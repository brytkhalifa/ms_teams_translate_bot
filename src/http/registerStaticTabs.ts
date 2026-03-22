import type { HttpPlugin } from '@microsoft/teams.apps';
import type { Request, Response } from 'express';
import { resolveTabFilePath } from './resolveTabFilePath';

export function registerStaticTabs(app: { http: HttpPlugin }): void {
  const translateChatPath = resolveTabFilePath('translate-chat.html');
  app.http.get('/tabs/translate-chat', (_req: Request, res: Response) => {
    res.sendFile(translateChatPath);
  });
}
