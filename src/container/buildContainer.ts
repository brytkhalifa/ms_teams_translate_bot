import { DeepLAdapter } from '../adapters/deepl/DeepLAdapter';
import { OpenAIAdapter } from '../adapters/openai/OpenAIAdapter';
import { createDeepLAdapter } from '../factories/deepLAdapterFactory';
import { createOpenAIAdapter } from '../factories/openAIAdapterFactory';

export interface AppContainer {
  deepLAdapter: DeepLAdapter | null;
  openAIAdapter: OpenAIAdapter | null;
  get<K extends keyof Omit<AppContainer, 'get'>>(key: K): Omit<AppContainer, 'get'>[K];
}

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

  const dependencies = {
    deepLAdapter,
    openAIAdapter,
  };

  const get = <K extends keyof typeof dependencies>(key: K) => dependencies[key];

  return {
    ...dependencies,
    get,
  };
}
