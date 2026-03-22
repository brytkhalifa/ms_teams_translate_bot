import type { HttpPlugin } from '@microsoft/teams.apps';
import type { Request, Response } from 'express';
import type { ChatTabService } from '../services/ChatTabService';
import type { TranslateTabService } from '../services/TranslateTabService';
import { chatFailureToStatus, translateFailureToStatus } from './mapApiFailure';

function queryString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }
  return undefined;
}

export function registerApiRoutes(
  http: HttpPlugin,
  services: {
    translateTabService: TranslateTabService;
    chatTabService: ChatTabService;
  },
): void {
  http.get('/api/translate', async (req: Request, res: Response) => {
    const result = await services.translateTabService.translateFromQuery({
      text: queryString(req.query.text),
      targetLanguage: queryString(req.query.targetLanguage),
    });

    if (!result.ok) {
      res.status(translateFailureToStatus(result.failure.code)).json({
        error: result.failure.message,
      });
      return;
    }

    res.json(result.data);
  });

  http.post('/api/chat', async (req: Request, res: Response) => {
    const outcome = await services.chatTabService.chatFromBody(req.body);

    if (!outcome.ok) {
      res.status(chatFailureToStatus(outcome.failure.code)).json({
        error: outcome.failure.message,
      });
      return;
    }

    res.json({ reply: outcome.data.reply });
  });
}
