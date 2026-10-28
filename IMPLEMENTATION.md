# Etapa social — implementação e verificação

## Autenticação
Alterados: `src/pages/Auth.tsx`, `src/components/UserMenu.tsx`, `src/pages/Settings.tsx`, `src/App.tsx`.
Criados: `src/hooks/useAuth.tsx`, `src/components/RequireAuth.tsx`, `src/pages/ResetPassword.tsx`.
Email/senha, Google e Lovable habilitados. Cadastro mantém confirmação por email. Sessões são geridas pelo cliente existente; validação usa getUser. Nenhum cadastro atribui administrador.

## Banco social
Migrações aplicadas:
- `drizzle/migrations/0001_social_auth_base.sql`: seis tabelas sociais, provisionamento de perfil, permissões, índices, unicidade e limites de frequência.
- `drizzle/migrations/0002_social_timestamp_hardening.sql`: datas de ações geradas no banco para impedir burla dos limites.
- `drizzle/migrations/0003_private_social_grants.sql`: remove acesso anônimo a perfis e denúncias e acesso de escrita a privilégios.

## Feed e avaliações
Alterados: `src/pages/Index.tsx`, `src/pages/CreatePost.tsx`, `src/components/PostCard.tsx`, `src/components/NatalOfficials.tsx`.
Criados: `src/hooks/useSocial.ts`, `src/components/SocialPost.tsx`, `src/components/PoliticianEvaluation.tsx`.
Feed sem posts fictícios, filtros de município/político, publicação textual, edição/exclusão com confirmação, curtidas, comentários, denúncias privadas e avaliações atualizáveis estão conectados ao banco. Dados de residência não são retornados pela função pública de autoria.

## Testes realizados
- `bun test tests/social-security.test.ts`: 12 testes passaram. Inclui inspeção das restrições declaradas, RLS e solicitações reais anônimas contra leitura privada, escrita social e concessão de admin.
- Navegador: homepage de Natal, estado vazio do feed, botão de entrada, bloqueio de criação sem sessão, formulário de recuperação e página pública de redefinição sem link. Nenhum erro de execução observado.
- Banco: 450 candidaturas preservadas e RLS habilitada nas seis novas tabelas.
- Compilação automática: sem erros na última verificação.

## Não verificado / pendente
Cadastro positivo, provisionamento do perfil, login/logout, link de recuperação, publicação/edição/curtidas/comentários/avaliações autenticados e testes entre usuários não foram concluídos: não existe usuário autenticável. O endereço reservado de teste foi corretamente rejeitado; a criação de sessão segura também falhou por ausência de usuários. É necessário cadastrar e entrar com uma conta real no preview.
As restrições de duplicidade, avaliação e limites têm verificações de declaração, mas precisam também de testes de execução com sessão autenticada.
Upload de fotos e documentos e painel administrativo não foram implementados nesta etapa. Controles demonstrativos de envio foram removidos para evitar alegação de funcionamento. A interface de avaliação informa opinião dos usuários; não confirma desempenho oficial nem mandato atual.