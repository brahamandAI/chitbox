const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Support both connection string and individual parameters for Supabase
const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'chitbox',
      user: process.env.DB_USER || 'username',
      password: process.env.DB_PASSWORD || 'password',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

async function setupSupabaseDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Setting up ChitBox database in Supabase...');
    console.log('📊 Connection details:');
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      console.log(`   Host: ${url.hostname}`);
      console.log(`   Database: ${url.pathname.slice(1)}`);
      console.log(`   User: ${url.username}`);
    } else {
      console.log(`   Host: ${process.env.DB_HOST}`);
      console.log(`   Database: ${process.env.DB_NAME}`);
      console.log(`   User: ${process.env.DB_USER}`);
    }
    
    // Test connection
    console.log('\n🔍 Testing connection...');
    const testResult = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Connection successful!');
    console.log(`   Current time: ${testResult.rows[0].current_time}`);
    console.log(`   PostgreSQL version: ${testResult.rows[0].postgres_version.split(' ')[0]}`);
    
    // Read and execute the main schema
    const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('\n📋 Creating tables...');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await client.query(statement);
          } catch (error) {
            if (error.code !== '42P07') { // Ignore "relation already exists" errors
              console.warn(`⚠️  Warning executing statement: ${error.message}`);
            }
          }
        }
      }
    }
    
    // Read and execute the migration
    const migrationPath = path.join(__dirname, 'src', 'database', 'migrations', '001_add_user_profile_fields.sql');
    if (fs.existsSync(migrationPath)) {
      console.log('🔄 Running migrations...');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await client.query(statement);
          } catch (error) {
            if (error.code !== '42701' && error.code !== '42P07') { // Ignore "column already exists" and "relation already exists" errors
              console.warn(`⚠️  Warning executing migration: ${error.message}`);
            }
          }
        }
      }
    }
    
    // Verify tables were created
    console.log('\n📊 Verifying database structure...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('✅ Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check if users table has the new columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n👥 Users table structure:');
    columnsResult.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
    console.log('\n🎯 Setup completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Your Supabase database is ready');
    console.log('   2. Start your backend: npm run dev');
    console.log('   3. Test authentication endpoints');
    console.log('   4. Deploy to your VPS when ready');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check your DATABASE_URL in .env file');
    console.log('   2. Ensure your Supabase project is active');
    console.log('   3. Verify your database password is correct');
    console.log('   4. Check if SSL is required (set DB_SSL=true)');
    throw error;
  } finally {
    client.release();
  }
}

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as database_name');
    console.log('✅ Supabase connection successful!');
    console.log(`   Database: ${result.rows[0].database_name}`);
    console.log(`   Time: ${result.rows[0].current_time}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Your Supabase project is active');
    console.log('   2. DATABASE_URL is correct in .env');
    console.log('   3. Your database password is correct');
    console.log('   4. Internet connection is working');
    return false;
  }
}

async function main() {
  try {
    console.log('🔍 Testing Supabase connection...');
    const connected = await testConnection();
    
    if (!connected) {
      process.exit(1);
    }
    
    await setupSupabaseDatabase();
    
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

module.exports = { setupSupabaseDatabase, testConnection };
