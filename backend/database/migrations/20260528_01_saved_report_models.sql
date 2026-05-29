IF OBJECT_ID('dbo.saved_report_models', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.saved_report_models (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_saved_report_models PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX) NULL,
    category VARCHAR(60) NOT NULL CONSTRAINT DF_saved_report_models_category DEFAULT 'geral',
    visibility VARCHAR(20) NOT NULL,
    owner_user_id INT NULL,
    owner_user_login VARCHAR(120) NOT NULL,
    created_by VARCHAR(120) NOT NULL,
    updated_by VARCHAR(120) NOT NULL,
    definition_json NVARCHAR(MAX) NOT NULL,
    version INT NOT NULL CONSTRAINT DF_saved_report_models_version DEFAULT 1,
    is_active BIT NOT NULL CONSTRAINT DF_saved_report_models_is_active DEFAULT 1,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_saved_report_models_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_saved_report_models_updated_at DEFAULT SYSUTCDATETIME(),
    deleted_at DATETIME2 NULL,
    CONSTRAINT CK_saved_report_models_visibility CHECK (visibility IN ('private', 'team', 'public'))
  );
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_saved_report_models_owner_user_id'
    AND object_id = OBJECT_ID('dbo.saved_report_models')
)
BEGIN
  CREATE INDEX IX_saved_report_models_owner_user_id
    ON dbo.saved_report_models(owner_user_id);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_saved_report_models_owner_user_login'
    AND object_id = OBJECT_ID('dbo.saved_report_models')
)
BEGIN
  CREATE INDEX IX_saved_report_models_owner_user_login
    ON dbo.saved_report_models(owner_user_login);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_saved_report_models_category'
    AND object_id = OBJECT_ID('dbo.saved_report_models')
)
BEGIN
  CREATE INDEX IX_saved_report_models_category
    ON dbo.saved_report_models(category);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_saved_report_models_visibility'
    AND object_id = OBJECT_ID('dbo.saved_report_models')
)
BEGIN
  CREATE INDEX IX_saved_report_models_visibility
    ON dbo.saved_report_models(visibility);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_saved_report_models_is_active'
    AND object_id = OBJECT_ID('dbo.saved_report_models')
)
BEGIN
  CREATE INDEX IX_saved_report_models_is_active
    ON dbo.saved_report_models(is_active);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_saved_report_models_created_at'
    AND object_id = OBJECT_ID('dbo.saved_report_models')
)
BEGIN
  CREATE INDEX IX_saved_report_models_created_at
    ON dbo.saved_report_models(created_at DESC);
END;
GO
