import { DeepLAdapter } from '../adapters/deepl/DeepLAdapter';
import { OpenAIAdapter } from '../adapters/openai/OpenAIAdapter';
import { getChatLimits } from '../config/chatLimits';
import { createDeepLAdapter } from '../factories/deepLAdapterFactory';
import { createOpenAIAdapter } from '../factories/openAIAdapterFactory';
import { ChatTabService } from '../services/ChatTabService';
import { TeamsBotMessageService } from '../services/TeamsBotMessageService';
import { TranslateTabService } from '../services/TranslateTabService';

export interface AppContainer {
  deepLAdapter: DeepLAdapter | null;
  openAIAdapter: OpenAIAdapter | null;
  translateTabService: TranslateTabService;
  chatTabService: ChatTabService;
  teamsBotMessageService: TeamsBotMessageService;
  get<K extends keyof Omit<AppContainer, 'get'>>(key: K): Omit<AppContainer, 'get'>[K];
}

export type TabAndBotServices = Pick<
  AppContainer,
  'translateTabService' | 'chatTabService' | 'teamsBotMessageService'
>;

export function buildContainer(): AppContainer {
  const deepLAdapter = (() => {
    try {
      return createDeepLAdapter();
    } catch {
      return null;
    }
  })();
  const openAIAdapter = (() => {
    try {
      return createOpenAIAdapter();
    } catch {
      return null;
    }
  })();

  const defaultTargetLang = process.env.DEEPL_TARGET_LANG || 'EN-US';
  const limits = getChatLimits();

  const translateTabService = new TranslateTabService(deepLAdapter, defaultTargetLang);
  const chatTabService = new ChatTabService(openAIAdapter, limits);
  const teamsBotMessageService = new TeamsBotMessageService(
    deepLAdapter,
    openAIAdapter,
    defaultTargetLang,
  );

  const dependencies = {
    deepLAdapter,
    openAIAdapter,
    translateTabService,
    chatTabService,
    teamsBotMessageService,
  };

  const get = <K extends keyof typeof dependencies>(key: K) => dependencies[key];

  return {
    ...dependencies,
    get,
  };
}
