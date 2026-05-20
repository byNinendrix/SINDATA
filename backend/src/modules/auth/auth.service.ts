import jwt, { type SignOptions } from 'jsonwebtoken';
import { createHash } from 'crypto';
import { env } from '../../config/env';
import { AuthRepository } from './auth.repository';
import type { AuthUser } from './auth.types';

export class AuthInfrastructureError extends Error {
  constructor(message = 'Falha ao consultar a base de autenticação.') {
    super(message);
    this.name = 'AuthInfrastructureError';
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthUser;
    user: AuthUser;
  }
}

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  private validatePassword(inputPassword: string, storedPassword: string): boolean {
    const normalizedInput = inputPassword.trim();
    const normalizedStored = String(storedPassword ?? '').trim();

    if (!normalizedStored) {
      return false;
    }

    // Compatibilidade MVP com legados:
    // 1) texto puro
    // 2) MD5 (32 hex)
    // 3) SHA1 (40 hex)
    // TODO: confirmar padrão oficial de hash/criptografia do SGS/Maker antes de produção.
    if (normalizedInput === normalizedStored) {
      return true;
    }

    const md5 = createHash('md5').update(normalizedInput).digest('hex');
    if (md5.toLowerCase() === normalizedStored.toLowerCase()) {
      return true;
    }

    // Compatibilidade com legado observado no SGS (ex.: senha "1" armazenada como MD5 de "11").
    const md5Duplicated = createHash('md5')
      .update(`${normalizedInput}${normalizedInput}`)
      .digest('hex');
    if (md5Duplicated.toLowerCase() === normalizedStored.toLowerCase()) {
      return true;
    }

    const sha1 = createHash('sha1').update(normalizedInput).digest('hex');
    if (sha1.toLowerCase() === normalizedStored.toLowerCase()) {
      return true;
    }

    return false;
  }

  async login(login: string, senha: string): Promise<{ token: string; user: AuthUser } | null> {
    let userRecord;

    try {
      userRecord = await this.authRepository.findByLogin(login);
    } catch {
      throw new AuthInfrastructureError(
        'Não foi possível conectar à base SINTESE. Verifique as variáveis DB_* do backend/.env.'
      );
    }

    if (!userRecord) {
      return null;
    }

    const isPasswordValid = this.validatePassword(senha, userRecord.USR_SENHA);

    if (!isPasswordValid) {
      return null;
    }

    const user: AuthUser = {
      login: userRecord.USR_LOGIN
    };

    const token = jwt.sign(user, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
    });

    return { token, user };
  }
}
