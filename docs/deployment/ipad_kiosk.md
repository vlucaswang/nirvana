# iPad Kiosk Deployment

## MVP
Use Safari or an Add to Home Screen web app with Guided Access.

1. Open the kiosk URL on the iPad.
2. Add it to the Home Screen if using the web-app style.
3. Enable Guided Access in iPadOS Accessibility settings.
4. Open the kiosk app.
5. Start Guided Access.

This keeps the kiosk in front for normal sleep and wake. It does not guarantee automatic recovery after a full restart.

## Robust
Use a supervised iPad with Single App Mode.

The strongest long-term target is a tiny native iOS wrapper app using `WKWebView` that opens the local kiosk URL, then locking that wrapper app with Single App Mode.
