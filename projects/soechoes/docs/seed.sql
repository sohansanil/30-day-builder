-- SoEchoes — Supabase Seed SQL
-- Run this in the Supabase SQL editor AFTER creating the memories table.
-- Schema is in BUILD_PLAN.md

-- ============================================================
-- STEP 1: Create the memories table
-- ============================================================

create table if not exists memories (
  id uuid default gen_random_uuid() primary key,
  text text not null check (char_length(text) <= 280),
  category text not null check (category in ('love', 'funny', 'regret', 'sidequest', 'latenight', 'milestone', 'forsomeone')),
  lat decimal(10, 8) not null,
  lng decimal(11, 8) not null,
  is_spot boolean default false,
  felt_count integer default 0,
  location_name text,
  campus text default 'MIT Manipal',
  created_at timestamptz default now()
);

-- ============================================================
-- STEP 2: Enable Row Level Security
-- ============================================================

alter table memories enable row level security;

-- Anyone can read
create policy "Anyone can read memories"
  on memories for select
  using (true);

-- Anyone can insert (anonymous) — text must be non-empty
create policy "Anyone can insert memories"
  on memories for insert
  with check (char_length(text) >= 1 and char_length(text) <= 280);

-- ============================================================
-- STEP 3: Atomic increment function for "I felt this too"
-- ============================================================

create or replace function increment_felt_count(memory_id uuid)
returns void as $$
  update memories set felt_count = felt_count + 1 where id = memory_id;
$$ language sql security definer;

-- ============================================================
-- STEP 4: Seed memories (MIT Manipal campus)
-- ============================================================

insert into memories (text, category, lat, lng, is_spot, felt_count, location_name, campus) values

-- 1. Hostel Rooftop (Spot)
(
  'Came here almost every night during first year because I genuinely thought everyone else had their life figured out except me. Turns out none of us did.',
  'latenight', 13.35250000, 74.79340000, true, 143, 'Hostel Rooftop', 'MIT Manipal'
),

-- 2. Library Staircase (Spot)
(
  'Got a 6 out of 20 in my first internals and sat here for about an hour pretending I was checking my phone so nobody would realize I was crying.',
  'regret', 13.35280000, 74.79400000, true, 89, 'Library Staircase', 'MIT Manipal'
),

-- 3. Campus Food Court
(
  'Accidentally waved back at someone who wasn''t waving at me. Never sat on this side of the food court again.',
  'chaos', 13.35200000, 74.79300000, false, 312, 'Campus Food Court', 'MIT Manipal'
),

-- 4. Academic Block Entrance
(
  'This is where I checked my email and found out I''d gotten my first internship. Called my parents before I even told my friends.',
  'milestone', 13.35220000, 74.79380000, false, 67, 'Academic Block Entrance', 'MIT Manipal'
),

-- 5. Bus Stop Outside Campus
(
  'Missed my bus because I was talking to her. Missed the next bus too.',
  'love', 13.35150000, 74.79250000, false, 201, 'Bus Stop Outside Campus', 'MIT Manipal'
),

-- 6. Hostel Corridor
(
  'You probably don''t remember helping me move my luggage on the first day. I was terrified. You made the place feel like home.',
  'forsomeone', 13.35300000, 74.79350000, false, 78, 'Hostel Corridor', 'MIT Manipal'
),

-- 7. Library Fourth Floor (Spot)
(
  'I came here because nobody talked on this floor. Somewhere between the assignments and panic attacks, I realized I actually liked what I was studying.',
  'growth', 13.35280000, 74.79410000, true, 94, 'Library Fourth Floor', 'MIT Manipal'
),

-- 8. Campus Lake
(
  'Sat here after my first breakup and genuinely believed I''d never be happy again. Human beings are surprisingly bad at predicting their own future.',
  'latenight', 13.35180000, 74.79420000, false, 156, 'Campus Lake', 'MIT Manipal'
),

-- 9. Hostel Mess
(
  'Ate only Maggi for six consecutive days because I was too lazy to walk here. This is my formal apology to my digestive system.',
  'chaos', 13.35270000, 74.79320000, false, 428, 'Hostel Mess', 'MIT Manipal'
),

-- 10. Sports Ground
(
  'Failed selections. Sat on the grass for twenty minutes. Came back the next year and made the team.',
  'growth', 13.35350000, 74.79450000, false, 112, 'Sports Ground', 'MIT Manipal'
),

-- 11. Campus Bench Near Library
(
  'We studied here almost every evening. We mostly didn''t study.',
  'love', 13.35290000, 74.79410000, false, 203, 'Campus Bench Near Library', 'MIT Manipal'
),

-- 12. Engineering Block Staircase
(
  'Called my parents from here and lied that everything was going well. It wasn''t. It eventually did.',
  'regret', 13.35230000, 74.79370000, false, 88, 'Engineering Block Staircase', 'MIT Manipal'
),

-- 13. Hostel Terrace (Spot)
(
  'Dad, I know I don''t call enough. But I hope you know I''m trying.',
  'forsomeone', 13.35260000, 74.79330000, true, 231, 'Hostel Terrace', 'MIT Manipal'
),

-- 14. Campus Canteen
(
  'Ordered food for someone because I thought they were my friend. They were not my friend. They accepted the food anyway.',
  'chaos', 13.35210000, 74.79310000, false, 519, 'Campus Canteen', 'MIT Manipal'
),

-- 15. Random Bench Behind Academic Block (Spot)
(
  'I used to sit here after every bad day. Looking back, I think this bench knows more about me than most people do.',
  'latenight', 13.35190000, 74.79360000, true, 177, 'Random Bench Behind Academic Block', 'MIT Manipal'
);

-- ============================================================
-- STEP 5: Verify
-- ============================================================

select location_name, category, is_spot, felt_count
from memories
order by felt_count desc;
