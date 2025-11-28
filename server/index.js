import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from './db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'; // <--- ¡AÑADE ESTA LÍNEA!

const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN GEMINI (MODIFICADO) ---

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// --- GEMINI HELPERS ---

const getSystemPrompt = (game) => {
    return `Eres un Dungeon Master de D&D. El jugador controla a ${game.character_name}, un ${game.char_race} ${game.char_class}.
Sus atributos son: Fuerza ${game.strength}, Destreza ${game.dexterity}, Inteligencia ${game.intelligence}.
Contexto de la Aventura: ${game.prologue}.
Instrucción: Narra una historia de fantasía oscura, vívida y llena de acción. Sé descriptivo pero mantén el ritmo. Mantén la consistencia de la historia narrada hasta ahora. Responde siempre en español.`;
};

// CAMBIO 2: Función reescrita para la librería estable
const generateDMResponse = async (modelName, systemInstruction, history) => {
  try {
    // YA NO HACEMOS IF/ELSE PARA CAMBIAR EL NOMBRE.
    // Confiamos en que le pasamos el nombre correcto desde las rutas.
    
    const model = genAI.getGenerativeModel({ 
        model: modelName, // <--- Usa el nombre directo (ej: gemini-2.5-flash)
        systemInstruction: systemInstruction 
    });

    // Mapeo de historial para la API
    const contents = history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model', 
      parts: [{ text: m.content }] 
    }));

    const result = await model.generateContent({ contents });
    const response = await result.response;
    const text = response.text();

    return text || "[El Narrador se queda en silencio...]";
  } catch (error) {
    console.error(`Error generando respuesta con ${modelName}:`, error);
    throw new Error(`Error de la IA (${modelName}): ${error.message}`);
  }
};

// --- AUTH ROUTES (NUEVO) ---

