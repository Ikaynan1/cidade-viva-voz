import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
const sql=readFileSync('drizzle/migrations/0001_social_auth_base.sql','utf8');
const env=Object.fromEntries(readFileSync('.env','utf8').trim().split('\n').map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1).replaceAll('"','')];}));
async function api(path:string,method='GET',body?:unknown){return fetch(env.VITE_SUPABASE_URL+'/rest/v1/'+path,{method,headers:{apikey:env.VITE_SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});}
test('one evaluation per user and politician',()=>expect(sql).toContain('UNIQUE(user_id,politician_id)'));
test('one like per user and post',()=>expect(sql).toContain('UNIQUE(user_id,post_id)'));
test('rating accepts only 1 through 5',()=>expect(sql).toContain('CHECK(rating BETWEEN 1 AND 5)'));
test('all six new tables enable RLS',()=>{for(const table of ['profiles','posts','post_likes','post_comments','politician_evaluations','reports'])expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);});
test('anonymous clients cannot read reports',async()=>expect((await api('reports?select=*')).ok).toBe(false));
test('anonymous clients cannot read private profiles',async()=>expect((await api('profiles?select=*')).ok).toBe(false));
for(const table of ['posts','post_comments','post_likes','politician_evaluations','reports'])test(`anonymous clients cannot insert ${table}`,async()=>expect((await api(table,'POST',{})).ok).toBe(false));
test('anonymous clients cannot grant themselves admin',async()=>expect((await api('user_roles','POST',{user_id:'00000000-0000-0000-0000-000000000001',role:'admin'})).ok).toBe(false));
