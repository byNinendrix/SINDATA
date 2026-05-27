import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../shared/utils/response';
import { RelatoriosService } from './relatorios.service';

const relatoriosService = new RelatoriosService();

const relationSchema = z.object({
  sourceTableId: z.string().trim().min(1),
  sourceFieldId: z.string().trim().min(1),
  targetTableId: z.string().trim().min(1),
  targetFieldId: z.string().trim().min(1),
  operator: z.literal('equals')
});

const filterSchema = z.object({
  tableId: z.string().trim().min(1),
  fieldId: z.string().trim().min(1),
  condition: z.enum(['Igual a', 'Diferente de', 'Contem', 'Maior que', 'Menor que', 'Entre']),
  value: z.string().default(''),
  secondValue: z.string().optional()
});

const previewBodySchema = z.object({
  selectedTableIds: z.array(z.string().trim().min(1)).default([]),
  selectedFieldKeys: z.array(z.string().trim().min(1)).default([]),
  manualRelations: z.array(relationSchema).default([]),
  filters: z.array(filterSchema).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  orderBy: z.string().trim().optional()
});

export async function relatoriosPreviewController(request: FastifyRequest, reply: FastifyReply) {
  const parsedBody = previewBodySchema.safeParse(request.body);

  if (!parsedBody.success) {
    request.log.warn(
      {
        issues: parsedBody.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      },
      'Payload invalido na previa de relatorio.'
    );
    const firstIssue = parsedBody.error.issues[0];
    const details = firstIssue ? `${firstIssue.path.join('.') || 'body'}: ${firstIssue.message}` : '';
    const message = details
      ? `Parâmetros inválidos para prévia do relatório. ${details}`
      : 'Parâmetros inválidos para prévia do relatório.';
    return errorResponse(reply, message, 400);
  }

  try {
    request.log.info(
      {
        selectedTableIds: parsedBody.data.selectedTableIds,
        selectedFieldKeys: parsedBody.data.selectedFieldKeys,
        manualRelations: parsedBody.data.manualRelations.map((relation) => ({
          sourceTableId: relation.sourceTableId,
          sourceFieldId: relation.sourceFieldId,
          targetTableId: relation.targetTableId,
          targetFieldId: relation.targetFieldId
        })),
        filtersCount: parsedBody.data.filters?.length ?? 0,
        limit: parsedBody.data.limit ?? null,
        orderBy: parsedBody.data.orderBy ?? null
      },
      'Gerando previa real do relatorio.'
    );
    const preview = await relatoriosService.getPreview(parsedBody.data);
    return successResponse(reply, preview, 'Prévia real carregada com sucesso.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível gerar a prévia real.';
    request.log.warn({ message }, 'Falha ao gerar previa real do relatorio.');
    return errorResponse(reply, message, 400);
  }
}
