// src/routes/categoryRoutes.js

import express from 'express';
import { createCategory, updateCategory,getAllCategories,getCategoryById } from '../controllers/categoryController.js';

const router = express.Router();


router.post('/', createCategory);
router.put('/:id', updateCategory);
router.get('/', getAllCategories)
router.get('/:id', getCategoryById)

export default router;
