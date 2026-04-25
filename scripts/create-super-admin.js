#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/revlock';

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Super Admin', 'Admin', 'Manager', 'User'],
    default: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createSuperAdmin() {
  try {
    console.log('\n👑 Super Admin User Creation Script\n');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get user input
    const name = await question('Name: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const confirmPassword = await question('Confirm Password: ');

    // Validate inputs
    if (!name || !email || !password) {
      console.error('\n❌ Error: All fields are required');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('\n❌ Error: Passwords do not match');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('\n❌ Error: Password must be at least 6 characters');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.error('\n❌ Error: User with this email already exists');
      process.exit(1);
    }

    // Hash password
    console.log('\nProcessing...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin user
    const superAdminUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'Super Admin',
      isActive: true,
    });

    await superAdminUser.save();

    console.log('\n✓ Super Admin user created successfully!');
    console.log(`  Name: ${superAdminUser.name}`);
    console.log(`  Email: ${superAdminUser.email}`);
    console.log(`  Role: ${superAdminUser.role}`);
    console.log(`  Active: ${superAdminUser.isActive}`);
    console.log(`  ID: ${superAdminUser._id}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

createSuperAdmin();
