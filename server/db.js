import mysql from 'mysql2/promise';
import 'dotenv/config';

// Crea un pool de conexiones para reutilizar conexiones y mejorar el rendimiento
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Función para probar la conexión
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos MySQL establecida correctamente.');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1); // Termina el proceso si no se puede conectar a la DB
  }
}

checkConnection();

export default pool;
