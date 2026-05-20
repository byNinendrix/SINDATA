export interface LoginPayload {
  login: string;
  senha: string;
}

export interface AuthUser {
  login: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}
