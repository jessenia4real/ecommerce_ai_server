/**
 * Async Handler - Wraps async route handlers to catch errors
 * @param {Function} requestHandler - The async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
