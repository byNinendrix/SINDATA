import api from '../../../services/api';
import type { LoginPayload, LoginResponse } from '../types/auth.types';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  }
};
