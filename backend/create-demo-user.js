const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createDemoUser() {
  const client = await pool.connect();
  
  try {
    console.log('🎭 Creating demo user...\n');
    
    // Demo user details
    const email = 'demo@chitbox.com';
    const name = 'Demo User';
    const password = 'DemoPassword123';
    
    // Check if demo user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Demo user already exists!');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   User ID: ${existingUser.rows[0].id}\n`);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create demo user
    const result = await client.query(`
      INSERT INTO users (email, name, password_hash, age, profession, interests, country, newsletter)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, name
    `, [
      email,
      name,
      passwordHash,
      25,
      'Software Developer',
      ['Technology', 'Email', 'AI'],
      'India',
      false
    ]);

    const user = result.rows[0];

    // Create default folders for demo user
    const defaultFolders = [
      { name: 'Inbox', type: 'inbox' },
      { name: 'Sent', type: 'sent' },
      { name: 'Drafts', type: 'drafts' },
      { name: 'Spam', type: 'spam' },
      { name: 'Trash', type: 'trash' }
    ];

    for (const folder of defaultFolders) {
      await client.query(
        'INSERT INTO folders (user_id, name, type) VALUES ($1, $2, $3)',
        [user.id, folder.name, folder.type]
      );
    }

    console.log('✅ Demo user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Folders created: ${defaultFolders.map(f => f.name).join(', ')}\n`);
    
    console.log('🎯 You can now use "Try Demo Mode" button in the login page!');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createDemoUser();
