import type { App } from '@microsoft/teams.apps';
import type { AppContainer } from '../container/buildContainer';
import { registerApiRoutes } from './registerApiRoutes';
import { registerBotMessaging } from './registerBotMessaging';
import { registerStaticTabs } from './registerStaticTabs';

/** Wire static tab, `/api/*` routes, and `app.on('message', …)` using services from the container. */
export function registerTabAndBotHandlers(
  app: App,
  services: Pick<AppContainer, 'translateTabService' | 'chatTabService' | 'teamsBotMessageService'>,
): void {
  registerStaticTabs(app);
  registerApiRoutes(app.http, {
    translateTabService: services.translateTabService,
    chatTabService: services.chatTabService,
  });
  registerBotMessaging(app, services.teamsBotMessageService);
}
