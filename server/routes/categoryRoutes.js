import express from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  updateProductCount,
  seedCategories,
} from '../controllers/categoryController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { categoryValidation } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', getCategories);

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get('/slug/:slug', getCategoryBySlug);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 */
router.get('/:id', categoryValidation.getById, getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Create new category (Admin only)
 * @access  Private/Admin
 */
router.post('/', verifyToken, requireAdmin, categoryValidation.create, createCategory);

/**
 * @route   POST /api/categories/seed
 * @desc    Seed default categories (Admin only)
 * @access  Private/Admin
 */
router.post('/seed', verifyToken, requireAdmin, seedCategories);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', verifyToken, requireAdmin, categoryValidation.update, updateCategory);

/**
 * @route   PATCH /api/categories/:id/update-count
 * @desc    Update category product count (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/update-count', verifyToken, requireAdmin, updateProductCount);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', verifyToken, requireAdmin, categoryValidation.delete, deleteCategory);

export default router;
