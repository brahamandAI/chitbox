const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/chitbox',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Setting up ChitBox database...');
    
    // Read and execute the main schema
    const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Creating tables...');
    await client.query(schemaSQL);
    
    // Read and execute the migration
    const migrationPath = path.join(__dirname, 'src', 'database', 'migrations', '001_add_user_profile_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Running migrations...');
    await client.query(migrationSQL);
    
    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - users (with profile fields)');
    console.log('   - folders');
    console.log('   - mail_threads');
    console.log('   - mail_messages');
    console.log('   - attachments');
    console.log('   - user_sessions');
    
    console.log('\n🎯 Ready to run the application!');
    console.log('   Frontend: npm run dev (in frontend folder)');
    console.log('   Backend: npm run dev (in backend folder)');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('🕐 Current time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. PostgreSQL is running');
    console.log('   2. Database exists (create it if needed)');
    console.log('   3. Environment variables are set correctly');
    console.log('   4. User has proper permissions');
    return false;
  }
}

async function main() {
  try {
    console.log('🔍 Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      process.exit(1);
    }
    
    await setupDatabase();
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupDatabase, testConnection };
