/**
 * Seed script – affordable rental prices for students & working professionals
 * Pricing: ~2-3% of product value per month
 * Run: node seed.js
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
    name: 'King Size Bed with Storage',
    description: 'Spacious king-size bed with hydraulic storage. Ideal for master bedrooms.',
    category: 'Furniture',
    subCategory: 'Bed',
    brand: 'Nilkamal',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600',
    ],
    securityDeposit: 999,
    tenureOptions: [
      { months: 3,  monthlyRent: 599 },
      { months: 6,  monthlyRent: 499, discount: 17 },
      { months: 12, monthlyRent: 399, discount: 33 },
    ],
    availableQuantity: 8,
    totalQuantity: 10,
    features: ['Hydraulic storage', 'Solid wood frame', 'Easy assembly'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi'],
  },
  {
    name: 'Single Bed with Mattress',
    description: 'Compact single bed with orthopedic mattress. Perfect for students.',
    category: 'Furniture',
    subCategory: 'Bed',
    brand: 'Durian',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600',
    ],
    securityDeposit: 499,
    tenureOptions: [
      { months: 3,  monthlyRent: 299 },
      { months: 6,  monthlyRent: 249, discount: 17 },
      { months: 12, monthlyRent: 199, discount: 33 },
    ],
    availableQuantity: 15,
    totalQuantity: 15,
    features: ['Orthopedic mattress', 'Under-bed storage', 'Scratch-resistant'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad'],
  },
  {
    name: '3-Seater Fabric Sofa',
    description: 'Comfortable 3-seater sofa in premium fabric. Great for living rooms.',
    category: 'Furniture',
    subCategory: 'Sofa',
    brand: 'Urban Ladder',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600',
    ],
    securityDeposit: 799,
    tenureOptions: [
      { months: 3,  monthlyRent: 449 },
      { months: 6,  monthlyRent: 379, discount: 16 },
      { months: 12, monthlyRent: 299, discount: 33 },
    ],
    availableQuantity: 6,
    totalQuantity: 8,
    features: ['Premium fabric', 'High-density foam', 'Easy to clean'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore'],
  },
  {
    name: 'L-Shaped Sofa Set',
    description: 'Modern L-shaped sofa set with chaise lounge. Seats up to 5 people.',
    category: 'Furniture',
    subCategory: 'Sofa',
    brand: 'Pepperfry',
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600',
    ],
    securityDeposit: 1499,
    tenureOptions: [
      { months: 3,  monthlyRent: 799 },
      { months: 6,  monthlyRent: 649, discount: 19 },
      { months: 12, monthlyRent: 499, discount: 38 },
    ],
    availableQuantity: 4,
    totalQuantity: 5,
    features: ['Chaise lounge', 'Modular design', 'Stain-resistant fabric'],
    serviceAreas: ['Mumbai', 'Delhi', 'Bangalore'],
  },
  {
    name: 'Study Table with Bookshelf',
    description: 'Ergonomic study table with integrated bookshelf. Ideal for students.',
    category: 'Furniture',
    subCategory: 'Table',
    brand: 'Godrej Interio',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600',
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600',
    ],
    securityDeposit: 299,
    tenureOptions: [
      { months: 3,  monthlyRent: 149 },
      { months: 6,  monthlyRent: 119, discount: 20 },
      { months: 12, monthlyRent: 99,  discount: 34 },
    ],
    availableQuantity: 20,
    totalQuantity: 20,
    features: ['Integrated bookshelf', 'Cable management', 'Ergonomic design'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'],
  },
  {
    name: 'Dining Table Set (4 Chairs)',
    description: '4-seater dining table with chairs. Solid wood construction.',
    category: 'Furniture',
    subCategory: 'Table',
    brand: 'Nilkamal',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600',
      'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600',
    ],
    securityDeposit: 799,
    tenureOptions: [
      { months: 3,  monthlyRent: 449 },
      { months: 6,  monthlyRent: 369, discount: 18 },
      { months: 12, monthlyRent: 299, discount: 33 },
    ],
    availableQuantity: 5,
    totalQuantity: 6,
    features: ['Solid wood', '4 chairs included', 'Easy assembly'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi'],
  },
  {
    name: '2-Door Wardrobe',
    description: 'Spacious 2-door wardrobe with mirror and internal shelves.',
    category: 'Furniture',
    subCategory: 'Wardrobe',
    brand: 'Godrej Interio',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    ],
    securityDeposit: 699,
    tenureOptions: [
      { months: 3,  monthlyRent: 349 },
      { months: 6,  monthlyRent: 279, discount: 20 },
      { months: 12, monthlyRent: 229, discount: 34 },
    ],
    availableQuantity: 10,
    totalQuantity: 12,
    features: ['Full-length mirror', 'Internal shelves', 'Hanging rod'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad'],
  },

  // ── Appliances ─────────────────────────────────────────────────────────────
  {
    name: 'Double Door Refrigerator 350L',
    description: '350L double door refrigerator with frost-free technology.',
    category: 'Appliances',
    subCategory: 'Refrigerator',
    brand: 'LG',
    images: [
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600',
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    ],
    securityDeposit: 1499,
    tenureOptions: [
      { months: 3,  monthlyRent: 699 },
      { months: 6,  monthlyRent: 579, discount: 17 },
      { months: 12, monthlyRent: 449, discount: 36 },
    ],
    availableQuantity: 7,
    totalQuantity: 10,
    features: ['Frost-free', 'Energy Star rated', '5-star rating', 'Smart inverter'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi'],
  },
  {
    name: 'Single Door Refrigerator 180L',
    description: 'Compact 180L single door refrigerator. Perfect for bachelors.',
    category: 'Appliances',
    subCategory: 'Refrigerator',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    ],
    securityDeposit: 799,
    tenureOptions: [
      { months: 3,  monthlyRent: 349 },
      { months: 6,  monthlyRent: 279, discount: 20 },
      { months: 12, monthlyRent: 229, discount: 34 },
    ],
    availableQuantity: 12,
    totalQuantity: 15,
    features: ['Direct cool', '5-star rating', 'Toughened glass shelves'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'],
  },
  {
    name: 'Front Load Washing Machine 7kg',
    description: '7kg front load washing machine with multiple wash programs.',
    category: 'Appliances',
    subCategory: 'Washing Machine',
    brand: 'Bosch',
    images: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600',
      'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=600',
    ],
    securityDeposit: 1299,
    tenureOptions: [
      { months: 3,  monthlyRent: 599 },
      { months: 6,  monthlyRent: 499, discount: 17 },
      { months: 12, monthlyRent: 399, discount: 33 },
    ],
    availableQuantity: 8,
    totalQuantity: 10,
    features: ['Front load', '15 wash programs', 'Energy efficient', 'Child lock'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi'],
  },
  {
    name: 'Semi-Automatic Washing Machine 8kg',
    description: '8kg semi-automatic washing machine. Budget-friendly option.',
    category: 'Appliances',
    subCategory: 'Washing Machine',
    brand: 'Whirlpool',
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600',
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600',
      'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=600',
    ],
    securityDeposit: 699,
    tenureOptions: [
      { months: 3,  monthlyRent: 299 },
      { months: 6,  monthlyRent: 249, discount: 17 },
      { months: 12, monthlyRent: 199, discount: 33 },
    ],
    availableQuantity: 10,
    totalQuantity: 12,
    features: ['Semi-automatic', 'Turbo scrub', 'Lint filter'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad'],
  },
  {
    name: '43-inch 4K Smart TV',
    description: '43-inch 4K UHD Smart TV with Android OS and built-in streaming apps.',
    category: 'Appliances',
    subCategory: 'TV',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600',
      'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=600',
    ],
    securityDeposit: 1299,
    tenureOptions: [
      { months: 3,  monthlyRent: 649 },
      { months: 6,  monthlyRent: 529, discount: 18 },
      { months: 12, monthlyRent: 429, discount: 34 },
    ],
    availableQuantity: 9,
    totalQuantity: 12,
    features: ['4K UHD', 'Android TV', 'Dolby Audio', 'Built-in WiFi'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'],
  },
  {
    name: '32-inch HD Smart TV',
    description: '32-inch HD Smart TV. Great for bedrooms and small spaces.',
    category: 'Appliances',
    subCategory: 'TV',
    brand: 'Mi',
    images: [
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600',
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600',
      'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=600',
    ],
    securityDeposit: 699,
    tenureOptions: [
      { months: 3,  monthlyRent: 299 },
      { months: 6,  monthlyRent: 249, discount: 17 },
      { months: 12, monthlyRent: 199, discount: 33 },
    ],
    availableQuantity: 14,
    totalQuantity: 15,
    features: ['HD Ready', 'Smart TV', 'Multiple HDMI ports', 'Thin bezel'],
    serviceAreas: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'],
  },
  {
    name: '1.5 Ton Split AC',
    description: '1.5 ton 5-star split AC with inverter technology.',
    category: 'Appliances',
    subCategory: 'AC',
    brand: 'Daikin',
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    ],
    securityDeposit: 1499,
    tenureOptions: [
      { months: 3,  monthlyRent: 799 },
      { months: 6,  monthlyRent: 649, discount: 19 },
      { months: 12, monthlyRent: 499, discount: 38 },
    ],
    availableQuantity: 5,
    totalQuantity: 8,
    features: ['5-star rating', 'Inverter technology', 'Auto-clean', 'Wi-Fi enabled'],
    serviceAreas: ['Mumbai', 'Pune', 'Delhi', 'Hyderabad'],
  },
  {
    name: 'Microwave Oven 25L',
    description: '25L convection microwave oven with multiple cooking modes.',
    category: 'Appliances',
    subCategory: 'Microwave',
    brand: 'IFB',
    images: [
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600',
    ],
    securityDeposit: 499,
    tenureOptions: [
      { months: 3,  monthlyRent: 199 },
      { months: 6,  monthlyRent: 159, discount: 20 },
      { months: 12, monthlyRent: 129, discount: 35 },
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

    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@rentease.com',
      password: adminPassword,
      role: 'admin',
      phone: '9999999999',
    });
    console.log('👤 Admin created: admin@rentease.com / admin123');

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
