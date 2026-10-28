REVOKE ALL ON public.profiles, public.reports FROM anon;
REVOKE INSERT,UPDATE,DELETE ON public.posts,public.post_comments,public.post_likes,public.politician_evaluations FROM anon;
REVOKE INSERT,UPDATE,DELETE ON public.user_roles FROM anon,authenticated;