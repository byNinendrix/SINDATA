IF OBJECT_ID('dbo.report_data_sources', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.report_data_sources (
    id VARCHAR(60) NOT NULL CONSTRAINT PK_report_data_sources PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_report_data_sources_is_active DEFAULT 1,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_report_data_sources_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_report_data_sources_updated_at DEFAULT SYSUTCDATETIME()
  );
END;
GO

IF OBJECT_ID('dbo.report_tables', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.report_tables (
    id VARCHAR(120) NOT NULL CONSTRAINT PK_report_tables PRIMARY KEY,
    source_id VARCHAR(60) NOT NULL,
    technical_name VARCHAR(140) NOT NULL,
    display_name NVARCHAR(140) NOT NULL,
    description NVARCHAR(500) NULL,
    category VARCHAR(80) NOT NULL,
    icon VARCHAR(80) NULL,
    sort_order INT NOT NULL CONSTRAINT DF_report_tables_sort_order DEFAULT 1000,
    is_active BIT NOT NULL CONSTRAINT DF_report_tables_is_active DEFAULT 1,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_report_tables_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_report_tables_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_report_tables_source FOREIGN KEY (source_id) REFERENCES dbo.report_data_sources(id)
  );
END;
GO

IF OBJECT_ID('dbo.report_fields', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.report_fields (
    id VARCHAR(180) NOT NULL CONSTRAINT PK_report_fields PRIMARY KEY,
    table_id VARCHAR(120) NOT NULL,
    technical_name VARCHAR(160) NOT NULL,
    display_name NVARCHAR(160) NOT NULL,
    description NVARCHAR(500) NULL,
    data_type VARCHAR(20) NOT NULL,
    is_selectable BIT NOT NULL CONSTRAINT DF_report_fields_is_selectable DEFAULT 1,
    is_filterable BIT NOT NULL CONSTRAINT DF_report_fields_is_filterable DEFAULT 1,
    is_sortable BIT NOT NULL CONSTRAINT DF_report_fields_is_sortable DEFAULT 1,
    is_groupable BIT NOT NULL CONSTRAINT DF_report_fields_is_groupable DEFAULT 1,
    is_sensitive BIT NOT NULL CONSTRAINT DF_report_fields_is_sensitive DEFAULT 0,
    mask_type VARCHAR(20) NOT NULL CONSTRAINT DF_report_fields_mask_type DEFAULT 'none',
    sort_order INT NOT NULL CONSTRAINT DF_report_fields_sort_order DEFAULT 1000,
    is_active BIT NOT NULL CONSTRAINT DF_report_fields_is_active DEFAULT 1,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_report_fields_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_report_fields_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_report_fields_table FOREIGN KEY (table_id) REFERENCES dbo.report_tables(id),
    CONSTRAINT CK_report_fields_data_type CHECK (data_type IN ('text', 'number', 'date', 'boolean', 'option')),
    CONSTRAINT CK_report_fields_mask_type CHECK (mask_type IN ('none', 'cpf', 'currency', 'date'))
  );
END;
GO

IF OBJECT_ID('dbo.report_relations', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.report_relations (
    id VARCHAR(180) NOT NULL CONSTRAINT PK_report_relations PRIMARY KEY,
    source_table_id VARCHAR(120) NOT NULL,
    source_field_id VARCHAR(180) NOT NULL,
    target_table_id VARCHAR(120) NOT NULL,
    target_field_id VARCHAR(180) NOT NULL,
    relation_type VARCHAR(20) NOT NULL CONSTRAINT DF_report_relations_relation_type DEFAULT 'equals',
    display_label NVARCHAR(240) NULL,
    is_required BIT NOT NULL CONSTRAINT DF_report_relations_is_required DEFAULT 0,
    is_active BIT NOT NULL CONSTRAINT DF_report_relations_is_active DEFAULT 1,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_report_relations_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_report_relations_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_report_relations_source_table FOREIGN KEY (source_table_id) REFERENCES dbo.report_tables(id),
    CONSTRAINT FK_report_relations_target_table FOREIGN KEY (target_table_id) REFERENCES dbo.report_tables(id),
    CONSTRAINT FK_report_relations_source_field FOREIGN KEY (source_field_id) REFERENCES dbo.report_fields(id),
    CONSTRAINT FK_report_relations_target_field FOREIGN KEY (target_field_id) REFERENCES dbo.report_fields(id),
    CONSTRAINT CK_report_relations_relation_type CHECK (relation_type IN ('equals'))
  );
END;
GO

IF OBJECT_ID('dbo.report_filter_operators', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.report_filter_operators (
    id VARCHAR(120) NOT NULL CONSTRAINT PK_report_filter_operators PRIMARY KEY,
    data_type VARCHAR(20) NOT NULL,
    operator_code VARCHAR(40) NOT NULL,
    display_name NVARCHAR(80) NOT NULL,
    requires_value BIT NOT NULL,
    requires_second_value BIT NOT NULL,
    is_active BIT NOT NULL CONSTRAINT DF_report_filter_operators_is_active DEFAULT 1,
    sort_order INT NOT NULL CONSTRAINT DF_report_filter_operators_sort_order DEFAULT 1000,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_report_filter_operators_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_report_filter_operators_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_report_filter_operators_data_type CHECK (data_type IN ('text', 'number', 'date', 'boolean', 'option'))
  );
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.report_data_sources WHERE id = 'default')
BEGIN
  INSERT INTO dbo.report_data_sources (id, name, description, is_active)
  VALUES ('default', N'Base principal SINDATA', N'Fonte principal de dados do SINDATA.', 1);
END;
GO

MERGE dbo.report_tables AS target
USING (
  VALUES
    ('pessoas', 'default', 'PESSOAS', N'Pessoas', N'Dados cadastrais das pessoas.', 'pessoas_filiacoes', 'users', 10, 1),
    ('filiacoes', 'default', 'FILIADO', N'Filiacoes', N'Informacoes de vinculo sindical.', 'pessoas_filiacoes', 'link', 20, 1),
    ('escolas', 'default', 'PREDIO', N'Predio', N'Dados dos predios.', 'estrutura_sindical', 'school', 30, 1),
    ('ente_publico', 'default', 'EMPRESA', N'Ente Publico', N'Dados de ente publico.', 'estrutura_sindical', 'building', 40, 1),
    ('municipios', 'default', 'MUNICIPIOS', N'Municipios', N'Informacoes territoriais por municipio.', 'local_trabalho', 'map-pin', 50, 1),
    ('regionais', 'default', 'REGIONAIS', N'Regionais', N'Dados das regionais de atuacao.', 'local_trabalho', 'map', 60, 1),
    ('financeiro', 'default', 'FINANCEIRO', N'Financeiro', N'Informacoes de pagamentos e contribuicoes.', 'financeiro', 'wallet', 70, 1),
    ('atendimentos', 'default', 'ATENDIMENTOS', N'Atendimentos', N'Historico de atendimentos.', 'atendimentos', 'headset', 80, 1)
) AS source (id, source_id, technical_name, display_name, description, category, icon, sort_order, is_active)
ON target.id = source.id
WHEN MATCHED THEN
  UPDATE SET
    source_id = source.source_id,
    technical_name = source.technical_name,
    display_name = source.display_name,
    description = source.description,
    category = source.category,
    icon = source.icon,
    sort_order = source.sort_order,
    is_active = source.is_active,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (id, source_id, technical_name, display_name, description, category, icon, sort_order, is_active)
  VALUES (source.id, source.source_id, source.technical_name, source.display_name, source.description, source.category, source.icon, source.sort_order, source.is_active);
GO

MERGE dbo.report_fields AS target
USING (
  VALUES
    ('pessoas.cpf', 'pessoas', 'CPF', N'CPF', N'CPF da pessoa.', 'text', 1, 1, 1, 0, 1, 'cpf', 10, 1),
    ('pessoas.nome', 'pessoas', 'NOME', N'NOME', N'Nome completo da pessoa.', 'text', 1, 1, 1, 1, 0, 'none', 20, 1),
    ('pessoas.matricula', 'pessoas', 'MATRICULA', N'MATRICULA', N'Matricula funcional.', 'text', 1, 1, 1, 1, 0, 'none', 30, 1),
    ('pessoas.situacao', 'pessoas', 'SITUACAO', N'SITUACAO', N'Situacao da pessoa.', 'option', 1, 1, 1, 1, 0, 'none', 40, 1),
    ('pessoas.datanascimento', 'pessoas', 'DATANASCIMENTO', N'DATANASCIMENTO', N'Data de nascimento.', 'date', 1, 1, 1, 1, 0, 'date', 50, 1),

    ('filiacoes.cpf', 'filiacoes', 'CPF', N'CPF', N'CPF vinculado a filiacao.', 'text', 1, 1, 1, 0, 1, 'cpf', 10, 1),
    ('filiacoes.codigo_empresa', 'filiacoes', 'CODIGO_EMPRESA', N'CODIGO_EMPRESA', N'Codigo da empresa.', 'text', 1, 1, 1, 1, 0, 'none', 20, 1),
    ('filiacoes.codigo_predio', 'filiacoes', 'CODIGO_PREDIO', N'CODIGO_PREDIO', N'Codigo do predio.', 'text', 1, 1, 1, 1, 0, 'none', 30, 1),
    ('filiacoes.data_filiacao', 'filiacoes', 'DATASINDICALIZACAO', N'DATA_FILIACAO', N'Data de filiacao.', 'date', 1, 1, 1, 1, 0, 'date', 40, 1),
    ('filiacoes.status', 'filiacoes', 'STATUS', N'STATUS', N'Status da filiacao.', 'option', 1, 1, 1, 1, 0, 'none', 50, 1),

    ('escolas.codigo_empresa', 'escolas', 'CODIGO_EMPRESA', N'CODIGO_EMPRESA', N'Codigo da empresa do predio.', 'text', 1, 1, 1, 1, 0, 'none', 10, 1),
    ('escolas.codigo', 'escolas', 'CODIGO', N'CODIGO', N'Codigo do predio.', 'text', 1, 1, 1, 1, 0, 'none', 20, 1),
    ('escolas.descricao', 'escolas', 'DESCRICAO', N'DESCRICAO', N'Descricao do predio.', 'text', 1, 1, 1, 1, 0, 'none', 30, 1),
    ('escolas.municipio', 'escolas', 'CIDADE', N'MUNICIPIO', N'Municipio do predio.', 'text', 1, 1, 1, 1, 0, 'none', 40, 1),
    ('escolas.regiao', 'escolas', 'REGIAO', N'REGIAO', N'Regiao do predio.', 'text', 1, 1, 1, 1, 0, 'none', 50, 1),

    ('ente_publico.codigo', 'ente_publico', 'CODIGO', N'CODIGO', N'Codigo do ente publico.', 'text', 1, 1, 1, 1, 0, 'none', 10, 1),
    ('ente_publico.descricao', 'ente_publico', 'DESCRICAO', N'DESCRICAO', N'Descricao do ente publico.', 'text', 1, 1, 1, 1, 0, 'none', 20, 1),

    ('municipios.nome_municipio', 'municipios', 'NOME_MUNICIPIO', N'NOME_MUNICIPIO', N'Nome do municipio.', 'text', 1, 1, 1, 1, 0, 'none', 10, 1),
    ('municipios.regiao', 'municipios', 'REGIAO', N'REGIAO', N'Regiao do municipio.', 'text', 1, 1, 1, 1, 0, 'none', 20, 1),
    ('municipios.estado', 'municipios', 'ESTADO', N'ESTADO', N'Estado (UF).', 'text', 1, 1, 1, 1, 0, 'none', 30, 1),

    ('regionais.nome_regional', 'regionais', 'NOME_REGIONAL', N'NOME_REGIONAL', N'Nome da regional.', 'text', 1, 1, 1, 1, 0, 'none', 10, 1),

    ('financeiro.competencia', 'financeiro', 'COMPETENCIA', N'COMPETENCIA', N'Competencia financeira.', 'text', 1, 1, 1, 1, 0, 'none', 10, 1),
    ('financeiro.valor', 'financeiro', 'VALOR', N'VALOR', N'Valor financeiro.', 'number', 1, 1, 1, 1, 0, 'currency', 20, 1),
    ('financeiro.situacao_pagamento', 'financeiro', 'SITUACAO_PAGAMENTO', N'SITUACAO_PAGAMENTO', N'Situacao do pagamento.', 'option', 1, 1, 1, 1, 0, 'none', 30, 1),
    ('financeiro.data_pagamento', 'financeiro', 'DATA_PAGAMENTO', N'DATA_PAGAMENTO', N'Data do pagamento.', 'date', 1, 1, 1, 1, 0, 'date', 40, 1),

    ('atendimentos.protocolo', 'atendimentos', 'PROTOCOLO', N'PROTOCOLO', N'Protocolo de atendimento.', 'text', 1, 1, 1, 1, 0, 'none', 10, 1),
    ('atendimentos.tipo_atendimento', 'atendimentos', 'TIPO_ATENDIMENTO', N'TIPO_ATENDIMENTO', N'Tipo do atendimento.', 'option', 1, 1, 1, 1, 0, 'none', 20, 1),
    ('atendimentos.status', 'atendimentos', 'STATUS', N'STATUS', N'Status do atendimento.', 'option', 1, 1, 1, 1, 0, 'none', 30, 1),
    ('atendimentos.data_abertura', 'atendimentos', 'DATA_ABERTURA', N'DATA_ABERTURA', N'Data de abertura.', 'date', 1, 1, 1, 1, 0, 'date', 40, 1)
) AS source (
  id, table_id, technical_name, display_name, description, data_type,
  is_selectable, is_filterable, is_sortable, is_groupable, is_sensitive, mask_type, sort_order, is_active
)
ON target.id = source.id
WHEN MATCHED THEN
  UPDATE SET
    table_id = source.table_id,
    technical_name = source.technical_name,
    display_name = source.display_name,
    description = source.description,
    data_type = source.data_type,
    is_selectable = source.is_selectable,
    is_filterable = source.is_filterable,
    is_sortable = source.is_sortable,
    is_groupable = source.is_groupable,
    is_sensitive = source.is_sensitive,
    mask_type = source.mask_type,
    sort_order = source.sort_order,
    is_active = source.is_active,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (
    id, table_id, technical_name, display_name, description, data_type,
    is_selectable, is_filterable, is_sortable, is_groupable, is_sensitive, mask_type, sort_order, is_active
  )
  VALUES (
    source.id, source.table_id, source.technical_name, source.display_name, source.description, source.data_type,
    source.is_selectable, source.is_filterable, source.is_sortable, source.is_groupable, source.is_sensitive, source.mask_type, source.sort_order, source.is_active
  );
GO

MERGE dbo.report_relations AS target
USING (
  VALUES
    ('rel_pessoas_filiacoes_cpf', 'pessoas', 'pessoas.cpf', 'filiacoes', 'filiacoes.cpf', 'equals', N'Pessoas.CPF -> Filiacoes.CPF', 1, 1),
    ('rel_filiacoes_escolas_empresa', 'filiacoes', 'filiacoes.codigo_empresa', 'escolas', 'escolas.codigo_empresa', 'equals', N'Filiacoes.CODIGO_EMPRESA -> Predio.CODIGO_EMPRESA', 1, 1),
    ('rel_filiacoes_escolas_predio', 'filiacoes', 'filiacoes.codigo_predio', 'escolas', 'escolas.codigo', 'equals', N'Filiacoes.CODIGO_PREDIO -> Predio.CODIGO', 1, 1),
    ('rel_escolas_ente_empresa', 'escolas', 'escolas.codigo_empresa', 'ente_publico', 'ente_publico.codigo', 'equals', N'Predio.CODIGO_EMPRESA -> Ente Publico.CODIGO', 1, 1)
) AS source (
  id, source_table_id, source_field_id, target_table_id, target_field_id, relation_type, display_label, is_required, is_active
)
ON target.id = source.id
WHEN MATCHED THEN
  UPDATE SET
    source_table_id = source.source_table_id,
    source_field_id = source.source_field_id,
    target_table_id = source.target_table_id,
    target_field_id = source.target_field_id,
    relation_type = source.relation_type,
    display_label = source.display_label,
    is_required = source.is_required,
    is_active = source.is_active,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (
    id, source_table_id, source_field_id, target_table_id, target_field_id, relation_type, display_label, is_required, is_active
  )
  VALUES (
    source.id, source.source_table_id, source.source_field_id, source.target_table_id, source.target_field_id, source.relation_type, source.display_label, source.is_required, source.is_active
  );
GO

MERGE dbo.report_filter_operators AS target
USING (
  VALUES
    ('text.contains', 'text', 'contains', N'Contem', 1, 0, 10, 1),
    ('text.not_contains', 'text', 'not_contains', N'Nao contem', 1, 0, 20, 1),
    ('text.equals', 'text', 'equals', N'Igual a', 1, 0, 30, 1),
    ('text.not_equals', 'text', 'not_equals', N'Diferente de', 1, 0, 40, 1),
    ('text.starts_with', 'text', 'starts_with', N'Comeca com', 1, 0, 50, 1),
    ('text.ends_with', 'text', 'ends_with', N'Termina com', 1, 0, 60, 1),
    ('text.is_empty', 'text', 'is_empty', N'Esta vazio', 0, 0, 70, 1),
    ('text.is_not_empty', 'text', 'is_not_empty', N'Nao esta vazio', 0, 0, 80, 1),

    ('number.equals', 'number', 'equals', N'Igual a', 1, 0, 10, 1),
    ('number.not_equals', 'number', 'not_equals', N'Diferente de', 1, 0, 20, 1),
    ('number.greater_than', 'number', 'greater_than', N'Maior que', 1, 0, 30, 1),
    ('number.greater_or_equal', 'number', 'greater_or_equal', N'Maior ou igual', 1, 0, 40, 1),
    ('number.less_than', 'number', 'less_than', N'Menor que', 1, 0, 50, 1),
    ('number.less_or_equal', 'number', 'less_or_equal', N'Menor ou igual', 1, 0, 60, 1),
    ('number.between', 'number', 'between', N'Entre', 1, 1, 70, 1),
    ('number.is_empty', 'number', 'is_empty', N'Esta vazio', 0, 0, 80, 1),
    ('number.is_not_empty', 'number', 'is_not_empty', N'Nao esta vazio', 0, 0, 90, 1),

    ('date.equals', 'date', 'equals', N'Igual a', 1, 0, 10, 1),
    ('date.before', 'date', 'before', N'Antes de', 1, 0, 20, 1),
    ('date.after', 'date', 'after', N'Depois de', 1, 0, 30, 1),
    ('date.between', 'date', 'between', N'Entre', 1, 1, 40, 1),
    ('date.current_month', 'date', 'current_month', N'Este mes', 0, 0, 50, 1),
    ('date.current_year', 'date', 'current_year', N'Este ano', 0, 0, 60, 1),
    ('date.last_7_days', 'date', 'last_7_days', N'Ultimos 7 dias', 0, 0, 70, 1),
    ('date.last_30_days', 'date', 'last_30_days', N'Ultimos 30 dias', 0, 0, 80, 1),
    ('date.is_empty', 'date', 'is_empty', N'Esta vazio', 0, 0, 90, 1),
    ('date.is_not_empty', 'date', 'is_not_empty', N'Nao esta vazio', 0, 0, 100, 1),

    ('boolean.is_true', 'boolean', 'is_true', N'Sim', 0, 0, 10, 1),
    ('boolean.is_false', 'boolean', 'is_false', N'Nao', 0, 0, 20, 1),

    ('option.equals', 'option', 'equals', N'Igual a', 1, 0, 10, 1),
    ('option.not_equals', 'option', 'not_equals', N'Diferente de', 1, 0, 20, 1),
    ('option.in', 'option', 'in', N'Esta em', 1, 0, 30, 1),
    ('option.not_in', 'option', 'not_in', N'Nao esta em', 1, 0, 40, 1)
) AS source (
  id, data_type, operator_code, display_name, requires_value, requires_second_value, sort_order, is_active
)
ON target.id = source.id
WHEN MATCHED THEN
  UPDATE SET
    data_type = source.data_type,
    operator_code = source.operator_code,
    display_name = source.display_name,
    requires_value = source.requires_value,
    requires_second_value = source.requires_second_value,
    sort_order = source.sort_order,
    is_active = source.is_active,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (id, data_type, operator_code, display_name, requires_value, requires_second_value, sort_order, is_active)
  VALUES (source.id, source.data_type, source.operator_code, source.display_name, source.requires_value, source.requires_second_value, source.sort_order, source.is_active);
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes WHERE name = 'IX_report_tables_active_category' AND object_id = OBJECT_ID('dbo.report_tables')
)
BEGIN
  CREATE INDEX IX_report_tables_active_category
    ON dbo.report_tables(is_active, category, sort_order);
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes WHERE name = 'IX_report_fields_table_active' AND object_id = OBJECT_ID('dbo.report_fields')
)
BEGIN
  CREATE INDEX IX_report_fields_table_active
    ON dbo.report_fields(table_id, is_active, sort_order);
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes WHERE name = 'IX_report_relations_active_tables' AND object_id = OBJECT_ID('dbo.report_relations')
)
BEGIN
  CREATE INDEX IX_report_relations_active_tables
    ON dbo.report_relations(is_active, source_table_id, target_table_id);
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes WHERE name = 'IX_report_filter_operators_active_type' AND object_id = OBJECT_ID('dbo.report_filter_operators')
)
BEGIN
  CREATE INDEX IX_report_filter_operators_active_type
    ON dbo.report_filter_operators(is_active, data_type, sort_order);
END;
GO
