import React, { useState, useCallback, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { CreateGameScreen } from './components/CreateGameScreen';
import { GameScreen } from './components/GameScreen';
import { AuthScreen } from './components/AuthScreen';
import { createGame, sendGameAction } from './services/apiService';
import { Message, GameSession, CharacterClass, CharacterRace, CharacterAttributes, User } from './types';
import { downloadGameLogs } from './utils/exportUtils';

type AppView = 'auth' | 'menu' | 'create' | 'playing';

export default function App() {
  const [view, setView] = useState<AppView>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentGame, setCurrentGame] = useState<GameSession | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for saved user session on component mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('dnd-user');
    if (savedUser) {
        try {
            const user: User = JSON.parse(savedUser);
            setCurrentUser(user);
            setView('menu');
        } catch (e) {
            sessionStorage.removeItem('dnd-user');
        }
    }
  }, []);


  // -- AUTH HANDLERS --
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('dnd-user', JSON.stringify(user));
    setView('menu');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('dnd-user');
    setView('auth');
    setCurrentGame(null);
  };

  // -- EVENT HANDLERS --

  const handleCreateNewGame = async (
    charClass: CharacterClass, 
    charRace: CharacterRace,
    characterName: string,
    attributes: CharacterAttributes,
    prologue: string
  ) => {
    if (!currentUser) {
        setError("Debes iniciar sesión para crear una partida.");
        return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const newGame = await createGame(currentUser.id, charClass, charRace, characterName, attributes, prologue);
      setCurrentGame(newGame);
      setView('playing');
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear la partida.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadGame = (game: GameSession) => {
    setCurrentGame(game);
    setView('playing');
  };

  const handleBackToMenu = () => {
    setView('menu');
    setCurrentGame(null);
  };

  const handleSendAction = useCallback(async (action: string) => {
    if (!currentGame || isLoading || !currentUser) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      role: 'user',
      parts: [{ text: action }],
    };

    const previousGame = currentGame;
    setCurrentGame(prevGame => {
        if (!prevGame) return null;
        return {
            ...prevGame,
            historyDM1: [...prevGame.historyDM1, userMessage],
            historyDM2: [...prevGame.historyDM2, userMessage],
        }
    });


    try {
      const updatedGame = await sendGameAction(currentUser.id, currentGame.id, action);
      setCurrentGame(updatedGame);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error de conexión.';
      setError(errorMessage);
      setCurrentGame(previousGame);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentGame, currentUser]);

  // -- RENDER --
  const renderHeader = () => {
    if (view === 'auth') return null;

    return (
        <header className="p-4 md:p-6 flex justify-between items-center border-b border-[#333] bg-[#0a0a0a] relative shadow-lg z-50">
          <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-[#e0e0e0] font-['Cinzel_Decorative'] tracking-wider text-shadow">
              Comparador de DMs
              </h1>
              <span className="hidden md:inline-block px-2 py-1 bg-[#8a0000] text-[10px] font-bold rounded text-white tracking-widest">
                  IA EDITION
              </span>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser && <span className="text-gray-400 text-sm hidden sm:inline">Hola, <span className="text-[#ff4444]">{currentUser.username}</span></span>}
            
            {/* --- BOTÓN NUEVO DE DESCARGAR LOG --- */}
            {view === 'playing' && (
                <button
                    onClick={() => downloadGameLogs(currentGame)}
                    className="flex items-center gap-2 border border-[#444] hover:border-[#8a0000] text-gray-300 hover:text-white px-3 py-2 rounded transition-all text-sm group"
                    title="Descargar Historial Completo"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:text-[#ff4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="hidden sm:inline">Descargar Crónica (.md)</span>
                </button>
            )}
            {/* ------------------------------------ */}

            {(view === 'playing' || view === 'create') && (
              <button
                onClick={handleBackToMenu}
                className="secondary-btn px-4 py-2 rounded-md text-sm transition-all duration-200"
              >
                Menú
              </button>
            )}
            
            <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-white px-3 py-1 rounded transition-colors">Salir</button>
          </div>
        </header>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      {renderHeader()}
      
      {/* CAMBIO CLAVE AQUÍ: Las vistas que NO son auth/menu fuerzan el centrado vertical */}
      <main className={`flex-grow flex flex-col relative overflow-hidden 
                         ${view === 'auth' ? 'items-center justify-center h-screen' : ''} 
                         ${view === 'menu' ? 'h-screen items-center' : ''} 
                         ${view === 'create' || view === 'playing' ? 'p-4 md:p-6 items-center justify-center h-[calc(100vh-80px)]' : ''}`
      }>
        
        {error && (
            <div className="absolute top-0 left-0 right-0 z-[60] bg-red-900/90 border-b border-red-600 text-white px-4 py-2 text-center" onClick={() => setError(null)}>
                <strong className="font-bold font-serif">Error: </strong>
                <span className="inline">{error}</span>
            </div>
        )}
        
        {view === 'auth' && <AuthScreen onLoginSuccess={handleLoginSuccess} />}

        {view === 'menu' && currentUser && (
            <MainMenu 
                userId={currentUser.id}
                onCreateNew={() => setView('create')} 
                onLoadGame={handleLoadGame} 
            />
        )}

        {view === 'create' && (
             <div className="w-full max-w-6xl mx-auto">
                <CreateGameScreen 
                    onStart={handleCreateNewGame} 
                    onCancel={() => setView('menu')} 
                />
            </div>
        )}

        {view === 'playing' && currentGame && (
          <GameScreen
            historyDM1={currentGame.historyDM1}
            historyDM2={currentGame.historyDM2}
            onSendAction={handleSendAction}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}