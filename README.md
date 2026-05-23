# 🏠 RentEase – Furniture & Appliance Rental Platform

A full-stack web application for renting furniture and appliances on a monthly basis. Built for students and working professionals who prefer renting over buying.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, React Toastify |
| Backend | Node.js, Express.js, REST API |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Styling | Custom CSS with CSS Variables |

---

## 📁 Project Structure

```
rentease/
├── backend/
│   ├── models/          # Mongoose models (User, Product, Rental, Cart, Maintenance)
│   ├── routes/          # Express routes (auth, products, rentals, cart, maintenance, admin)
│   ├── middleware/       # JWT auth middleware
│   ├── server.js        # Express app entry point
│   ├── seed.js          # Database seeder
│   └── .env.example     # Environment variables template
│
└── frontend/
    └── src/
        ├── components/  # Reusable components (Navbar, Footer, ProductCard)
        ├── context/     # React Context (AuthContext, CartContext)
        ├── pages/       # Page components
        │   ├── admin/   # Admin dashboard pages
        │   └── ...      # User-facing pages
        └── services/    # Axios API service
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone and install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**.env contents:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/rentease
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Seed the database

```bash
cd backend
node seed.js
```

This creates:
- **Admin:** `admin@rentease.com` / `admin123`
- **User:** `user@rentease.com` / `user123`
- 16 sample products across Furniture and Appliances

### 4. Run the application

**Backend (from `/backend`):**
```bash
npm run dev
# Server runs on http://localhost:5000
```

**Frontend (from `/frontend`):**
```bash
npm start
# App runs on http://localhost:3000
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Deactivate product (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update/:itemId` | Update cart item |
| DELETE | `/api/cart/remove/:itemId` | Remove item |
| DELETE | `/api/cart/clear` | Clear cart |

### Rentals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rentals/checkout` | Place rental order |
| GET | `/api/rentals` | Get user's rentals |
| GET | `/api/rentals/:id` | Get rental details |
| PUT | `/api/rentals/:id/request-return` | Request return |
| PUT | `/api/rentals/:id/extend` | Extend tenure |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/maintenance` | Submit request |
| GET | `/api/maintenance` | Get user's requests |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id/toggle` | Toggle user status |
| GET | `/api/admin/rentals` | List all rentals |
| PUT | `/api/admin/rentals/:id/status` | Update rental status |
| GET | `/api/admin/maintenance` | List all requests |
| PUT | `/api/admin/maintenance/:id` | Update request |
| GET | `/api/admin/reports/revenue` | Revenue report |
| GET | `/api/admin/reports/products` | Product utilization |

---

## ✨ Features

### User Features
- Register / Login with JWT auth
- Browse products by category (Furniture / Appliances)
- Filter by sub-category, city, price range
- View product details with tenure options
- Add to cart, update tenure, remove items
- Checkout with delivery address & date
- View and manage active rentals
- Request return or extend tenure
- Submit maintenance requests
- Update profile and change password

### Admin Features
- Dashboard with KPIs (active rentals, MRR, pending orders)
- Product management (add, edit, deactivate)
- Rental management (confirm, deliver, mark returned)
- User management (activate/deactivate)
- Maintenance request management
- Revenue and product utilization reports

---

## 🎨 Design Highlights

- Mobile-first responsive design
- CSS custom properties for consistent theming
- Smooth animations and transitions
- Accessible form controls with validation
- Toast notifications for user feedback
- Sticky admin sidebar with collapse support

---

## 📊 Sample Data

16 products seeded across:
- **Furniture:** Beds, Sofas, Tables, Wardrobes
- **Appliances:** Refrigerators, Washing Machines, TVs, ACs, Microwaves

Each product has 3 tenure options (3, 6, 12 months) with progressive discounts.

Service areas: Mumbai, Pune, Bangalore, Delhi, Hyderabad, Chennai
