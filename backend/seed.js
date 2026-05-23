/**
 * Seed script – populates the database with sample products and an admin user.
 * Run: node seed.js
 *
 * Pricing logic (realistic rental rates):
 *   - 3-month total  = ~25–30% of purchase price
 *   - 6-month total  = ~35–40% of purchase price
 *   - 12-month total = ~45–55% of purchase price
 *   So renting is always cheaper than buying for short/medium stays.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rentease';

const products = [
  // ── Furniture ──────────────────────────────────────────────────────────────

  {
    // Purchase price ~₹18,000 | 3m=₹3,600 | 6m=₹5,400 | 12m=₹7,200
    name: 'King Size Bed with Storage',
    description: 'Spacious king-size bed with hydraulic storage. Ideal for master bedrooms.',
    category: 'Furniture',
    subCategory: 'Bed',
    brand: 'Nilkamal',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
    securityDeposit: 1500,
    tenureOptions: [
      { months: 3,  monthlyRent: 1200 },
      { months: 6,  monthlyRent: 900,  discount: 25 },
      { months: 12, monthlyRent: 600,  discount: 50 },
    ],
    availableQuantity: 8,
    totalQuantity: 10,
    features: ['Hydraulic storage', 'Solid wood frame', 'Easy assembly'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi'],
  },

  {
    // Purchase price ~₹8,000 | 3m=₹1,500 | 6m=₹2,400 | 12m=₹3,600
    name: 'Single Bed with Mattress',
    description: 'Compact single bed with orthopedic mattress. Perfect for students.',
    category: 'Furniture',
    subCategory: 'Bed',
    brand: 'Durian',
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'],
    securityDeposit: 800,
    tenureOptions: [
      { months: 3,  monthlyRent: 500 },
      { months: 6,  monthlyRent: 400, discount: 20 },
      { months: 12, monthlyRent: 300, discount: 40 },
    ],
    availableQuantity: 15,
    totalQuantity: 15,
    features: ['Orthopedic mattress', 'Under-bed storage', 'Scratch-resistant'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad'],
  },

  {
    // Purchase price ~₹15,000 | 3m=₹2,700 | 6m=₹4,200 | 12m=₹6,000
    name: '3-Seater Fabric Sofa',
    description: 'Comfortable 3-seater sofa in premium fabric. Great for living rooms.',
    category: 'Furniture',
    subCategory: 'Sofa',
    brand: 'Urban Ladder',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
    securityDeposit: 1200,
    tenureOptions: [
      { months: 3,  monthlyRent: 900 },
      { months: 6,  monthlyRent: 700, discount: 22 },
      { months: 12, monthlyRent: 500, discount: 44 },
    ],
    availableQuantity: 6,
    totalQuantity: 8,
    features: ['Premium fabric', 'High-density foam', 'Easy to clean'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore'],
  },

  {
    // Purchase price ~₹30,000 | 3m=₹5,400 | 6m=₹8,400 | 12m=₹12,000
    name: 'L-Shaped Sofa Set',
    description: 'Modern L-shaped sofa set with chaise lounge. Seats up to 5 people.',
    category: 'Furniture',
    subCategory: 'Sofa',
    brand: 'Pepperfry',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
    securityDeposit: 2000,
    tenureOptions: [
      { months: 3,  monthlyRent: 1800 },
      { months: 6,  monthlyRent: 1400, discount: 22 },
      { months: 12, monthlyRent: 1000, discount: 44 },
    ],
    availableQuantity: 4,
    totalQuantity: 5,
    features: ['Chaise lounge', 'Modular design', 'Stain-resistant fabric'],
    serviceAreas: ['Mumbai', 'Delhi', 'Bangalore'],
  },

  {
    // Purchase price ~₹6,000 | 3m=₹900 | 6m=₹1,500 | 12m=₹2,400
    name: 'Study Table with Bookshelf',
    description: 'Ergonomic study table with integrated bookshelf. Ideal for students.',
    category: 'Furniture',
    subCategory: 'Table',
    brand: 'Godrej Interio',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600'],
    securityDeposit: 500,
    tenureOptions: [
      { months: 3,  monthlyRent: 300 },
      { months: 6,  monthlyRent: 250, discount: 17 },
      { months: 12, monthlyRent: 200, discount: 33 },
    ],
    availableQuantity: 20,
    totalQuantity: 20,
    features: ['Integrated bookshelf', 'Cable management', 'Ergonomic design'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'],
  },

  {
    // Purchase price ~₹14,000 | 3m=₹2,700 | 6m=₹4,200 | 12m=₹6,000
    name: 'Dining Table Set (4 Chairs)',
    description: '4-seater dining table with chairs. Solid wood construction.',
    category: 'Furniture',
    subCategory: 'Table',
    brand: 'Nilkamal',
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600'],
    securityDeposit: 1200,
    tenureOptions: [
      { months: 3,  monthlyRent: 900 },
      { months: 6,  monthlyRent: 700, discount: 22 },
      { months: 12, monthlyRent: 500, discount: 44 },
    ],
    availableQuantity: 5,
    totalQuantity: 6,
    features: ['Solid wood', '4 chairs included', 'Easy assembly'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi'],
  },

  {
    // Purchase price ~₹12,000 | 3m=₹2,100 | 6m=₹3,000 | 12m=₹4,800
    name: '2-Door Wardrobe',
    description: 'Spacious 2-door wardrobe with mirror and internal shelves.',
    category: 'Furniture',
    subCategory: 'Wardrobe',
    brand: 'Godrej Interio',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
    securityDeposit: 1000,
    tenureOptions: [
      { months: 3,  monthlyRent: 700 },
      { months: 6,  monthlyRent: 500, discount: 29 },
      { months: 12, monthlyRent: 400, discount: 43 },
    ],
    availableQuantity: 10,
    totalQuantity: 12,
    features: ['Full-length mirror', 'Internal shelves', 'Hanging rod'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad'],
  },

  // ── Appliances ─────────────────────────────────────────────────────────────

  {
    // Purchase price ~₹32,000 | 3m=₹4,500 | 6m=₹7,200 | 12m=₹12,000
    name: 'Double Door Refrigerator 350L',
    description: '350L double door refrigerator with frost-free technology.',
    category: 'Appliances',
    subCategory: 'Refrigerator',
    brand: 'LG',
    images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'],
    securityDeposit: 2500,
    tenureOptions: [
      { months: 3,  monthlyRent: 1500 },
      { months: 6,  monthlyRent: 1200, discount: 20 },
      { months: 12, monthlyRent: 1000, discount: 33 },
    ],
    availableQuantity: 7,
    totalQuantity: 10,
    features: ['Frost-free', 'Energy Star rated', '5-star rating', 'Smart inverter'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi'],
  },

  {
    // Purchase price ~₹14,000 | 3m=₹2,100 | 6m=₹3,000 | 12m=₹4,800
    name: 'Single Door Refrigerator 180L',
    description: 'Compact 180L single door refrigerator. Perfect for bachelors.',
    category: 'Appliances',
    subCategory: 'Refrigerator',
    brand: 'Samsung',
    images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'],
    securityDeposit: 1200,
    tenureOptions: [
      { months: 3,  monthlyRent: 700 },
      { months: 6,  monthlyRent: 500, discount: 29 },
      { months: 12, monthlyRent: 400, discount: 43 },
    ],
    availableQuantity: 12,
    totalQuantity: 15,
    features: ['Direct cool', '5-star rating', 'Toughened glass shelves'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'],
  },

  {
    // Purchase price ~₹38,000 | 3m=₹5,400 | 6m=₹8,400 | 12m=₹13,200
    name: 'Front Load Washing Machine 7kg',
    description: '7kg front load washing machine with multiple wash programs.',
    category: 'Appliances',
    subCategory: 'Washing Machine',
    brand: 'Bosch',
    images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600'],
    securityDeposit: 2500,
    tenureOptions: [
      { months: 3,  monthlyRent: 1800 },
      { months: 6,  monthlyRent: 1400, discount: 22 },
      { months: 12, monthlyRent: 1100, discount: 39 },
    ],
    availableQuantity: 8,
    totalQuantity: 10,
    features: ['Front load', '15 wash programs', 'Energy efficient', 'Child lock'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi'],
  },

  {
    // Purchase price ~₹14,000 | 3m=₹2,100 | 6m=₹3,000 | 12m=₹4,800
    name: 'Semi-Automatic Washing Machine 8kg',
    description: '8kg semi-automatic washing machine. Budget-friendly option.',
    category: 'Appliances',
    subCategory: 'Washing Machine',
    brand: 'Whirlpool',
    images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600'],
    securityDeposit: 1000,
    tenureOptions: [
      { months: 3,  monthlyRent: 700 },
      { months: 6,  monthlyRent: 500, discount: 29 },
      { months: 12, monthlyRent: 400, discount: 43 },
    ],
    availableQuantity: 10,
    totalQuantity: 12,
    features: ['Semi-automatic', 'Turbo scrub', 'Lint filter'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad'],
  },

  {
    // Purchase price ~₹45,000 | 3m=₹5,400 | 6m=₹8,400 | 12m=₹13,200
    name: '43-inch 4K Smart TV',
    description: '43-inch 4K UHD Smart TV with Android OS and built-in streaming apps.',
    category: 'Appliances',
    subCategory: 'TV',
    brand: 'Sony',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'],
    securityDeposit: 2000,
    tenureOptions: [
      { months: 3,  monthlyRent: 1800 },
      { months: 6,  monthlyRent: 1400, discount: 22 },
      { months: 12, monthlyRent: 1100, discount: 39 },
    ],
    availableQuantity: 9,
    totalQuantity: 12,
    features: ['4K UHD', 'Android TV', 'Dolby Audio', 'Built-in WiFi'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'],
  },

  {
    // Purchase price ~₹15,000 | 3m=₹1,800 | 6m=₹2,700 | 12m=₹4,200
    name: '32-inch HD Smart TV',
    description: '32-inch HD Smart TV. Great for bedrooms and small spaces.',
    category: 'Appliances',
    subCategory: 'TV',
    brand: 'Mi',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'],
    securityDeposit: 1000,
    tenureOptions: [
      { months: 3,  monthlyRent: 600 },
      { months: 6,  monthlyRent: 450, discount: 25 },
      { months: 12, monthlyRent: 350, discount: 42 },
    ],
    availableQuantity: 14,
    totalQuantity: 15,
    features: ['HD Ready', 'Smart TV', 'Multiple HDMI ports', 'Thin bezel'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'],
  },

  {
    // Purchase price ~₹35,000 | 3m=₹5,400 | 6m=₹7,800 | 12m=₹12,000
    name: '1.5 Ton Split AC',
    description: '1.5 ton 5-star split AC with inverter technology.',
    category: 'Appliances',
    subCategory: 'AC',
    brand: 'Daikin',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'],
    securityDeposit: 2500,
    tenureOptions: [
      { months: 3,  monthlyRent: 1800 },
      { months: 6,  monthlyRent: 1300, discount: 28 },
      { months: 12, monthlyRent: 1000, discount: 44 },
    ],
    availableQuantity: 5,
    totalQuantity: 8,
    features: ['5-star rating', 'Inverter technology', 'Auto-clean', 'Wi-Fi enabled'],
    serviceAreas: ['Mumbai', 'Pune', 'Delhi', 'Hyderabad'],
  },

  {
    // Purchase price ~₹10,000 | 3m=₹1,200 | 6m=₹1,800 | 12m=₹2,400
    name: 'Microwave Oven 25L',
    description: '25L convection microwave oven with multiple cooking modes.',
    category: 'Appliances',
    subCategory: 'Microwave',
    brand: 'IFB',
    images: ['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600'],
    securityDeposit: 800,
    tenureOptions: [
      { months: 3,  monthlyRent: 400 },
      { months: 6,  monthlyRent: 300, discount: 25 },
      { months: 12, monthlyRent: 200, discount: 50 },
    ],
    availableQuantity: 10,
    totalQuantity: 12,
    features: ['Convection mode', '25L capacity', 'Auto-cook menus', 'Child lock'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@rentease.com',
      password: adminPassword,
      role: 'admin',
      phone: '9999999999',
    });
    console.log('👤 Admin created: admin@rentease.com / admin123');

    // Create demo user
    const userPassword = await bcrypt.hash('user123', 10);
    await User.create({
      name: 'Demo User',
      email: 'user@rentease.com',
      password: userPassword,
      role: 'user',
      phone: '8888888888',
      address: { street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    });
    console.log('👤 Demo user created: user@rentease.com / user123');

    // Insert products
    await Product.insertMany(products);
    console.log(`📦 ${products.length} products seeded`);

    console.log('\n✅ Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
