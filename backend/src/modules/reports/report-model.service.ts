import { getSqlPool, sql } from '../../database/sqlserver';
import type {
  SaveReportModelInput,
  SavedReportDefinition,
  SavedReportModelEntity,
  SavedReportModelSummary
} from './report-model.types';

interface SavedReportModelDbRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  visibility: 'private' | 'team' | 'public';
  owner_user_id: number | null;
  owner_user_login: string;
  created_by: string;
  updated_by: string;
  definition_json: string;
  version: number;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

function safeIsoString(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function getArrayCount(definition: SavedReportDefinition, keys: string[]): number {
  for (const key of keys) {
    const value = definition[key as keyof SavedReportDefinition];
    if (Array.isArray(value)) {
      return value.length;
    }
  }
  return 0;
}

function buildSummary(definition: SavedReportDefinition) {
  return {
    tablesCount: getArrayCount(definition, ['selectedTableIds', 'selectedTables', 'tables']),
    fieldsCount: getArrayCount(definition, ['selectedFieldKeys', 'selectedFields', 'fields']),
    filtersCount: Array.isArray(definition.filters) ? definition.filters.length : 0,
    relationsCount: Array.isArray(definition.manualRelations) ? definition.manualRelations.length : 0
  };
}

function parseDefinitionJson(definitionJsonRaw: string): SavedReportDefinition {
  try {
    const parsed = JSON.parse(definitionJsonRaw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error();
    }
    return parsed as SavedReportDefinition;
  } catch {
    return {};
  }
}

function normalizeEntity(row: SavedReportModelDbRow): SavedReportModelEntity {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    category: row.category ?? 'geral',
    visibility: row.visibility,
    ownerUserId: row.owner_user_id,
    ownerUserLogin: row.owner_user_login,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    definitionJson: parseDefinitionJson(row.definition_json),
    version: row.version,
    isActive: Boolean(row.is_active),
    createdAt: safeIsoString(row.created_at),
    updatedAt: safeIsoString(row.updated_at)
  };
}

function normalizeSummary(row: SavedReportModelDbRow): SavedReportModelSummary {
  const entity = normalizeEntity(row);
  return {
    ...entity,
    summary: buildSummary(entity.definitionJson)
  };
}

function isOwnerOrPublic(model: SavedReportModelEntity, login: string): boolean {
  return model.ownerUserLogin.toLowerCase() === login.toLowerCase() || model.visibility === 'public';
}

function isOwner(model: SavedReportModelEntity, login: string): boolean {
  return model.ownerUserLogin.toLowerCase() === login.toLowerCase();
}

export class ReportModelValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportModelValidationError';
  }
}

export class ReportModelForbiddenError extends Error {
  constructor(message = 'Voce nao possui permissao para acessar este modelo.') {
    super(message);
    this.name = 'ReportModelForbiddenError';
  }
}

export class ReportModelNotFoundError extends Error {
  constructor(message = 'Modelo de relatorio nao encontrado.') {
    super(message);
    this.name = 'ReportModelNotFoundError';
  }
}

export class ReportModelService {
  private readonly maxDefinitionLength = 300_000;

  private async resolveOwnerUserId(login: string): Promise<number | null> {
    const pool = await getSqlPool();
    const request = pool.request().input('login', sql.VarChar(120), login);
    const result = await request.query<{ USR_CODIGO: number }>(`
      SELECT TOP 1 USR_CODIGO
      FROM FR_USUARIO
      WHERE LOWER(USR_LOGIN) = LOWER(@login)
    `);
    const userCode = result.recordset[0]?.USR_CODIGO;
    return typeof userCode === 'number' ? userCode : null;
  }

  private serializeDefinition(definitionJson: SavedReportDefinition): string {
    const serialized = JSON.stringify(definitionJson);
    if (serialized.length > this.maxDefinitionLength) {
      throw new ReportModelValidationError(
        `A definicao do modelo excedeu o limite permitido de ${this.maxDefinitionLength} caracteres.`
      );
    }
    return serialized;
  }

  private validateDefinition(definitionJson: SavedReportDefinition) {
    if (!definitionJson || typeof definitionJson !== 'object' || Array.isArray(definitionJson)) {
      throw new ReportModelValidationError('A definicao do modelo deve ser um objeto JSON valido.');
    }

    const tablesCount = getArrayCount(definitionJson, ['selectedTableIds', 'selectedTables', 'tables']);
    const fieldsCount = getArrayCount(definitionJson, ['selectedFieldKeys', 'selectedFields', 'fields']);

    if (tablesCount <= 0) {
      throw new ReportModelValidationError('A definicao do modelo deve conter pelo menos uma tabela selecionada.');
    }

    if (fieldsCount <= 0) {
      throw new ReportModelValidationError('A definicao do modelo deve conter pelo menos um campo selecionado.');
    }
  }

