import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../shared/utils/response';
import { ReportPreviewService, ReportPreviewValidationError } from './report-preview.service';

const reportPreviewService = new ReportPreviewService();

const selectedFieldSchema = z.object({
  fieldId: z.string().trim().min(1),
  alias: z.string().trim().max(120).optional()
});

const relationSchema = z.object({
  sourceFieldId: z.string().trim().min(1),
  targetFieldId: z.string().trim().min(1),
  operator: z.literal('equals')
});

const filterSchema = z.object({
  fieldId: z.string().trim().min(1),
  operator: z.string().trim().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]).optional(),
  secondValue: z.union([z.string(), z.number()]).optional(),
  logicalConnector: z.enum(['AND', 'OR']).optional()
});

const settingsSchema = z.object({
  orderByFieldId: z.string().trim().min(1).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  maskCpf: z.boolean().optional(),
  maskName: z.boolean().optional(),
  removeDuplicates: z.boolean().optional()
});

const previewBodySchema = z.object({
  selectedTables: z.array(z.string().trim().min(1)).default([]),
  selectedFields: z.array(selectedFieldSchema).default([]),
  relations: z.array(relationSchema).optional(),
  filters: z.array(filterSchema).optional(),
  settings: settingsSchema.optional(),
  reportModelId: z.string().trim().optional()
});

function getUserLogin(request: FastifyRequest): string {
  const login = request.user?.login?.trim();
  if (!login) {
    throw new ReportPreviewValidationError('Usuario autenticado invalido para gerar a previa.');
  }
  return login;
}

export async function previewReportController(request: FastifyRequest, reply: FastifyReply) {
  const parsedBody = previewBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issue = parsedBody.error.issues[0];
    return errorResponse(reply, `Payload invalido: ${issue?.message ?? 'dados invalidos'}.`, 400);
  }

  try {
    const login = getUserLogin(request);
    const preview = await reportPreviewService.preview(login, parsedBody.data);
    return successResponse(reply, preview, 'Previa real carregada com sucesso.');
  } catch (error) {
    if (error instanceof ReportPreviewValidationError) {
      return errorResponse(reply, error.message, 400);
    }

    return errorResponse(reply, 'Nao foi possivel gerar a previa do relatorio.', 500);
  }
}
