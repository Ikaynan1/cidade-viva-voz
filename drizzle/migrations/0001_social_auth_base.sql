CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT 'Morador' CHECK (char_length(display_name) BETWEEN 1 AND 100),
 avatar_url text, city text NOT NULL DEFAULT 'Natal', neighborhood text NOT NULL DEFAULT '',
 municipality_id uuid REFERENCES public.municipalities(id),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_own_read ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid());
CREATE POLICY profiles_own_update ON public.profiles FOR UPDATE TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid());
CREATE FUNCTION public.provision_social_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 INSERT INTO public.profiles(id,display_name,city,neighborhood) VALUES (NEW.id,coalesce(nullif(left(NEW.raw_user_meta_data->>'display_name',100),''),'Morador'),coalesce(left(NEW.raw_user_meta_data->>'city',100),'Natal'),coalesce(left(NEW.raw_user_meta_data->>'neighborhood',100),'')) ON CONFLICT(id) DO NOTHING;
 RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.provision_social_profile() FROM PUBLIC;
CREATE TRIGGER provision_social_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.provision_social_profile();
INSERT INTO public.profiles(id) SELECT id FROM auth.users ON CONFLICT DO NOTHING;
CREATE TABLE public.posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 municipality_id uuid NOT NULL REFERENCES public.municipalities(id), politician_id uuid REFERENCES public.politicians(id),
 content text NOT NULL CHECK(char_length(trim(content)) BETWEEN 1 AND 1200), sentiment text NOT NULL DEFAULT 'neutro' CHECK(sentiment IN ('positivo','negativo','neutro')),
 category text NOT NULL DEFAULT 'Outro', neighborhood text NOT NULL DEFAULT '', moderation_status text NOT NULL DEFAULT 'visible' CHECK(moderation_status IN ('visible','hidden')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_read ON public.posts FOR SELECT USING(moderation_status='visible' OR author_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY posts_insert ON public.posts FOR INSERT TO authenticated WITH CHECK(author_id=auth.uid() AND moderation_status='visible');
CREATE POLICY posts_update ON public.posts FOR UPDATE TO authenticated USING((author_id=auth.uid() AND moderation_status='visible') OR public.has_role(auth.uid(),'admin')) WITH CHECK(author_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY posts_delete ON public.posts FOR DELETE TO authenticated USING((author_id=auth.uid() AND moderation_status='visible') OR public.has_role(auth.uid(),'admin'));
CREATE TABLE public.post_likes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,post_id)
);
GRANT SELECT ON public.post_likes TO anon;
GRANT SELECT,INSERT,DELETE ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY likes_read ON public.post_likes FOR SELECT USING(EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id AND p.moderation_status='visible'));
CREATE POLICY likes_insert ON public.post_likes FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id AND p.moderation_status='visible'));
CREATE POLICY likes_delete ON public.post_likes FOR DELETE TO authenticated USING(user_id=auth.uid());
CREATE TABLE public.post_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE, content text NOT NULL CHECK(char_length(trim(content)) BETWEEN 1 AND 1200),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.post_comments TO anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.post_comments TO authenticated;
GRANT ALL ON public.post_comments TO service_role;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comments_read ON public.post_comments FOR SELECT USING(EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id AND p.moderation_status='visible'));
CREATE POLICY comments_insert ON public.post_comments FOR INSERT TO authenticated WITH CHECK(author_id=auth.uid() AND EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id AND p.moderation_status='visible'));
CREATE POLICY comments_update ON public.post_comments FOR UPDATE TO authenticated USING(author_id=auth.uid() AND EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id AND p.moderation_status='visible')) WITH CHECK(author_id=auth.uid());
CREATE POLICY comments_delete ON public.post_comments FOR DELETE TO authenticated USING(author_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TABLE public.politician_evaluations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 politician_id uuid NOT NULL REFERENCES public.politicians(id), rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,politician_id)
);
GRANT SELECT ON public.politician_evaluations TO anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.politician_evaluations TO authenticated;
GRANT ALL ON public.politician_evaluations TO service_role;
ALTER TABLE public.politician_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY evaluations_read ON public.politician_evaluations FOR SELECT USING(true);
CREATE POLICY evaluations_insert ON public.politician_evaluations FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid());
CREATE POLICY evaluations_update ON public.politician_evaluations FOR UPDATE TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE POLICY evaluations_delete ON public.politician_evaluations FOR DELETE TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TABLE public.reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE, reason text NOT NULL CHECK(char_length(trim(reason)) BETWEEN 1 AND 1000),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewed')), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(reporter_id,post_id)
);
GRANT SELECT,INSERT,UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY reports_read ON public.reports FOR SELECT TO authenticated USING(reporter_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY reports_insert ON public.reports FOR INSERT TO authenticated WITH CHECK(reporter_id=auth.uid() AND status='pending' AND EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id AND p.moderation_status='visible'));
CREATE POLICY reports_update ON public.reports FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE INDEX posts_feed_idx ON public.posts(municipality_id,created_at DESC);
CREATE INDEX posts_politician_idx ON public.posts(politician_id,created_at DESC);
CREATE INDEX comments_post_idx ON public.post_comments(post_id,created_at);
CREATE INDEX likes_post_idx ON public.post_likes(post_id);
CREATE INDEX evaluations_politician_idx ON public.politician_evaluations(politician_id);
CREATE INDEX reports_status_idx ON public.reports(status,created_at);
CREATE FUNCTION public.public_author(_id uuid) RETURNS TABLE(display_name text,avatar_url text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT p.display_name,p.avatar_url FROM public.profiles p WHERE p.id=_id AND (EXISTS(SELECT 1 FROM public.posts s WHERE s.author_id=p.id AND s.moderation_status='visible') OR EXISTS(SELECT 1 FROM public.post_comments c JOIN public.posts s ON s.id=c.post_id WHERE c.author_id=p.id AND s.moderation_status='visible')) $$;
REVOKE ALL ON FUNCTION public.public_author(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_author(uuid) TO anon,authenticated;
CREATE FUNCTION public.social_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE actor uuid; recent integer; max_actions integer;
BEGIN
 IF TG_OP='UPDATE' THEN
  NEW.created_at=OLD.created_at; NEW.updated_at=now();
  IF TG_TABLE_NAME='posts' THEN
   IF NEW.author_id<>OLD.author_id THEN RAISE EXCEPTION 'Autor imutável'; END IF;
   IF NEW.moderation_status<>OLD.moderation_status AND auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Moderação restrita'; END IF;
  ELSIF TG_TABLE_NAME='post_comments' THEN
   IF NEW.author_id<>OLD.author_id OR NEW.post_id<>OLD.post_id THEN RAISE EXCEPTION 'Autoria imutável'; END IF;
  ELSIF TG_TABLE_NAME='politician_evaluations' THEN
   IF NEW.user_id<>OLD.user_id OR NEW.politician_id<>OLD.politician_id THEN RAISE EXCEPTION 'Avaliação imutável'; END IF;
  END IF;
 END IF;
 IF auth.uid() IS NOT NULL AND (TG_OP='INSERT' OR TG_TABLE_NAME='politician_evaluations') THEN
  actor=auth.uid(); PERFORM pg_advisory_xact_lock(hashtext(actor::text),hashtext(TG_TABLE_NAME));
  IF TG_TABLE_NAME='posts' THEN SELECT count(*) INTO recent FROM public.posts WHERE author_id=actor AND created_at>now()-interval '1 minute'; max_actions=3;
  ELSIF TG_TABLE_NAME='post_comments' THEN SELECT count(*) INTO recent FROM public.post_comments WHERE author_id=actor AND created_at>now()-interval '1 minute'; max_actions=10;
  ELSIF TG_TABLE_NAME='post_likes' THEN SELECT count(*) INTO recent FROM public.post_likes WHERE user_id=actor AND created_at>now()-interval '1 minute'; max_actions=30;
  ELSIF TG_TABLE_NAME='reports' THEN SELECT count(*) INTO recent FROM public.reports WHERE reporter_id=actor AND created_at>now()-interval '1 minute'; max_actions=5;
  ELSIF TG_TABLE_NAME='politician_evaluations' THEN SELECT count(*) INTO recent FROM public.politician_evaluations WHERE user_id=actor AND updated_at>now()-interval '1 minute'; max_actions=20;
  END IF;
  IF recent>=max_actions THEN RAISE EXCEPTION 'Muitas ações. Aguarde um minuto.'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER posts_guard BEFORE INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.social_guard();
CREATE TRIGGER comments_guard BEFORE INSERT OR UPDATE ON public.post_comments FOR EACH ROW EXECUTE FUNCTION public.social_guard();
CREATE TRIGGER likes_guard BEFORE INSERT ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.social_guard();
CREATE TRIGGER evaluations_guard BEFORE INSERT OR UPDATE ON public.politician_evaluations FOR EACH ROW EXECUTE FUNCTION public.social_guard();
CREATE TRIGGER reports_guard BEFORE INSERT OR UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.social_guard();
CREATE FUNCTION public.profile_timestamp() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.id=OLD.id; NEW.created_at=OLD.created_at; NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TRIGGER profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.profile_timestamp();