  private sanitizeInput(input: SaveReportModelInput): SaveReportModelInput {
    const name = input.name.trim();
    const description = input.description.trim();
    const category = input.category.trim() || 'geral';

    if (!name) {
      throw new ReportModelValidationError('O nome do modelo de relatorio e obrigatorio.');
    }
    if (name.length > 150) {
      throw new ReportModelValidationError('O nome do modelo de relatorio deve ter no maximo 150 caracteres.');
    }
    if (description.length > 1000) {
      throw new ReportModelValidationError('A descricao do modelo de relatorio deve ter no maximo 1000 caracteres.');
    }
    if (category.length > 60) {
      throw new ReportModelValidationError('A categoria do modelo de relatorio deve ter no maximo 60 caracteres.');
    }

    if (!['private', 'team', 'public'].includes(input.visibility)) {
      throw new ReportModelValidationError('Visibilidade invalida para modelo de relatorio.');
    }

    this.validateDefinition(input.definitionJson);

    return {
      ...input,
      name,
      description,
      category
    };
  }

  private async getModelByIdInternal(id: string): Promise<SavedReportModelEntity | null> {
    const pool = await getSqlPool();
    const request = pool.request().input('id', sql.UniqueIdentifier, id);
    const result = await request.query<SavedReportModelDbRow>(`
      SELECT
        id,
        name,
        description,
        category,
        visibility,
        owner_user_id,
        owner_user_login,
        created_by,
        updated_by,
        definition_json,
        version,
        is_active,
        created_at,
        updated_at
      FROM saved_report_models
      WHERE id = @id
        AND is_active = 1
        AND deleted_at IS NULL
    `);

    const row = result.recordset[0];
    return row ? normalizeEntity(row) : null;
  }

  async listModels(login: string): Promise<SavedReportModelSummary[]> {
    const pool = await getSqlPool();
    const request = pool.request().input('login', sql.VarChar(120), login);
    const result = await request.query<SavedReportModelDbRow>(`
      SELECT
        id,
        name,
        description,
        category,
        visibility,
        owner_user_id,
        owner_user_login,
        created_by,
        updated_by,
        definition_json,
        version,
        is_active,
        created_at,
        updated_at
      FROM saved_report_models
      WHERE is_active = 1
        AND deleted_at IS NULL
        AND (
          owner_user_login = @login
          OR visibility = 'public'
        )
      ORDER BY updated_at DESC
    `);

    return result.recordset.map((row) => normalizeSummary(row));
  }

  async getModelById(login: string, id: string): Promise<SavedReportModelEntity> {
    const model = await this.getModelByIdInternal(id);
    if (!model) {
      throw new ReportModelNotFoundError();
    }

    if (!isOwnerOrPublic(model, login)) {
      throw new ReportModelForbiddenError();
    }

    return model;
  }

  async createModel(login: string, input: SaveReportModelInput): Promise<SavedReportModelEntity> {
    const sanitized = this.sanitizeInput(input);
    const definitionJson = this.serializeDefinition(sanitized.definitionJson);
    const ownerUserId = await this.resolveOwnerUserId(login);
    const pool = await getSqlPool();

    const request = pool
      .request()
      .input('name', sql.NVarChar(150), sanitized.name)
      .input('description', sql.NVarChar(sql.MAX), sanitized.description)
      .input('category', sql.VarChar(60), sanitized.category)
      .input('visibility', sql.VarChar(20), sanitized.visibility)
      .input('ownerUserId', sql.Int, ownerUserId)
      .input('ownerUserLogin', sql.VarChar(120), login)
      .input('createdBy', sql.VarChar(120), login)
      .input('updatedBy', sql.VarChar(120), login)
      .input('definitionJson', sql.NVarChar(sql.MAX), definitionJson);

    const result = await request.query<SavedReportModelDbRow>(`
      INSERT INTO saved_report_models (
        name,
        description,
        category,
        visibility,
        owner_user_id,
        owner_user_login,
        created_by,
        updated_by,
        definition_json,
        version,
        is_active
      )
      OUTPUT
        INSERTED.id,
        INSERTED.name,
        INSERTED.description,
        INSERTED.category,
        INSERTED.visibility,
        INSERTED.owner_user_id,
        INSERTED.owner_user_login,
        INSERTED.created_by,
        INSERTED.updated_by,
        INSERTED.definition_json,
        INSERTED.version,
        INSERTED.is_active,
        INSERTED.created_at,
        INSERTED.updated_at
      VALUES (
        @name,
        @description,
        @category,
        @visibility,
        @ownerUserId,
        @ownerUserLogin,
        @createdBy,
        @updatedBy,
        @definitionJson,
        1,
        1
      )
    `);

    const row = result.recordset[0];
    if (!row) {
      throw new Error('Falha ao criar modelo de relatorio.');
    }

    return normalizeEntity(row);
  }

