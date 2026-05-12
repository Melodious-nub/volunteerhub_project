const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('\n📡 Connecting to MongoDB...');
    
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`\n✅ =================================`);
    console.log(`✅ MONGODB CONNECTION SUCCESSFUL`);
    console.log(`✅ =================================`);
    console.log(`📁 Host: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port || 27017}`);
    console.log(`✅ =================================\n`);
    
  } catch (error) {
    console.error(`\n❌ =================================`);
    console.error(`❌ MONGODB CONNECTION FAILED`);
    console.error(`❌ =================================`);
    console.error(`Error: ${error.message}`);
    console.error(`=================================\n`);
    
    // Don't exit the process, just show error
    // process.exit(1);
  }
};

module.exports = connectDB;