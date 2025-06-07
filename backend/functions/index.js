const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Express
const app = express();

// Middleware
app.use(helmet());
app.use(cors({origin: true}));
app.use(express.json());

// JWT Secret (In production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'swipemall-secret-key-change-in-production';

// Validation Schemas
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  password: Joi.string().required(),
});

const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  profileImage: Joi.string().uri().optional(),
});

// Phase 2: Store Management Schemas
const storeRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(100).lowercase().pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().min(10).max(500).required(),
  location: Joi.string().max(200).optional(),
  logoImage: Joi.string().uri().optional(),
  whatsappNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  instagramPage: Joi.string().uri().optional(),
  website: Joi.string().uri().optional(),
  ownerId: Joi.string().optional(),
  ownerDetails: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    email: Joi.string().email().optional(),
  }).optional(),
}).xor('ownerId', 'ownerDetails'); // Either ownerId OR ownerDetails is required

const storeUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().min(10).max(500).optional(),
  location: Joi.string().max(200).optional(),
  logoImage: Joi.string().uri().optional(),
  whatsappNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  instagramPage: Joi.string().uri().optional(),
  website: Joi.string().uri().optional(),
});

// Phase 3: Product & Category Management Schemas
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  slug: Joi.string().min(2).max(50).lowercase().pattern(/^[a-z0-9-]+$/).required(),
  isActive: Joi.boolean().optional().default(true),
});

const categoryUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  isActive: Joi.boolean().optional(),
});

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  image: Joi.string().uri().required(),
  price: Joi.number().positive().required(),
  isOnSale: Joi.boolean().optional().default(false),
  salePrice: Joi.number().positive().optional(),
  availableSizes: Joi.array().items(Joi.string()).optional(),
  size: Joi.string().optional(),
  availableColors: Joi.array().items(Joi.string()).optional(),
  stockAmount: Joi.number().integer().min(0).required(),
  categorySlug: Joi.string().required(),
  storeSlug: Joi.string().required(),
});

const productUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  image: Joi.string().uri().optional(),
  price: Joi.number().positive().optional(),
  isOnSale: Joi.boolean().optional(),
  salePrice: Joi.number().positive().optional(),
  availableSizes: Joi.array().items(Joi.string()).optional(),
  size: Joi.string().optional(),
  availableColors: Joi.array().items(Joi.string()).optional(),
  stockAmount: Joi.number().integer().min(0).optional(),
  categorySlug: Joi.string().optional(),
});

// Phase 4: User Interactions & Swipe System Schemas
const swipeSchema = Joi.object({
  productId: Joi.string().required(),
  action: Joi.string().valid('like', 'dislike').required(),
  swipeDirection: Joi.string().valid('left', 'right').optional(), // left = dislike, right = like
  timeSpent: Joi.number().integer().min(0).max(300).optional(), // seconds spent viewing before swipe
});

const feedRequestSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).optional().default(20),
  excludeSwipedToday: Joi.boolean().optional().default(true),
  categorySlug: Joi.string().optional(),
  priceMax: Joi.number().positive().optional(),
  onSaleOnly: Joi.boolean().optional(),
});

const preferencesSchema = Joi.object({
  favoriteCategories: Joi.array().items(Joi.string()).max(10).optional(),
  priceRange: Joi.object({
    min: Joi.number().positive().optional(),
    max: Joi.number().positive().optional(),
  }).optional(),
  preferredStores: Joi.array().items(Joi.string()).max(20).optional(),
  interests: Joi.array().items(Joi.string().valid(
    'fashion', 'electronics', 'home', 'beauty', 'sports', 'books', 
    'jewelry', 'automotive', 'health', 'toys', 'food', 'art'
  )).max(15).optional(),
});

// Phase 4.5: Search System Schemas
const searchSchema = Joi.object({
  query: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('all', 'products', 'categories', 'stores').optional().default('all'),
  limit: Joi.number().integer().min(1).max(20).optional().default(10),
  categorySlug: Joi.string().optional(), // Filter products by category
  storeSlug: Joi.string().optional(), // Filter products by store
  priceMax: Joi.number().positive().optional(),
  onSaleOnly: Joi.boolean().optional(),
});

// Phase 5: Social Features (User-Store Follow System) Schemas
const followActionSchema = Joi.object({
  storeSlug: Joi.string().required(),
});

const followingListSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).optional().default(20),
  offset: Joi.number().integer().min(0).optional().default(0),
});

const activityFeedSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(30).optional().default(15),
  offset: Joi.number().integer().min(0).optional().default(0),
  type: Joi.string().valid('all', 'new_products', 'sales', 'store_updates').optional().default('all'),
});

// Helper Functions
const generateToken = (userId) => {
  return jwt.sign({userId}, JWT_SECRET, {expiresIn: '365d'}); // 1 year
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({error: 'No token provided'});
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({error: 'Invalid token'});
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({error: 'User not found'});
    }
    
    const userData = userDoc.data();
    if (userData.role !== 'admin') {
      return res.status(403).json({error: 'Admin access required'});
    }
    
    req.userRole = userData.role;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

