# Quote Agent (Teams bot)

Microsoft Teams bot with a **personal static tab** for **DeepL translation** and **ChatGPT chat**, plus bot messaging that routes either to DeepL (when you use a language prefix) or OpenAI (rewrite / answer without a prefix).

## Features

- **Personal tab** (`/tabs/translate-chat`):  
  - **Translate (DeepL)** — pick a target language, send text, see source → target pairs.  
  - **Chat (ChatGPT)** — multi-turn chat; only prior **chat** messages are sent as context (DeepL turns stay out of the model context).  
  - Thread items are labeled **DeepL** vs **ChatGPT** (`data-kind` on each card for styling).
- **Bot (1:1 / channel)**:  
  - Message **with** a language prefix (e.g. `en Wie heißt du`) → translate via DeepL.  
  - Message **without** a prefix → OpenAI `prompt` (rewrite / assist).
- **HTTP APIs** used by the tab (JSON under `/api*` is parsed by the Teams app host).

## Requirements

- Node.js 18+ (recommended 20+)
- A registered Microsoft Teams app / Bot Framework registration (see `appPackage/manifest.json`)
- Optional: [DeepL](https://www.deepl.com/pro-api) API key, [OpenAI](https://platform.openai.com/) API key

## Environment variables

Create a `.env` in this folder for local development (`npm run dev` loads it via `dotenv`).

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `3978`) |
| `DEEPL_MODE` | Set to any **truthy** value (e.g. `1`) to use the real DeepL API. If **unset**, a **DeepL echo** adapter is used (returns input as “translation”). |
| `DEEPL_API_KEY` | Required when `DEEPL_MODE` is set and you want live translation. |
| `DEEPL_API_URL` | Optional DeepL API base URL (see `DeepLHttpAdapter`; defaults to free API host). |
| `DEEPL_TARGET_LANG` | Default target language for the tab/API when not specified (default `EN-US`). |
| `OPENAI_MODE` | Set to any **truthy** value (e.g. `1`) with `OPENAI_API_KEY` to call OpenAI. If **unset**, an **OpenAI echo** adapter is used. |
| `OPENAI_API_KEY` | Required for live OpenAI when `OPENAI_MODE` is set. |
| `OPENAI_MODEL` | Chat / prompt model (default `gpt-4o-mini`). |

If `OPENAI_API_KEY` or `DEEPL_API_KEY` is missing while the corresponding `_MODE` is enabled, adapter creation fails gracefully and that integration is **disabled** (`null` in the container) instead of crashing the process.

## Scripts

```bash
npm install
npm run dev      # watch + dotenv — src/index.ts
npm run build    # tsup → dist/
npm start        # node . (uses dist/)
```

## Teams app package

- Manifest: [`appPackage/manifest.json`](appPackage/manifest.json)  
- Static tab URL: `https://<BOT_DOMAIN>/tabs/translate-chat`  
- After changing URLs or `entityId`, **repackage and update** the app in Teams.

## HTTP API (tab)

### `GET /api/translate`

Query parameters:

- `text` — required (non-empty after trim)
- `targetLanguage` — DeepL target code (e.g. `EN-US`, `DE`)

**200** — `{ translatedText, targetLanguage, detectedSourceLanguage? }`  
**400** — empty text  
**500** — e.g. DeepL not configured or translation error  

### `POST /api/chat`

JSON body:

```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "Follow-up…" }
  ]
}
```

Rules enforced server-side:

- `messages` is a non-empty array.
- Each item: `role` is `user` or `assistant`, `content` is a non-empty string.
- **Last** message must be `user`.
- Limits: up to **50** messages, **24 000** characters total (approximate guardrail).

**200** — `{ reply: string }`  
**400** — invalid body  
**413** — over limits  
**501** — OpenAI not configured  
**500** — upstream / internal error  

## Bot: language prefixes

Prefixes map to DeepL target codes (examples: `en`, `english` → `EN-US`; `de`, `german` → `DE`). See [`src/mappers/targetLanguageMapper.ts`](src/mappers/targetLanguageMapper.ts) for the full map.

## Project layout

```
src/
  index.ts                 # App entry: routes, tab, bot handler
  services/TranslationService.ts
  tabs/translate-chat.html # Personal tab UI
  adapters/deepl/          # DeepL HTTP + echo
  adapters/openai/         # OpenAI chat.completions + prompt + echo
  container/buildContainer.ts
  factories/               # Env-based adapter wiring
appPackage/manifest.json
```

## Static tab file path

At runtime the server prefers `dist/tabs/translate-chat.html` if it exists, otherwise `src/tabs/translate-chat.html`. The default **tsup** build only emits `dist/index.js`; for production you may copy `src/tabs/*.html` into `dist/tabs/` in your deploy pipeline, or run from a layout that includes `src/tabs`.

## License

MIT (see [`package.json`](package.json)).
