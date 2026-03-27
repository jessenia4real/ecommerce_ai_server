import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Verify JWT Token Middleware
 * Protects routes that require authentication
 */
export const verifyToken = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new ApiError(401, 'Access denied. No token provided.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new ApiError(401, 'User not found. Token is invalid.');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'User account is deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired. Please login again.');
    }
    throw error;
  }
});

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      req.user = null;
    }
  }

  next();
});

/**
 * Admin Authorization Middleware
 * Requires verifyToken to be called first
 */
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }

  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Admin privileges required.');
  }

  next();
});

/**
 * Generate JWT Token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT Token
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Generate Refresh Token
 * @param {string} userId - User ID to encode in token
 * @returns {string} Refresh JWT Token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};
