import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../shared/utils/response';
import { ReportMetadataService } from './report-metadata.service';

const reportMetadataService = new ReportMetadataService();

const tableIdParamsSchema = z.object({
  id: z.string().trim().min(1)
});

function handleMetadataError(reply: FastifyReply, error: unknown) {
  const message = error instanceof Error ? error.message : 'Falha ao carregar metadados do gerador de relatorios.';
  return errorResponse(reply, message, 500);
}

export async function getReportMetadataController(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const metadata = await reportMetadataService.getCatalog();
    return successResponse(reply, metadata, 'Metadados do gerador carregados com sucesso.');
  } catch (error) {
    return handleMetadataError(reply, error);
  }
}

export async function getReportMetadataTablesController(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const tables = await reportMetadataService.getTables();
    return successResponse(reply, tables, 'Tabelas de metadados carregadas com sucesso.');
  } catch (error) {
    return handleMetadataError(reply, error);
  }
}

export async function getReportMetadataTableFieldsController(request: FastifyRequest, reply: FastifyReply) {
  const parsedParams = tableIdParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    return errorResponse(reply, 'Identificador de tabela invalido.', 400);
  }

  try {
    const fields = await reportMetadataService.getFields(parsedParams.data.id);
    return successResponse(reply, fields, 'Campos da tabela carregados com sucesso.');
  } catch (error) {
    return handleMetadataError(reply, error);
  }
}

export async function getReportMetadataRelationsController(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const relations = await reportMetadataService.getRelations();
    return successResponse(reply, relations, 'Relacoes de metadados carregadas com sucesso.');
  } catch (error) {
    return handleMetadataError(reply, error);
  }
}

export async function getReportMetadataFilterOperatorsController(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const operators = await reportMetadataService.getFilterOperators();
    return successResponse(reply, operators, 'Operadores de filtro carregados com sucesso.');
  } catch (error) {
    return handleMetadataError(reply, error);
  }
}
