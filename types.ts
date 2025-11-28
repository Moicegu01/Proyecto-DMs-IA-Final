export type Role = 'user' | 'model';

export interface MessagePart {
  text: string;
}

export interface Message {
  role: Role;
  parts: MessagePart[];
}



// Actualizado al estilo Baldur's Gate 3
export type CharacterClass = 'Bárbaro' | 'Bardo' | 'Guerrero' | 'Pícaro' | 'Hechicero' | 'Clérigo';
export type CharacterRace = 'Elfo' | 'Tiefling' | 'Humano' | 'Githyanki' | 'Enano' | 'Semiorco';



export interface CharacterAttributes {
  strength: number;
  dexterity: number;
  intelligence: number;
}

// NUEVO: Interfaz para el usuario
export interface User {
  id: string;
  username: string;
}

// NUEVO: Respuesta de la API al loguearse (nos dará el usuario y el token)
export interface AuthResponse {
  user: User;
  token: string;
}

export interface GameSession {
  id: string;
  createdAt: number;
  userId?: string; // NUEVO: Opcional, porque las partidas viejas no lo tienen
  characterName: string;
  charClass: CharacterClass;
  charRace: CharacterRace;
  attributes: CharacterAttributes;
  prologue: string;
  historyDM1: Message[];
  historyDM2: Message[];
}