import { App } from '@microsoft/teams.apps';
import { DevtoolsPlugin } from '@microsoft/teams.dev';
import fs from 'node:fs';
import path from 'node:path';
import { buildContainer } from './container/buildContainer';
import { TranslationService } from './services/TranslationService';

const app = new App({
  plugins: [new DevtoolsPlugin()],
});

const container = buildContainer();
const translationService = new TranslationService(container);

function appTab(name: string, filePath: string): void {
  app.http.get(`/tabs/${name}`, (_req: any, res: any) => {
    res.sendFile(filePath);
  });
}

const translateChatTabDistPath = path.resolve('dist/tabs/translate-chat.html');
const translateChatTabSrcPath = path.resolve('src/tabs/translate-chat.html');
const translateChatTabPath = fs.existsSync(translateChatTabDistPath)
  ? translateChatTabDistPath
  : translateChatTabSrcPath;

appTab('translate-chat', translateChatTabPath);

app.http.get('/api/translate', async (req: any, res: any) => {
  const result = await translationService.translateFromQuery({
    text: req.query.text,
    targetLanguage: req.query.targetLanguage,
  });

  if (!result.ok) {
    const status =
      result.failure.code === 'EMPTY_TEXT'
        ? 400
        : 500;
    res.status(status).json({ error: result.failure.message });
    return;
  }

  res.json(result.data);
});

app.http.post('/api/chat', async (req: any, res: any) => {
  const outcome = await translationService.chatFromBody(req.body);

  if (!outcome.ok) {
    const status =
      outcome.failure.code === 'INVALID_BODY'
        ? 400
        : outcome.failure.code === 'PAYLOAD_TOO_LARGE'
          ? 413
          : outcome.failure.code === 'NO_ADAPTER'
            ? 501
            : 500;
    res.status(status).json({ error: outcome.failure.message });
    return;
  }

  res.json({ reply: outcome.data.reply });
});

app.on('message', async ({ send, activity }) => {
  await send({ type: 'typing' });
  const outcome = await translationService.handleUserMessage(activity.text || '');
  await send(outcome.text);
});

app.start(process.env.PORT || 3978).catch(console.error);