const verifyStoreOwner = async (req, res, next) => {
  try {
    const storeIdentifier = req.params.storeId || req.params.storeSlug;
    let storeDoc;
    let storeData;
    
    // Try to get store by ID first, then by slug
    if (storeIdentifier.match(/^[a-zA-Z0-9]{20}$/)) {
      // Looks like a Firestore ID (20 characters)
      storeDoc = await db.collection('stores').doc(storeIdentifier).get();
      if (storeDoc.exists) {
        storeData = { id: storeDoc.id, ...storeDoc.data() };
      }
    } else {
      // Assume it's a slug
      const storeQuery = await db.collection('stores')
        .where('slug', '==', storeIdentifier)
        .get();
      
      if (!storeQuery.empty) {
        storeDoc = storeQuery.docs[0];
        storeData = { id: storeDoc.id, ...storeDoc.data() };
      }
    }
    
    if (!storeData) {
      return res.status(404).json({error: 'Store not found'});
    }
    
    const userDoc = await db.collection('users').doc(req.userId).get();
    const userData = userDoc.data();
    
    // Allow if user is store owner or admin
    if (storeData.ownerId !== req.userId && userData.role !== 'admin') {
      return res.status(403).json({error: 'Store owner or admin access required'});
    }
    
    req.storeData = storeData;
    req.storeDoc = storeDoc;
    req.userRole = userData.role;
    next();
  } catch (error) {
    console.error('Store owner verification error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

const verifyProductOwner = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const productDoc = await db.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({error: 'Product not found'});
    }
    
    const productData = productDoc.data();
    const userDoc = await db.collection('users').doc(req.userId).get();
    const userData = userDoc.data();
    
    // Get store data to verify ownership
    const storeDoc = await db.collection('stores').doc(productData.storeId).get();
    const storeData = storeDoc.data();
    
    // Allow if user is store owner or admin
    if (storeData.ownerId !== req.userId && userData.role !== 'admin') {
      return res.status(403).json({error: 'Product owner or admin access required'});
    }
    
    req.productData = { id: productDoc.id, ...productData };
    req.productDoc = productDoc;
    req.storeData = { id: storeDoc.id, ...storeData };
    req.userRole = userData.role;
    next();
  } catch (error) {
    console.error('Product owner verification error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

// Helper function to resolve category by slug or ID
const resolveCategoryBySlugOrId = async (identifier) => {
  if (!identifier) return null;
  
  let categoryDoc;
  let categoryData;
  
  // Try to get category by ID first, then by slug
  if (identifier.match(/^[a-zA-Z0-9]{20}$/)) {
    // Looks like a Firestore ID (20 characters)
    categoryDoc = await db.collection('categories').doc(identifier).get();
    if (categoryDoc.exists) {
      categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
    }
  } else {
    // Assume it's a slug
    const categoryQuery = await db.collection('categories')
      .where('slug', '==', identifier)
      .get();
    
    if (!categoryQuery.empty) {
      categoryDoc = categoryQuery.docs[0];
      categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
    }
  }
  
  return categoryData;
};

// Helper function to resolve store by slug or ID
const resolveStoreBySlugOrId = async (identifier) => {
  if (!identifier) return null;
  
  let storeDoc;
  let storeData;
  
  // Try to get store by ID first, then by slug
  if (identifier.match(/^[a-zA-Z0-9]{20}$/)) {
    // Looks like a Firestore ID (20 characters)
    storeDoc = await db.collection('stores').doc(identifier).get();
    if (storeDoc.exists) {
      storeData = { id: storeDoc.id, ...storeDoc.data() };
    }
  } else {
    // Assume it's a slug
    const storeQuery = await db.collection('stores')
      .where('slug', '==', identifier)
      .get();
    
    if (!storeQuery.empty) {
      storeDoc = storeQuery.docs[0];
      storeData = { id: storeDoc.id, ...storeDoc.data() };
    }
  }
  
  return storeData;
};

// Phase 1: Authentication APIs

// Sign Up API
app.post('/auth/signup', async (req, res) => {
  try {
    const {error, value} = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {name, phoneNumber, email, password} = value;
    
    // Check if user exists
    const existingUser = await db.collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .get();
      
    if (!existingUser.empty) {
      return res.status(409).json({error: 'User already exists'});
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const userRef = db.collection('users').doc();
    const now = new Date();
    const userData = {
      id: userRef.id,
      name,
      phoneNumber,
      email: email || null,
      password: hashedPassword,
      profileImage: null,
      numberOfFollowing: 0,
      numberOfClicks: 0,
      isActive: true,
      isBlocked: false,
      role: 'user',
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    };
    
    await userRef.set(userData);
    
    const token = generateToken(userRef.id);
    const {password: _, ...userResponse} = userData;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse,
      token,
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Login API
app.post('/auth/login', async (req, res) => {
  try {
    const {error, value} = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {phoneNumber, password} = value;
    
    const userQuery = await db.collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .get();
      
    if (userQuery.empty) {
      return res.status(401).json({error: 'Invalid credentials'});
    }
    
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    
    if (userData.isBlocked) {
      return res.status(403).json({error: 'Account is blocked'});
    }
    
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({error: 'Invalid credentials'});
    }
    
    await userDoc.ref.update({
      lastActiveAt: new Date(),
    });
    
    const token = generateToken(userDoc.id);
    const {password: _, ...userResponse} = userData;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Logout API
app.post('/auth/logout', verifyToken, async (req, res) => {
  try {
    await db.collection('users').doc(req.userId).update({
      lastActiveAt: new Date(),
    });
    
    res.json({success: true, message: 'Logout successful'});
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Password Reset API
app.post('/auth/reset-password', async (req, res) => {
  try {
    const {phoneNumber} = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({error: 'Phone number is required'});
    }
    
    // Find user by phone number
    const userQuery = await db.collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .get();
      
    if (userQuery.empty) {
      return res.status(404).json({error: 'User not found'});
    }
    
    // Generate reset code (6 digits)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store reset code in user document (expires in 10 minutes)
    const userDoc = userQuery.docs[0];
    await userDoc.ref.update({
      resetCode,
      resetCodeExpiry: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
      updatedAt: new Date(),
    });
    
    // In production, send SMS with reset code
    console.log(`Reset code for ${phoneNumber}: ${resetCode}`);
    
    res.json({
      success: true,
      message: 'Reset code sent successfully',
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Verify Reset Code and Update Password
app.post('/auth/verify-reset', async (req, res) => {
  try {
    const {phoneNumber, resetCode, newPassword} = req.body;
    
    if (!phoneNumber || !resetCode || !newPassword) {
      return res.status(400).json({error: 'All fields are required'});
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({error: 'Password must be at least 6 characters'});
    }
    
    // Find user by phone number
    const userQuery = await db.collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .get();
      
    if (userQuery.empty) {
      return res.status(404).json({error: 'User not found'});
    }
    
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    
    // Check reset code and expiry
    if (userData.resetCode !== resetCode) {
      return res.status(400).json({error: 'Invalid reset code'});
    }
    
    if (!userData.resetCodeExpiry || userData.resetCodeExpiry.toMillis() < Date.now()) {
      return res.status(400).json({error: 'Reset code has expired'});
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password and clear reset code
    await userDoc.ref.update({
      password: hashedPassword,
      resetCode: FieldValue.delete(),
      resetCodeExpiry: FieldValue.delete(),
      updatedAt: new Date(),
    });
    
    res.json({
      success: true,
      message: 'Password updated successfully',
    });
    
  } catch (error) {
    console.error('Verify reset error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Profile Management API
app.get('/auth/profile', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({error: 'User not found'});
    }
    
    const userData = userDoc.data();
    const {password: _, resetCode: __, resetCodeExpiry: ___, ...userResponse} = userData;
    
    res.json({
      success: true,
      user: userResponse,
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

app.put('/auth/profile', verifyToken, async (req, res) => {
  try {
    const {error, value} = profileUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const updateData = {
      ...value,
      updatedAt: new Date(),
    };
    
    await db.collection('users').doc(req.userId).update(updateData);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 1.2: Guest User System

// Guest Session API
app.post('/auth/guest-session', async (req, res) => {
  try {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestToken = jwt.sign(
      {guestId, isGuest: true}, 
      JWT_SECRET, 
      {expiresIn: '30d'} // 30 days for guests
    );
    
    res.json({
      success: true,
      message: 'Guest session created',
      guestId,
      token: guestToken,
    });
  } catch (error) {
    console.error('Guest session error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Guest to User Conversion API
app.post('/auth/convert-guest', async (req, res) => {
  try {
    const {error, value} = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {name, phoneNumber, email, password} = value;
    
    // Check if user already exists
    const existingUser = await db.collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .get();
      
    if (!existingUser.empty) {
      return res.status(409).json({error: 'User already exists with this phone number'});
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user document
    const userRef = db.collection('users').doc();
    const userData = {
      id: userRef.id,
      name,
      phoneNumber,
      email: email || null,
      password: hashedPassword,
      profileImage: null,
      numberOfFollowing: 0,
      numberOfClicks: 0,
      isActive: true,
      isBlocked: false,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date(),
    };
    
    await userRef.set(userData);
    
    // Generate user token
    const token = generateToken(userRef.id);
    
    // Return user data without password
    const {password: _, ...userResponse} = userData;
    
    res.status(201).json({
      success: true,
      message: 'Guest converted to user successfully',
      user: userResponse,
      token,
    });
    
  } catch (error) {
    console.error('Convert guest error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 2: Store Management APIs

// Phase 2.1: Store Registration API (Admin Only)
app.post('/stores', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {error, value} = storeRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {name, slug, description, location, logoImage, whatsappNumber, instagramPage, website, ownerId, ownerDetails} = value;
    
    // Check if slug is unique
    const existingStore = await db.collection('stores')
      .where('slug', '==', slug)
      .get();
      
    if (!existingStore.empty) {
      return res.status(409).json({error: 'Store slug already exists'});
    }
    
    let finalOwnerId = ownerId;
    
    // If ownerId provided, verify it exists
    if (ownerId) {
      const ownerDoc = await db.collection('users').doc(ownerId).get();
      if (!ownerDoc.exists) {
        return res.status(404).json({error: 'Store owner not found'});
      }
      
      const ownerData = ownerDoc.data();
      if (ownerData.isBlocked) {
        return res.status(400).json({error: 'Cannot create store for blocked user'});
      }
    } else if (ownerDetails) {
      // Create new user for the store owner
      const hashedPassword = await bcrypt.hash('tempPassword123', 12);
      const userRef = db.collection('users').doc();
      const now = new Date();
      
      const userData = {
        id: userRef.id,
        name: ownerDetails.name,
        phoneNumber: ownerDetails.phoneNumber,
        email: ownerDetails.email || null,
        password: hashedPassword,
        profileImage: null,
        numberOfFollowing: 0,
        numberOfClicks: 0,
        isActive: true,
        isBlocked: false,
        role: 'user',
        needsPasswordReset: true, // Flag to force password change on first login
        createdAt: now,
        updatedAt: now,
        lastActiveAt: now,
      };
      
      await userRef.set(userData);
      finalOwnerId = userRef.id;
    } else {
      return res.status(400).json({error: 'Either ownerId or ownerDetails must be provided'});
    }
    
    // Create store
    const storeRef = db.collection('stores').doc();
    const now = new Date();
    const storeData = {
      id: storeRef.id,
      name,
      slug,
      description,
      location: location || null,
      logoImage: logoImage || null,
      whatsappNumber: whatsappNumber || null,
      instagramPage: instagramPage || null,
      website: website || null,
      totalClicks: 0,
      totalFollowers: 0,
      totalLikedProducts: 0,
      isVerified: false,
      isBlocked: false,
      ownerId: finalOwnerId,
      createdAt: now,
      updatedAt: now,
    };
    
    await storeRef.set(storeData);
    
    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      store: storeData,
      ...(ownerDetails && {
        newOwnerCreated: true,
        ownerInfo: {
          id: finalOwnerId,
          name: ownerDetails.name,
          phoneNumber: ownerDetails.phoneNumber,
          defaultPassword: 'tempPassword123',
          needsPasswordReset: true
        }
      })
    });
    
  } catch (error) {
    console.error('Store registration error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Get All Stores (Public)
app.get('/stores', async (req, res) => {
  try {
    const {limit = 20, offset = 0, verified, search} = req.query;
    
    let query = db.collection('stores')
      .where('isBlocked', '==', false);
    
    if (verified === 'true') {
      query = query.where('isVerified', '==', true);
    }
    
    const storesSnapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    let stores = storesSnapshot.docs.map(doc => {
      const data = doc.data();
      // Remove sensitive data
      delete data.ownerId;
      return data;
    });
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      stores = stores.filter(store => 
        store.name.toLowerCase().includes(searchLower) ||
        store.description.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      stores,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: stores.length,
      },
    });
    
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Get Single Store (Public) - by ID or slug
app.get('/stores/:storeSlug', async (req, res) => {
  try {
    const {storeSlug} = req.params;
    let storeData;
    
    // Try to get store by ID first, then by slug
    if (storeSlug.match(/^[a-zA-Z0-9]{20}$/)) {
      // Looks like a Firestore ID (20 characters)
      const storeDoc = await db.collection('stores').doc(storeSlug).get();
      if (storeDoc.exists) {
        storeData = { id: storeDoc.id, ...storeDoc.data() };
      }
    } else {
      // Assume it's a slug
      const storeQuery = await db.collection('stores')
        .where('slug', '==', storeSlug)
        .get();
      
      if (!storeQuery.empty) {
        const storeDoc = storeQuery.docs[0];
        storeData = { id: storeDoc.id, ...storeDoc.data() };
      }
    }
    
    if (!storeData) {
      return res.status(404).json({error: 'Store not found'});
    }
    
    if (storeData.isBlocked) {
      return res.status(404).json({error: 'Store not found'});
    }
    
    // Remove sensitive data for public view
    delete storeData.ownerId;
    
    res.json({
      success: true,
      store: storeData,
    });
    
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Update Store Profile (Store Owner or Admin) - by slug
app.put('/stores/:storeSlug', verifyToken, verifyStoreOwner, async (req, res) => {
  try {
    const {error, value} = storeUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const updateData = {
      ...value,
      updatedAt: new Date(),
    };
    
    await req.storeDoc.ref.update(updateData);
    
    res.json({
      success: true,
      message: 'Store updated successfully',
    });
    
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Store Verification API (Admin Only) - by slug
app.patch('/stores/:storeSlug/verify', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {storeSlug} = req.params;
    const {isVerified} = req.body;
    
    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({error: 'isVerified must be a boolean'});
    }
    
    // Get store by slug
    let storeDoc;
    if (storeSlug.match(/^[a-zA-Z0-9]{20}$/)) {
      storeDoc = await db.collection('stores').doc(storeSlug).get();
    } else {
      const storeQuery = await db.collection('stores')
        .where('slug', '==', storeSlug)
        .get();
      if (!storeQuery.empty) {
        storeDoc = storeQuery.docs[0];
      }
    }
    
    if (!storeDoc || !storeDoc.exists) {
      return res.status(404).json({error: 'Store not found'});
    }
    
    await storeDoc.ref.update({
      isVerified,
      updatedAt: new Date(),
    });
    
    res.json({
      success: true,
      message: `Store ${isVerified ? 'verified' : 'unverified'} successfully`,
    });
    
  } catch (error) {
    console.error('Store verification error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Store Analytics API (Store Owner or Admin) - by slug
app.get('/stores/:storeSlug/analytics', verifyToken, verifyStoreOwner, async (req, res) => {
  try {
    const storeData = req.storeData;
    const storeId = storeData.id;
    
    // Get products count
    const productsSnapshot = await db.collection('products')
      .where('storeId', '==', storeId)
      .get();
    
    const totalProducts = productsSnapshot.size;
    const activeProducts = productsSnapshot.docs.filter(doc => 
      doc.data().status === 'active'
    ).length;
    
    // Get recent followers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentFollowersSnapshot = await db.collection(`storeFollowers/${storeId}/followers`)
      .where('createdAt', '>=', thirtyDaysAgo)
      .get();
    
    const analytics = {
      store: {
        id: storeData.id,
        name: storeData.name,
        isVerified: storeData.isVerified,
      },
      metrics: {
        totalClicks: storeData.totalClicks || 0,
        totalFollowers: storeData.totalFollowers || 0,
        totalLikedProducts: storeData.totalLikedProducts || 0,
        totalProducts,
        activeProducts,
        recentFollowers: recentFollowersSnapshot.size,
      },
      period: {
        from: thirtyDaysAgo.toISOString(),
        to: new Date().toISOString(),
      },
    };
    
    res.json({
      success: true,
      analytics,
    });
    
  } catch (error) {
    console.error('Store analytics error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Store Dashboard Data API (Store Owner or Admin) - by slug
app.get('/stores/:storeSlug/dashboard', verifyToken, verifyStoreOwner, async (req, res) => {
  try {
    const storeData = req.storeData;
    const storeId = storeData.id;
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get recent products
    const recentProductsSnapshot = await db.collection('products')
      .where('storeId', '==', storeId)
      .where('createdAt', '>=', sevenDaysAgo)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    const recentProducts = recentProductsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      status: doc.data().status,
      totalLikes: doc.data().totalLikes || 0,
      createdAt: doc.data().createdAt,
    }));
    
    const dashboard = {
      store: {
        id: storeData.id,
        name: storeData.name,
        isVerified: storeData.isVerified,
        totalFollowers: storeData.totalFollowers || 0,
      },
      recentActivity: {
        recentProducts,
        totalRecentProducts: recentProductsSnapshot.size,
      },
      quickStats: {
        totalClicks: storeData.totalClicks || 0,
        totalFollowers: storeData.totalFollowers || 0,
        totalLikedProducts: storeData.totalLikedProducts || 0,
      },
    };
    
    res.json({
      success: true,
      dashboard,
    });
    
  } catch (error) {
    console.error('Store dashboard error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Store Followers List API (Store Owner or Admin) - by slug
app.get('/stores/:storeSlug/followers', verifyToken, verifyStoreOwner, async (req, res) => {
  try {
    const storeData = req.storeData;
    const storeId = storeData.id;
    const {limit = 20, offset = 0} = req.query;
    
    const followersSnapshot = await db.collection(`storeFollowers/${storeId}/followers`)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    const followers = [];
    for (const doc of followersSnapshot.docs) {
      const followerData = doc.data();
      // Get user details
      const userDoc = await db.collection('users').doc(followerData.userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        followers.push({
          userId: userData.id,
          name: userData.name,
          profileImage: userData.profileImage,
          followedAt: followerData.createdAt,
        });
      }
    }
    
    res.json({
      success: true,
      followers,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: followers.length,
      },
    });
    
  } catch (error) {
    console.error('Store followers error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 3: Product Management System

// Phase 3.1: Category Management APIs

// Get All Categories (Public)
app.get('/categories', async (req, res) => {
  try {
    const {active = 'true'} = req.query;
    
    let query = db.collection('categories');
    
    if (active === 'true') {
      query = query.where('isActive', '==', true);
    }
    
    const categoriesSnapshot = await query
      .orderBy('name', 'asc')
      .get();
    
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.json({
      success: true,
      categories,
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Create Category (Admin Only)
app.post('/categories', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {error, value} = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {name, slug, isActive = true} = value;
    
    // Check if slug is unique
    const existingCategory = await db.collection('categories')
      .where('slug', '==', slug)
      .get();
      
    if (!existingCategory.empty) {
      return res.status(409).json({error: 'Category slug already exists'});
    }
    
    // Create category
    const categoryRef = db.collection('categories').doc();
    const now = new Date();
    const categoryData = {
      id: categoryRef.id,
      name,
      slug,
      isActive,
      createdAt: now,
      updatedAt: now,
    };
    
    await categoryRef.set(categoryData);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: categoryData,
    });
    
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Get Single Category (Public) - by slug or ID
app.get('/categories/:categorySlug', async (req, res) => {
  try {
    const categoryIdentifier = req.params.categorySlug;
    let categoryDoc;
    let categoryData;
    
    // Try to get category by ID first, then by slug
    if (categoryIdentifier.match(/^[a-zA-Z0-9]{20}$/)) {
      // Looks like a Firestore ID (20 characters)
      categoryDoc = await db.collection('categories').doc(categoryIdentifier).get();
      if (categoryDoc.exists) {
        categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
      }
    } else {
      // Assume it's a slug
      const categoryQuery = await db.collection('categories')
        .where('slug', '==', categoryIdentifier)
        .get();
      
      if (!categoryQuery.empty) {
        categoryDoc = categoryQuery.docs[0];
        categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
      }
    }
    
    if (!categoryData) {
      return res.status(404).json({error: 'Category not found'});
    }
    
    res.json({
      success: true,
      category: categoryData,
    });
    
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Update Category (Admin Only) - by slug or ID
app.put('/categories/:categorySlug', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {error, value} = categoryUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const categoryIdentifier = req.params.categorySlug;
    let categoryDoc;
    let categoryData;
    
    // Try to get category by ID first, then by slug
    if (categoryIdentifier.match(/^[a-zA-Z0-9]{20}$/)) {
      // Looks like a Firestore ID (20 characters)
      categoryDoc = await db.collection('categories').doc(categoryIdentifier).get();
      if (categoryDoc.exists) {
        categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
      }
    } else {
      // Assume it's a slug
      const categoryQuery = await db.collection('categories')
        .where('slug', '==', categoryIdentifier)
        .get();
      
      if (!categoryQuery.empty) {
        categoryDoc = categoryQuery.docs[0];
        categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
      }
    }
    
    if (!categoryData) {
      return res.status(404).json({error: 'Category not found'});
    }
    
    const updateData = {
      ...value,
      updatedAt: new Date(),
    };
    
    await categoryDoc.ref.update(updateData);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
    });
    
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Delete Category (Admin Only) - by slug or ID
app.delete('/categories/:categorySlug', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const categoryIdentifier = req.params.categorySlug;
    let categoryDoc;
    let categoryData;
    
    // Try to get category by ID first, then by slug
    if (categoryIdentifier.match(/^[a-zA-Z0-9]{20}$/)) {
      // Looks like a Firestore ID (20 characters)
      categoryDoc = await db.collection('categories').doc(categoryIdentifier).get();
      if (categoryDoc.exists) {
        categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
      }
    } else {
      // Assume it's a slug
      const categoryQuery = await db.collection('categories')
        .where('slug', '==', categoryIdentifier)
        .get();
      
      if (!categoryQuery.empty) {
        categoryDoc = categoryQuery.docs[0];
        categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
      }
    }
    
    if (!categoryData) {
      return res.status(404).json({error: 'Category not found'});
    }
    
    // Check if category has products
    const productsSnapshot = await db.collection('products')
      .where('categorySlug', '==', categoryData.slug)
      .limit(1)
      .get();
    
    if (!productsSnapshot.empty) {
      return res.status(400).json({error: 'Cannot delete category with existing products'});
    }
    
    await categoryDoc.ref.delete();
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
    
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 3.2: Product CRUD Operations

// Get All Products (Public with filters)
app.get('/products', async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      categoryId,
      categorySlug,
      storeId,
      storeSlug,
      status = 'active',
      search,
      priceMin,
      priceMax,
      onSale
    } = req.query;
    
    let query = db.collection('products');
    
    // Filter by status (public only sees active products unless admin)
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }
    
    // Filter by category slug
    if (categoryId || categorySlug) {
      const categoryIdentifier = categoryId || categorySlug;
      
      if (categoryIdentifier) {
        // For efficiency, try to use slug directly first
        if (categorySlug) {
          query = query.where('categorySlug', '==', categorySlug);
        } else {
          // Fallback: resolve ID to slug
          const categoryData = await resolveCategoryBySlugOrId(categoryIdentifier);
          if (categoryData) {
            query = query.where('categorySlug', '==', categoryData.slug);
          } else {
            // Category not found, return empty results
            return res.json({
              success: true,
              products: [],
              pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: 0,
              },
            });
          }
        }
      }
    }
    
    // Filter by store slug
    if (storeId || storeSlug) {
      const storeIdentifier = storeId || storeSlug;
      
      if (storeIdentifier) {
        // For efficiency, try to use slug directly first
        if (storeSlug) {
          query = query.where('storeSlug', '==', storeSlug);
        } else {
          // Fallback: resolve ID to slug
          const storeData = await resolveStoreBySlugOrId(storeIdentifier);
          if (storeData) {
            query = query.where('storeSlug', '==', storeData.slug);
          } else {
            // Store not found, return empty results
            return res.json({
              success: true,
              products: [],
              pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: 0,
              },
            });
          }
        }
      }
    }
    
    const productsSnapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    let products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Apply additional filters
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (priceMin) {
      products = products.filter(product => 
        (product.isOnSale ? product.salePrice : product.price) >= parseFloat(priceMin)
      );
    }
    
    if (priceMax) {
      products = products.filter(product => 
        (product.isOnSale ? product.salePrice : product.price) <= parseFloat(priceMax)
      );
    }
    
    if (onSale === 'true') {
      products = products.filter(product => product.isOnSale === true);
    }
    
    res.json({
      success: true,
      products,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: products.length,
      },
    });
    
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Get Single Product (Public)
app.get('/products/:productId', async (req, res) => {
  try {
    const {productId} = req.params;
    const productDoc = await db.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({error: 'Product not found'});
    }
    
    const productData = { id: productDoc.id, ...productDoc.data() };
    
    // Only show active products to public (unless admin)
    if (productData.status !== 'active') {
      return res.status(404).json({error: 'Product not found'});
    }
    
    // Increment view count
    await productDoc.ref.update({
      totalViews: (productData.totalViews || 0) + 1,
    });
    
    res.json({
      success: true,
      product: productData,
    });
    
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Create Product (Store Owner)
app.post('/products', verifyToken, async (req, res) => {
  try {
    const {error, value} = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {name, description, image, price, isOnSale = false, salePrice, availableSizes, size, availableColors, stockAmount, categorySlug, storeSlug} = value;
    
    // Resolve store by slug
    const storeData = await resolveStoreBySlugOrId(storeSlug);
    
    if (!storeData) {
      return res.status(404).json({error: 'Store not found'});
    }
    
    const userDoc = await db.collection('users').doc(req.userId).get();
    const userData = userDoc.data();
    
    if (storeData.ownerId !== req.userId && userData.role !== 'admin') {
      return res.status(403).json({error: 'You can only create products for your own store'});
    }
    
    // Resolve category by slug
    const categoryData = await resolveCategoryBySlugOrId(categorySlug);
    
    if (!categoryData) {
      return res.status(404).json({error: 'Category not found'});
    }
    
    // Validate sale price
    if (isOnSale && (!salePrice || salePrice >= price)) {
      return res.status(400).json({error: 'Sale price must be less than regular price'});
    }
    
    // Create product
    const productRef = db.collection('products').doc();
    const now = new Date();
    const productData = {
      id: productRef.id,
      name,
      description,
      image,
      price,
      isOnSale,
      salePrice: isOnSale ? salePrice : null,
      availableSizes: availableSizes || null,
      size: size || null,
      availableColors: availableColors || null,
      stockAmount,
      totalLikes: 0,
      totalViews: 0,
      status: 'pending', // All products start as pending approval
      isApproved: false,
      rejectionReason: null,
      // Store slug as primary reference, keep ID for efficient querying
      storeSlug: storeData.slug,
      storeId: storeData.id, // Keep for efficient querying
      // Store slug as primary reference, keep ID for efficient querying  
      categorySlug: categoryData.slug,
      categoryId: categoryData.id, // Keep for efficient querying
      createdAt: now,
      updatedAt: now,
    };
    
    await productRef.set(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created and submitted for approval',
      product: productData,
    });
    
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Update Product (Store Owner or Admin)
app.put('/products/:productId', verifyToken, verifyProductOwner, async (req, res) => {
  try {
    const {error, value} = productUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    // Validate sale price if updating
    if (value.isOnSale && value.salePrice && value.price && value.salePrice >= value.price) {
      return res.status(400).json({error: 'Sale price must be less than regular price'});
    }
    
    // If updating sale info, validate against existing price
    const currentProduct = req.productData;
    if (value.isOnSale && value.salePrice && !value.price && value.salePrice >= currentProduct.price) {
      return res.status(400).json({error: 'Sale price must be less than current price'});
    }
    
    const updateData = {
      ...value,
      updatedAt: new Date(),
    };
    
    // If updating category by slug, resolve and update both slug and ID
    if (value.categorySlug) {
      const categoryData = await resolveCategoryBySlugOrId(value.categorySlug);
      if (!categoryData) {
        return res.status(404).json({error: 'Category not found'});
      }
      updateData.categorySlug = categoryData.slug;
      updateData.categoryId = categoryData.id; // Keep ID for efficient querying
    }
    
    // If significant changes, reset to pending approval
    const significantFields = ['name', 'description', 'image', 'price', 'categorySlug'];
    const hasSignificantChanges = significantFields.some(field => value[field] !== undefined);
    
    if (hasSignificantChanges && currentProduct.status === 'active') {
      updateData.status = 'pending';
      updateData.isApproved = false;
      updateData.rejectionReason = null;
    }
    
    await req.productDoc.ref.update(updateData);
    
    res.json({
      success: true,
      message: hasSignificantChanges && currentProduct.status === 'active' 
        ? 'Product updated and resubmitted for approval'
        : 'Product updated successfully',
    });
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Delete Product (Store Owner or Admin)
app.delete('/products/:productId', verifyToken, verifyProductOwner, async (req, res) => {
  try {
    await req.productDoc.ref.delete();
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
    
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 3.3: Product Approval Workflow

// Get Products Pending Approval (Admin Only)
app.get('/admin/products/pending', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {limit = 20, offset = 0} = req.query;
    
          const productsSnapshot = await db.collection('products')
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'asc')
        .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    const products = [];
    for (const doc of productsSnapshot.docs) {
      const productData = { id: doc.id, ...doc.data() };
      
      // Get store info
      const storeDoc = await db.collection('stores').doc(productData.storeId).get();
      productData.store = storeDoc.exists ? storeDoc.data() : null;
      
      // Get category info
      const categoryDoc = await db.collection('categories').doc(productData.categoryId).get();
      productData.category = categoryDoc.exists ? categoryDoc.data() : null;
      
      products.push(productData);
    }
    
    res.json({
      success: true,
      products,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: products.length,
      },
    });
    
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Approve Product (Admin Only)
app.patch('/admin/products/:productId/approve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {productId} = req.params;
    
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).json({error: 'Product not found'});
    }
    
    const productData = productDoc.data();
    if (productData.status !== 'pending') {
      return res.status(400).json({error: 'Only pending products can be approved'});
    }
    
    const updateData = {
      status: 'active',
      isApproved: true,
      rejectionReason: null,
      updatedAt: new Date(),
    };
    
    await productDoc.ref.update(updateData);
    
    res.json({
      success: true,
      message: 'Product approved successfully',
    });
    
  } catch (error) {
    console.error('Product approval error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Reject Product (Admin Only)
app.patch('/admin/products/:productId/reject', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {rejectionReason} = req.body;
    
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({error: 'Rejection reason is required (minimum 10 characters)'});
    }
    
    const {productId} = req.params;
    
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).json({error: 'Product not found'});
    }
    
    const productData = productDoc.data();
    if (productData.status !== 'pending') {
      return res.status(400).json({error: 'Only pending products can be rejected'});
    }
    
    const updateData = {
      status: 'rejected',
      isApproved: false,
      rejectionReason: rejectionReason.trim(),
      updatedAt: new Date(),
    };
    
    await productDoc.ref.update(updateData);
    
    res.json({
      success: true,
      message: 'Product rejected successfully',
    });
    
  } catch (error) {
    console.error('Product rejection error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Update Product Status (Store Owner or Admin)
app.patch('/products/:productId/status', verifyToken, verifyProductOwner, async (req, res) => {
  try {
    const {status} = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({error: 'Status must be active or inactive'});
    }
    
    const currentProduct = req.productData;
    
    // Only allow status change for approved products
    if (!currentProduct.isApproved) {
      return res.status(400).json({error: 'Product must be approved before changing status'});
    }
    
    await req.productDoc.ref.update({
      status,
      updatedAt: new Date(),
    });
    
    res.json({
      success: true,
      message: `Product marked as ${status}`,
    });
    
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 4: User Interactions & Swipe System

// Phase 4.1: User Product Swipe APIs

// Record User Swipe
app.post('/swipes', verifyToken, async (req, res) => {
  try {
    const {error, value} = swipeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {productId, action, swipeDirection, timeSpent = 0} = value;
    
    // Verify product exists and is active
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).json({error: 'Product not found'});
    }
    
    const productData = productDoc.data();
    if (productData.status !== 'active') {
      return res.status(400).json({error: 'Product is not available'});
    }
    
    // Check if user already swiped this product
    const existingSwipe = await db.collection('userSwipes')
      .where('userId', '==', req.userId)
      .where('productId', '==', productId)
      .get();
    
    if (!existingSwipe.empty) {
      return res.status(409).json({error: 'Product already swiped'});
    }
    
    // Create swipe record
    const swipeRef = db.collection('userSwipes').doc();
    const now = new Date();
    const swipeData = {
      id: swipeRef.id,
      userId: req.userId,
      productId,
      action,
      swipeDirection: swipeDirection || (action === 'like' ? 'right' : 'left'),
      timeSpent,
      storeSlug: productData.storeSlug,
      categorySlug: productData.categorySlug,
      productPrice: productData.isOnSale ? productData.salePrice : productData.price,
      createdAt: now,
    };
    
    await swipeRef.set(swipeData);
    
    // Update product stats
    const updateField = action === 'like' ? 'totalLikes' : 'totalDislikes';
    await productDoc.ref.update({
      [updateField]: (productData[updateField] || 0) + 1,
      updatedAt: now,
    });
    
    res.status(201).json({
      success: true,
      message: `Product ${action}d successfully`,
      swipe: swipeData,
    });
    
  } catch (error) {
    console.error('Record swipe error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Get User Swipe History
app.get('/swipes/history', verifyToken, async (req, res) => {
  try {
    const {limit = 20, offset = 0, action, categorySlug, storeSlug} = req.query;
    
    let query = db.collection('userSwipes')
      .where('userId', '==', req.userId);
    
    // Filter by action
    if (action && ['like', 'dislike'].includes(action)) {
      query = query.where('action', '==', action);
    }
    
    // Filter by category
    if (categorySlug) {
      query = query.where('categorySlug', '==', categorySlug);
    }
    
    // Filter by store
    if (storeSlug) {
      query = query.where('storeSlug', '==', storeSlug);
    }
    
    const swipesSnapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    const swipes = [];
    for (const doc of swipesSnapshot.docs) {
      const swipeData = { id: doc.id, ...doc.data() };
      
      // Get product details
      const productDoc = await db.collection('products').doc(swipeData.productId).get();
      if (productDoc.exists) {
        swipeData.product = { id: productDoc.id, ...productDoc.data() };
      }
      
      swipes.push(swipeData);
    }
    
    res.json({
      success: true,
      swipes,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: swipes.length,
      },
    });
    
  } catch (error) {
    console.error('Get swipe history error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 4.2: Personalized Product Feed

// Get Personalized Product Feed
app.get('/feed', verifyToken, async (req, res) => {
  try {
    const {error, value} = feedRequestSchema.validate(req.query);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {limit = 20, excludeSwipedToday = true, categorySlug, priceMax, onSaleOnly} = value;
    
    // Get user's swiped products to exclude
    let excludedProductIds = [];
    if (excludeSwipedToday) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const swipedToday = await db.collection('userSwipes')
        .where('userId', '==', req.userId)
        .where('createdAt', '>=', todayStart)
        .get();
      
      excludedProductIds = swipedToday.docs.map(doc => doc.data().productId);
    }
    
    // Build product query
    let query = db.collection('products')
      .where('status', '==', 'active');
    
    // Apply filters
    if (categorySlug) {
      query = query.where('categorySlug', '==', categorySlug);
    }
    
    const productsSnapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit) * 3) // Get more to filter out swiped ones
      .get();
    
    let products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Filter out already swiped products
    if (excludedProductIds.length > 0) {
      products = products.filter(product => !excludedProductIds.includes(product.id));
    }
    
    // Apply price filter
    if (priceMax) {
      products = products.filter(product => {
        const price = product.isOnSale ? product.salePrice : product.price;
        return price <= priceMax;
      });
    }
    
    // Filter sale products only
    if (onSaleOnly) {
      products = products.filter(product => product.isOnSale === true);
    }
    
    // Limit to requested amount
    products = products.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      products,
      feedInfo: {
        totalAvailable: products.length,
        excludedCount: excludedProductIds.length,
        hasMore: products.length === parseInt(limit),
      },
    });
    
  } catch (error) {
    console.error('Get product feed error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 4.3: User Preferences Management

// Get User Preferences
app.get('/preferences', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({error: 'User not found'});
    }
    
    const userData = userDoc.data();
    const preferences = userData.preferences || {
      favoriteCategories: [],
      priceRange: { min: 0, max: 1000 },
      preferredStores: [],
      interests: [],
    };
    
    res.json({
      success: true,
      preferences,
    });
    
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Update User Preferences
app.put('/preferences', verifyToken, async (req, res) => {
  try {
    const {error, value} = preferencesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const userDoc = await db.collection('users').doc(req.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({error: 'User not found'});
    }
    
    const updateData = {
      preferences: value,
      updatedAt: new Date(),
    };
    
    await userDoc.ref.update(updateData);
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: value,
    });
    
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 4.4: Swipe Analytics

// Get User Swipe Analytics
app.get('/analytics/swipes', verifyToken, async (req, res) => {
  try {
    const {period = '7d'} = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    // Get user swipes in period
    const swipesSnapshot = await db.collection('userSwipes')
      .where('userId', '==', req.userId)
      .where('createdAt', '>=', startDate)
      .get();
    
    const swipes = swipesSnapshot.docs.map(doc => doc.data());
    
    // Calculate analytics
    const analytics = {
      period,
      totalSwipes: swipes.length,
      likes: swipes.filter(s => s.action === 'like').length,
      dislikes: swipes.filter(s => s.action === 'dislike').length,
      likeRate: swipes.length > 0 ? (swipes.filter(s => s.action === 'like').length / swipes.length * 100).toFixed(1) : 0,
      averageTimeSpent: swipes.length > 0 ? (swipes.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / swipes.length).toFixed(1) : 0,
      topCategories: {},
      topStores: {},
    };
    
    // Calculate top categories and stores
    swipes.forEach(swipe => {
      if (swipe.categorySlug) {
        analytics.topCategories[swipe.categorySlug] = (analytics.topCategories[swipe.categorySlug] || 0) + 1;
      }
      if (swipe.storeSlug) {
        analytics.topStores[swipe.storeSlug] = (analytics.topStores[swipe.storeSlug] || 0) + 1;
      }
    });
    
    // Sort and limit top categories/stores
    analytics.topCategories = Object.entries(analytics.topCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
      
    analytics.topStores = Object.entries(analytics.topStores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
    res.json({
      success: true,
      analytics,
    });
    
  } catch (error) {
    console.error('Get swipe analytics error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 4.5: Search System

// Unified Search API
app.get('/search', async (req, res) => {
  try {
    const {error, value} = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {query, type, limit, categorySlug, storeSlug, priceMax, onSaleOnly} = value;
    const searchTerm = query.toLowerCase().trim();
    
    // Save search to history (if user is authenticated)
    if (req.headers.authorization) {
      try {
        // Extract user ID from token for search history
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          
          // Save search history
          const searchHistoryRef = db.collection('searchHistory').doc();
          await searchHistoryRef.set({
            id: searchHistoryRef.id,
            userId: decoded.userId,
            query: searchTerm,
            type,
            createdAt: new Date(),
          });
        }
      } catch (authError) {
        // Continue without saving search history if auth fails
        console.log('Search history save skipped - auth error');
      }
    }
    
    const results = {
      query: searchTerm,
      type,
      products: [],
      categories: [],
      stores: [],
      totalResults: 0,
    };
    
    // Search Categories
    if (type === 'all' || type === 'categories') {
      const categoriesSnapshot = await db.collection('categories')
        .where('isActive', '==', true)
        .get();
      
      const categories = categoriesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(category => 
          category.name.toLowerCase().includes(searchTerm) ||
          category.slug.toLowerCase().includes(searchTerm)
        )
        .slice(0, limit);
      
      results.categories = categories;
    }
    
    // Search Stores  
    if (type === 'all' || type === 'stores') {
      const storesSnapshot = await db.collection('stores').get();
      
      const stores = storesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(store => 
          store.name.toLowerCase().includes(searchTerm) ||
          store.slug.toLowerCase().includes(searchTerm) ||
          (store.description && store.description.toLowerCase().includes(searchTerm)) ||
          (store.location && store.location.toLowerCase().includes(searchTerm))
        )
        .slice(0, limit);
      
      results.stores = stores;
    }
    
    // Search Products
    if (type === 'all' || type === 'products') {
      let query = db.collection('products')
        .where('status', '==', 'active');
      
      // Apply filters
      if (categorySlug) {
        query = query.where('categorySlug', '==', categorySlug);
      }
      
      if (storeSlug) {
        query = query.where('storeSlug', '==', storeSlug);
      }
      
      const productsSnapshot = await query.get();
      
      let products = productsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(product => {
          const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                               product.description.toLowerCase().includes(searchTerm);
          
          if (!matchesSearch) return false;
          
          // Apply price filter
          if (priceMax) {
            const price = product.isOnSale ? product.salePrice : product.price;
            if (price > priceMax) return false;
          }
          
          // Apply sale filter
          if (onSaleOnly && !product.isOnSale) return false;
          
          return true;
        })
        .slice(0, limit);
      
      results.products = products;
    }
    
    results.totalResults = results.products.length + results.categories.length + results.stores.length;
    
    res.json({
      success: true,
      results,
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Get User Search History
app.get('/search/history', verifyToken, async (req, res) => {
  try {
    const {limit = 20} = req.query;
    
    const searchHistorySnapshot = await db.collection('searchHistory')
      .where('userId', '==', req.userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const searches = searchHistorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Group by query to get recent unique searches
    const uniqueSearches = [];
    const seenQueries = new Set();
    
    for (const search of searches) {
      if (!seenQueries.has(search.query)) {
        seenQueries.add(search.query);
        uniqueSearches.push(search);
      }
    }
    
    res.json({
      success: true,
      searches: uniqueSearches.slice(0, 10), // Limit to 10 recent unique searches
      totalCount: searches.length,
    });
    
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Delete Search History Item
app.delete('/search/history/:searchId', verifyToken, async (req, res) => {
  try {
    const {searchId} = req.params;
    
    const searchDoc = await db.collection('searchHistory').doc(searchId).get();
    
    if (!searchDoc.exists) {
      return res.status(404).json({error: 'Search history item not found'});
    }
    
    const searchData = searchDoc.data();
    
    // Verify ownership
    if (searchData.userId !== req.userId) {
      return res.status(403).json({error: 'You can only delete your own search history'});
    }
    
    await searchDoc.ref.delete();
    
    res.json({
      success: true,
      message: 'Search history item deleted successfully',
    });
    
  } catch (error) {
    console.error('Delete search history error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Clear All Search History
app.delete('/search/history', verifyToken, async (req, res) => {
  try {
    const searchHistorySnapshot = await db.collection('searchHistory')
      .where('userId', '==', req.userId)
      .get();
    
    const batch = db.batch();
    searchHistorySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    res.json({
      success: true,
      message: `Deleted ${searchHistorySnapshot.size} search history items`,
    });
    
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 5: Social Features (User-Store Follow System)

// Phase 5.1: User-Store Follow/Unfollow APIs

// Follow Store
app.post('/stores/follow', verifyToken, async (req, res) => {
  try {
    const {error, value} = followActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {storeSlug} = value;
    
    // Resolve store by slug
    const storeData = await resolveStoreBySlugOrId(storeSlug);
    if (!storeData) {
      return res.status(404).json({error: 'Store not found'});
    }
    
    // Check if already following
    const existingFollow = await db.collection('userFollows')
      .where('userId', '==', req.userId)
      .where('storeId', '==', storeData.id)
      .get();
    
    if (!existingFollow.empty) {
      return res.status(409).json({error: 'Already following this store'});
    }
    
    // Create follow relationship
    const followRef = db.collection('userFollows').doc();
    const now = new Date();
    const followData = {
      id: followRef.id,
      userId: req.userId,
      storeId: storeData.id,
      storeSlug: storeData.slug,
      storeName: storeData.name,
      createdAt: now,
    };
    
    await followRef.set(followData);
    
    // Update store follower count
    await db.collection('stores').doc(storeData.id).update({
      totalFollowers: (storeData.totalFollowers || 0) + 1,
      updatedAt: now,
    });
    
    res.status(201).json({
      success: true,
      message: 'Store followed successfully',
      follow: followData,
    });
    
  } catch (error) {
    console.error('Follow store error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Unfollow Store
app.delete('/stores/unfollow', verifyToken, async (req, res) => {
  try {
    const {error, value} = followActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {storeSlug} = value;
    
    // Resolve store by slug
    const storeData = await resolveStoreBySlugOrId(storeSlug);
    if (!storeData) {
      return res.status(404).json({error: 'Store not found'});
    }
    
    // Find existing follow
    const followQuery = await db.collection('userFollows')
      .where('userId', '==', req.userId)
      .where('storeId', '==', storeData.id)
      .get();
    
    if (followQuery.empty) {
      return res.status(404).json({error: 'Not following this store'});
    }
    
    // Delete follow relationship
    await followQuery.docs[0].ref.delete();
    
    // Update store follower count
    const newFollowerCount = Math.max((storeData.totalFollowers || 1) - 1, 0);
    await db.collection('stores').doc(storeData.id).update({
      totalFollowers: newFollowerCount,
      updatedAt: new Date(),
    });
    
    res.json({
      success: true,
      message: 'Store unfollowed successfully',
    });
    
  } catch (error) {
    console.error('Unfollow store error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Check if Following Store
app.get('/stores/:storeSlug/following', verifyToken, async (req, res) => {
  try {
    const {storeSlug} = req.params;
    
    // Resolve store by slug
    const storeData = await resolveStoreBySlugOrId(storeSlug);
    if (!storeData) {
      return res.status(404).json({error: 'Store not found'});
    }
    
    // Check if following
    const followQuery = await db.collection('userFollows')
      .where('userId', '==', req.userId)
      .where('storeId', '==', storeData.id)
      .get();
    
    const isFollowing = !followQuery.empty;
    let followData = null;
    
    if (isFollowing) {
      followData = { id: followQuery.docs[0].id, ...followQuery.docs[0].data() };
    }
    
    res.json({
      success: true,
      isFollowing,
      follow: followData,
      store: {
        id: storeData.id,
        name: storeData.name,
        slug: storeData.slug,
        totalFollowers: storeData.totalFollowers || 0,
      },
    });
    
  } catch (error) {
    console.error('Check following error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 5.2: User Following List APIs

// Get User's Following List (Stores they follow)
app.get('/following', verifyToken, async (req, res) => {
  try {
    const {error, value} = followingListSchema.validate(req.query);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {limit, offset} = value;
    
    const followsSnapshot = await db.collection('userFollows')
      .where('userId', '==', req.userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    const following = [];
    for (const doc of followsSnapshot.docs) {
      const followData = { id: doc.id, ...doc.data() };
      
      // Get current store data
      const storeDoc = await db.collection('stores').doc(followData.storeId).get();
      if (storeDoc.exists) {
        followData.store = { id: storeDoc.id, ...storeDoc.data() };
      }
      
      following.push(followData);
    }
    
    res.json({
      success: true,
      following,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: following.length,
      },
    });
    
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 5.3: Store Followers APIs

// Get Store Followers (Store Owner or Admin)
app.get('/stores/:storeSlug/followers', verifyToken, verifyStoreOwner, async (req, res) => {
  try {
    const {limit = 20, offset = 0} = req.query;
    
    const followersSnapshot = await db.collection('userFollows')
      .where('storeId', '==', req.storeData.id)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    const followers = [];
    for (const doc of followersSnapshot.docs) {
      const followData = { id: doc.id, ...doc.data() };
      
      // Get user data (excluding sensitive info)
      const userDoc = await db.collection('users').doc(followData.userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        followData.user = {
          id: userDoc.id,
          name: userData.name,
          email: userData.email,
          profileImage: userData.profileImage || null,
          createdAt: userData.createdAt,
        };
      }
      
      followers.push(followData);
    }
    
    res.json({
      success: true,
      followers,
      store: {
        id: req.storeData.id,
        name: req.storeData.name,
        slug: req.storeData.slug,
        totalFollowers: req.storeData.totalFollowers || 0,
      },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: followers.length,
      },
    });
    
  } catch (error) {
    console.error('Get store followers error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 5.4: Following Activity Feed

// Get Following Activity Feed
app.get('/feed/following', verifyToken, async (req, res) => {
  try {
    const {error, value} = activityFeedSchema.validate(req.query);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    
    const {limit, offset, type} = value;
    
    // Get user's followed stores
    const followedStoresSnapshot = await db.collection('userFollows')
      .where('userId', '==', req.userId)
      .get();
    
    if (followedStoresSnapshot.empty) {
      return res.json({
        success: true,
        activities: [],
        feedInfo: {
          followedStoresCount: 0,
          hasMore: false,
        },
      });
    }
    
    const followedStoreIds = followedStoresSnapshot.docs.map(doc => doc.data().storeId);
    
    // Get recent activities from followed stores
    const activities = [];
    
    // Get recent products from followed stores
    if (type === 'all' || type === 'new_products') {
      const recentProductsSnapshot = await db.collection('products')
        .where('status', '==', 'active')
        .where('storeId', 'in', followedStoreIds.slice(0, 10)) // Firestore limit
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit))
        .get();
      
      recentProductsSnapshot.docs.forEach(doc => {
        const productData = { id: doc.id, ...doc.data() };
        activities.push({
          id: `product_${doc.id}`,
          type: 'new_product',
          createdAt: productData.createdAt,
          storeSlug: productData.storeSlug,
          product: productData,
        });
      });
    }
    
    // Sort activities by date and limit
    activities.sort((a, b) => b.createdAt - a.createdAt);
    const paginatedActivities = activities.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      activities: paginatedActivities,
      feedInfo: {
        followedStoresCount: followedStoreIds.length,
        totalActivities: activities.length,
        hasMore: activities.length > parseInt(offset) + parseInt(limit),
      },
    });
    
  } catch (error) {
    console.error('Get following feed error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 5.5: Store Follow Analytics

// Get Store Follow Analytics (Store Owner or Admin)
app.get('/stores/:storeSlug/analytics/followers', verifyToken, verifyStoreOwner, async (req, res) => {
  try {
    const {period = '30d'} = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    // Get follower growth in period
    const followersInPeriod = await db.collection('userFollows')
      .where('storeId', '==', req.storeData.id)
      .where('createdAt', '>=', startDate)
      .orderBy('createdAt', 'asc')
      .get();
    
    // Get all followers for total count
    const allFollowers = await db.collection('userFollows')
      .where('storeId', '==', req.storeData.id)
      .get();
    
    const analytics = {
      period,
      totalFollowers: allFollowers.size,
      newFollowersInPeriod: followersInPeriod.size,
      growthRate: allFollowers.size > 0 ? 
        ((followersInPeriod.size / Math.max(allFollowers.size - followersInPeriod.size, 1)) * 100).toFixed(1) : 0,
      dailyGrowth: [],
    };
    
    // Calculate daily growth
    const dailyGrowthMap = {};
    followersInPeriod.docs.forEach(doc => {
      const date = doc.data().createdAt.toDate().toISOString().split('T')[0];
      dailyGrowthMap[date] = (dailyGrowthMap[date] || 0) + 1;
    });
    
    analytics.dailyGrowth = Object.entries(dailyGrowthMap)
      .map(([date, count]) => ({ date, followers: count }))
      .slice(-7); // Last 7 days
    
    res.json({
      success: true,
      analytics,
      store: {
        id: req.storeData.id,
        name: req.storeData.name,
        slug: req.storeData.slug,
      },
    });
    
  } catch (error) {
    console.error('Get follower analytics error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Phase 5.6: Follow Recommendations

// Get Store Follow Recommendations
app.get('/recommendations/stores', verifyToken, async (req, res) => {
  try {
    const {limit = 10} = req.query;
    
    // Get user's current follows
    const userFollowsSnapshot = await db.collection('userFollows')
      .where('userId', '==', req.userId)
      .get();
    
    const followedStoreIds = userFollowsSnapshot.docs.map(doc => doc.data().storeId);
    
    // Get user's liked product categories for recommendations
    const userSwipesSnapshot = await db.collection('userSwipes')
      .where('userId', '==', req.userId)
      .where('action', '==', 'like')
      .limit(50)
      .get();
    
    const likedCategories = {};
    userSwipesSnapshot.docs.forEach(doc => {
      const categorySlug = doc.data().categorySlug;
      if (categorySlug) {
        likedCategories[categorySlug] = (likedCategories[categorySlug] || 0) + 1;
      }
    });
    
    const topCategories = Object.entries(likedCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([slug]) => slug);
    
    // Get stores with products in user's preferred categories
    let storesQuery = db.collection('stores')
      .where('isVerified', '==', true);
    
    const storesSnapshot = await storesQuery
      .orderBy('totalFollowers', 'desc')
      .limit(parseInt(limit) * 3)
      .get();
    
    let recommendedStores = storesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(store => !followedStoreIds.includes(store.id));
    
    // If user has category preferences, boost stores with matching products
    if (topCategories.length > 0) {
      for (const store of recommendedStores) {
        store.score = 0;
        
        // Check if store has products in preferred categories
        for (const categorySlug of topCategories) {
          const categoryProductsSnapshot = await db.collection('products')
            .where('storeId', '==', store.id)
            .where('categorySlug', '==', categorySlug)
            .where('status', '==', 'active')
            .limit(1)
            .get();
          
          if (!categoryProductsSnapshot.empty) {
            store.score += 10;
          }
        }
        
        // Add follower count to score
        store.score += (store.totalFollowers || 0) * 0.1;
      }
      
      // Sort by score
      recommendedStores.sort((a, b) => b.score - a.score);
    }
    
    // Limit results
    recommendedStores = recommendedStores.slice(0, parseInt(limit));
    
    // Clean up response
    recommendedStores.forEach(store => {
      delete store.score;
    });
    
    res.json({
      success: true,
      recommendations: recommendedStores,
      recommendationInfo: {
        basedOnCategories: topCategories,
        totalRecommendations: recommendedStores.length,
        userFollowsCount: followedStoreIds.length,
      },
    });
    
  } catch (error) {
    console.error('Get store recommendations error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SwipeMall API is running',
    timestamp: new Date().toISOString(),
    phase: 'Phase 5 - Social Features (User-Store Follow System)',
  });
});

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app); 