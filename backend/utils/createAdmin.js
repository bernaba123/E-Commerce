import User from '../models/User.js';

export const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@ethioconnect.com' 
    });

    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@ethioconnect.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      phone: '+49 30 12345678',
      address: {
        street: 'Alexanderplatz 1',
        city: 'Berlin',
        state: 'Berlin',
        country: 'Germany',
        zipCode: '10178'
      },
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};