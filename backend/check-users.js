const { Pool } = require('pg');
require('dotenv').config();

// Support both connection string (for Supabase) and individual parameters
const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
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

async function checkUsers() {
  try {
    console.log('Connecting to database...\n');
    
    // Query all users
    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        name, 
        avatar_url,
        age,
        profession,
        country,
        interests,
        newsletter,
        created_at, 
        updated_at 
      FROM users 
      ORDER BY id ASC
    `);
    
    if (result.rows.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${result.rows.length} user(s):\n`);
      console.log('═'.repeat(100));
      
      result.rows.forEach((user, index) => {
        console.log(`\n👤 User #${index + 1}`);
        console.log('─'.repeat(100));
        console.log(`ID:          ${user.id}`);
        console.log(`Email:       ${user.email}`);
        console.log(`Name:        ${user.name}`);
        console.log(`Avatar URL:  ${user.avatar_url || 'Not set'}`);
        console.log(`Age:         ${user.age || 'Not set'}`);
        console.log(`Profession:  ${user.profession || 'Not set'}`);
        console.log(`Country:     ${user.country || 'Not set'}`);
        console.log(`Interests:   ${user.interests ? user.interests.join(', ') : 'None'}`);
        console.log(`Newsletter:  ${user.newsletter ? 'Yes' : 'No'}`);
        console.log(`Created:     ${user.created_at}`);
        console.log(`Updated:     ${user.updated_at}`);
        console.log('─'.repeat(100));
      });
      
      console.log('\n═'.repeat(100));
      console.log(`\n📊 Total users: ${result.rows.length}\n`);
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await pool.end();
  }
}

checkUsers();

