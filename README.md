# ⚔️ EL COMPARADOR DE DMS (IA) 🧠

[cite_start]Plataforma Full-Stack diseñada para comparar la capacidad narrativa y de dirección de juego (Dungeon Master) de dos Modelos de Lenguaje Grandes (LLMs) diferentes de Google Gemini[cite: 8]. [cite_start]El objetivo es construir una herramienta de análisis completa para consumir estas APIs de forma eficiente, segura y creativa[cite: 5, 6].

---

## 1. OBJETIVO PRINCIPAL (RT6)

[cite_start]El proyecto simula una aventura de Dungeons & Dragons (D&D) en dos universos paralelos, dirigida por la IA-1 (Flash) y la IA-2 (Pro)[cite: 9]. [cite_start]El **back-end es el responsable de gestionar el estado y el contexto** de la conversación[cite: 30, 31].

* [cite_start]El servidor debe guardar y recuperar el historial completo de cada partida desde la BBDD antes de cada turno[cite: 32, 33].
* [cite_start]El historial completo, junto con la acción nueva del jugador, se envía a la API del LLM para asegurar el contexto[cite: 34].

### Modelos en Comparación
* **DM 1:** Gemini 2.5 Flash (Velocidad y eficiencia).
* **DM 2:** Gemini 2.5 Pro (Razonamiento y creatividad).

---

## 2. REQUISITOS TÉCNICOS Y ARQUITECTURA

| Componente | Requisito | Tecnología | Estado |
| :--- | :--- | :--- | :--- |
| **Back-end** | RT1 | Node.js (Express) | ✅ Implementado |
| **Front-end** | RT2 | React (Vite) + TypeScript | ✅ Implementado |
| **Base de Datos** | RT5 | MySQL (`dm_comparator`) | ✅ Implementado |
| **Seguridad de API** | RT4 | Claves gestionadas por el servidor (`.env`) | ✅ Implementado |
| **Extras** | Extra | Autenticación, Gestión de Partidas, Log de Análisis (RF6) | ✅ Implementado |

---

## 3. INSTALACIÓN Y ARRANQUE (npm install)

### A. Configuración de la Base de Datos

1.  Crea la base de datos llamada **`dm_comparator`**.
2.  Importa en la base de datos el SQL proporcionado en la carpeta **`base_datos`**.

### B. Instalación de Dependencias (Frontend y Backend)

Es necesario ejecutar `npm install` en la carpeta **`server/`** y en la carpeta **`client/`** (o donde sea el directorio raíz del frontend) para instalar todas las dependencias necesarias.

1.  **Instalar Backend (`server/`):**
    ```bash
    cd server
    npm install
    ```
2.  **Instalar Frontend (raíz del cliente):**
    ```bash
    cd .. 
    npm install
    ```

### C. Instrucciones para Arrancar (npm start)

Inicia ambos servicios en dos terminales separadas:

1.  **Backend (Terminal 1):**
    ```bash
    cd server
    npm start 
    ```
2.  **Frontend (Terminal 2):**
    ```bash
    npm run dev 
    ```
    *Abre el enlace que te dé la terminal para iniciar la aplicación.*

---

## 4. VISUALIZACIÓN DE ARCHIVOS MARKDOWN

Para ver el `README.md` o el log completo de las partidas (`log_partida_[...].md`) en su formato renderizado (con títulos y tablas bonitas):

### A. Ver el README
Si estás usando VS Code, simplemente abre el archivo **`README.md`** y pulsa **`Ctrl` + `Shift` + `V`** para activar la vista previa integrada.

### B. Ver el Log de Partidas (RF6)
Una vez descargado el archivo **`.md`** desde la interfaz de juego, puedes usar el mismo método de VS Code para ver los logs de cada partida separado en tablas o subirlo temporalmente a una herramienta online como **Dillinger** para ver las tablas comparativas.

---
---
## 🔐 REFERENCIA DE CLAVES SECRETAS (RT4)

Este proyecto requiere que la clave de la API de Gemini (RT3) se gestione en el servidor. Por favor, revisa el archivo **`.env`** que se encuentra dentro de la carpeta **`server/`** e introduce las claves necesarias para la base de datos y la IA en el siguiente formato:

```env
API_KEY=AIzaSy...TU_CLAVE_GEMINI_AQUÍ
DB_USER=root 
DB_PASS= 
JWT_SECRET=tu_clave_secreta_para_sesiones