import { createHash } from 'crypto';
import config from '../config';

process.env['OPENSSL_CONF'] = '/dev/null'; // workaround

export class Crypto {
  static async hashPassword(text: string): Promise<string> {
    return createHash('sha256')
      .update(String(text + config.appKey))
      .digest('hex');
  }
}
