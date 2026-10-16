-- Two skills per word, like Anki/Quizlet separate "recognize" from "produce":
--   flip_*  = Erkennen: card stack, flip, right/wrong or swipe
--   box     = Schreiben: handwriting the answer (as before)
-- Both use Leitner boxes with due dates (1, 3, 7, 14, 30 days). A word "sitzt"
-- from box 2 on. Writing a word correctly also counts as recognizing it;
-- not recognizing it sends both skills back to box 0.
alter table public.cards
  add column due_at timestamptz,
  add column flip_box integer not null default 0,
  add column flip_correct integer not null default 0,
  add column flip_wrong integer not null default 0,
  add column flip_reviewed timestamptz,
  add column flip_due timestamptz;

-- cards learned so far: due again according to their box
update public.cards set due_at = last_reviewed + (array[interval '0', interval '1 day', interval '3 days',
  interval '7 days', interval '14 days', interval '30 days'])[box + 1]
where last_reviewed is not null;

alter table public.reviews add column mode text not null default 'write' check (mode in ('write', 'flip'));

-- p_first = first answer to this card in the current round. Only that answer
-- moves the box up (like Anki: getting it right after a "nochmal" in the same
-- round doesn't prove you know it); a wrong answer always resets.
create function public.record_review(
  p_card uuid, p_user uuid, p_correct boolean, p_mode text, p_first boolean default true
)
returns json
language sql
volatile
set search_path = public
as $$
  with steps(b, i) as (
    select * from unnest(array[interval '0', interval '1 day', interval '3 days',
      interval '7 days', interval '14 days', interval '30 days']) with ordinality
  ),
  cur as (
    select c.id, c.box, c.flip_box,
      case when not p_correct then 0
           when p_first then least(c.box + 1, 5) else c.box end as nb,
      case when not p_correct then 0
           when p_first then least(c.flip_box + 1, 5) else c.flip_box end as nfb
    from public.cards c where c.id = p_card and c.user_id = p_user
  ),
  updated as (
    update public.cards c set
      -- write mode changes box; flip mode changes flip_box (wrong also resets box)
      box = case when p_mode = 'write' then cur.nb
                 when not p_correct then 0 else c.box end,
      due_at = case when p_mode = 'write' or not p_correct then
                 now() + (select b from steps where i = (case when p_mode = 'write' then cur.nb else 0 end) + 1)
               else c.due_at end,
      correct_count = c.correct_count + case when p_mode = 'write' and p_correct then 1 else 0 end,
      wrong_count = c.wrong_count + case when p_mode = 'write' and not p_correct then 1 else 0 end,
      last_reviewed = case when p_mode = 'write' then now() else c.last_reviewed end,
      -- writing it right proves recognition too
      flip_box = case when p_mode = 'flip' then cur.nfb
                      when p_correct then greatest(c.flip_box, cur.nb)
                      else least(c.flip_box, 1) end,
      flip_due = case when p_mode = 'flip' then now() + (select b from steps where i = cur.nfb + 1)
                      when p_correct and cur.nb > c.flip_box then now() + (select b from steps where i = cur.nb + 1)
                      else c.flip_due end,
      flip_correct = c.flip_correct + case when p_mode = 'flip' and p_correct then 1 else 0 end,
      flip_wrong = c.flip_wrong + case when p_mode = 'flip' and not p_correct then 1 else 0 end,
      flip_reviewed = case when p_mode = 'flip' then now() else c.flip_reviewed end
    from cur where c.id = cur.id
    returning c.box, c.due_at, c.correct_count, c.wrong_count, c.last_reviewed,
      c.flip_box, c.flip_due, c.flip_correct, c.flip_wrong, c.flip_reviewed
  ),
  logged as (
    insert into public.reviews (card_id, user_id, correct, mode)
    select p_card, p_user, p_correct, p_mode from updated
  )
  select row_to_json(updated) from updated;
$$;

revoke execute on function public.record_review(uuid, uuid, boolean, text, boolean) from public, anon, authenticated;

-- the old version without mode (once the edge function passes p_mode)
drop function if exists public.record_review(uuid, uuid, boolean);
