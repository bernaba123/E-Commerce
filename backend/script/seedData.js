import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@ethioconnect.com' });
    
    if (!existingAdmin) {
      const hashedPassword = await bcryptjs.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
      
      const adminUser = new User({
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@ethioconnect.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+251911123456',
        address: {
          street: 'Bole Road',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia'
        }
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample regular users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'user1@example.com',
        password: await bcryptjs.hash('password123', 12),
        role: 'user',
        phone: '+251911111111',
        address: {
          street: 'Kazanchis',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1001',
          country: 'Ethiopia'
        }
      },
      {
        name: 'Jane Smith',
        email: 'user2@example.com',
        password: await bcryptjs.hash('password123', 12),
        role: 'user',
        phone: '+251922222222',
        address: {
          street: 'Piassa',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1002',
          country: 'Ethiopia'
        }
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`User ${userData.email} created successfully`);
      }
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedProducts = async () => {
  try {
    const existingProducts = await Product.countDocuments();
    
    if (existingProducts === 0) {
      // Get admin user to set as creator
      const adminUser = await User.findOne({ role: 'admin' });
      const sampleProducts = [
        {
          name: 'Ethiopian Coffee Beans - Premium Arabica',
          description: 'High-quality Arabica coffee beans from the highlands of Ethiopia. Known for their rich flavor and aromatic profile.',
          price: 25.99,
          category: 'coffee',
          stock: 100,
          images: ['/api/placeholder/400/300'],
          featured: true,
          origin: 'ethiopia',
          weight: 1.2,
          dimensions: { length: 20, width: 15, height: 8 },
          tags: ['coffee', 'arabica', 'premium', 'ethiopia'],
          createdBy: adminUser._id
        },
        {
          name: 'Traditional Ethiopian Spice Blend - Berbere',
          description: 'Authentic berbere spice blend, a cornerstone of Ethiopian cuisine. Perfect for adding traditional flavors to your dishes.',
          price: 12.50,
          category: 'spices',
          stock: 50,
          images: ['/api/placeholder/400/300'],
          featured: true,
          origin: 'ethiopia',
          weight: 0.3,
          dimensions: { length: 10, width: 10, height: 5 },
          tags: ['spices', 'berbere', 'ethiopian', 'traditional'],
          createdBy: adminUser._id
        },
        {
          name: 'Handwoven Ethiopian Scarf',
          description: 'Beautiful handwoven cotton scarf featuring traditional Ethiopian patterns. Perfect accessory for any occasion.',
          price: 35.00,
          category: 'clothing',
          stock: 25,
          images: ['/api/placeholder/400/300'],
          featured: true,
          origin: 'ethiopia',
          weight: 0.2,
          dimensions: { length: 25, width: 20, height: 3 },
          tags: ['clothing', 'scarf', 'handwoven', 'traditional'],
          createdBy: adminUser._id
        },
        {
          name: 'Ethiopian Honey - Wild Forest',
          description: 'Pure wild forest honey from the mountains of Ethiopia. Unprocessed and naturally sweet with floral notes.',
          price: 18.75,
          category: 'food',
          stock: 75,
          images: ['/api/placeholder/400/300'],
          featured: false,
          origin: 'ethiopia',
          weight: 0.6,
          dimensions: { length: 12, width: 8, height: 8 },
          tags: ['food', 'honey', 'natural', 'organic'],
          createdBy: adminUser._id
        },
        {
          name: 'German Engineering Tool Set',
          description: 'High-precision tool set manufactured in Germany. Perfect for professional and home use.',
          price: 89.99,
          category: 'other',
          stock: 30,
          images: ['/api/placeholder/400/300'],
          featured: true,
          origin: 'germany',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 8 },
          tags: ['tools', 'engineering', 'german', 'precision'],
          createdBy: adminUser._id
        },
        {
          name: 'German Chocolate - Dark 70%',
          description: 'Premium dark chocolate made in Germany with 70% cocoa content. Rich and smooth texture.',
          price: 8.99,
          category: 'food',
          stock: 200,
          images: ['/api/placeholder/400/300'],
          featured: false,
          origin: 'germany',
          weight: 0.12,
          dimensions: { length: 15, width: 8, height: 1 },
          tags: ['food', 'chocolate', 'dark', 'premium'],
          createdBy: adminUser._id
        }
      ];

      for (const productData of sampleProducts) {
        const product = new Product(productData);
        await product.save();
        console.log(`Product "${productData.name}" created successfully`);
      }
      
      console.log(`${sampleProducts.length} products seeded successfully`);
    } else {
      console.log('Products already exist, skipping seeding');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    console.log('Starting data seeding...');
    
    await seedUsers();
    await seedProducts();
    
    console.log('Data seeding completed successfully!');
    console.log('\nSample credentials:');
    console.log('Admin: admin@ethioconnect.com / admin123');
    console.log('User 1: user1@example.com / password123');
    console.log('User 2: user2@example.com / password123');
    
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData();
}

export default seedData;