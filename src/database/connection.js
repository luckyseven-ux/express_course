// src/database/connection.js

import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'backend'
});

// Membuat koneksi ke database untuk memastikan koneksi berhasil
export const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Berhasil! Terhubung dengan database');
    connection.release();
  } catch (error) {
    console.error('Gagal terkoneksi dengan database:', error);
  }
};
