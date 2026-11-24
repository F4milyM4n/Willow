# Willow — deployment guide

A static site: no build step on the server, no database. GitHub Pages serves it as-is.

## Files

- `index.html` — app shell (styles, install metadata, service-worker registration)
- `app.js` — the whole app, plain JavaScript, no frameworks
- `sw.js` — service worker: caches the app so it opens offline and can be installed
- `manifest.json` — app name, colours and icons for "Add to Home Screen"
- `icons/` — keep this as a subfolder

## Deploy

1. Push these files to the root of the repo's `main` branch.
2. Repo **Settings → Pages** → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The live link is `https://<username>.github.io/<repo>/` (a minute or two the first time).

## Install on her phone

- **iPhone:** open the link in **Safari** → Share → **Add to Home Screen**.
- **Android:** open in Chrome → menu → **Install app** / **Add to Home Screen**.

## Her data

Everything is saved on the phone (localStorage), never sent anywhere.

- On iPhone the home-screen app keeps its **own** storage, separate from Safari — install first, then start logging.
- Use **Setup → Download backup file** now and then. Deleting the home-screen icon deletes its data.

## Releasing an update

Bump `VERSION` in `build.py`, rebuild, push. Installed copies pick it up the next time
the app comes to the foreground; it never reloads in the middle of an interval timer.
