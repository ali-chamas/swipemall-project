# SwipeMall - Virtual Mall Platform

 firebase emulators:start --project swipemall

A comprehensive virtual mall platform with mobile app, web app, and Firebase backend.

## 🏗️ Project Structure

```
swipemall-monorepo/
├── apps/
│   ├── mobile/                 # Expo React Native mobile app
│   └── web/                    # React Vite web app (placeholder)
├── packages/
│   ├── shared/                 # Shared utilities and constants
│   ├── ui-components/          # Shared UI components
│   └── api-client/             # Shared API client for Firebase
├── backend/
│   ├── firebase/               # Firebase configuration
│   ├── functions/              # Cloud Functions (API endpoints)
│   └── firestore/             # Database rules and structure
├── docs/                       # Documentation
├── package.json               # Root workspace configuration
└── README.md
```

## 🚀 Phase 1, 2, 3, 4, 5 & 6 Completed - Complete Social Shopping Platform + Notifications

### ✅ Phase 1 Features Implemented

**1.1 User Authentication System:**
- ✅ Sign Up API - Create new user accounts with phone/email validation
- ✅ Login API - Authenticate users and generate session tokens (365-day tokens)
- ✅ Logout API - Invalidate user sessions
- ✅ Password Reset API - Send reset codes and update passwords
- ✅ Profile Management API - Update user profile information

**1.2 Guest User System:**
- ✅ Guest Session API - Create temporary guest sessions for app browsing
- ✅ Guest to User Conversion API - Convert guest sessions to registered accounts

### ✅ Phase 2 Features Implemented

**2.1 Store Registration & Profile:**
- ✅ Store Registration API - Create new store accounts (admin only) with slug support
- ✅ Store Profile API - CRUD operations for store information (by slug)
- ✅ Store Verification API - Admin verifies stores (by slug)
- ✅ Store Analytics API - Retrieve store performance metrics (by slug)

**2.2 Store Dashboard:**
- ✅ Store Dashboard Data API - Aggregate store statistics and insights
- ✅ Store Follower List API - Retrieve and manage store followers

### ✅ Phase 3 Features Implemented

**3.1 Category Management:**
- ✅ Category List API - Retrieve all active categories (public)
- ✅ Category Management API - Admin CRUD operations for categories
- ✅ Category Validation - Unique slug validation and product dependency checks

**3.2 Product CRUD Operations:**
- ✅ Create Product API - Add new products with slug-based references (categorySlug, storeSlug)
- ✅ Update Product API - Edit product information with re-approval workflow and slug support
- ✅ Delete Product API - Remove products from store catalog
- ✅ Get Products API - List products with advanced slug-based filters (categorySlug, storeSlug, price, etc.)
- ✅ Get Single Product API - Product details with view tracking and slug references

**3.3 Product Approval Workflow:**
- ✅ Submit Product for Approval API - Products start as "pending" status
- ✅ Admin Product Review API - Approve/reject products with feedback (separate endpoints)
- ✅ Product Status API - Mark products as active/inactive for approved items
- ✅ Pending Products API - Admin dashboard for product review queue

### ✅ Phase 4 Features Implemented

**4.1 User Product Swipe System:**
- ✅ Record Swipe API - Track user like/dislike actions with time spent analytics
- ✅ Swipe History API - Retrieve user's swipe history with product details and filters
- ✅ Duplicate Prevention - Users can only swipe each product once

**4.2 Personalized Product Feed:**
- ✅ Smart Product Feed API - TikTok-style endless discovery feed
- ✅ Auto-exclude Swiped Products - Don't show already swiped products (configurable)
- ✅ Feed Filtering - Category, price, sale status filters
- ✅ Feed Analytics - Track exclusion counts and availability

**4.3 User Preferences Management:**
- ✅ Get User Preferences API - Retrieve personalized user settings
- ✅ Update Preferences API - Set favorite categories, price ranges, stores, interests
- ✅ Interest Categories - 12 predefined interest categories for better matching

**4.4 Swipe Analytics & Insights:**
- ✅ Personal Swipe Analytics API - Like rate, time spent, swipe patterns
- ✅ Category & Store Analysis - Top categories and stores by user interaction
- ✅ Time Period Analytics - 1 day, 7 days, 30 days analytics periods
- ✅ Smart Insights - Average time spent, engagement metrics