  async updateModel(login: string, id: string, input: SaveReportModelInput): Promise<SavedReportModelEntity> {
    const current = await this.getModelByIdInternal(id);
    if (!current) {
      throw new ReportModelNotFoundError();
    }

    if (!isOwner(current, login)) {
      throw new ReportModelForbiddenError('Voce nao possui permissao para editar este modelo.');
    }

    const sanitized = this.sanitizeInput(input);
    const definitionJson = this.serializeDefinition(sanitized.definitionJson);
    const pool = await getSqlPool();
    const request = pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar(150), sanitized.name)
      .input('description', sql.NVarChar(sql.MAX), sanitized.description)
      .input('category', sql.VarChar(60), sanitized.category)
      .input('visibility', sql.VarChar(20), sanitized.visibility)
      .input('updatedBy', sql.VarChar(120), login)
      .input('definitionJson', sql.NVarChar(sql.MAX), definitionJson);

    const result = await request.query<SavedReportModelDbRow>(`
      UPDATE saved_report_models
      SET
        name = @name,
        description = @description,
        category = @category,
        visibility = @visibility,
        definition_json = @definitionJson,
        updated_by = @updatedBy,
        updated_at = SYSUTCDATETIME(),
        version = version + 1
      OUTPUT
        INSERTED.id,
        INSERTED.name,
        INSERTED.description,
        INSERTED.category,
        INSERTED.visibility,
        INSERTED.owner_user_id,
        INSERTED.owner_user_login,
        INSERTED.created_by,
        INSERTED.updated_by,
        INSERTED.definition_json,
        INSERTED.version,
        INSERTED.is_active,
        INSERTED.created_at,
        INSERTED.updated_at
      WHERE id = @id
        AND is_active = 1
        AND deleted_at IS NULL
    `);

    const row = result.recordset[0];
    if (!row) {
      throw new ReportModelNotFoundError();
    }

    return normalizeEntity(row);
  }

  async deleteModel(login: string, id: string): Promise<void> {
    const current = await this.getModelByIdInternal(id);
    if (!current) {
      throw new ReportModelNotFoundError();
    }

    if (!isOwner(current, login)) {
      throw new ReportModelForbiddenError('Voce nao possui permissao para excluir este modelo.');
    }

    const pool = await getSqlPool();
    const request = pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('updatedBy', sql.VarChar(120), login);

    await request.query(`
      UPDATE saved_report_models
      SET
        is_active = 0,
        deleted_at = SYSUTCDATETIME(),
        updated_by = @updatedBy,
        updated_at = SYSUTCDATETIME()
      WHERE id = @id
        AND is_active = 1
        AND deleted_at IS NULL
    `);
  }

  async duplicateModel(login: string, id: string): Promise<SavedReportModelEntity> {
    const source = await this.getModelById(login, id);
    const ownerUserId = await this.resolveOwnerUserId(login);
    const duplicatedName = `Copia de ${source.name}`.slice(0, 150);
    const definitionJson = this.serializeDefinition(source.definitionJson);

    const pool = await getSqlPool();
    const request = pool
      .request()
      .input('name', sql.NVarChar(150), duplicatedName)
      .input('description', sql.NVarChar(sql.MAX), source.description)
      .input('category', sql.VarChar(60), source.category)
      .input('visibility', sql.VarChar(20), 'private')
      .input('ownerUserId', sql.Int, ownerUserId)
      .input('ownerUserLogin', sql.VarChar(120), login)
      .input('createdBy', sql.VarChar(120), login)
      .input('updatedBy', sql.VarChar(120), login)
      .input('definitionJson', sql.NVarChar(sql.MAX), definitionJson);

    const result = await request.query<SavedReportModelDbRow>(`
      INSERT INTO saved_report_models (
        name,
        description,
        category,
        visibility,
        owner_user_id,
        owner_user_login,
        created_by,
        updated_by,
        definition_json,
        version,
        is_active
      )
      OUTPUT
        INSERTED.id,
        INSERTED.name,
        INSERTED.description,
        INSERTED.category,
        INSERTED.visibility,
        INSERTED.owner_user_id,
        INSERTED.owner_user_login,
        INSERTED.created_by,
        INSERTED.updated_by,
        INSERTED.definition_json,
        INSERTED.version,
        INSERTED.is_active,
        INSERTED.created_at,
        INSERTED.updated_at
      VALUES (
        @name,
        @description,
        @category,
        @visibility,
        @ownerUserId,
        @ownerUserLogin,
        @createdBy,
        @updatedBy,
        @definitionJson,
        1,
        1
      )
    `);

    const row = result.recordset[0];
    if (!row) {
      throw new Error('Falha ao duplicar modelo de relatorio.');
    }

    return normalizeEntity(row);
  }
}
