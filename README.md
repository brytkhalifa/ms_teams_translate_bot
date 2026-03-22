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
  - Send **`tr help`** (or `tr hlep`) for a full list of DeepL prefixes and usage (`tr help` is handled locally, no AI call).
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
| `DEEPL_MODE` | **Opt-in** to the real DeepL API: set to `1`, `true`, `yes`, `on`, or `y` (case-insensitive). If **unset** or any other value, a **DeepL echo** adapter is used. |
| `DEEPL_API_KEY` | Required when `DEEPL_MODE` opts in and you want live translation. |
| `DEEPL_API_URL` | Optional DeepL API base URL (see `DeepLHttpAdapter`; defaults to free API host). |
| `DEEPL_TARGET_LANG` | Default target language for the tab/API when not specified (default `EN-US`). |
| `OPENAI_MODE` | Set to any **truthy** value (e.g. `1`) with `OPENAI_API_KEY` to call OpenAI. If **unset**, an **OpenAI echo** adapter is used. |
| `OPENAI_API_KEY` | Required for live OpenAI when `OPENAI_MODE` is set. |
| `OPENAI_MODEL` | Chat / prompt model (default `gpt-4o-mini`). |

If `OPENAI_API_KEY` or `DEEPL_API_KEY` is missing while the corresponding `_MODE` opts in, adapter creation fails gracefully and that integration is **disabled** (`null` in the container) instead of crashing the process.

## Scripts

```bash
npm install
npm run dev      # watch + dotenv — src/index.ts
npm run build    # tsup → dist/
npm start        # node . (uses dist/)
npm test         # vitest (unit tests in test/)
npm run test:watch
```

## Testing

Unit tests use [Vitest](https://vitest.dev/) (`vitest.config.ts`). They live under [`test/`](test/) and cover:

- `envMode`, `chatLimits`, `mapApiFailure`, `parseChatRequestBody`, `targetLanguageMapper` (including `tr help` help text)
- `TeamsBotMessageService`, `TranslateTabService`, `ChatTabService` with mocked adapters

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

Prefixes map to DeepL target codes (examples: `en`, `english` → `EN-US`; `de`, `german` → `DE`). See [`src/mappers/targetLanguageMapper.ts`](src/mappers/targetLanguageMapper.ts) for the full map. In chat, send **`tr help`** to print every prefix grouped by target code (same source as the mapper).

## Project layout

```
src/
  index.ts                    # App construction, composeApp, start
  composeApp.ts               # buildContainer + registerTabAndBotHandlers; returns AppContainer
  api/types.ts                # Tab API result types
  config/envMode.ts           # OPENAI_MODE / DEEPL_MODE opt-in parsing
  config/chatLimits.ts        # Chat payload limits from env
  validation/parseChatRequestBody.ts
  http/                       # registerApiRoutes, registerStaticTabs, mapApiFailure, resolveTabFilePath
  services/
    TranslateTabService.ts    # GET /api/translate
    ChatTabService.ts         # POST /api/chat
    TeamsBotMessageService.ts # Bot 1:1 / channel messages
  tabs/translate-chat.html
  adapters/deepl/
  adapters/openai/
  container/buildContainer.ts # Adapters + TranslateTabService, ChatTabService, TeamsBotMessageService; `get()` accessor
  factories/
appPackage/manifest.json
```

## Static tab file path

At runtime the server prefers `dist/tabs/translate-chat.html` if it exists, otherwise `src/tabs/translate-chat.html`. **tsup** bundles app code to `dist/index.js`; HTML stays under `src/tabs` unless you copy it into `dist/tabs/` during deploy.

## License

MIT (see [`package.json`](package.json)).
