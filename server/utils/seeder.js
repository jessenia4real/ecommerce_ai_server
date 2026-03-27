import dotenv from 'dotenv';
import connectDB from '../db/connectDB.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

// Sample products data matching your frontend
const sampleProducts = [
  // Electronics
  {
    name: 'Sony WH-1000XM5 Headphones',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category: 'electronics',
    rating: 4.8,
    description: 'Industry-leading noise canceling with crystal clear audio.',
    countInStock: 50,
    brand: 'Sony',
    isFeatured: true,
  },
  {
    name: 'Apple MacBook Pro 14"',
    price: 1999.99,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    category: 'electronics',
    rating: 4.9,
    description: 'Supercharged by M3 Pro chip for professionals.',
    countInStock: 25,
    brand: 'Apple',
    isFeatured: true,
  },
  {
    name: 'Samsung 4K QLED TV 55"',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=400&fit=crop',
    category: 'electronics',
    rating: 4.6,
    description: 'Quantum HDR with stunning 4K picture quality.',
    countInStock: 30,
    brand: 'Samsung',
  },
  {
    name: 'iPad Pro 12.9"',
    price: 1099.99,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    category: 'electronics',
    rating: 4.7,
    description: 'The ultimate iPad experience with M2 chip.',
    countInStock: 40,
    brand: 'Apple',
  },
  {
    name: 'Canon EOS R6 Mark II',
    price: 2499.99,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop',
    category: 'electronics',
    rating: 4.9,
    description: 'Professional mirrorless camera with 40fps burst.',
    countInStock: 15,
    brand: 'Canon',
    isFeatured: true,
  },
  {
    name: 'Bose SoundLink Speaker',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
    category: 'electronics',
    rating: 4.5,
    description: '360° sound with deep bass, waterproof design.',
    countInStock: 60,
    brand: 'Bose',
  },

  // Fashion
  {
    name: 'Premium Linen Blazer',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4b07?w=400&h=400&fit=crop',
    category: 'fashion',
    rating: 4.6,
    description: 'Tailored linen blazer perfect for smart-casual looks.',
    countInStock: 45,
  },
  {
    name: 'Classic Denim Jacket',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=400&fit=crop',
    category: 'fashion',
    rating: 4.4,
    description: 'Timeless denim jacket with a modern slim fit.',
    countInStock: 80,
  },
  {
    name: 'Silk Evening Dress',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=400&fit=crop',
    category: 'fashion',
    rating: 4.7,
    description: 'Flowing silk midi dress for elegant evenings.',
    countInStock: 35,
    isFeatured: true,
  },
  {
    name: 'Merino Wool Sweater',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    category: 'fashion',
    rating: 4.5,
    description: 'Ultra-soft merino wool in a relaxed knit.',
    countInStock: 55,
  },

  // Jewellery
  {
    name: '18K Gold Chain Necklace',
    price: 599.99,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
    category: 'jewellery',
    rating: 4.8,
    description: 'Handcrafted 18K gold chain with lobster clasp.',
    countInStock: 20,
    isFeatured: true,
  },
  {
    name: 'Diamond Stud Earrings',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    category: 'jewellery',
    rating: 4.9,
    description: 'Classic 0.5ct diamond studs in white gold setting.',
    countInStock: 12,
    isFeatured: true,
  },
  {
    name: 'Rose Gold Bracelet',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&h=400&fit=crop',
    category: 'jewellery',
    rating: 4.6,
    description: 'Delicate rose gold chain bracelet with charm.',
    countInStock: 28,
  },

  // Accessories
  {
    name: 'Italian Leather Wallet',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    category: 'accessories',
    rating: 4.7,
    description: 'Full-grain Italian leather bifold with RFID block.',
    countInStock: 70,
  },
  {
    name: 'Canvas Tote Bag',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=400&fit=crop',
    category: 'accessories',
    rating: 4.3,
    description: 'Heavyweight canvas tote with interior pockets.',
    countInStock: 100,
  },
  {
    name: 'Polarized Aviator Sunglasses',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop',
    category: 'accessories',
    rating: 4.6,
    description: 'Classic aviators with polarized UV400 protection.',
    countInStock: 45,
  },

  // Footwear
  {
    name: 'Nike Air Max 270',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'footwear',
    rating: 4.7,
    description: 'Iconic Air Max unit for all-day comfort and style.',
    countInStock: 65,
    brand: 'Nike',
    isFeatured: true,
  },
  {
    name: 'Chelsea Leather Boots',
    price: 229.99,
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&h=400&fit=crop',
    category: 'footwear',
    rating: 4.8,
    description: 'Hand-stitched Chelsea boots in full-grain leather.',
    countInStock: 30,
  },
  {
    name: 'Adidas Ultraboost 23',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
    category: 'footwear',
    rating: 4.6,
    description: 'Responsive Boost midsole for energy return.',
    countInStock: 50,
    brand: 'Adidas',
  },

  // Beauty
  {
    name: 'Vitamin C Serum',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    category: 'beauty',
    rating: 4.7,
    description: '20% Vitamin C brightening serum with hyaluronic acid.',
    countInStock: 90,
  },
  {
    name: 'Matte Lipstick Set',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf8c30?w=400&h=400&fit=crop',
    category: 'beauty',
    rating: 4.5,
    description: 'Long-lasting matte formula in 6 curated shades.',
    countInStock: 120,
  },
  {
    name: 'Hydrating Face Cream',
    price: 64.99,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
    category: 'beauty',
    rating: 4.6,
    description: 'Rich moisturizer with ceramides and peptides.',
    countInStock: 75,
  },
  {
    name: 'Perfume - Midnight Oud',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop',
    category: 'beauty',
    rating: 4.8,
    description: 'Oriental fragrance with oud, amber and sandalwood.',
    countInStock: 40,
    isFeatured: true,
  },
];

// Sample categories
const sampleCategories = [
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

// Seed database
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Starting database seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing products, categories, and users');

    // Seed categories one by one to trigger pre-save hooks
    const createdCategories = [];
    for (const catData of sampleCategories) {
      const category = await Category.create(catData);
      createdCategories.push(category);
    }
    console.log(`Created ${createdCategories.length} categories`);

    // Seed products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Created ${createdProducts.length} products`);

    // Create regular user
    const sampleUser = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'User@123',
      phone: '+91 98765 43210',
      role: 'user',
    });
    console.log('Created sample user: user@example.com / User@123');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@luxe.com',
      password: 'Admin@123456',
      phone: '+91 98765 43211',
      role: 'admin',
    });
    console.log('Created admin user: admin@luxe.com / Admin@123456');

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('\nSample Login Credentials:');
    console.log('-------------------------');
    console.log('Regular User:');
    console.log('  Email: user@example.com');
    console.log('  Password: User@123');
    console.log('\nAdmin User:');
    console.log('  Email: admin@luxe.com');
    console.log('  Password: Admin@123456');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeder if this file is executed directly
if (process.argv.includes('--seed')) {
  seedDatabase();
}

export default seedDatabase;
