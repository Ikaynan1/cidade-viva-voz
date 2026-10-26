CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TYPE public.jurisdiction_level AS ENUM ('municipal','estadual','federal');
CREATE TYPE public.electoral_outcome AS ENUM ('eleito','segundo_turno','suplente','nao_eleito','sem_resultado');
CREATE TYPE public.mandate_status AS ENUM ('nao_verificado','em_exercicio','licenciado','encerrado','afastado');

-- Catalog of official sources
CREATE TABLE public.data_sources (
  key text PRIMARY KEY,
  name text NOT NULL,
  institution text NOT NULL,
  base_url text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.states (
  ibge_code integer PRIMARY KEY,
  uf char(2) NOT NULL UNIQUE,
  name text NOT NULL,
  source_key text NOT NULL REFERENCES public.data_sources(key),
  source_url text,
  collected_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.municipalities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ibge_code integer UNIQUE,
  tse_code text UNIQUE,
  name text NOT NULL,
  uf char(2) NOT NULL REFERENCES public.states(uf),
  ibge_verified_at timestamptz,
  tse_verified_at timestamptz,
  ibge_source_url text,
  tse_source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.elections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text NOT NULL REFERENCES public.data_sources(key),
  official_code text NOT NULL,
  year integer NOT NULL,
  round integer NOT NULL,
  description text NOT NULL,
  election_type text,
  election_date date,
  scope public.jurisdiction_level NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_key, official_code, round)
);

-- A real person. Never merged automatically across elections.
CREATE TABLE public.politicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  civil_name text NOT NULL,
  ballot_name text,
  social_name text,
  gender text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Official ids from any institution (TSE, Câmara, Senado, ALRN, CMN...)
CREATE TABLE public.politician_identifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id uuid NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  source_key text NOT NULL REFERENCES public.data_sources(key),
  id_type text NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_key, id_type, value)
);

-- Candidacy + result: one row per person, election and round. History is append-only.
CREATE TABLE public.candidacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id uuid NOT NULL REFERENCES public.politicians(id) ON DELETE RESTRICT,
  election_id uuid NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
  tse_candidate_seq text NOT NULL,
  round integer NOT NULL,
  office_code integer NOT NULL,
  office_name text NOT NULL,
  level public.jurisdiction_level NOT NULL,
  municipality_id uuid REFERENCES public.municipalities(id),
  uf char(2) NOT NULL REFERENCES public.states(uf),
  ballot_number text,
  ballot_name text,
  party_number text,
  party_acronym text,
  party_name text,
  federation_name text,
  coalition_name text,
  candidacy_status text,
  result_code text,
  result_name text,
  outcome public.electoral_outcome NOT NULL DEFAULT 'sem_resultado',
  valid_votes integer,
  occupation text,
  source_key text NOT NULL REFERENCES public.data_sources(key),
  source_url text NOT NULL,
  source_generated_at text,
  collected_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (election_id, tse_candidate_seq, round)
);
CREATE INDEX candidacies_mun_idx ON public.candidacies(municipality_id, office_code);
CREATE INDEX candidacies_uf_idx ON public.candidacies(uf, level);

-- Office actually held. Separate from election results; requires institutional verification.
CREATE TABLE public.mandates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id uuid NOT NULL REFERENCES public.politicians(id) ON DELETE RESTRICT,
  candidacy_id uuid REFERENCES public.candidacies(id) ON DELETE SET NULL,
  office_name text NOT NULL,
  level public.jurisdiction_level NOT NULL,
  municipality_id uuid REFERENCES public.municipalities(id),
  uf char(2) NOT NULL REFERENCES public.states(uf),
  term_start date,
  term_end date,
  status public.mandate_status NOT NULL DEFAULT 'nao_verificado',
  verification_source_key text REFERENCES public.data_sources(key),
  verification_url text,
  verified_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidacy_id)
);

CREATE TABLE public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text NOT NULL REFERENCES public.data_sources(key),
  scope text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  rows_read integer DEFAULT 0,
  rows_inserted integer DEFAULT 0,
  rows_updated integer DEFAULT 0,
  error_message text,
  details jsonb,
  triggered_by uuid
);

-- Grants: public reference data readable by everyone; writes only by admins / backend
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['data_sources','states','municipalities','elections','politicians','politician_identifiers','candidacies','mandates'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "admin write" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin'')) WITH CHECK (public.has_role(auth.uid(),''admin''))', t);
  END LOOP;
END $$;
GRANT SELECT ON public.sync_logs TO authenticated;
GRANT ALL ON public.sync_logs TO service_role;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read logs" ON public.sync_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.data_sources(key,name,institution,base_url,description) VALUES
('tse_cand','Candidatos (consulta_cand)','Tribunal Superior Eleitoral','https://dadosabertos.tse.jus.br/dataset/','Registro de candidaturas e situação de totalização por turno'),
('tse_votacao','Votação nominal por município e zona','Tribunal Superior Eleitoral','https://dadosabertos.tse.jus.br/dataset/','Votos nominais válidos por candidato'),
('ibge_localidades','API de Localidades','IBGE','https://servicodados.ibge.gov.br/api/v1/localidades','Códigos e nomes oficiais de UFs e municípios'),
('camara_deputados','Dados Abertos da Câmara','Câmara dos Deputados','https://dadosabertos.camara.leg.br/api/v2','Deputados federais em exercício'),
('senado_federal','Dados Abertos do Senado','Senado Federal','https://legis.senado.leg.br/dadosabertos','Senadores em exercício'),
('alrn','Assembleia Legislativa do RN','ALRN','https://www.al.rn.leg.br','Deputados estaduais do RN'),
('cmnatal','Câmara Municipal de Natal','CMN','https://www.cmnat.rn.gov.br','Vereadores em exercício em Natal'),
('pmnatal','Prefeitura do Natal','Prefeitura do Natal','https://natal.rn.gov.br','Gestão municipal'),
('manual_admin','Revisão administrativa','Cidade Viva Voz','-','Ajuste manual feito por administrador');