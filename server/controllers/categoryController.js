import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { includeInactive = 'false' } = req.query;

  const query = includeInactive === 'true' ? {} : { isActive: true };

  const categories = await Category.find(query)
    .sort({ displayOrder: 1, name: 1 })
    .populate('subcategories', 'name slug')
    .lean();

  res.status(200).json(
    new ApiResponse(200, { categories }, 'Categories retrieved successfully')
  );
});

/**
 * @desc    Get single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id).populate(
    'subcategories',
    'name slug image'
  );

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json(
    new ApiResponse(200, { category }, 'Category retrieved successfully')
  );
});

/**
 * @desc    Get category by slug
 * @route   GET /api/categories/slug/:slug
 * @access  Public
 */
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug, isActive: true }).populate(
    'subcategories',
    'name slug image'
  );

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json(
    new ApiResponse(200, { category }, 'Category retrieved successfully')
  );
});

/**
 * @desc    Create new category (Admin only)
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, icon, color, parentCategory, displayOrder } =
    req.body;

  // Check if category with same name exists
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
  });

  if (existingCategory) {
    throw new ApiError(409, 'Category with this name already exists');
  }

  const category = await Category.create({
    name,
    description,
    image,
    icon,
    color,
    parentCategory,
    displayOrder,
  });

  // If parent category is specified, add this category to parent's subcategories
  if (parentCategory) {
    await Category.findByIdAndUpdate(parentCategory, {
      $push: { subcategories: category._id },
    });
  }

  res.status(201).json(
    new ApiResponse(201, { category }, 'Category created successfully')
  );
});

/**
 * @desc    Update category (Admin only)
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image, icon, color, isActive, displayOrder } =
    req.body;

  const category = await Category.findByIdAndUpdate(
    id,
    {
      name,
      description,
      image,
      icon,
      color,
      isActive,
      displayOrder,
    },
    { new: true, runValidators: true }
  );

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json(
    new ApiResponse(200, { category }, 'Category updated successfully')
  );
});

/**
 * @desc    Delete category (Admin only)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category.slug });

  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category. It has ${productCount} products associated with it.`
    );
  }

  // Check if category has subcategories
  if (category.subcategories && category.subcategories.length > 0) {
    throw new ApiError(
      400,
      'Cannot delete category. Please delete or reassign subcategories first.'
    );
  }

  // Remove from parent's subcategories if it has a parent
  if (category.parentCategory) {
    await Category.findByIdAndUpdate(category.parentCategory, {
      $pull: { subcategories: category._id },
    });
  }

  await Category.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, {}, 'Category deleted successfully')
  );
});

/**
 * @desc    Update category product count
 * @route   PATCH /api/categories/:id/update-count
 * @access  Private/Admin
 */
export const updateProductCount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const count = await Product.countDocuments({
    category: category.slug,
    isActive: true,
  });

  category.productCount = count;
  await category.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { category },
      'Product count updated successfully'
    )
  );
});

/**
 * @desc    Seed initial categories
 * @route   POST /api/categories/seed
 * @access  Private/Admin
 */
export const seedCategories = asyncHandler(async (req, res) => {
  const defaultCategories = [
    {
      name: 'Electronics',
      description: 'Latest gadgets and electronic devices',
      color: '#1a3a5c',
      icon: '🖥️',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
      displayOrder: 1,
    },
    {
      name: 'Fashion',
      description: 'Trendy clothing and apparel',
      color: '#4a1942',
      icon: '👗',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      displayOrder: 2,
    },
    {
      name: 'Jewellery',
      description: 'Exquisite jewelry and accessories',
      color: '#5c3d00',
      icon: '💎',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
      displayOrder: 3,
    },
    {
      name: 'Accessories',
      description: 'Fashion accessories and more',
      color: '#1a3a2a',
      icon: '👜',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop',
      displayOrder: 4,
    },
    {
      name: 'Footwear',
      description: 'Shoes, sneakers, and footwear',
      color: '#4a1a1a',
      icon: '👟',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
      displayOrder: 5,
    },
    {
      name: 'Beauty',
      description: 'Beauty and personal care products',
      color: '#3a1a4a',
      icon: '💄',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop',
      displayOrder: 6,
    },
  ];

  const createdCategories = [];
  const skippedCategories = [];

  for (const catData of defaultCategories) {
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${catData.name}$`, 'i') },
    });

    if (!existing) {
      const category = await Category.create(catData);
      createdCategories.push(category);
    } else {
      skippedCategories.push(catData.name);
    }
  }

  res.status(201).json(
    new ApiResponse(
      201,
      {
        created: createdCategories,
        skipped: skippedCategories,
      },
      `Created ${createdCategories.length} categories, skipped ${skippedCategories.length}`
    )
  );
});
