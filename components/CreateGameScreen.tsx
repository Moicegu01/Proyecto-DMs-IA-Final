import React, { useState } from 'react';
import { CharacterClass, CharacterRace, CharacterAttributes } from '../types';

interface CreateGameScreenProps {
  onStart: (
    charClass: CharacterClass, 
    charRace: CharacterRace,
    characterName: string,
    attributes: CharacterAttributes,
    prologue: string
  ) => void;
  onCancel: () => void;
}

const CLASS_IMAGES: Record<CharacterClass, string> = {
    'Bárbaro': 'https://images.unsplash.com/photo-1535581652167-3d6b98c36cd0?q=80&w=1000&auto=format&fit=crop', 
    'Bardo': 'https://images.unsplash.com/photo-1465847899078-b8779c6bb377?q=80&w=1000&auto=format&fit=crop', 
    'Guerrero': 'https://images.unsplash.com/photo-1598556776374-0a473403c488?q=80&w=1000&auto=format&fit=crop', 
    'Pícaro': 'https://images.unsplash.com/photo-1615672963428-9c3233c07248?q=80&w=1000&auto=format&fit=crop', 
    'Hechicero': 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop', 
    'Clérigo': 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=1000&auto=format&fit=crop'
};

const MAX_TOTAL_POINTS = 20;

