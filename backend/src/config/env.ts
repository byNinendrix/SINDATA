import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

dotenvConfig();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatório.'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  DB_SERVER: z.string().min(1, 'DB_SERVER é obrigatório.'),
  DB_PORT: z.coerce.number().default(1433),
  DB_USER: z.string().min(1, 'DB_USER é obrigatório.'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD é obrigatório.'),
  DB_DATABASE: z.string().min(1, 'DB_DATABASE é obrigatório.'),
  DB_ENCRYPT: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  DB_TRUST_SERVER_CERTIFICATE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formatted = parsedEnv.error.flatten().fieldErrors;
  throw new Error(`Erro ao validar variáveis de ambiente: ${JSON.stringify(formatted)}`);
}

export const env = parsedEnv.data;
