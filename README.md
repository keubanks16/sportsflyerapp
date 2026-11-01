# Sports Flyer Studio — AI Edition

A browser-based sports flyer generator with OpenAI image generation and editable, precisely rendered text overlays.

## Architecture

- `index.html`: static frontend, deployable on GitHub Pages.
- `worker.js`: Cloudflare Worker backend that calls OpenAI securely.
- `wrangler.toml`: Worker configuration.

**Never place an OpenAI API key in HTML, JavaScript served to browsers, GitHub repository files, or localStorage.**

## Deploy backend

1. Install Wrangler and log in: `npm install -g wrangler && wrangler login`.
2. In this repository, set secrets using `wrangler secret put OPENAI_API_KEY` and `wrangler secret put APP_ACCESS_TOKEN`. Choose a long random access token. The latter is a shared access gate, not user authentication.
3. Run `wrangler deploy`. Copy the resulting `https://...workers.dev` URL.
4. Open the frontend and enter the Worker URL and app access token under Connection Settings.
5. Enable GitHub Pages for `main` / root.

For production/public use, replace the shared token with authenticated accounts and per-user rate limits/quotas; the shared token alone does not prevent abuse if distributed. Set Cloudflare spending and OpenAI project budget limits. Each Generate and Regenerate action can incur API charges.

The model produces **background artwork only**. All names, dates, phone numbers and registration URLs are rendered by the browser as editable text, preventing AI text hallucinations. Image edits regenerate the artwork from a revised prompt rather than preserving exact pixels.

Uploaded logos are composited locally on the flyer, never sent to the OpenAI API. Saving a project stores text/settings in localStorage, not the image or logo.

API image output is 1024 × 1536; larger PNG exports upscale the composition and do not add native artwork detail.

