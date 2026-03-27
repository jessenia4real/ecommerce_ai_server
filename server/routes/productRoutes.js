import express from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getRelatedProducts,
  updateStock,
  getCategoryCounts,
} from '../controllers/productController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { productValidation } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, sorting, and pagination
 * @access  Public
 */
router.get('/', productValidation.query, getProducts);

/**
 * @route   GET /api/products/search
 * @desc    Search products
 * @access  Public
 */
router.get('/search', searchProducts);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', getFeaturedProducts);

/**
 * @route   GET /api/products/categories/counts
 * @desc    Get product counts by category
 * @access  Public
 */
router.get('/categories/counts', getCategoryCounts);

/**
 * @route   GET /api/products/category/:category
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:category', getProductsByCategory);

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get('/slug/:slug', getProductBySlug);

/**
 * @route   GET /api/products/:id/related
 * @desc    Get related products
 * @access  Public
 */
router.get('/:id/related', getRelatedProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', productValidation.getById, getProductById);

/**
 * @route   POST /api/products
 * @desc    Create new product (Admin only)
 * @access  Private/Admin
 */
router.post('/', verifyToken, requireAdmin, productValidation.create, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', verifyToken, requireAdmin, productValidation.update, updateProduct);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product stock (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/stock', verifyToken, requireAdmin, updateStock);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', verifyToken, requireAdmin, productValidation.delete, deleteProduct);

export default router;
