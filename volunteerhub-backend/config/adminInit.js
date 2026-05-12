const User = require('../models/User');

const initAdmin = async () => {
  try {
    const adminEmail = 'admin@volunteerhub.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('👷 Initializing Super Admin...');
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        status: 'active'
      });
      console.log('✅ Super Admin created successfully!');
    } else {
      console.log('ℹ️ Super Admin already exists.');
    }
  } catch (err) {
    console.error('❌ Error initializing Super Admin:', err.message);
  }
};

module.exports = initAdmin;
