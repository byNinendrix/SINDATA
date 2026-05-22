export interface LoginBody {
  login: string;
  senha: string;
}

export interface AuthUser {
  login: string;
}

export interface UsuarioRecord {
  USR_CODIGO: number;
  USR_LOGIN: string;
  USR_SENHA: string;
}
