-- Run this in the Supabase SQL editor.
-- It extends the existing cafe + profiles tables, adds voting / comments /
-- AI captions, and turns on the strictest RLS that still lets the app work.

alter table public.cafe
  add column if not exists description text,
  add column if not exists neighborhood text,
  add column if not exists vibe text;

update public.cafe
set
  description = 'A Columbia staple for lattes between classes. Grab a window seat when you need to feel like a real New Yorker for twenty minutes.',
  neighborhood = 'Morningside Heights',
  vibe = 'Between-class fuel'
where name = 'joes coffee';

update public.cafe
set
  description = 'Bright, precise, and a little extra — the kind of pour-over that makes a midwest transplant text their group chat about "the coffee here."',
  neighborhood = 'Morningside Heights',
  vibe = 'Clean and caffeinated'
where name = 'blue bottle';

update public.cafe
set
  description = 'Matcha-forward and photogenic. Perfect when you want a treat that still looks like you have your life together.',
  neighborhood = 'Near campus',
  vibe = 'Soft and green'
where name = 'MAKI';

update public.cafe
set
  description = 'Campus-close caffeine with enough table space to spread out a laptop, a problem set, and a pastry you swore you would not buy.',
  neighborhood = 'Morningside Heights',
  vibe = 'Laptop hours'
where name = 'blue java cafe';

update public.cafe
set
  description = 'Dark, cozy, and a little mysterious — the weekend cafe when the dorm lounge is too loud and the city still feels new.',
  neighborhood = 'Near campus',
  vibe = 'Moody hideout'
where name = 'kuro kuma';

update public.cafe
set
  description = 'Comfort food energy in cafe form. Come here when you miss home cooking but still want to people-watch on Broadway.',
  neighborhood = 'Morningside Heights',
  vibe = 'Homey and filling'
where name = 'dear mama';

update public.cafe
set
  description = 'A Morningside sip spot for slow weekend walks. Bring a friend from the floor and pretend you have a regular order.',
  neighborhood = 'Morningside Heights',
  vibe = 'Weekend wander'
where name = 'sipsteria morningside';

update public.cafe
set
  description = 'The legendary study cave. Overhear thesis panic, share a table, and stay until the light turns gold on Amsterdam.',
  neighborhood = 'Morningside Heights',
  vibe = 'Classic study haunt'
where name = 'the hungarian pastry shop';

update public.cafe
set
  description = 'East-campus caffeine when you are done crossing campus in the wind. Quick, warm, and unfussy.',
  neighborhood = 'East of campus',
  vibe = 'No-frills warm-up'
where name = 'cafe east';

update public.cafe
set
  description = 'Yemeni coffee, cardamom, and a reason to leave the dorm without a five-hour study plan. A weekend ritual waiting to happen.',
  neighborhood = 'Near campus',
  vibe = 'Spiced and social'
where name = 'qahwah house';