**4.5 Search System:**
- ✅ Unified Search API - Search products, categories, and stores simultaneously
- ✅ Search Type Filtering - All results, products only, categories only, stores only
- ✅ Advanced Search Filters - Category, store, price, sale status filters
- ✅ Search History Management - Auto-save searches for authenticated users
- ✅ Search History APIs - Get, delete item, clear all search history
- ✅ Smart Limiting - Configurable limits per section to optimize response times

### ✅ Phase 5 Features Implemented

**5.1 User-Store Follow System:**
- ✅ Follow Store API - Users can follow their favorite stores using store slugs
- ✅ Unfollow Store API - Remove store from following list
- ✅ Follow Status Check API - Check if user is following a specific store
- ✅ Duplicate Prevention - Users can only follow each store once

**5.2 Following Management:**
- ✅ User Following List API - Get all stores a user follows with store details
- ✅ Store Followers API - Store owners can see their follower list and user details
- ✅ Real-time Follower Counts - Automatic update of store follower counts

**5.3 Social Activity Feed:**
- ✅ Following Activity Feed API - Get updates from followed stores (new products, sales)
- ✅ Activity Type Filtering - All activities, new products only, sales only, store updates
- ✅ Smart Feed Sorting - Chronological feed of activities from followed stores

**5.4 Follow Analytics & Insights:**
- ✅ Store Follow Analytics API - Growth metrics, daily follower trends
- ✅ Follower Growth Tracking - 7, 30, 90-day growth analysis
- ✅ Growth Rate Calculations - Percentage growth and daily breakdown

**5.5 Intelligent Recommendations:**
- ✅ Store Recommendation API - AI-powered store suggestions based on user swipe patterns
- ✅ Category-based Matching - Recommend stores with products in user's liked categories
- ✅ Popularity Weighting - Factor in store follower counts for better recommendations
- ✅ Smart Filtering - Exclude already-followed stores from recommendations

### ✅ Phase 6 Features Implemented

**6.1 In-App Notification Management:**
- ✅ Get Notifications API - Retrieve user notifications with filtering and pagination
- ✅ Notification Count API - Get total and unread notification counts
- ✅ Mark as Read API - Mark specific notifications or all notifications as read
- ✅ Delete Notifications API - Remove unwanted notifications with bulk operations
- ✅ Notification Filtering - Filter by type (new products, followers, approvals, etc.)

**6.2 Notification Preferences System:**
- ✅ Get Preferences API - Retrieve user's notification settings
- ✅ Update Preferences API - Customize notification types and delivery methods
- ✅ Granular Controls - 7 different notification categories (products, sales, likes, follows, etc.)
- ✅ Push Notification Toggle - Enable/disable mobile push notifications

**6.3 Real-Time Notification Triggers:**
- ✅ New Product Notifications - Followers get notified when stores add new products
- ✅ Store Follow Notifications - Store owners get notified of new followers
- ✅ Product Approval Notifications - Store owners get approval/rejection notifications
- ✅ Smart Preference Filtering - Only send notifications based on user preferences
- ✅ Rich Notification Data - Include relevant product/store info in notifications

**6.4 Notification Types Supported:**
- ✅ **New Product** - From followed stores
- ✅ **Store Sales** - Sales and promotions from followed stores  
- ✅ **Product Likes** - When users like/interact with products
- ✅ **Store Updates** - When followed stores update their profiles
- ✅ **New Followers** - When users follow your store
- ✅ **Product Approval** - Admin approval/rejection of submitted products
- ✅ **Store Follow** - Social interaction notifications

### 🛠️ Technologies Used

- **Backend**: Firebase Cloud Functions, Node.js, Express.js
- **Database**: Firestore with security rules and composite indexes
- **Authentication**: JWT tokens, bcrypt for password hashing
- **Mobile**: Expo React Native
- **API Client**: Axios with interceptors
- **Validation**: Joi schema validation

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm 9+
- Firebase CLI
- Expo CLI (for mobile development)

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 2. Firebase Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase project (if not already done)
firebase init

