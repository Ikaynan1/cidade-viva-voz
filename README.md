# cidade-viva-voz

1 — Visão geral

Aplicativo tipo rede social focado em feedback local sobre cidades. Usuários publicam relatos classificados como Positivo / Negativo / Neutro, com texto e foto, e podem avaliar gestores públicos (prefeito, governador, vereador, ministro, presidente, etc.). O app mostra o feed da cidade selecionada (ex.: “Parnamirim”) no topo e permite trocar de cidade para ver avaliações de outros lugares.

Objetivo: permitir que moradores expressem opinião qualificada sobre serviços/infraestrutura/gestão, com verificação mínima de residência para reduzir spam e abuso.

2 — Regras de cadastro e verificação (fluxo obrigatório)

Objetivo: evitar perfis falsos e manter qualidade do conteúdo sem bloquear entrada.

Cadastro inicial (mínimo):

Nome completo, e-mail/telefone (verificação via SMS ou e-mail), senha.

Cidade e bairro (campo obrigatório).

Aceite de Termos de Uso e Política de Privacidade (LGPD).

Níveis de conta / privilégios:

Não verificado (entrada imediata): pode visualizar feed e postar, mas com restrições (por ex., limite diário menor, posts marcados como “não verificado”).

Verificação de residência (recomendado logo após): upload de comprovante de residência (conta de luz/água/internet em PDF/Foto) + campo bairro preenchido. Após verificação, ganha selo “Morador verificado” e mais privilégios.

Verificação de identidade (opcional, pedida depois): upload de documento de identidade (RG/CPF, frente e verso) — só necessário se quiser acesso total (ex.: votar em ranking de gestores). Você afirmou que talvez pedir isso depois — implemente como “forçar depois” (push para completar) ou “opcional com vantagens”.

Validação técnica:

OCR simples para extrair nome e endereço do comprovante (ajuda na triagem).

Heurística de correspondência entre nome do cadastro e nome no documento.

Se OCR/heurística inconclusiva, enviar para moderação humana.

Estados do documento: pendente, em-analise, verificado, rejeitado (com motivo).

Política de retenção e privacidade (LGPD):

IDs e comprovantes armazenados criptografados.

Dados mantidos somente pelo período necessário para verificação (ex.: 6 meses — ajustar conforme jurídico).

Usuário pode solicitar exclusão/retirada de documentos; isso desativa o selo verificado.

Log de consentimento no momento do envio.

3 — Feed e experiência principal

Topo da tela: nome da cidade atual (ex.: Parnamirim) — botão para trocar cidade.

Filtros rápidos abaixo do topo: Todos | Positivos | Negativos | Neutros.

Cards de post: avatar (ou ícone), selo de verificação do usuário (se aplicável), classificação (Pos/Neg/Neutro), categoria (Economia, Saúde, Transporte, Rua/Infraestrutura, Educação, Segurança, Outro), bairro (se fornecido), data, texto, foto(s).

Ações no card: comentar, denunciar, favoritar/salvar (opcional), ver perfil do autor.

Barra de criação: botão + (postar) — abre tela de criação.

4 — Tela de criação de post (detalhada)

Campos:

Escolher Positivo / Negativo / Neutro (obrigatório).

Selecionar Categoria (lista fixa + “Outro”).

Campo Texto com limite (ex.: 1.200 caracteres).

Upload de foto(s) (máx 4).

Campo Bairro preenchido automaticamente com base no perfil, editável.

Botões: Cancelar | Publicar.

Regras:

Usuários não verificados têm aviso “Post marcado como não verificado”.

Limite de posts por dia: sugerido 10/dia para não-verificados, 30/dia para verificados (você falou em limitar para evitar bagunça — essas são sugestões; ajustar depois).

Geo-tag opcional (apenas bairro ou ponto aproximado, não coordenadas exatas por privacidade).

5 — Perfis de gestores públicos

Lista de cargos: Prefeito (da cidade selecionada), Governador (estado), Vereadores (por cidade), Ministro (categoria nacional), Presidente, etc.

Cada perfil mostra:

Foto, nome, cargo, período (mandato).

Nota média geral (1–10 ou 1–5) — calculada a partir das avaliações associadas às postagens e votações diretas.

Notas por categoria (educação, saúde, segurança, infraestrutura, economia).

Linha do tempo com comentários recentes (filtráveis).

Botão “Avaliar este gestor” — abrir modal para deixar nota + categoria + comentário.

Verificação de perfis: vincular dados a fontes públicas quando possível (integração com bases públicas, se disponível).

Regra de cálculo da nota (exemplo):

Média ponderada: 70% avaliações diretas (nota dada ao gestor), 30% sentimento agregado das postagens marcadas como relacionadas ao gestor.

Excluir avaliações suspeitas (contas novas sem verificação/relatórios).

6 — Moderação e segurança

Detecção automática: filtros para spam, palavras de ódio, conteúdo sexual, possíveis difamações (modelo de classificação).

Fluxo de denúncias: todos podem denunciar posts/perfis/avaliações. Tipos de denúncia: Spam, Difamação, Discurso de ódio, Conteúdo Impróprio.

Ações automáticas: esconder post com alta taxa de denúncias até revisão humana.

Moderação humana: painel administrativo para revisar denúncias e documentos de verificação.

Apelação: usuário pode pedir revisão com justificativa e novo envio de documentos.

Transparência: publicar estatísticas de moderação (ex.: % de posts removidos) no admin.

