# Social pipeline — X, LinkedIn, Instagram (Level 2: machine drafts, human approves)

The distribution layer for the gallery catalog. The machine picks stories and drafts
platform-native posts; you approve/edit in `/admin/social`; a scheduler (or you)
posts. Nothing ever publishes without a human approval.

## The loop

```
Mon 12:07 UTC  Social drafts (weekly) Action
               → picks 3 stories (new first, then evergreen rotation, topic-diverse,
                 60-day cooldown; policy in scripts/social-pick.ts)
               → Claude drafts 1 X + 1 LinkedIn + 1 Instagram post per story
                 (voice + format rules: content/social-voice.md — EDIT THAT FILE
                 to steer the drafts; replace its examples with your real winners)
               → rows land in Turso `social_queue` as status 'draft'

You (~15 min)  vishalsingh.org/admin/social
               → edit text inline → Approve (or Reject)
               → LinkedIn / Instagram: Copy → paste into the platform → Mark posted
                 (Instagram: download the story's chart image — image_url — as the visual)

Weekdays 13:37 UTC  Social deliver (Typefully) Action
               → approved X drafts → Typefully drafts, scheduled at your next free
                 slot (post text + UTM link as a reply tweet)
               → marks them 'posted'. Without TYPEFULLY_API_KEY it no-ops and just
                 lists what's waiting — X can also be posted manually via Copy.
```

## Setup

1. **Repo secret `ANTHROPIC_API_KEY`** (required — draft generation).
2. **Repo secret `TYPEFULLY_API_KEY`** (optional — X auto-delivery). Typefully →
   Settings → API. Connect your X account there; pick posting slots in its queue
   settings (e.g. Tue/Thu 9am). Without it, everything still works via Copy.
3. Turso secrets are already in place (shared with the content pipeline).

## Commands (local, from book-template/)

```
pnpm social-drafts                 # generate this week's batch now
BATCH=5 pnpm social-drafts         # bigger batch
ONLY=five-subway-stops pnpm social-drafts   # draft a specific story (e.g. news peg)
DRY=1 pnpm social-drafts           # print + JSON only, no queue insert
pnpm social-deliver                # push approved X drafts to Typefully now
```

## Conventions the pipeline enforces

- **Link discipline:** X gets the link as a reply tweet, LinkedIn in the first
  comment (the Copy button appends it), Instagram says "link in bio" — external
  links in post bodies get suppressed reach on all three.
- **UTM tagging:** every queued link carries
  `utm_source=<platform>&utm_medium=social&utm_campaign=<story-id>`, so
  analytics can attribute site visits per platform per story.
- **Eligibility:** published Blog stories with a thumbnail (the chart is the
  post). Datasets/studios are excluded for now.
- **Statuses:** `draft → approved → posted`, or `rejected`. Rejected/posted rows
  can be sent back to draft in the UI. Cooldown means a story won't be re-picked
  within 60 days of its last posted entry — evergreen recycling, not spam.

## Tuning over time

- **Voice drift:** whenever a post does well, paste it into the EXAMPLES in
  `content/social-voice.md` — the next batches imitate it.
- **Cadence:** batch size (`BATCH`) and the cron in
  `.github/workflows/social-drafts.yml` set the weekly volume; 3 stories × 3
  platforms ≈ 9 posts/week is a sustainable starting point.
- **What's working:** filter your analytics by `utm_source` / `utm_campaign`;
  when a topic consistently pulls, feature more of it (the picker already favors
  topic diversity, so winners surface quickly).
