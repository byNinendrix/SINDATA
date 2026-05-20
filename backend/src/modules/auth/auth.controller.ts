import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../shared/utils/response';
import { AuthRepository } from './auth.repository';
import { AuthInfrastructureError, AuthService } from './auth.service';

const loginSchema = z.object({
  login: z.string().min(1, 'Usuário é obrigatório.'),
  senha: z.string().min(1, 'Senha é obrigatória.')
});

const authService = new AuthService(new AuthRepository());

export async function loginController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const parsedBody = loginSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return errorResponse(reply, 'Usuário ou senha inválidos.', 400);
    }

    const { login, senha } = parsedBody.data;
    const authResult = await authService.login(login, senha);

    if (!authResult) {
      return errorResponse(reply, 'Usuário ou senha inválidos.', 401);
    }

    return successResponse(
      reply,
      {
        token: authResult.token,
        user: {
          login: authResult.user.login
        }
      },
      'Login realizado com sucesso.'
    );
  } catch (error) {
    if (error instanceof AuthInfrastructureError) {
      return errorResponse(reply, error.message, 503);
    }

    return errorResponse(reply, 'Não foi possível validar o login no momento.', 500);
  }
}

export async function meController(request: FastifyRequest, reply: FastifyReply) {
  return successResponse(
    reply,
    {
      user: request.user
    },
    'Usuário autenticado.'
  );
}