# Set your project ID in firebase.json
# Update baseURL in packages/api-client/index.js
```

### 3. Development Setup

**Start Firebase Emulators:**
```bash
npm run firebase:emulators
```

**Start Mobile App:**
```bash
npm run mobile
```

**API Client Configuration:**
```javascript
// For development, set environment to use emulators
import api from '@swipemall/api-client';
api.setEnvironment('development');
```

## 📊 Database Schema

### Collections Implemented:
- ✅ **users** - User profiles and authentication data
- ✅ **stores** - Store information and verification status
- ✅ **categories** - Product categories
- ✅ **products** - Product listings with approval workflow
- ✅ **userSwipes** - User interaction tracking
- ✅ **userFollows** - User-store following relationships
- ✅ **storeFollowers** - Store follower tracking
- ✅ **notifications** - User notifications
- ✅ **reports** - Content reporting system
- ✅ **boostedProducts** - Product promotion system

### Security Rules
- ✅ Users can only read/write their own data
- ✅ Stores can only manage their own products
- ✅ Admins have full access to all collections
- ✅ Guest users have limited read access
- ✅ All writes require authentication

## 🧪 Testing Phase 1, 2, 3 & 4 APIs

### Health Check
```bash
GET /health
```

### Phase 1: Authentication Endpoints

**Sign Up:**
```bash
POST /auth/signup
{
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Login:**
```bash
POST /auth/login
{
  "phoneNumber": "+1234567890",
  "password": "securepassword"
}
```

### Phase 2: Store Management Endpoints

**Create Store with New Owner (Admin only):**
```bash
POST /stores
Headers: Authorization: Bearer <admin-token>
{
  "name": "Beirut Electronics",
  "slug": "beirut-electronics",
  "description": "Premium electronics store",
  "location": "Hamra, Beirut, Lebanon",
  "whatsappNumber": "+9611234567",
  "ownerDetails": {
    "name": "Ahmad Electronics",
    "phoneNumber": "+9611234567",
    "email": "ahmad@beirutelectronics.com"
  }
}
```

**Get Store by Slug (Public):**
```bash
GET /stores/beirut-electronics
```

**Update Store by Slug:**
```bash
PUT /stores/beirut-electronics
Headers: Authorization: Bearer <token>
{
  "description": "Updated: Best electronics in Lebanon!"
}
```

### Phase 3: Category Management Endpoints

**Get All Categories (Public):**
```bash
GET /categories?active=true
```

**Get Single Category by Slug (Public):**
```bash
GET /categories/electronics
```

**Create Category (Admin only):**
```bash
POST /categories
Headers: Authorization: Bearer <admin-token>
{
  "name": "Electronics",
  "slug": "electronics"
}
```

**Update Category by Slug (Admin only):**
```bash
PUT /categories/electronics
Headers: Authorization: Bearer <admin-token>
{
  "name": "Electronics & Gadgets"
}
```

**Delete Category by Slug (Admin only):**
```bash
DELETE /categories/fashion
Headers: Authorization: Bearer <admin-token>
```

### Phase 3: Product Management Endpoints

**Create Product (Store Owner):**
```bash
POST /products
Headers: Authorization: Bearer <store-owner-token>
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced camera system and titanium design",
  "image": "https://example.com/iphone15pro.jpg",
  "price": 999.99,
  "isOnSale": true,
  "salePrice": 899.99,
  "availableSizes": ["128GB", "256GB", "512GB"],
  "availableColors": ["Natural Titanium", "Blue Titanium", "White Titanium"],
  "stockAmount": 50,
  "categorySlug": "electronics",
  "storeSlug": "beirut-electronics"
}
```

**Get All Products (Public with filters):**
```bash
GET /products?limit=10&categorySlug=electronics&priceMax=500&onSale=true
```

**Get Products by Store Slug:**
```bash
GET /products?storeSlug=beirut-electronics&limit=20
```

**Get Products by Category Slug:**
```bash
GET /products?categorySlug=fashion&limit=15&onSale=true
```

**Get Single Product:**
```bash
GET /products/<product-id>
```

**Update Product (Store Owner):**
```bash
PUT /products/<product-id>
Headers: Authorization: Bearer <store-owner-token>
{
  "name": "iPhone 15 Pro Max",
  "price": 1199.99,
  "categorySlug": "electronics",
  "stockAmount": 30
}
```

### Phase 3: Product Approval Endpoints (Admin)

**Get Pending Products (Admin only):**
```bash
GET /admin/products/pending
Headers: Authorization: Bearer <admin-token>
```

**Approve Product (Admin only):**
```bash
PATCH /admin/products/<product-id>/approve
Headers: Authorization: Bearer <admin-token>
```

**Reject Product (Admin only):**
```bash
PATCH /admin/products/<product-id>/reject
Headers: Authorization: Bearer <admin-token>
{
  "rejectionReason": "Product image quality is not acceptable. Please upload higher resolution images."
}
```

**Update Product Status (Store Owner):**
```bash
PATCH /products/<product-id>/status
Headers: Authorization: Bearer <store-owner-token>
{
  "status": "inactive"
}
```

### Phase 4: User Interactions & Swipe System Endpoints

**Record User Swipe:**
```bash
POST /swipes
Headers: Authorization: Bearer <user-token>
{
  "productId": "<product-id>",
  "action": "like",
  "swipeDirection": "right",
  "timeSpent": 15
}
```

**Record Dislike Swipe:**
```bash
POST /swipes
Headers: Authorization: Bearer <user-token>
{
  "productId": "<product-id>",
  "action": "dislike",
  "swipeDirection": "left",
  "timeSpent": 3
}
```

**Get User Swipe History:**
```bash
GET /swipes/history?action=like&limit=10
Headers: Authorization: Bearer <user-token>
```

**Get Swipe History by Category:**
```bash
GET /swipes/history?categorySlug=electronics&limit=20
Headers: Authorization: Bearer <user-token>
```

**Get Personalized Product Feed:**
```bash
GET /feed?limit=20&excludeSwipedToday=true
Headers: Authorization: Bearer <user-token>
```

**Get Filtered Product Feed:**
```bash
GET /feed?categorySlug=fashion&priceMax=100&onSaleOnly=true&limit=15
Headers: Authorization: Bearer <user-token>
```

**Get User Preferences:**
```bash
GET /preferences
Headers: Authorization: Bearer <user-token>
```

**Update User Preferences:**
```bash
PUT /preferences
Headers: Authorization: Bearer <user-token>
{
  "favoriteCategories": ["electronics", "fashion"],
  "priceRange": {
    "min": 10,
    "max": 500
  },
  "preferredStores": ["beirut-electronics", "fashion-store"],
  "interests": ["electronics", "fashion", "sports"]
}
```

**Get User Swipe Analytics:**
```bash
GET /analytics/swipes?period=7d
Headers: Authorization: Bearer <user-token>
```

**Get Monthly Swipe Analytics:**
```bash
GET /analytics/swipes?period=30d
Headers: Authorization: Bearer <user-token>
```

### Phase 4.5: Search System Endpoints

**Unified Search (All Types):**
```bash
GET /search?query=electronics&limit=10
# Returns products, categories, and stores matching "electronics"
```

**Search Products Only:**
```bash
GET /search?query=iphone&type=products&limit=15
```

**Search with Filters:**
```bash
GET /search?query=fashion&type=products&categorySlug=clothing&priceMax=100&onSaleOnly=true
```

**Search Categories Only:**
```bash
GET /search?query=tech&type=categories&limit=5
```

**Search Stores Only:**
```bash
GET /search?query=beirut&type=stores&limit=8
```

**Get Search History:**
```bash
GET /search/history?limit=10
Headers: Authorization: Bearer <user-token>
```

**Delete Search History Item:**
```bash
DELETE /search/history/<search-id>
Headers: Authorization: Bearer <user-token>
```

**Clear All Search History:**
```bash
DELETE /search/history
Headers: Authorization: Bearer <user-token>
```

### Phase 5: Social Features (User-Store Follow System) Endpoints

**Follow Store:**
```bash
POST /stores/follow
Headers: Authorization: Bearer <user-token>
{
  "storeSlug": "beirut-electronics"
}
```

**Unfollow Store:**
```bash
DELETE /stores/unfollow
Headers: Authorization: Bearer <user-token>
{
  "storeSlug": "beirut-electronics"
}
```

**Check if Following Store:**
```bash
GET /stores/beirut-electronics/following
Headers: Authorization: Bearer <user-token>
```

**Get User's Following List:**
```bash
GET /following?limit=20&offset=0
Headers: Authorization: Bearer <user-token>
```

**Get Store Followers (Store Owner):**
```bash
GET /stores/beirut-electronics/followers?limit=15
Headers: Authorization: Bearer <store-owner-token>
```

**Get Following Activity Feed:**
```bash
GET /feed/following?limit=15&type=all
Headers: Authorization: Bearer <user-token>
```

**Get New Products from Followed Stores:**
```bash
GET /feed/following?type=new_products&limit=20
Headers: Authorization: Bearer <user-token>
```

**Get Store Follow Analytics (Store Owner):**
```bash
GET /stores/beirut-electronics/analytics/followers?period=30d
Headers: Authorization: Bearer <store-owner-token>
```

**Get Store Recommendations:**
```bash
GET /recommendations/stores?limit=10
Headers: Authorization: Bearer <user-token>
```

### Phase 6: Notification System Endpoints

**Get User Notifications:**
```bash
GET /notifications?limit=20&unreadOnly=false
Headers: Authorization: Bearer <user-token>
```

**Get Unread Notifications Only:**
```bash
GET /notifications?unreadOnly=true&limit=10
Headers: Authorization: Bearer <user-token>
```

**Get Notifications by Type:**
```bash
GET /notifications?type=new_product&limit=15
Headers: Authorization: Bearer <user-token>
```

**Get Notification Count:**
```bash
GET /notifications/count
Headers: Authorization: Bearer <user-token>
```

**Mark Notifications as Read:**
```bash
PATCH /notifications/read
Headers: Authorization: Bearer <user-token>
{
  "notificationIds": ["notif1", "notif2", "notif3"]
}
```

**Mark All Notifications as Read:**
```bash
PATCH /notifications/read-all
Headers: Authorization: Bearer <user-token>
```

**Delete Notifications:**
```bash
DELETE /notifications
Headers: Authorization: Bearer <user-token>
{
  "notificationIds": ["notif1", "notif2"]
}
```

**Get Notification Preferences:**
```bash
GET /notifications/preferences
Headers: Authorization: Bearer <user-token>
```

**Update Notification Preferences:**
```bash
PUT /notifications/preferences
Headers: Authorization: Bearer <user-token>
{
  "newProducts": true,
  "storeSales": true,
  "productLikes": false,
  "storeUpdates": false,
  "followNotifications": true,
  "productApproval": true,
  "pushNotifications": true
}
```

### Using the API Client

```javascript
import api from '@swipemall/api-client';

// Set development environment
api.setEnvironment('development');

// Sign up
const response = await api.signUp({
  name: 'John Doe',
  phoneNumber: '+1234567890',
  email: 'john@example.com',
  password: 'securepassword'
});

// Login
const loginResponse = await api.login({
  phoneNumber: '+1234567890',
  password: 'securepassword'
});

// Check authentication status
const isAuth = api.isAuthenticated();
```

## 📱 Mobile App Integration

The mobile app is already set up and ready to integrate with the API client:

```javascript
// In your React Native components
import api from '@swipemall/api-client';

// Configure for development
api.setEnvironment('development');

// Use in components
const handleSignUp = async (userData) => {
  try {
    const response = await api.signUp(userData);
    console.log('User created:', response.user);
  } catch (error) {
    console.error('Sign up failed:', error.message);
  }
};
```

## 🚧 Next Steps - Phase 7

**Phase 7: Report & Moderation System**
- Content Reporting APIs (products, stores, users)
- Admin Moderation Dashboard APIs  
- Report Review & Action APIs
- Content Flagging & Auto-Moderation
- User Block/Unblock APIs
- Moderation Analytics & Insights

**Later**: Email/SMS Notification Integration (Phase 6 extension)

**Estimated Timeline**: 2-3 weeks

## 📝 Development Notes

1. **Security**: JWT secrets should be set as environment variables in production
2. **Database Indexes**: Composite indexes are configured for optimal query performance
3. **Error Handling**: Comprehensive error handling with proper HTTP status codes
4. **Validation**: Input validation using Joi schemas
5. **Monorepo**: Shared packages allow code reuse between mobile and web apps

## 🔗 Important Files

- `backend/functions/index.js` - Main Cloud Functions API
- `backend/firebase/firestore.rules` - Database security rules
- `backend/firebase/firestore.indexes.json` - Database indexes
- `packages/api-client/index.js` - Shared API client
- `apps/mobile/` - Expo React Native mobile app

## 📞 Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Current Status**: Phase 1, 2, 3, 4, 5 & 6 Complete ✅ (Full Social Shopping Platform + Notifications)  
**Next Phase**: Report & Moderation System  
**Total Progress**: 6/12 phases completed (50.0%)  
**API Progress**: 51/62 endpoints implemented (82.3%) 