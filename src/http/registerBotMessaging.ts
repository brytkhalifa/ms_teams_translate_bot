import type { App } from '@microsoft/teams.apps';
import type { TeamsBotMessageService } from '../services/TeamsBotMessageService';

export function registerBotMessaging(app: App, teamsBotMessageService: TeamsBotMessageService): void {
  app.on('message', async ({ send, activity }) => {
    await send({ type: 'typing' });
    const outcome = await teamsBotMessageService.handleUserMessage(activity.text || '');
    await send(outcome.text);
  });
}
