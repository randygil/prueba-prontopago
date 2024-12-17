import 'dotenv/config';
class config {
  static getEnv(variable: string): string {
    if (!process.env[variable]) {
      throw new Error(`Environment variable ${variable} is not defined`);
    }
    return process.env[variable];
  }

  get port(): number {
    return Number(config.getEnv('PORT'));
  }

  get appKey(): string {
    return config.getEnv('APP_KEY');
  }

  get paypalClientId(): string {
    return config.getEnv('PAYPAL_CLIENT_ID');
  }

  get paypalClientSecret(): string {
    return config.getEnv('PAYPAL_CLIENT_SECRET');
  }

  get paypalMode(): string {
    return config.getEnv('PAYPAL_MODE');
  }
}

export default new config();
