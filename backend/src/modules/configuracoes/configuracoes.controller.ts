import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../shared/utils/response';
import { ConfiguracoesService } from './configuracoes.service';

const service = new ConfiguracoesService();

const saveEntePublicoSchema = z.object({
  codigoEmpresa: z.string().min(1),
  codigoPredio: z.string().min(1),
  estadual: z.boolean()
});

export async function getEntePublicoOpcoesController(_request: FastifyRequest, reply: FastifyReply) {
  const data = await service.getEntePublicoOpcoes();
  return successResponse(reply, data, 'Opções de ente público carregadas com sucesso.');
}

export async function saveEntePublicoController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = saveEntePublicoSchema.safeParse(request.body);
  if (!parsed.success) {
    return errorResponse(reply, 'Dados inválidos para salvar configuração de ente público.', 400);
  }

  const login = String((request.user as { login?: string } | undefined)?.login ?? 'sistema');

  await service.saveEntePublico({
    ...parsed.data,
    usuario: login
  });

  return successResponse(reply, { ok: true }, 'Configuração salva com sucesso.');
}
