import { DeepLAdapter } from '../adapters/deepl/DeepLAdapter';
import { DeepLEchoAdapter } from '../adapters/deepl/DeepLEchoAdapter';
import { DeepLHttpAdapter } from '../adapters/deepl/DeepLHttpAdapter';

export function createDeepLAdapter(): DeepLAdapter {
  if ([false, 'false', '0', 'no', 'n'].includes((process.env.DEEPL_MODE as string | false).toLowerCase()) ){
    return new DeepLEchoAdapter();
  }

  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    throw new Error('DEEPL_API_KEY is required.');
  }

  return new DeepLHttpAdapter(apiKey);
}
