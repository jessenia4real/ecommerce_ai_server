import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, status, data = null, error = null) {
  const test = { name, status, data, error };
  results.tests.push(test);
  if (status === 'PASS') {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
    if (error) console.log(`   Error: ${error}`);
  }
}

async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function runTests() {
  console.log('========================================');
  console.log('API CRUD Operations Test');
  console.log('========================================\n');
  
  let authToken = null;
  let userId = null;
  let productId = null;
  let categoryId = null;
  
  // ==================== HEALTH CHECK ====================
  console.log('\n📋 Health Check');
  console.log('----------------');
  const health = await makeRequest('/health');
  if (health.status === 200 && health.data.success) {
    logTest('Health endpoint', 'PASS');
  } else {
    logTest('Health endpoint', 'FAIL', null, health.error || 'Server not responding');
    console.log('\n❌ Server is not running. Please start it first with: npm run dev');
    return;
  }
  
  // ==================== AUTHENTICATION ====================
  console.log('\n🔐 Authentication Tests');
  console.log('------------------------');
  
  // Test 1: Register new user
  const registerData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test@123',
    phone: '+91 98765 43210'
  };
  const register = await makeRequest('/auth/register', 'POST', registerData);
  if (register.status === 201 && register.data.success) {
    logTest('Register new user', 'PASS');
    authToken = register.data.data.token;
    userId = register.data.data.user._id;
  } else {
    logTest('Register new user', 'FAIL', register.data, register.data?.message);
  }
  
  // Test 2: Login with existing user
  const loginData = {
    email: 'user@example.com',
    password: 'User@123'
  };
  const login = await makeRequest('/auth/login', 'POST', loginData);
  if (login.status === 200 && login.data.success) {
    logTest('Login existing user', 'PASS');
    authToken = login.data.data.token;
    userId = login.data.data.user._id;
  } else {
    logTest('Login existing user', 'FAIL', login.data, login.data?.message);
  }
  
  // Test 3: Get profile (protected)
  if (authToken) {
    const profile = await makeRequest('/auth/profile', 'GET', null, authToken);
    if (profile.status === 200 && profile.data.success) {
      logTest('Get user profile', 'PASS');
    } else {
      logTest('Get user profile', 'FAIL', profile.data, profile.data?.message);
    }
  } else {
    logTest('Get user profile', 'SKIP', null, 'No auth token');
  }
  
  // Test 4: Update profile (protected)
  if (authToken) {
    const updateData = { name: 'Updated Name' };
    const update = await makeRequest('/auth/profile', 'PUT', updateData, authToken);
    if (update.status === 200 && update.data.success) {
      logTest('Update user profile', 'PASS');
    } else {
      logTest('Update user profile', 'FAIL', update.data, update.data?.message);
    }
  } else {
    logTest('Update user profile', 'SKIP', null, 'No auth token');
  }
  
  // ==================== PRODUCTS ====================
  console.log('\n📦 Product Tests');
  console.log('-----------------');
  
  // Test 5: Get all products
  const products = await makeRequest('/products');
  if (products.status === 200 && products.data.success && products.data.data.products.length > 0) {
    logTest('Get all products', 'PASS');
    productId = products.data.data.products[0]._id;
  } else {
    logTest('Get all products', 'FAIL', products.data, products.data?.message);
  }
  
  // Test 6: Get products by category
  const categoryProducts = await makeRequest('/products/category/electronics');
  if (categoryProducts.status === 200 && categoryProducts.data.success) {
    logTest('Get products by category', 'PASS');
  } else {
    logTest('Get products by category', 'FAIL', categoryProducts.data, categoryProducts.data?.message);
  }
  
  // Test 7: Get featured products
  const featured = await makeRequest('/products/featured');
  if (featured.status === 200 && featured.data.success) {
    logTest('Get featured products', 'PASS');
  } else {
    logTest('Get featured products', 'FAIL', featured.data, featured.data?.message);
  }
  
  // Test 8: Get single product
  if (productId) {
    const singleProduct = await makeRequest(`/products/${productId}`);
    if (singleProduct.status === 200 && singleProduct.data.success) {
      logTest('Get single product', 'PASS');
    } else {
      logTest('Get single product', 'FAIL', singleProduct.data, singleProduct.data?.message);
    }
  } else {
    logTest('Get single product', 'SKIP', null, 'No product ID');
  }
  
  // Test 9: Search products
  const search = await makeRequest('/products/search?q=headphones');
  if (search.status === 200 && search.data.success) {
    logTest('Search products', 'PASS');
  } else {
    logTest('Search products', 'FAIL', search.data, search.data?.message);
  }
  
  // ==================== CATEGORIES ====================
  console.log('\n📁 Category Tests');
  console.log('------------------');
  
  // Test 10: Get all categories
  const categories = await makeRequest('/categories');
  if (categories.status === 200 && categories.data.success && categories.data.data.categories.length > 0) {
    logTest('Get all categories', 'PASS');
    categoryId = categories.data.data.categories[0]._id;
  } else {
    logTest('Get all categories', 'FAIL', categories.data, categories.data?.message);
  }
  
  // Test 11: Get single category
  if (categoryId) {
    const singleCategory = await makeRequest(`/categories/${categoryId}`);
    if (singleCategory.status === 200 && singleCategory.data.success) {
      logTest('Get single category', 'PASS');
    } else {
      logTest('Get single category', 'FAIL', singleCategory.data, singleCategory.data?.message);
    }
  } else {
    logTest('Get single category', 'SKIP', null, 'No category ID');
  }
  
  // Test 12: Get category by slug
  const categoryBySlug = await makeRequest('/categories/slug/electronics');
  if (categoryBySlug.status === 200 && categoryBySlug.data.success) {
    logTest('Get category by slug', 'PASS');
  } else {
    logTest('Get category by slug', 'FAIL', categoryBySlug.data, categoryBySlug.data?.message);
  }
  
  // ==================== ADMIN OPERATIONS ====================
  console.log('\n🔒 Admin Tests (Protected)');
  console.log('---------------------------');
  
  // Login as admin
  const adminLogin = await makeRequest('/auth/login', 'POST', {
    email: 'admin@luxe.com',
    password: 'Admin@123456'
  });
  
  let adminToken = null;
  if (adminLogin.status === 200 && adminLogin.data.success) {
    adminToken = adminLogin.data.data.token;
    logTest('Admin login', 'PASS');
  } else {
    logTest('Admin login', 'FAIL', adminLogin.data, adminLogin.data?.message);
  }
  
  // Test 13: Create product (admin only)
  if (adminToken) {
    const newProduct = {
      name: 'Test Product ' + Date.now(),
      description: 'This is a test product',
      price: 99.99,
      image: 'https://example.com/image.jpg',
      category: 'electronics',
      countInStock: 10
    };
    const createProduct = await makeRequest('/products', 'POST', newProduct, adminToken);
    if (createProduct.status === 201 && createProduct.data.success) {
      logTest('Create product (admin)', 'PASS');
      productId = createProduct.data.data.product._id;
    } else {
      logTest('Create product (admin)', 'FAIL', createProduct.data, createProduct.data?.message);
    }
  } else {
    logTest('Create product (admin)', 'SKIP', null, 'No admin token');
  }
  
  // Test 14: Update product (admin only)
  if (adminToken && productId) {
    const updateProduct = await makeRequest(`/products/${productId}`, 'PUT', { price: 89.99 }, adminToken);
    if (updateProduct.status === 200 && updateProduct.data.success) {
      logTest('Update product (admin)', 'PASS');
    } else {
      logTest('Update product (admin)', 'FAIL', updateProduct.data, updateProduct.data?.message);
    }
  } else {
    logTest('Update product (admin)', 'SKIP', null, 'No admin token or product ID');
  }
  
  // Test 15: Get all users (admin only)
  if (adminToken) {
    const allUsers = await makeRequest('/auth/users', 'GET', null, adminToken);
    if (allUsers.status === 200 && allUsers.data.success) {
      logTest('Get all users (admin)', 'PASS');
    } else {
      logTest('Get all users (admin)', 'FAIL', allUsers.data, allUsers.data?.message);
    }
  } else {
    logTest('Get all users (admin)', 'SKIP', null, 'No admin token');
  }
  
  // ==================== SUMMARY ====================
  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.tests.length}`);
  console.log('========================================');
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n⚠️  ${results.failed} test(s) failed.`);
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Wait a moment for server to be ready if just started
console.log('Waiting for server...');
setTimeout(runTests, 2000);
