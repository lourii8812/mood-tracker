# Lunari PWA

A static, installable Progressive Web App for daily mood check-ins and journaling.

## Files
- `index.html` — app structure
- `styles.css` — responsive lavender UI
- `app.js` — mood picker, date navigation, journal, calendar, recent check-ins, local persistence
- `manifest.json` — install metadata
- `service-worker.js` — offline asset caching and app-shell fallback
- `icons/lunari.svg` — app icon

## Publish
Upload the **contents of this folder** to a static HTTPS host, such as the root of a GitHub Pages repository. Keep the folder structure unchanged. A service worker generally requires HTTPS (or localhost) to work.

## Install
- **Android:** open the published URL in Chrome and choose Install app / Add to Home screen.
- **iPhone/iPad:** open the URL in Safari, tap Share, then Add to Home Screen.

## Data and privacy
Mood entries and journal notes are stored in `localStorage` in that browser on that device. They are not uploaded or synced. Clearing browser site data can erase them; use the browser's normal device backup/export options where applicable. The app has no account, analytics, remote API, or tracking.

## Notes
The PWA does not use Android Usage Access and does not include app-usage reports, automatic sleep estimates, or scheduled notifications. Browser and operating-system PWA capabilities vary.
