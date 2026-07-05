# Privacy Policy

Dopamine Guard is designed to run locally in your browser.

## Data stored

The extension stores the list of domains you add to the guard list. This list is saved using Chrome extension storage so it can remain available across browser sessions.

## Data not collected

Dopamine Guard does not collect, sell, or transmit your browsing history to a backend server. This project does not include analytics, tracking pixels, advertising scripts, or account systems.

## External requests

The popup uses Google's favicon service to display small icons next to saved domains. That means the listed domain may be requested from Google's favicon service when the popup renders.

If you want no external favicon requests, remove or replace the `getFaviconUrl()` function in `popup.js` and update the popup rendering logic.

## Contact

Open an issue in the GitHub repository if you find a privacy concern or want to suggest an improvement.
