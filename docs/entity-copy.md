# Entity copy set

The one approved way to describe **Entity Corporation** on this site. Reuse these lines word for word
on new pages (hero, meta/OG/Twitter tags, about strips, résumé) instead of writing new ones.
Branch facts come from the ecosystem map (`ecosystem.json` in the Entity root) and the `#ecosystem`
section of `/entity/`.

## Rules

- Entity Corporation is an independent **app** studio. Never call it a "game studio".
- Seven branches: Games, Finance, LMS, Music, Notification, Extensions, AI Tools.
- Privacy-first everywhere; "kid-safe", "child-directed ads" and "no personal data" are claims about
  the **games** only. "Offline" is for the games and for apps that really work offline (CashBook, Music).
- Status: the seven games are in **closed testing** on Google Play. Cost Calculator (web) and
  SVNWorkflow (VS Code Marketplace) are available. Everything else is **coming soon**. AI Tools are
  internal and not offered to the public.
- No overclaiming: no user counts, ratings, downloads or features that don't exist yet.
- Plain, friendly British English (colour, personalised), short sentences.

## Tagline (one line)

> Simple, privacy-first apps for play, work and learning.

## Short description (~160 characters; meta, OG and Twitter descriptions)

> Entity Corporation is an independent, privacy-first app studio with seven branches: kid-safe offline games in testing on Google Play, and more apps on the way.

Page title: `Entity Corporation - independent app studio`.

## Medium paragraph (hero, about strips)

> Entity Corporation is an independent app studio with seven branches: Games, Finance, LMS, Music,
> Notification, Extensions and AI Tools. Every app is built privacy-first. The seven kid-safe games
> play offline and are in closed testing on Google Play. The Cost Calculator and the SVNWorkflow
> VS Code extension are already available, and more apps are on the way.

Founder line (when the page needs it): "Founded by Tabish Ali Mughal, who builds the apps through
AI-assisted development (vibe coding)." First-person version (home page, résumé): "I build its apps
through AI-assisted development (vibe coding)."

## One line per branch

| Branch | Line |
|---|---|
| Games | Calm, kid-safe puzzle and arcade games for Android that play offline, with no tracking. |
| Finance | Simple money tools for small shops and small projects. |
| LMS | Learning tools that help schools, teachers and students work together. |
| Music | Music to enjoy anywhere, online or off. |
| Notification | Friendly ways for businesses to keep their customers in the loop. |
| Extensions | Add-ons that make everyday developer tools quicker to use. |
| AI Tools | The helpers we use behind the scenes to build and test every Entity app (internal, not offered to the public). |

The Games line is the old site-wide tagline: use it only where the text is about the games.

## Where it is used

- `entity/index.html`: `<title>`, meta description, OG/Twitter title and description, hero tagline
  and paragraph, ecosystem lead, branch leads, "Our approach", contact, footer.
- `index.html`: `#apps` subtitle and the `.entity-brand` founder strip.
- `resume.html`: `#entity-corporation` tagline and the Entity Games project line.
- Game pages (`entity/games/<slug>/`) keep their own game copy; they describe one game, not Entity.
