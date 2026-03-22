import { DeepLAdapter } from '../adapters/deepl/DeepLAdapter';
import { DeepLEchoAdapter } from '../adapters/deepl/DeepLEchoAdapter';
import { DeepLHttpAdapter } from '../adapters/deepl/DeepLHttpAdapter';
import { isLiveApiEnabled } from '../config/envMode';

export function createDeepLAdapter(): DeepLAdapter {
  if (!isLiveApiEnabled(process.env.DEEPL_MODE)) {
    return new DeepLEchoAdapter();
  }

  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    throw new Error('DEEPL_API_KEY is required.');
  }

  return new DeepLHttpAdapter(apiKey);
}
