-- Record an answer atomically: move the card's Leitner box and log the review
-- in one statement, so two quick answers can't overwrite each other.
-- Returns null if the card does not exist or belongs to another user.
create function public.record_review(p_card uuid, p_user uuid, p_correct boolean)
returns json
language sql
volatile
set search_path = public
as $$
  with updated as (
    update public.cards set
      box = case when p_correct then least(box + 1, 5) else 0 end,
      correct_count = correct_count + case when p_correct then 1 else 0 end,
      wrong_count = wrong_count + case when p_correct then 0 else 1 end,
      last_reviewed = now()
    where id = p_card and user_id = p_user
    returning box, correct_count, wrong_count, last_reviewed
  ),
  logged as (
    insert into public.reviews (card_id, user_id, correct)
    select p_card, p_user, p_correct from updated
  )
  select row_to_json(updated) from updated;
$$;

revoke execute on function public.record_review(uuid, uuid, boolean) from public, anon, authenticated;
