CREATE OR REPLACE FUNCTION public.social_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE actor uuid; recent integer; max_actions integer;
BEGIN
 IF TG_OP='INSERT' THEN
  NEW.created_at=now();
  IF TG_TABLE_NAME<>'post_likes' THEN NEW.updated_at=now(); END IF;
 ELSIF TG_OP='UPDATE' THEN
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