create table if not exists public.captions (
  id bigint generated always as identity primary key,
  cafe_id bigint not null references public.cafe (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  prompt text not null,
  generated_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.caption_votes (
  id bigint generated always as identity primary key,
  caption_id bigint not null references public.captions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (caption_id, user_id)
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  cafe_id bigint not null references public.cafe (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 280),
  created_at timestamptz not null default now()
);

create table if not exists public.comment_votes (
  id bigint generated always as identity primary key,
  comment_id bigint not null references public.comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create table if not exists public.cafe_ratings (
  id bigint generated always as identity primary key,
  cafe_id bigint not null references public.cafe (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  unique (cafe_id, user_id)
);

create index if not exists captions_cafe_id_idx on public.captions (cafe_id);
create index if not exists comments_cafe_id_idx on public.comments (cafe_id);
create index if not exists caption_votes_caption_id_idx on public.caption_votes (caption_id);
create index if not exists comment_votes_comment_id_idx on public.comment_votes (comment_id);
create index if not exists cafe_ratings_cafe_id_idx on public.cafe_ratings (cafe_id);

alter table public.cafe enable row level security;
alter table public.profiles enable row level security;
alter table public.captions enable row level security;
alter table public.caption_votes enable row level security;
alter table public.comments enable row level security;
alter table public.comment_votes enable row level security;
alter table public.cafe_ratings enable row level security;

drop policy if exists "cafe_select_public" on public.cafe;
create policy "cafe_select_public"
on public.cafe
for select
to anon, authenticated
using (true);

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "captions_select_public" on public.captions;
create policy "captions_select_public"
on public.captions
for select
to anon, authenticated
using (true);

drop policy if exists "captions_insert_own" on public.captions;
create policy "captions_insert_own"
on public.captions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "captions_delete_own" on public.captions;
create policy "captions_delete_own"
on public.captions
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "caption_votes_select_public" on public.caption_votes;
create policy "caption_votes_select_public"
on public.caption_votes
for select
to anon, authenticated
using (true);

drop policy if exists "caption_votes_insert_own" on public.caption_votes;
create policy "caption_votes_insert_own"
on public.caption_votes
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "caption_votes_update_own" on public.caption_votes;
create policy "caption_votes_update_own"
on public.caption_votes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "caption_votes_delete_own" on public.caption_votes;
create policy "caption_votes_delete_own"
on public.caption_votes
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public"
on public.comments
for select
to anon, authenticated
using (true);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
on public.comments
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own"
on public.comments
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "comment_votes_select_public" on public.comment_votes;
create policy "comment_votes_select_public"
on public.comment_votes
for select
to anon, authenticated
using (true);

drop policy if exists "comment_votes_insert_own" on public.comment_votes;
create policy "comment_votes_insert_own"
on public.comment_votes
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "comment_votes_update_own" on public.comment_votes;
create policy "comment_votes_update_own"
on public.comment_votes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "comment_votes_delete_own" on public.comment_votes;
create policy "comment_votes_delete_own"
on public.comment_votes
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "cafe_ratings_select_public" on public.cafe_ratings;
create policy "cafe_ratings_select_public"
on public.cafe_ratings
for select
to anon, authenticated
using (true);

drop policy if exists "cafe_ratings_insert_own" on public.cafe_ratings;
create policy "cafe_ratings_insert_own"
on public.cafe_ratings
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "cafe_ratings_update_own" on public.cafe_ratings;
create policy "cafe_ratings_update_own"
on public.cafe_ratings
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "cafe_ratings_delete_own" on public.cafe_ratings;
create policy "cafe_ratings_delete_own"
on public.cafe_ratings
for delete
to authenticated
using (user_id = auth.uid());

grant select on public.cafe to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

grant select on public.captions to anon, authenticated;
grant insert, delete on public.captions to authenticated;

grant select on public.caption_votes to anon, authenticated;
grant insert, update, delete on public.caption_votes to authenticated;

grant select on public.comments to anon, authenticated;
grant insert, delete on public.comments to authenticated;

grant select on public.comment_votes to anon, authenticated;
grant insert, update, delete on public.comment_votes to authenticated;

grant select on public.cafe_ratings to anon, authenticated;
grant insert, update, delete on public.cafe_ratings to authenticated;

grant usage, select on all sequences in schema public to authenticated;

create table if not exists public.cafe_visits (
  id bigint generated always as identity primary key,
  cafe_id bigint not null references public.cafe (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  visited_at timestamptz not null default now()
);

create index if not exists cafe_visits_cafe_user_idx
  on public.cafe_visits (cafe_id, user_id, visited_at desc);

alter table public.cafe_visits enable row level security;

drop policy if exists "cafe_visits_select_public" on public.cafe_visits;
create policy "cafe_visits_select_public"
on public.cafe_visits
for select
to anon, authenticated
using (true);

drop policy if exists "cafe_visits_insert_own" on public.cafe_visits;
create policy "cafe_visits_insert_own"
on public.cafe_visits
for insert
to authenticated
with check (user_id = auth.uid());

grant select on public.cafe_visits to anon, authenticated;
grant insert on public.cafe_visits to authenticated;
