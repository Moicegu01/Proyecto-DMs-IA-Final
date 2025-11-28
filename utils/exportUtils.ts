import { GameSession } from '../types';

export const downloadGameLogs = (game: GameSession | null) => {
  if (!game) return;

  const date = new Date(game.createdAt).toLocaleDateString();
  const time = new Date(game.createdAt).toLocaleTimeString();

  // 1. CABECERA DEL DOCUMENTO
  let content = `# 📜 CRÓNICAS DE ${game.characterName.toUpperCase()}\n\n`;
  content += `**Raza:** ${game.charRace} | **Clase:** ${game.charClass}\n`;
  content += `**Fecha de inicio:** ${date} a las ${time}\n`;
  content += `**Atributos:** FUE ${game.attributes.strength} | DES ${game.attributes.dexterity} | INT ${game.attributes.intelligence}\n`;
  content += `\n---\n\n`;
  
  // 2. PRÓLOGO
  content += `## 📖 PRÓLOGO\n\n`;
  content += `> *${game.prologue}*\n\n`;
  content += `\n---\n\n`;

  content += `## ⚔️ LA AVENTURA (COMPARATIVA)\n\n`;

  // 3. GENERACIÓN DE LA TABLA COMPARATIVA
  // Iteramos sobre los mensajes. Asumimos que van a la par.
  game.historyDM1.forEach((msg1, index) => {
    const msg2 = game.historyDM2[index];
    
    // Si es mensaje del usuario, lo mostramos centrado o destacado
    if (msg1.role === 'user') {
      content += `### TURNO ${Math.floor(index / 2) + 1}\n\n`;
      content += `**👤 JUGADOR:** ${msg1.parts[0].text}\n\n`;
    } else {
      // Si es respuesta de los DMs, creamos una tabla Markdown
      content += `| ⚡ Gemini 2.5 Flash (Velocidad) | 🧠 Gemini 2.5 Pro (Creatividad) |\n`;
      content += `| :--- | :--- |\n`;
      
      // Limpiamos saltos de línea para que no rompan la tabla
      const text1 = msg1.parts[0].text.replace(/\n/g, ' <br> ');
      const text2 = msg2 ? msg2.parts[0].text.replace(/\n/g, ' <br> ') : '...';
      
      content += `| ${text1} | ${text2} |\n\n`;
      content += `\n---\n\n`;
    }
  });

  // 4. DESCARGA DEL ARCHIVO
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Nombre de archivo limpio (ej: cronica_gandalf_171562.md)
  const safeName = game.characterName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `cronica_${safeName}_${Date.now()}.md`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};