7 — Mapas, busca e troca de cidade

Busca de cidade por nome.

Cada cidade tem página de resumo com: nota média da cidade, número de posts recentes, top problemas, top pontos positivos.

Mapa (fase posterior / roadmap): pins agregados por bairro com clusters (não exibir local exato por privacidade, mostrar apenas cluster ou rua sem número).

8 — Gamificação e incentivos

Selos por participação construtiva (ex.: “Contribuidor útil”, “Verificado”).

Pontos por postar avaliações úteis (votos de outros usuários).

Recompensas internas (perfil em destaque, ranking de contribuintes) — evitar monetização direta na fase inicial.

9 — Analytics e dashboards (admin)

Métricas: número de posts/dia, taxa de verificação, tempo médio de verificação, top categorias, sentimento por bairro, performance de moderação.

Exportar relatórios (CSV/PDF) para prefeituras/ONGs (opcional, com cuidado legal).

10 — Modelo de dados (resumo de tabelas essenciais)

users

id, nome, email, telefone, senha_hash, cidade, bairro, verified_residence (bool), verified_identity (bool), avatar_url, created_at, updated_at

documents

id, user_id, tipo (comprovante_residencia | identidade), arquivo_url, status, motivo_rejeicao, reviewed_by, created_at

cities

id, nome, estado, population (opcional), lat/lon (centro), meta_info

posts

id, user_id, city_id, bairro, tipo_sentimento (pos/neg/neu), categoria, texto, fotos[], geo (opcional), created_at, status (ativo | escondido | removido)

politicians

id, nome, cargo, cidade_id/estado/nacional, partido, foto_url, mandato_inicio, mandato_fim

ratings

id, user_id, politician_id, nota, categoria, texto, created_at

reports

id, resource_type (post|user|rating), resource_id, motivo, reporter_id, status, created_at

11 — Endpoints API (exemplos)

POST /api/signup — cria usuário

POST /api/login — autentica

GET /api/cities?query= — busca cidades

GET /api/cities/{id}/feed?filter=positivo — feed da cidade

POST /api/posts — criar post (multipart para imagens)

POST /api/documents — upload comprovante/ID

GET /api/politicians/{id} — perfil do gestor

POST /api/politicians/{id}/ratings — avaliar gestor

POST /api/reports — denunciar conteúdo

GET /api/admin/reports — painel de moderação

(Incluir autenticação JWT/refresh tokens e roles admin/moderador)

12 — MVP (prioridades)

Essencial (MVP):

Cadastro básico + verificação de telefone/e-mail;

Upload e fluxo de verificação de comprovante de residência;

Feed por cidade com filtros Pos/Neg/Neutro;

Post com categoria, texto e foto;

Perfis de gestores com avaliação direta;

Sistema de denúncias básico e painel de moderação;

Política de privacidade e termos (rascunho).

Fase 2 / Roadmap:

Verificação de identidade (ID) e reconhecimento facial (opcional);

Mapa com hotspots por bairro;

Integração com bases públicas para gestores;

Gamificação avançada; dashboards públicos para prefeituras;

API pública e exportação de dados (com anonimização).

13 — Critérios de aceitação (exemplos)

Usuário consegue cadastrar-se e publicar um post em < 5 minutos.

Sistema aceita upload de comprovante e altera estado para pendente.

Feed da cidade mostra posts filtráveis por sentimento.

Perfil do prefeito exibe nota média calculada de avaliações.

Painel admin consegue revisar denúncias e documentos.

14 — Microcopy (textos prontos em pt-BR)

Botão postar: Publicar

Classificadores: Positivo, Negativo, Neutro

Upload comprovante: Enviar comprovante de residência (conta de luz/água/internet)

Status verificação: Pendente, Verificado, Rejeitado

Aviso não-verificado: Sua conta ainda não tem comprovante confirmado — suas publicações terão marca “não verificado”.

Modal denunciar: Motivo da denúncia: Spam / Difamação / Discurso de ódio / Conteúdo impróprio / Outro

15 — Entregáveis que peça à Lovabi (lista clara)

Peça para a Lovabi gerar, por prioridade:

Protótipos mobile (iOS/Android) — telas: Login/Cadastro, Fluxo Verificação, Feed da Cidade, Tela de Post, Tela Política (perfil gestor), Tela Trocar Cidade, Tela Denúncias, Tela Admin (moderador).

Fluxos de usuário (user flows) em formato clicável.

Arquitetura de dados (schema SQL / ER diagram).

API spec (OpenAPI/Swagger).

Documento de políticas: rascunho de Termos e Política de Privacidade (foco LGPD).

Lista de assets e tokens de design (tipografia, espaçamentos, ícones).

Plano de testes (QA checklist) e critérios de aceitação.

Texto curto para onboarding (5 mensagens) e cópias de botões/erros em pt-BR.

Mockups exportáveis (PNG/SVG) e/ou arquivo importável para Figma (se a Lovabi suportar export).

16 — Observações técnicas & recomendações rápidas

Armazenamento de imagens: S3 (ou equivalente) com acesso via CDN.

Autenticação: usar provedor confiável (ex.: Firebase/Auth0) com verificação SMS.

OCR: Google Vision API/Tesseract para triagem; revisão humana para alta precisão.

Logs de auditoria: manter trilha de ações de moderação.

Escalabilidade: CPU-bound para processamento de OCR; serviço separado para moderação automática.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ef9e589-15de-4669-855a-aca92e8b07e3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
