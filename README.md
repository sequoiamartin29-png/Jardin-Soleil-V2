# Jardin Soleil V2

French-chalet inspired personal garden command center for Jardin Soleil.

## Run locally
```bash
npm install
npm run dev
```

`npm run dev` runs the frontend only. Plant Finder's Guided Identification remains available, but secure photo analysis requires the Netlify Function environment:

```bash
npx netlify dev
```

Configure these server-side environment variables in Netlify (or in an uncommitted local Netlify environment):

- `OPENAI_API_KEY` — the server-only OpenAI API credential
- `OPENAI_VISION_MODEL` — required image-capable Responses API model selected by the deployment; the browser never hard-codes or receives it

The browser calls `/.netlify/functions/identify-plant`. A safe `GET` diagnostic reports only whether the function is reachable and whether its credential and model settings are present. It never returns either environment variable. Selected Plant Finder images are resized to a maximum 1800-pixel edge, re-encoded as JPEG to remove embedded metadata, and held only in the current session until the user saves the identification, adds the plant to the estate, or explicitly saves the photo to Gallery.

## Deploy on Netlify
- Build command: `npm run build`
- Publish directory: `dist`

## Tabs
Dashboard, Orchard, Garden, Logbook, Gallery, Inventory, Learn, Word Search.
