import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../shared/utils/response';
import {
  ReportModelForbiddenError,
  ReportModelNotFoundError,
  ReportModelService,
  ReportModelValidationError
} from './report-model.service';
import type { ReportModelVisibility, SavedReportDefinition } from './report-model.types';

const reportModelService = new ReportModelService();

const definitionSchema = z
  .record(z.unknown())
  .superRefine((definition, ctx) => {
    const tables = Array.isArray(definition.selectedTableIds)
      ? definition.selectedTableIds
      : Array.isArray(definition.selectedTables)
      ? definition.selectedTables
      : Array.isArray(definition.tables)
      ? definition.tables
      : [];

    const fields = Array.isArray(definition.selectedFieldKeys)
      ? definition.selectedFieldKeys
      : Array.isArray(definition.selectedFields)
      ? definition.selectedFields
      : Array.isArray(definition.fields)
      ? definition.fields
      : [];

    if (tables.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A definicao precisa conter pelo menos uma tabela selecionada.'
      });
    }

    if (fields.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A definicao precisa conter pelo menos um campo selecionado.'
      });
    }
  });

const payloadSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).optional().default(''),
  category: z.string().trim().max(60).optional().default('geral'),
  visibility: z.enum(['private', 'team', 'public']),
  definitionJson: definitionSchema
});

const idParamsSchema = z.object({
  id: z.string().uuid()
});

function getUserLogin(request: FastifyRequest): string {
  const login = request.user?.login?.trim();
  if (!login) {
    throw new ReportModelForbiddenError('Usuario autenticado invalido para operacao de modelos.');
  }
  return login;
}

function formatModelResponse(model: {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: ReportModelVisibility;
  ownerUserId: number | null;
  ownerUserLogin: string;
  createdBy: string;
  updatedBy: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  definitionJson?: SavedReportDefinition;
  summary?: {
    tablesCount: number;
    fieldsCount: number;
    filtersCount: number;
    relationsCount: number;
  };
}) {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    category: model.category,
    visibility: model.visibility,
    ownerUserId: model.ownerUserId,
    ownerUserLogin: model.ownerUserLogin,
    createdBy: model.createdBy,
    updatedBy: model.updatedBy,
    version: model.version,
    isActive: model.isActive,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    summary: model.summary,
    definitionJson: model.definitionJson
  };
}

function handleControllerError(reply: FastifyReply, error: unknown) {
  if (error instanceof ReportModelValidationError) {
    return errorResponse(reply, error.message, 400);
  }

  if (error instanceof ReportModelForbiddenError) {
    return errorResponse(reply, error.message, 403);
  }

  if (error instanceof ReportModelNotFoundError) {
    return errorResponse(reply, error.message, 404);
  }

  const message = error instanceof Error ? error.message : 'Falha ao processar modelos de relatorio.';
  return errorResponse(reply, message, 500);
}

export async function listReportModelsController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const login = getUserLogin(request);
    const models = await reportModelService.listModels(login);
    return successResponse(
      reply,
      models.map((model) => formatModelResponse(model)),
      'Modelos de relatorio carregados com sucesso.'
    );
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

export async function getReportModelByIdController(request: FastifyRequest, reply: FastifyReply) {
  const parsedParams = idParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    return errorResponse(reply, 'Identificador de modelo invalido.', 400);
  }

  try {
    const login = getUserLogin(request);
    const model = await reportModelService.getModelById(login, parsedParams.data.id);
    return successResponse(reply, formatModelResponse(model), 'Modelo de relatorio carregado com sucesso.');
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

export async function createReportModelController(request: FastifyRequest, reply: FastifyReply) {
  const parsedBody = payloadSchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issue = parsedBody.error.issues[0];
    return errorResponse(reply, `Payload invalido: ${issue?.message ?? 'dados invalidos'}.`, 400);
  }

  try {
    const login = getUserLogin(request);
    const model = await reportModelService.createModel(login, parsedBody.data);
    return successResponse(reply, formatModelResponse(model), 'Modelo de relatorio salvo com sucesso.');
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

export async function updateReportModelController(request: FastifyRequest, reply: FastifyReply) {
  const parsedParams = idParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    return errorResponse(reply, 'Identificador de modelo invalido.', 400);
  }

  const parsedBody = payloadSchema.safeParse(request.body);
  if (!parsedBody.success) {
    const issue = parsedBody.error.issues[0];
    return errorResponse(reply, `Payload invalido: ${issue?.message ?? 'dados invalidos'}.`, 400);
  }

  try {
    const login = getUserLogin(request);
    const model = await reportModelService.updateModel(login, parsedParams.data.id, parsedBody.data);
    return successResponse(reply, formatModelResponse(model), 'Modelo de relatorio atualizado com sucesso.');
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

export async function deleteReportModelController(request: FastifyRequest, reply: FastifyReply) {
  const parsedParams = idParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    return errorResponse(reply, 'Identificador de modelo invalido.', 400);
  }

  try {
    const login = getUserLogin(request);
    await reportModelService.deleteModel(login, parsedParams.data.id);
    return successResponse(reply, { id: parsedParams.data.id }, 'Modelo de relatorio removido com sucesso.');
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

export async function duplicateReportModelController(request: FastifyRequest, reply: FastifyReply) {
  const parsedParams = idParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    return errorResponse(reply, 'Identificador de modelo invalido.', 400);
  }

  try {
    const login = getUserLogin(request);
    const model = await reportModelService.duplicateModel(login, parsedParams.data.id);
    return successResponse(reply, formatModelResponse(model), 'Modelo de relatorio duplicado com sucesso.');
  } catch (error) {
    return handleControllerError(reply, error);
  }
}
