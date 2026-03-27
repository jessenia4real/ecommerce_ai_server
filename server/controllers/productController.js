import Product from '../models/Product.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    minPrice,
    maxPrice,
    search,
    sort = 'newest',
    isFeatured,
    inStock,
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (category) {
    query.category = category.toLowerCase();
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (isFeatured === 'true') {
    query.isFeatured = true;
  }

  if (inStock === 'true') {
    query.countInStock = { $gt: 0 };
  }

  // Build sort
  let sortOption = {};
  switch (sort) {
    case 'price_asc':
      sortOption = { price: 1 };
      break;
    case 'price_desc':
      sortOption = { price: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'name':
      sortOption = { name: 1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Product.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Products retrieved successfully'
    )
  );
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(
    new ApiResponse(200, { product }, 'Product retrieved successfully')
  );
});

/**
 * @desc    Get product by slug (if you add slug field) or name
 * @route   GET /api/products/slug/:slug
 * @access  Public
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // Convert slug back to approximate name search
  const name = slug.replace(/-/g, ' ');
  
  const product = await Product.findOne({
    name: { $regex: new RegExp(name, 'i') },
    isActive: true,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(
    new ApiResponse(200, { product }, 'Product retrieved successfully')
  );
});

/**
 * @desc    Create new product (Admin only)
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;

  const product = await Product.create(productData);

  res.status(201).json(
    new ApiResponse(201, { product }, 'Product created successfully')
  );
});

/**
 * @desc    Update product (Admin only)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated directly
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  delete updateData.sku;

  const product = await Product.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(
    new ApiResponse(200, { product }, 'Product updated successfully')
  );
});

/**
 * @desc    Delete product (Admin only)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(
    new ApiResponse(200, {}, 'Product deleted successfully')
  );
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({ isFeatured: true, isActive: true })
    .sort({ rating: -1 })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json(
    new ApiResponse(200, { products }, 'Featured products retrieved successfully')
  );
});

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 12, sort = 'newest' } = req.query;

  // Build sort
  let sortOption = {};
  switch (sort) {
    case 'price_asc':
      sortOption = { price: 1 };
      break;
    case 'price_desc':
      sortOption = { price: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'name':
      sortOption = { name: 1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find({
      category: category.toLowerCase(),
      isActive: true,
    })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Product.countDocuments({
      category: category.toLowerCase(),
      isActive: true,
    }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Products retrieved successfully'
    )
  );
});

/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;

  if (!q || q.trim().length < 2) {
    throw new ApiError(400, 'Search query must be at least 2 characters');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Product.countDocuments({ $text: { $search: q }, isActive: true }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Search results retrieved successfully'
    )
  );
});

/**
 * @desc    Get related products
 * @route   GET /api/products/:id/related
 * @access  Public
 */
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: id },
    isActive: true,
  })
    .sort({ rating: -1 })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json(
    new ApiResponse(
      200,
      { products: relatedProducts },
      'Related products retrieved successfully'
    )
  );
});

/**
 * @desc    Update product stock
 * @route   PATCH /api/products/:id/stock
 * @access  Private/Admin
 */
export const updateStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { countInStock } = req.body;

  if (countInStock === undefined || countInStock < 0) {
    throw new ApiError(400, 'Valid stock count is required');
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { countInStock },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(
    new ApiResponse(200, { product }, 'Stock updated successfully')
  );
});

/**
 * @desc    Get all categories with product counts
 * @route   GET /api/products/categories/counts
 * @access  Public
 */
export const getCategoryCounts = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const formattedCategories = categories.map((cat) => ({
    name: cat._id,
    count: cat.count,
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      { categories: formattedCategories },
      'Category counts retrieved successfully'
    )
  );
});
