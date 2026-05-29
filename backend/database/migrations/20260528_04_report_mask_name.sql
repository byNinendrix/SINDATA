IF OBJECT_ID('dbo.report_fields', 'U') IS NOT NULL
BEGIN
  IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_report_fields_mask_type'
      AND parent_object_id = OBJECT_ID('dbo.report_fields')
  )
  BEGIN
    ALTER TABLE dbo.report_fields
      DROP CONSTRAINT CK_report_fields_mask_type;
  END;

  ALTER TABLE dbo.report_fields
    ADD CONSTRAINT CK_report_fields_mask_type
      CHECK (mask_type IN ('none', 'cpf', 'name', 'currency', 'date'));

  UPDATE dbo.report_fields
  SET
    mask_type = 'name',
    is_sensitive = 1,
    updated_at = SYSUTCDATETIME()
  WHERE id = 'pessoas.nome';
END;
GO
