import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/apiService';
import { User } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const authResponse = await loginUser(username, password);
        // Guardamos el token (opcional si queremos usarlo luego en headers)
        localStorage.setItem('dnd-token', authResponse.token); 
        onLoginSuccess(authResponse.user);
      } else {
        // REGISTER
        await registerUser(username, password);
        setSuccessMsg("¡Cuenta creada! Ahora inicia sesión.");
        setIsLogin(true); // Cambiamos a pantalla de login
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-md mx-auto p-6 bg-[#111] border border-[#333] rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold text-[#e0e0e0] mb-6 font-['Cinzel_Decorative']">
        {isLogin ? 'Acceso al Reino' : 'Nuevo Aventurero'}
      </h2>

      {error && (
        <div className="w-full bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">
          {error}
        </div>
      )}
      
      {successMsg && (
        <div className="w-full bg-green-900/50 border border-green-500 text-green-200 p-3 rounded mb-4 text-sm text-center">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Nombre de Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#050505] border border-[#444] text-white p-3 rounded focus:border-[#8a0000] focus:outline-none transition-colors"
            placeholder="Ej: Gandalf"
            required
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#050505] border border-[#444] text-white p-3 rounded focus:border-[#8a0000] focus:outline-none transition-colors"
            placeholder="******"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-[#8a0000] hover:bg-[#a30000] text-white font-bold py-3 rounded transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
        </button>
      </form>

      <div className="mt-6 text-gray-400 text-sm">
        {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <button
          onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); }}
          className="text-[#ff4444] hover:underline font-bold"
        >
          {isLogin ? "Regístrate aquí" : "Inicia Sesión"}
        </button>
      </div>
    </div>
  );
}