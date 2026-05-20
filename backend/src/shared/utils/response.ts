import type { FastifyReply } from 'fastify';

export function successResponse<T>(reply: FastifyReply, data: T, message = 'Sucesso.') {
  return reply.status(200).send({
    success: true,
    message,
    data
  });
}

export function errorResponse(reply: FastifyReply, message: string, statusCode = 400) {
  return reply.status(statusCode).send({
    success: false,
    message
  });
}
