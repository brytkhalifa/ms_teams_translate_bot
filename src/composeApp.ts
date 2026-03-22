import type { App } from '@microsoft/teams.apps';
import { buildContainer, type AppContainer } from './container/buildContainer';
import { registerTabAndBotHandlers } from './http/registerTabAndBotHandlers';

export type { AppContainer, TabAndBotServices } from './container/buildContainer';

export function composeApp(app: App): AppContainer {
  const container = buildContainer();
  registerTabAndBotHandlers(app, container);
  return container;
}