// POST /api/register
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    try {
        // Verificar si existe
        const [userRows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (userRows.length > 0) {
            return res.status(409).json({ error: 'El nombre de usuario ya existe.' });
        }

        const userId = crypto.randomUUID();
        const passwordHash = await bcrypt.hash(password, 10);

        await db.query('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)', [userId, username, passwordHash]);

        res.status(201).json({ message: 'Usuario registrado con éxito.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    try {
        const [userRows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (userRows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = userRows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // --- CAMBIOS A PARTIR DE AQUÍ ---

        // 1. Generamos el Token (necesario para la sesión)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'secreto',
            { expiresIn: '7d' }
        );

        // 2. Enviamos la estructura CORRECTA que espera el Frontend
        // { user: { ... }, token: "..." }
        res.json({ 
            user: { id: user.id, username: user.username }, 
            token: token 
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
});

// --- API ROUTES ---

// GET /api/games - MODIFICADO: Ahora filtra por usuario
app.get('/api/games', async (req, res) => {
  const { userId } = req.query;
  // Seguridad: Si no envían ID, error
  if (!userId) {
      return res.status(400).json({ error: 'Falta el ID de usuario.' });
  }

  try {
    // FILTRO SQL: WHERE user_id = ?
    const [gamesRows] = await db.query('SELECT * FROM games WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    const games = gamesRows;

    for (const game of games) {
      const [messagesRows] = await db.query('SELECT * FROM messages WHERE game_id = ? ORDER BY created_at ASC', [game.id]);
      const messages = messagesRows;
      
      game.historyDM1 = messages.filter(m => m.dm_version === 1).map(m => ({ role: m.role, parts: [{ text: m.content }] }));
      game.historyDM2 = messages.filter(m => m.dm_version === 2).map(m => ({ role: m.role, parts: [{ text: m.content }] }));

      game.characterName = game.character_name;
      game.charClass = game.char_class;
      game.charRace = game.char_race;
      game.createdAt = new Date(game.created_at).getTime();
      game.attributes = { strength: game.strength, dexterity: game.dexterity, intelligence: game.intelligence };

      delete game.character_name; delete game.char_class; delete game.char_race; 
      delete game.created_at; delete game.strength; delete game.dexterity; delete game.intelligence;
    }

    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Error al cargar las partidas.' });
  }
});

// POST /api/games - MODIFICADO: Guarda el user_id
app.post('/api/games', async (req, res) => {
  const { userId, charClass, charRace, characterName, attributes, prologue } = req.body;
  
  if (!userId) {
      return res.status(400).json({ error: 'Falta el ID de usuario.' });
  }
  
  const gameId = crypto.randomUUID();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const gameDataForPrompt = {
      character_name: characterName,
      char_class: charClass,
      char_race: charRace,
      ...attributes,
      prologue: prologue,
    };
    const systemPrompt = getSystemPrompt(gameDataForPrompt);
    const startHistory = [{ role: 'user', content: "Comienza la aventura narrando la escena inicial y pregunta al jugador qué desea hacer." }];

    // AQUÍ MANTÉN TU CONFIGURACIÓN DE IA QUE YA FUNCIONABA
    const [resp1, resp2] = await Promise.all([
      generateDMResponse('gemini-2.5-flash', systemPrompt, startHistory),
      generateDMResponse('gemini-2.5-pro', systemPrompt, startHistory)
    ]);

    // INSERT SQL: Incluye user_id
    const gameToInsert = { id: gameId, user_id: userId, ...gameDataForPrompt };
    await connection.query('INSERT INTO games SET ?', gameToInsert);

    const initialMessages = [
      { game_id: gameId, dm_version: 1, role: 'model', content: resp1 },
      { game_id: gameId, dm_version: 2, role: 'model', content: resp2 }
    ];
    for (const msg of initialMessages) {
      await connection.query('INSERT INTO messages SET ?', msg);
    }
    
    await connection.commit();

    const newGame = {
      id: gameId,
      createdAt: Date.now(),
      characterName, charClass, charRace, attributes, prologue,
      historyDM1: [{ role: 'model', parts: [{ text: resp1 }] }],
      historyDM2: [{ role: 'model', parts: [{ text: resp2 }] }]
    };
    res.status(201).json(newGame);

  } catch (error) {
    await connection.rollback();
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Error al crear la partida: ' + error.message });
  } finally {
    connection.release();
  }
});

// POST /api/games/:id/action - Enviar una acción del jugador
// POST /api/games/:id/action - Enviar una acción del jugador
app.post('/api/games/:id/action', async (req, res) => {
  const { id } = req.params;
  const { message, userId } = req.body;
  
  // Seguridad: Verificamos que envíe el userId
  if (!userId) {
      return res.status(400).json({ error: 'Falta el ID de usuario.' });
  }
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Seguridad: Verificamos que la partida pertenezca al usuario
    const [gameRows] = await connection.query('SELECT * FROM games WHERE id = ? AND user_id = ?', [id, userId]);
    if (gameRows.length === 0) {
      return res.status(404).json({ error: 'Partida no encontrada o no pertenece al usuario.' });
    }
    const game = gameRows[0];

    const [messagesRows] = await connection.query('SELECT * FROM messages WHERE game_id = ? ORDER BY created_at ASC', [id]);
    const messages = messagesRows;
    
    const historyDM1 = messages.filter(m => m.dm_version === 1);
    const historyDM2 = messages.filter(m => m.dm_version === 2);

    const systemPrompt = getSystemPrompt(game);
    const userHistoryEntry = { role: 'user', content: message };
    
    // CAMBIO: Usamos 'gemini-2.0-flash' para mantener consistencia con 'createGame'
    const [resp1, resp2] = await Promise.all([
      generateDMResponse('gemini-2.5-flash', systemPrompt, [...historyDM1, userHistoryEntry]),
      generateDMResponse('gemini-2.5-pro', systemPrompt, [...historyDM2, userHistoryEntry])
    ]);

    const messagesToInsert = [
      { game_id: id, dm_version: 1, role: 'user', content: message },
      { game_id: id, dm_version: 1, role: 'model', content: resp1 },
      { game_id: id, dm_version: 2, role: 'user', content: message },
      { game_id: id, dm_version: 2, role: 'model', content: resp2 }
    ];
    for (const msg of messagesToInsert) {
      await connection.query('INSERT INTO messages SET ?', msg);
    }

    await connection.commit();

    const [updatedMessages] = await connection.query('SELECT * FROM messages WHERE game_id = ? ORDER BY created_at ASC', [id]);
    const fullGame = {
        ...game,
        id: game.id,
        createdAt: new Date(game.created_at).getTime(),
        characterName: game.character_name,
        charClass: game.char_class,
        charRace: game.char_race,
        attributes: { strength: game.strength, dexterity: game.dexterity, intelligence: game.intelligence },
        historyDM1: updatedMessages.filter(m => m.dm_version === 1).map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        historyDM2: updatedMessages.filter(m => m.dm_version === 2).map(m => ({ role: m.role, parts: [{ text: m.content }] })),
    };
    res.json(fullGame);

  } catch (error) {
    await connection.rollback();
    console.error('Error processing action:', error);
    res.status(500).json({ error: 'Error al procesar la acción.' });
  } finally {
    connection.release();
  }
});

// DELETE /api/games/:id - Eliminar una partida
app.delete('/api/games/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // Recuerda: El frontend debe enviar esto en el body
    
    if (!userId) {
      return res.status(400).json({ error: 'Falta el ID de usuario.' });
    }

    try {
        const [result] = await db.query('DELETE FROM games WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Partida no encontrada o no pertenece al usuario.' });
        }
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({ error: 'Error al eliminar la partida.' });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});