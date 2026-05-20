import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { saveAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

export function LoginPage() {
  const navigate = useNavigate();

  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!login.trim() || !senha.trim()) {
      setError('Preencha usuario e senha para continuar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login({
        login: login.trim(),
        senha
      });

      saveAuth(response.data.token, response.data.user);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (isAxiosError<{ message?: string }>(error)) {
        setError(error.response?.data?.message ?? 'Usuario ou senha invalidos.');
      } else {
        setError('Usuario ou senha invalidos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Acessar plataforma</h2>
        <p className="mt-1 text-sm text-slate-600">Entre com sua conta para visualizar indicadores sindicais.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login" className="form-label">
            Usuario
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="login"
              className="form-input pl-11"
              placeholder="Digite seu usuario"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label htmlFor="senha" className="form-label">
            Senha
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="senha"
              type={showPassword ? 'text' : 'password'}
              className="form-input pl-11 pr-11"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error ? <div className="alert-error">{error}</div> : null}

        <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar no SINDATA'}
        </button>
      </form>
    </div>
  );
}