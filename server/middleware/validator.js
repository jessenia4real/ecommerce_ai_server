import { body, param, query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

/**
 * Auth validation rules
 */
export const authValidation = {
  register: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 50 })
      .withMessage('Name cannot exceed 50 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[\d\s\-()]{7,15}$/)
      .withMessage('Please enter a valid phone number'),
    handleValidationErrors,
  ],

  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors,
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Name cannot exceed 50 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[\d\s\-()]{7,15}$/)
      .withMessage('Please enter a valid phone number'),
    handleValidationErrors,
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
    handleValidationErrors,
  ],
};

/**
 * Product validation rules
 */
export const productValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ max: 100 })
      .withMessage('Product name cannot exceed 100 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Product description is required'),
    body('price')
      .notEmpty()
      .withMessage('Price is required')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required')
      .isIn(['electronics', 'fashion', 'jewellery', 'accessories', 'footwear', 'beauty'])
      .withMessage('Invalid category'),
    body('image')
      .trim()
      .notEmpty()
      .withMessage('Product image is required'),
    body('countInStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock count must be a non-negative integer'),
    handleValidationErrors,
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Product name cannot exceed 100 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('category')
      .optional()
      .trim()
      .isIn(['electronics', 'fashion', 'jewellery', 'accessories', 'footwear', 'beauty'])
      .withMessage('Invalid category'),
    body('countInStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock count must be a non-negative integer'),
    handleValidationErrors,
  ],

  getById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid product ID'),
    handleValidationErrors,
  ],

  delete: [
    param('id')
      .isMongoId()
      .withMessage('Invalid product ID'),
    handleValidationErrors,
  ],

  query: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max price must be a positive number'),
    query('category')
      .optional()
      .trim()
      .isIn(['electronics', 'fashion', 'jewellery', 'accessories', 'footwear', 'beauty'])
      .withMessage('Invalid category'),
    query('sort')
      .optional()
      .trim()
      .isIn(['price_asc', 'price_desc', 'rating', 'newest', 'name'])
      .withMessage('Invalid sort option'),
    handleValidationErrors,
  ],
};

/**
 * Category validation rules
 */
export const categoryValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ max: 50 })
      .withMessage('Category name cannot exceed 50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    handleValidationErrors,
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category name cannot exceed 50 characters'),
    handleValidationErrors,
  ],

  getById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid category ID'),
    handleValidationErrors,
  ],

  delete: [
    param('id')
      .isMongoId()
      .withMessage('Invalid category ID'),
    handleValidationErrors,
  ],
};
