# Rolla

**Swipe into work.** Rolla is a concept for a recruitment app that works like a dating app, with a social layer to rival LinkedIn. Candidates swipe through jobs, read the full listing to unlock Apply, and can send a limited number of Standouts (super likes) that put them at the top of an employer's list with a personal message.

This repository holds a working, clickable prototype with 30 mock creative and tech roles from 12 fictional studios and product teams, each with its own brand colours and generated cover art.

## Try it

**Live prototype:** [harrisongreener.github.io/Rolla](https://harrisongreener.github.io/Rolla/)

To run it yourself, no install or build step is needed. Either:

- open `index.html` in a browser, or
- serve the folder locally, for example `python3 -m http.server`, then visit `http://localhost:8000`.

On a desktop browser it shows inside a phone frame. On a phone it fills the screen.

## What works

- **Loading screen**: the Rolodex wheel spins round its hub and settles, the wordmark's second "l" swipes into place and a progress bar fills. It plays on every load (even with reduced motion turned on), replays when you tap the wordmark, and the Jobs tab icon's wheel spins on hover or tap.
- **Swipe deck**: swipe a card up to apply or down to save it for later. Passing is a deliberate tap on the ✕ button, not a swipe, so the deck doesn't feel like a dating app. Cards roll over the wheel like a Rolodex: up and over the top to apply, down and under to save. With a keyboard, use the up arrow to apply, the down arrow to save and Delete to pass. Saves and passes can be undone.
- **Read to unlock**: Apply stays locked until you scroll to the end of a job listing, so every application is deliberate. Until then, a card resists being swiped up.
- **Standouts**: three a week, shown in ink with a mint star. Each needs a short message and goes to the top of the employer's list.
- **Matches and filters**: every card shows your match score and which of your skills it matches. The Filter sheet narrows roles by discipline (Brand, UX/UI, Illustration, Motion, Marketing, Content, Tech), contract and where you work.
- **Apply button that fills as you read**: scroll the listing and the button fills with mint, then unlocks.
- **Save for later**: swipe down or tap the bookmark. Saved roles leave the deck and live under Applied → Saved.
- **Company profiles**: brand-coloured studio pages with ethos, recent work, the team and open roles. Shortlisting a company moves its jobs to the front of your deck.
- **Network**: search across people, studios and jobs with All / People / Studios / Jobs results; swipeable stories (drag with a mouse on desktop); person profiles with skills and work; showcase posts, milestones and company posts, with likes, vouching and "Add as acquaintance".
- **Applied**: everything you've applied to, with Standouts first and a status timeline (Sent, Viewed, Shortlisted, Interview) that moves along over a few minutes. Applications can be withdrawn.
- **Profile**: an Instagram-style candidate profile with associates, acquaintances and vouched skills.
- **Employer view**: see how your applications look to a recruiter, with Standouts pinned at the top.
- Progress is saved in your browser's local storage. Use **Reset demo** on the Profile tab to start again.

## Social vocabulary

| Term | Meaning |
| --- | --- |
| Acquaintance | Someone who follows you, one way |
| Associates | You follow each other, which unlocks messaging and vouching |
| Shortlist | Following a company |
| Standout | A super like with a message, limited to three a week |

## Brand

- **Colours**: Ink `#0E0E0E` and Mint `#7EE8C3` (Mint 700 `#0E7052` for text on light). Standouts are ink with a mint star.
- **Type**: Figtree for display, headings and buttons; Inter for body text, labels and captions.
- **Logo**: a side-on Rolodex with a solid mint fan of cards, a few loose cards flicking out and a curved ink stand, next to a wordmark whose second "l" is a swiped card.

## Structure

```
index.html        App shell
css/styles.css    Brand tokens and all styles
js/data.js        Mock companies, jobs, people and posts
js/icons.js       Inline SVG icons and the logo
js/art.js         Generated cover art and studio marks
js/store.js       App state and local storage
js/views.js       Screen templates
js/app.js         Navigation, swiping and interactions
tools/build_single.py  Bundles everything into one HTML file
```

All studios, people and jobs are fictional. Cover art is generated in code from each studio's palette, so no images are needed.
