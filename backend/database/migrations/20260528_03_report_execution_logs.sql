IF OBJECT_ID('dbo.report_execution_logs', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.report_execution_logs (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_report_execution_logs PRIMARY KEY DEFAULT NEWID(),
    report_model_id UNIQUEIDENTIFIER NULL,
    user_id INT NULL,
    user_login VARCHAR(120) NOT NULL,
    action VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    filters_summary NVARCHAR(1000) NULL,
    rows_returned INT NULL,
    execution_time_ms INT NULL,
    error_message NVARCHAR(1000) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_report_execution_logs_created_at DEFAULT SYSUTCDATETIME()
  );
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_report_execution_logs_user_created'
    AND object_id = OBJECT_ID('dbo.report_execution_logs')
)
BEGIN
  CREATE INDEX IX_report_execution_logs_user_created
    ON dbo.report_execution_logs(user_login, created_at DESC);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_report_execution_logs_action_status'
    AND object_id = OBJECT_ID('dbo.report_execution_logs')
)
BEGIN
  CREATE INDEX IX_report_execution_logs_action_status
    ON dbo.report_execution_logs(action, status, created_at DESC);
END;
GO
