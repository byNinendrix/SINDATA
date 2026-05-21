import type { Request } from 'mssql';

const WRITE_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'MERGE',
  'TRUNCATE',
  'DROP',
  'ALTER',
  'CREATE',
  'EXEC',
  'EXECUTE',
  'GRANT',
  'REVOKE',
  'DENY'
];

function normalizeSql(sqlText: string): string {
  return sqlText.replace(/\s+/g, ' ').trim().toUpperCase();
}

function assertReadOnlySql(sqlText: string): void {
  const normalized = normalizeSql(sqlText);

  if (!normalized) {
    throw new Error('Consulta SQL vazia não é permitida.');
  }

  // Permite SELECT direto ou CTE iniciando por WITH.
  const startsAsReadQuery = normalized.startsWith('SELECT') || normalized.startsWith('WITH');
  if (!startsAsReadQuery) {
    throw new Error('Apenas consultas somente leitura (SELECT) são permitidas nesta fase.');
  }

  // Bloqueia múltiplos statements encadeados por ';' (exceto ';' final).
  const statements = sqlText
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
  if (statements.length > 1) {
    throw new Error('Múltiplos statements SQL não são permitidos em modo somente leitura.');
  }

  for (const keyword of WRITE_KEYWORDS) {
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (keywordRegex.test(sqlText)) {
      throw new Error(`Comando SQL bloqueado em modo somente leitura: ${keyword}.`);
    }
  }
}

export async function queryReadOnly<T>(request: Request, sqlText: string) {
  assertReadOnlySql(sqlText);
  return request.query<T>(sqlText);
}
