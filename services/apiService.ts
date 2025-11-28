import { GameSession, CharacterClass, CharacterRace, CharacterAttributes, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// --- HELPER PARA MANEJAR RESPUESTAS DE LA API ---
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error de red o respuesta no JSON' }));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }
  // Si es un 204 (No Content), devolvemos null porque no hay JSON que leer
  if (response.status === 204) {
    return null as T;
  }
  return response.json() as Promise<T>;
}

// --- FUNCIONES DE AUTENTICACIÓN (NUEVO) ---

export async function registerUser(username: string, password: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    return handleApiResponse<{ message: string }>(response);
}

export async function loginUser(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    // Esto devolverá { user: {id, username}, token: "..." }
    return handleApiResponse<AuthResponse>(response);
}

// --- FUNCIONES DEL JUEGO (AHORA REQUIEREN userId) ---

export async function fetchGames(userId: string): Promise<GameSession[]> {
  // El backend espera el userId como parámetro en la URL (?userId=...)
  const response = await fetch(`${API_BASE_URL}/games?userId=${userId}`);
  return handleApiResponse<GameSession[]>(response);
}

export async function createGame(
  userId: string, // <--- Nuevo argumento obligatorio
  charClass: CharacterClass, 
  charRace: CharacterRace,
  characterName: string,
  attributes: CharacterAttributes,
  prologue: string
): Promise<GameSession> {
  const response = await fetch(`${API_BASE_URL}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Enviamos el userId en el cuerpo
    body: JSON.stringify({ userId, charClass, charRace, characterName, attributes, prologue }),
  });
  return handleApiResponse<GameSession>(response);
}

export async function deleteGame(userId: string, gameId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    // El backend espera el userId en el cuerpo para verificar propiedad
    body: JSON.stringify({ userId }),
  });
  await handleApiResponse<void>(response);
}

export async function sendGameAction(userId: string, gameId: string, message: string): Promise<GameSession> {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Enviamos el userId en el cuerpo
    body: JSON.stringify({ userId, message }),
  });
  return handleApiResponse<GameSession>(response);
}