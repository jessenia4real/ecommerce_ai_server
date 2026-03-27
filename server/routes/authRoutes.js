import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  getAllUsers,
  updateUserStatus,
} from '../controllers/authController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { authValidation } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authValidation.register, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authValidation.login, login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', verifyToken, logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', verifyToken, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', verifyToken, authValidation.updateProfile, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put('/change-password', verifyToken, authValidation.changePassword, changePassword);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/users', verifyToken, requireAdmin, getAllUsers);

/**
 * @route   PUT /api/auth/users/:id/status
 * @desc    Update user status (Admin only)
 * @access  Private/Admin
 */
router.put('/users/:id/status', verifyToken, requireAdmin, updateUserStatus);

export default router;
