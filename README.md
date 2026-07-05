# Dopamine Guard

Dopamine Guard is a small Chrome extension that adds a deliberate pause before you enter sites you personally mark as distracting.

Instead of completely blocking a site, Dopamine Guard gives you a short interruption: a full-screen prompt asks whether you really want to continue. The goal is to create enough friction to help you double-check your intention before opening social media, adult content, doom-scrolling sites, or any other domains that tend to pull your attention away.

> This is not a parental-control or hard-blocking tool. It is an attention guardrail designed to help you make a conscious choice.

## What it does

- Lets you add distracting domains from the extension popup.
- Saves your domain list with Chrome sync storage.
- Watches top-level page navigations.
- Shows a full-screen pause overlay when a saved domain is opened.
- Starts a 5-second countdown before the **Continue anyway** button becomes available.
- Lets you go back immediately with **Go back**.
- Matches subdomains too. For example, adding `reddit.com` also catches `old.reddit.com`.

## Why it exists

Many attention-blocking tools are strict blockers. Dopamine Guard is intentionally softer. It does not assume every visit is bad; it simply inserts a mindful checkpoint.

That checkpoint is useful when you want to stop automatic browsing patterns such as:

- opening social feeds without thinking,
- visiting adult sites out of habit,
- checking distracting communities during work,
- bouncing between entertainment sites when tired,
- using the browser for avoidance instead of intention.

The extension asks one simple question: **“Do you really need to be here right now?”**

## How it works

Dopamine Guard has three main parts:

1. **Popup UI**  
   The popup lets you add and remove domains. It normalizes entries by removing protocols, paths, and `www.`. For example, `https://www.reddit.com/r/all` becomes `reddit.com`.

2. **Background service worker**  
   The background script listens for browser navigation events. When the main page navigates to a domain on your list, it tells the content script to show the guard overlay.

3. **Content script overlay**  
   The content script creates a Shadow DOM overlay so the visited site's CSS cannot easily break the prompt. It temporarily locks page scrolling, displays the warning card, runs the countdown, and then either lets you continue or sends you back.

## Installation for local testing

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the `dopamine-guard` project folder.
6. Click the Dopamine Guard extension icon and add a domain such as `reddit.com`.
7. Open that domain in a tab to test the pause overlay.

## Project structure

```text
dopamine-guard/
├── manifest.json       # Chrome extension manifest
├── background.js       # Watches navigation and triggers the guard
├── content.js          # Creates the full-screen pause overlay
├── content.css         # Host overlay fallback styles
├── popup.html          # Extension popup markup
├── popup.css           # Popup styling
├── popup.js            # Domain list management
├── icons/              # Extension icons
├── docs/               # Extra documentation
└── README.md
```

## Permissions

The extension currently requests:

- `storage` — saves your list of guarded domains.
- `tabs` — communicates with the active tab when showing the overlay.
- `webNavigation` — detects when the browser navigates to a guarded domain.
- `<all_urls>` host permission — allows the guard to run on any site you choose to add.

Because the extension needs to check whether the current page matches your saved list, it uses broad host access. It does not send your browsing activity to an external server.

## Privacy

Dopamine Guard stores your guarded domain list in Chrome's sync storage. There is no backend, no analytics, and no external tracking code in this project.

The popup loads favicons through Google's favicon service so each domain can display a small site icon in the list. If you want a stricter privacy model, remove the favicon feature from `popup.js`.

See [`PRIVACY.md`](PRIVACY.md) for a short privacy statement you can include with the project.

## Development notes

There is no build step. The extension is plain HTML, CSS, and JavaScript.

After editing files:

1. Go to `chrome://extensions`.
2. Find Dopamine Guard.
3. Click the reload button.
4. Test the extension again.

## GitHub quick start

From inside the project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dopamine-guard.git
git push -u origin main
```

Or, using the GitHub CLI:

```bash
gh repo create dopamine-guard --public --source=. --remote=origin --push
```

## Roadmap ideas

- Custom countdown duration.
- Temporary allowlist for a site after continuing.
- Import/export domain lists.
- Preset category lists.
- Optional stronger blocking mode.
- Statistics for avoided visits.
- Keyboard shortcuts.

## Disclaimer

Dopamine Guard is a self-control aid, not a security boundary. A user can disable the extension, remove domains, or bypass it. Its value comes from creating a moment of awareness before an automatic browsing decision.