export function CreateGameScreen({ onStart, onCancel }: CreateGameScreenProps) {
  const [name, setName] = useState('');
  const [race, setRace] = useState<CharacterRace>('Humano');
  const [charClass, setCharClass] = useState<CharacterClass>('Guerrero');
  
  const [attributes, setAttributes] = useState<CharacterAttributes>({
    strength: 7,
    dexterity: 7,
    intelligence: 6,
  });
  const [prologue, setPrologue] = useState('Te encuentras en una taberna ruidosa en la Costa de la Espada. Un encapuchado te observa desde la esquina...');

  const currentTotal = attributes.strength + attributes.dexterity + attributes.intelligence;
  const remainingPoints = MAX_TOTAL_POINTS - currentTotal;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(charClass, race, name, attributes, prologue);
  };

  const updateAttribute = (key: keyof CharacterAttributes, newValue: number) => {
    const otherAttributesTotal = currentTotal - attributes[key];
    const maxAllowed = MAX_TOTAL_POINTS - otherAttributesTotal;
    const limitedValue = Math.max(1, Math.min(newValue, maxAllowed, 20));

    setAttributes(prev => ({ ...prev, [key]: limitedValue }));
  };

  return (
    // Contenedor principal: dos cajas separadas con espacio entre ellas
    <div className="flex flex-col lg:flex-row items-stretch justify-center min-h-[700px] p-4 w-full gap-6 max-w-[98%] mx-auto">
      
      {/* --- CAJA 1: FORMULARIO (ocupa 3/5 del ancho) --- */}
      <div className="w-full lg:w-3/5 bg-[#111] border border-[#333] rounded-lg shadow-2xl p-8 md:p-12 overflow-y-auto">
            
            {/* Título de Creación de Personaje */}
            <div className="border-b border-[#333] pb-4 mb-8">
                <h2 className="text-3xl font-bold text-[#e0e0e0] font-['Cinzel_Decorative']">
                    Creación de Personaje
                </h2>
            </div>

            <form onSubmit={handleStart} className="space-y-8">
                
                {/* FILA 1: Nombre y Raza */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[#c5a059] font-bold mb-3 uppercase tracking-wide text-xs">Nombre</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#050505] border border-[#444] text-white p-4 rounded focus:border-[#8a0000] focus:outline-none text-xl placeholder-gray-700"
                            placeholder="Ej: Tav"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[#c5a059] font-bold mb-3 uppercase tracking-wide text-xs">Raza</label>
                        <select 
                            value={race}
                            onChange={(e) => setRace(e.target.value as CharacterRace)}
                            className="w-full bg-[#050505] border border-[#444] text-white p-4 rounded focus:border-[#8a0000] text-xl cursor-pointer"
                        >
                            <option value="Humano">Humano</option>
                            <option value="Elfo">Elfo</option>
                            <option value="Enano">Enano</option>
                            <option value="Tiefling">Tiefling</option>
                            <option value="Githyanki">Githyanki</option>
                            <option value="Semiorco">Semiorco</option>
                        </select>
                    </div>
                </div>

                {/* FILA 2: Clase y Atributos */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Selector de Clase */}
                    <div className="xl:col-span-4">
                        <label className="block text-[#c5a059] font-bold mb-3 uppercase tracking-wide text-xs">Clase</label>
                        <select 
                            value={charClass}
                            onChange={(e) => setCharClass(e.target.value as CharacterClass)}
                            className="w-full bg-[#050505] border border-[#444] text-white p-2 rounded focus:border-[#8a0000] text-lg cursor-pointer h-[240px]" 
                            size={6}
                        >
                            <option value="Bárbaro" className="p-2 hover:bg-[#8a0000]">Bárbaro</option>
                            <option value="Bardo" className="p-2 hover:bg-[#8a0000]">Bardo</option>
                            <option value="Guerrero" className="p-2 hover:bg-[#8a0000]">Guerrero</option>
                            <option value="Pícaro" className="p-2 hover:bg-[#8a0000]">Pícaro</option>
                            <option value="Hechicero" className="p-2 hover:bg-[#8a0000]">Hechicero</option>
                            <option value="Clérigo" className="p-2 hover:bg-[#8a0000]">Clérigo</option>
                        </select>
                    </div>

                    {/* Caja de Atributos */}
                    <div className="xl:col-span-8 bg-[#1a1a1a] p-8 rounded border border-[#333] relative flex flex-col justify-center">
                        {/* CONTADOR DE PUNTOS */}
                        <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-2">
                            <label className="block text-gray-400 font-bold uppercase tracking-wide text-xs">
                                Distribución de Atributos (Max: {MAX_TOTAL_POINTS})
                            </label>
                            <span className={`text-xs font-bold tracking-widest border px-3 py-1 rounded uppercase ${remainingPoints === 0 ? 'border-green-600 text-green-500 bg-green-900/10' : 'border-[#8a0000] text-[#ff4444] bg-[#8a0000]/10'}`}>
                                Restantes: {remainingPoints}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-8 text-center items-end mt-2">
                            {/* Fuerza */}
                            <div className="flex flex-col items-center group w-full">
                                <div className="text-4xl font-bold text-[#e0e0e0] border-2 border-[#444] w-20 h-20 flex items-center justify-center rounded-full mb-4 bg-[#050505] group-hover:border-[#8a0000] transition-colors">
                                    {attributes.strength}
                                </div>
                                <label className="text-xs text-[#c5a059] font-bold mb-3 uppercase">FUERZA</label>
                                <input 
                                    type="range" min="1" max="20"
                                    value={attributes.strength}
                                    onChange={(e) => updateAttribute('strength', parseInt(e.target.value))}
                                    className="w-full accent-[#8a0000] cursor-pointer h-2 bg-gray-700 rounded-lg appearance-none"
                                />
                            </div>
                            
                            {/* Destreza */}
                            <div className="flex flex-col items-center group w-full">
                                <div className="text-4xl font-bold text-[#e0e0e0] border-2 border-[#444] w-20 h-20 flex items-center justify-center rounded-full mb-4 bg-[#050505] group-hover:border-[#8a0000] transition-colors">
                                    {attributes.dexterity}
                                </div>
                                <label className="text-xs text-[#c5a059] font-bold mb-3 uppercase">DESTREZA</label>
                                <input 
                                    type="range" min="1" max="20"
                                    value={attributes.dexterity}
                                    onChange={(e) => updateAttribute('dexterity', parseInt(e.target.value))}
                                    className="w-full accent-[#8a0000] cursor-pointer h-2 bg-gray-700 rounded-lg appearance-none"
                                />
                            </div>

                            {/* Inteligencia */}
                            <div className="flex flex-col items-center group w-full">
                                <div className="text-4xl font-bold text-[#e0e0e0] border-2 border-[#444] w-20 h-20 flex items-center justify-center rounded-full mb-4 bg-[#050505] group-hover:border-[#8a0000] transition-colors">
                                    {attributes.intelligence}
                                </div>
                                <label className="text-xs text-[#c5a059] font-bold mb-3 uppercase">INTELIGENCIA</label>
                                <input 
                                    type="range" min="1" max="20"
                                    value={attributes.intelligence}
                                    onChange={(e) => updateAttribute('intelligence', parseInt(e.target.value))}
                                    className="w-full accent-[#8a0000] cursor-pointer h-2 bg-gray-700 rounded-lg appearance-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prólogo */}
                <div>
                    <label className="block text-[#c5a059] font-bold mb-3 uppercase tracking-wide text-xs">Contexto de la Aventura</label>
                    <textarea 
                        value={prologue}
                        onChange={(e) => setPrologue(e.target.value)}
                        className="w-full bg-[#050505] border border-[#444] text-gray-300 p-5 rounded focus:border-[#8a0000] focus:outline-none h-36 resize-none text-lg leading-relaxed"
                        placeholder="Describe cómo empieza la aventura..."
                    />
                </div>

                {/* Botones */}
                <div className="flex gap-6 pt-4">
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="px-12 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 py-4 rounded transition-colors uppercase font-bold tracking-widest text-sm"
                    >
                        Volver
                    </button>
                    <button 
                        type="submit" 
                        className="flex-grow bg-gradient-to-r from-[#8a0000] to-[#600000] hover:from-[#a00000] hover:to-[#800000] text-white font-bold py-4 rounded shadow-lg transition-all transform hover:scale-[1.01] uppercase tracking-widest text-lg border border-[#ff4444]/20"
                    >
                        Comenzar Aventura
                    </button>
                </div>
            </form>
      </div>

      {/* --- CAJA 2: IMAGEN (ocupa 2/5 del ancho) --- */}
      <div className="w-full lg:w-2/5 bg-[#050505] border border-[#333] rounded-lg shadow-2xl overflow-hidden relative min-w-[350px]">
            
            {/* Imagen de Fondo */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={CLASS_IMAGES[charClass]} 
                    alt={charClass}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/10 to-transparent"></div>
            </div>
            
            {/* Contenido sobre la imagen */}
            <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <div className="border-l-4 border-[#c5a059] pl-6 mb-4 backdrop-blur-sm bg-black/30 p-3 rounded-r">
                    <h3 className="text-4xl font-bold text-white font-['Cinzel_Decorative'] mb-1 leading-tight drop-shadow-xl break-words">
                        {name || 'KAELEN'}
                    </h3>
                    <p className="text-[#e0e0e0] text-xl font-serif italic drop-shadow-lg">
                        {race} {charClass}
                    </p>
                </div>
                
                <div className="space-y-3 bg-black/70 p-5 rounded backdrop-blur-md border border-[#333] shadow-2xl">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <span className="text-gray-300 text-sm uppercase tracking-wider font-bold">Fuerza</span>
                        <span className="text-white font-bold text-xl">{attributes.strength}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <span className="text-gray-300 text-sm uppercase tracking-wider font-bold">Destreza</span>
                        <span className="text-white font-bold text-xl">{attributes.dexterity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm uppercase tracking-wider font-bold">Inteligencia</span>
                        <span className="text-white font-bold text-xl">{attributes.intelligence}</span>
                    </div>
                </div>
            </div>
      </div>

    </div>
  );
}
