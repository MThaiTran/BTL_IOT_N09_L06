import { config } from 'dotenv';
config();

export const NODE_ENV = process.env.NODE_ENV;

export const jwtConfig = {
  SALT_ROUNDS: process.env.SALT_ROUNDS || 12,
  SECRET: process.env.TOKEN_SECRET || 'defaultSecret',
  EXPIRED_IN: process.env.TOKEN_EXPIRED_IN || '1h',
  REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET || 'defaultRefreshSecret',
  REFRESH_EXPIRED_IN: process.env.REFRESH_TOKEN_EXPIRED_IN || '1h ',
};

export const databaseConfig = {
  TYPE: process.env.DB_TYPE || 'postgres',
  HOST: process.env.DB_HOST || 'localhost',
  PORT: +process.env.DB_PORT! || 5432,
  USERNAME: process.env.DB_USERNAME,
  PASSWORD: process.env.DB_PASSWORD,
  DATABASE: process.env.DB_DATABASE_NAME,
};
