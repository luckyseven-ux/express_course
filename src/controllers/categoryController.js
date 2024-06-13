// src/controllers/categoryController.js

import { pool } from '../database/connection.js';

// Fungsi untuk mendapatkan semua kategori
export const getAllCategories = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [categories] = await connection.query('SELECT * FROM category');
    connection.release();

    res.status(200).json({ categories });
  } catch (error) {
    console.error('Gagal mendapatkan kategori:', error);
    res.status(500).json({ message: 'Gagal mendapatkan kategori' });
  }
};

// Fungsi untuk mendapatkan kategori berdasarkan ID
export const getCategoryById = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const connection = await pool.getConnection();
    const [category] = await connection.query('SELECT * FROM category WHERE id = ?', [categoryId]);
    connection.release();

    if (category.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    res.status(200).json({ category: category[0] });
  } catch (error) {
    console.error('Gagal mendapatkan kategori:', error);
    res.status(500).json({ message: 'Gagal mendapatkan kategori' });
  }
};
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const [existingCate] = await pool.query('SELECT * FROM category WHERE name = ?', [name]);
    if (existingCate.length > 0) {
      return res.status(400).json({ message: 'Nama sudah ada' });
    }

    await pool.query('INSERT INTO category (name, description) VALUES (?, ?)', [name, description]);
    res.status(201).json({ message: 'Data baru berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: 'Kesalahan input', error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Check if category with given id exists
    const [existingCate] = await pool.query('SELECT * FROM category WHERE id = ?', [id]);
    if (existingCate.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    // Update the category
    await pool.query('UPDATE category SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    res.json({ message: 'Kategori berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Kesalahan server', error: err.message });
  }
};

