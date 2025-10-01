const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addDemoEmails() {
  const client = await pool.connect();
  
  try {
    console.log('📧 Adding demo emails...\n');
    
    // Get demo user
    const userResult = await client.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      ['demo@chitbox.com']
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Demo user not found. Please run create-demo-user.js first.');
      return;
    }

    const user = userResult.rows[0];
    console.log(`✅ Found demo user: ${user.name} (ID: ${user.id})\n`);

    // Get user's folders
    const foldersResult = await client.query(
      'SELECT id, name, type FROM folders WHERE user_id = $1',
      [user.id]
    );

    const folders = {};
    foldersResult.rows.forEach(folder => {
      folders[folder.type] = folder.id;
    });

    // Demo emails data
    const demoEmails = [
      {
        subject: 'Welcome to ChitBox - Your AI-Powered Email Experience',
        from: { name: 'ChitBox Team', email: 'team@chitbox.com' },
        to: user.email,
        body: {
          text: `Hi ${user.name}!\n\nWelcome to ChitBox! We're thrilled to have you on board. 🎉\n\nChitBox is your modern email platform with AI-powered features designed to make email management effortless:\n\n✨ Smart Compose - AI helps you write emails faster\n✨ Smart Reply - One-click intelligent responses\n✨ Email Summarization - Get the gist of long emails instantly\n✨ Priority Inbox - AI organizes your important emails\n✨ Tone Rewriter - Adjust your email tone (professional, friendly, concise)\n\nGet started by exploring the interface and trying out our AI features!\n\nBest regards,\nThe ChitBox Team`,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3B82F6;">Hi ${user.name}!</h2>
            <p>Welcome to <strong>ChitBox</strong>! We're thrilled to have you on board. 🎉</p>
            <p>ChitBox is your modern email platform with AI-powered features designed to make email management effortless:</p>
            <ul>
              <li>✨ <strong>Smart Compose</strong> - AI helps you write emails faster</li>
              <li>✨ <strong>Smart Reply</strong> - One-click intelligent responses</li>
              <li>✨ <strong>Email Summarization</strong> - Get the gist of long emails instantly</li>
              <li>✨ <strong>Priority Inbox</strong> - AI organizes your important emails</li>
              <li>✨ <strong>Tone Rewriter</strong> - Adjust your email tone (professional, friendly, concise)</li>
            </ul>
            <p>Get started by exploring the interface and trying out our AI features!</p>
            <p>Best regards,<br><strong>The ChitBox Team</strong></p>
          </div>`
        },
        folder: 'inbox',
        isRead: false,
        isStarred: true,
        isImportant: true,
        timestamp: new Date(Date.now() - 2 * 60000) // 2 minutes ago
      },
      {
        subject: 'Project Update: Q4 Marketing Campaign Results',
        from: { name: 'Sarah Johnson', email: 'sarah.johnson@company.com' },
        to: user.email,
        body: {
          text: `Hi team,\n\nI wanted to share the latest updates on our Q4 marketing campaign. The results have been outstanding:\n\n📈 40% increase in engagement\n📈 25% boost in conversions\n📈 60% growth in social media reach\n\nKey highlights:\n- Social media ads performed 3x better than expected\n- Email campaigns had 45% open rate\n- Website traffic increased by 80%\n\nNext steps:\n1. Scale successful ad campaigns\n2. Optimize underperforming channels\n3. Prepare Q1 strategy\n\nLet's discuss in tomorrow's meeting!\n\nBest,\nSarah`,
          html: `<p>Hi team,</p><p>I wanted to share the latest updates on our Q4 marketing campaign. The results have been outstanding:</p><ul><li>📈 40% increase in engagement</li><li>📈 25% boost in conversions</li><li>📈 60% growth in social media reach</li></ul><p><strong>Key highlights:</strong></p><ul><li>Social media ads performed 3x better than expected</li><li>Email campaigns had 45% open rate</li><li>Website traffic increased by 80%</li></ul><p><strong>Next steps:</strong></p><ol><li>Scale successful ad campaigns</li><li>Optimize underperforming channels</li><li>Prepare Q1 strategy</li></ol><p>Let's discuss in tomorrow's meeting!</p><p>Best,<br>Sarah</p>`
        },
        folder: 'inbox',
        isRead: false,
        isStarred: false,
        isImportant: true,
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        subject: 'Meeting Reminder: Design Review Tomorrow at 2 PM',
        from: { name: 'Mike Chen', email: 'mike.chen@design.com' },
        to: user.email,
        body: {
          text: `Hi there!\n\nDon't forget about our design review meeting tomorrow at 2 PM. We'll be discussing the new UI mockups and getting feedback from the team.\n\nAgenda:\n- Review new dashboard design\n- Discuss color scheme options\n- Plan mobile responsiveness\n- Set timeline for implementation\n\nPlease come prepared with your thoughts and suggestions!\n\nBest regards,\nMike`,
          html: `<p>Hi there!</p><p>Don't forget about our design review meeting tomorrow at 2 PM. We'll be discussing the new UI mockups and getting feedback from the team.</p><p><strong>Agenda:</strong></p><ul><li>Review new dashboard design</li><li>Discuss color scheme options</li><li>Plan mobile responsiveness</li><li>Set timeline for implementation</li></ul><p>Please come prepared with your thoughts and suggestions!</p><p>Best regards,<br>Mike</p>`
        },
        folder: 'inbox',
        isRead: true,
        isStarred: false,
        isImportant: false,
        timestamp: new Date(Date.now() - 10800000) // 3 hours ago
      },
      {
        subject: 'Weekly Newsletter: Latest Tech Trends',
        from: { name: 'Tech Weekly', email: 'newsletter@techweekly.com' },
        to: user.email,
        body: {
          text: `This week's top tech trends:\n\n🤖 AI Breakthroughs\n- New language models achieve human-level performance\n- AI-powered coding assistants revolutionize development\n- Machine learning applications in healthcare\n\n💻 Programming Languages\n- Rust gains popularity for system programming\n- TypeScript continues to dominate frontend\n- WebAssembly enables high-performance web apps\n\n📱 Industry Insights\n- Mobile-first design becomes standard\n- Privacy-focused browsers gain traction\n- Cloud computing costs continue to decrease\n\nRead more on our website!`,
          html: `<p>This week's top tech trends:</p><h3>🤖 AI Breakthroughs</h3><ul><li>New language models achieve human-level performance</li><li>AI-powered coding assistants revolutionize development</li><li>Machine learning applications in healthcare</li></ul><h3>💻 Programming Languages</h3><ul><li>Rust gains popularity for system programming</li><li>TypeScript continues to dominate frontend</li><li>WebAssembly enables high-performance web apps</li></ul><h3>📱 Industry Insights</h3><ul><li>Mobile-first design becomes standard</li><li>Privacy-focused browsers gain traction</li><li>Cloud computing costs continue to decrease</li></ul><p>Read more on our website!</p>`
        },
        folder: 'inbox',
        isRead: true,
        isStarred: false,
        isImportant: false,
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        subject: 'Invoice #2024-001 - Payment Due',
        from: { name: 'Billing Department', email: 'billing@services.com' },
        to: user.email,
        body: {
          text: `Dear Valued Customer,\n\nYour invoice for this month's services is now due. Please process payment by the end of this week to avoid any service interruptions.\n\nInvoice Details:\n- Invoice #: 2024-001\n- Amount: $1,250.00\n- Due Date: End of week\n- Services: Premium Email Hosting\n\nPayment Methods:\n- Credit Card (Visa, MasterCard, Amex)\n- Bank Transfer\n- PayPal\n\nThank you for your business!\n\nBest regards,\nBilling Department`,
          html: `<p>Dear Valued Customer,</p><p>Your invoice for this month's services is now due. Please process payment by the end of this week to avoid any service interruptions.</p><p><strong>Invoice Details:</strong></p><ul><li>Invoice #: 2024-001</li><li>Amount: $1,250.00</li><li>Due Date: End of week</li><li>Services: Premium Email Hosting</li></ul><p><strong>Payment Methods:</strong></p><ul><li>Credit Card (Visa, MasterCard, Amex)</li><li>Bank Transfer</li><li>PayPal</li></ul><p>Thank you for your business!</p><p>Best regards,<br>Billing Department</p>`
        },
        folder: 'inbox',
        isRead: false,
        isStarred: false,
        isImportant: true,
        timestamp: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        subject: 'Team Lunch - Friday 12:30 PM',
        from: { name: 'Emma Williams', email: 'emma@company.com' },
        to: user.email,
        body: {
          text: `Hey everyone!\n\nLet's do a team lunch this Friday at 12:30 PM. I've made a reservation at the new Italian restaurant downtown.\n\nPlease reply if you can make it so I can adjust the reservation!\n\nLooking forward to it! 🍝\n\nEmma`,
          html: `<p>Hey everyone!</p><p>Let's do a team lunch this Friday at 12:30 PM. I've made a reservation at the new Italian restaurant downtown.</p><p>Please reply if you can make it so I can adjust the reservation!</p><p>Looking forward to it! 🍝</p><p>Emma</p>`
        },
        folder: 'inbox',
        isRead: true,
        isStarred: true,
        isImportant: false,
        timestamp: new Date(Date.now() - 259200000) // 3 days ago
      },
      {
        subject: 'Re: Project Proposal Approved!',
        from: { name: 'John Smith', email: 'john.smith@company.com' },
        to: user.email,
        body: {
          text: `Great news ${user.name}!\n\nThe project proposal has been approved by the board. We can start implementation next week.\n\nBudget approved: $50,000\nTimeline: 3 months\nTeam size: 5 members\n\nLet's schedule a kickoff meeting to discuss the details.\n\nCongratulations!\n\nJohn`,
          html: `<p>Great news ${user.name}!</p><p>The project proposal has been approved by the board. We can start implementation next week.</p><ul><li><strong>Budget approved:</strong> $50,000</li><li><strong>Timeline:</strong> 3 months</li><li><strong>Team size:</strong> 5 members</li></ul><p>Let's schedule a kickoff meeting to discuss the details.</p><p>Congratulations!</p><p>John</p>`
        },
        folder: 'inbox',
        isRead: false,
        isStarred: true,
        isImportant: true,
        timestamp: new Date(Date.now() - 345600000) // 4 days ago
      }
    ];

    // Add emails to database
    for (const email of demoEmails) {
      // Create thread
      const threadResult = await client.query(`
        INSERT INTO mail_threads (subject, folder_id, user_id, is_read, is_starred, is_important, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING id
      `, [
        email.subject,
        folders[email.folder],
        user.id,
        email.isRead,
        email.isStarred,
        email.isImportant,
        email.timestamp
      ]);

      const threadId = threadResult.rows[0].id;

      // Create message
      await client.query(`
        INSERT INTO mail_messages (
          thread_id, from_email, from_name, to_emails, subject, body_text, body_html, 
          is_read, is_sent, sent_at, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        threadId,
        email.from.email,
        email.from.name,
        [email.to],
        email.subject,
        email.body.text,
        email.body.html,
        email.isRead,
        true,
        email.timestamp,
        email.timestamp
      ]);

      console.log(`✅ Added: ${email.subject}`);
    }

    console.log(`\n🎉 Successfully added ${demoEmails.length} demo emails!`);
    console.log(`\n📧 Demo user now has:`);
    console.log(`   - ${demoEmails.filter(e => !e.isRead).length} unread emails`);
    console.log(`   - ${demoEmails.filter(e => e.isStarred).length} starred emails`);
    console.log(`   - ${demoEmails.filter(e => e.isImportant).length} important emails`);
    
  } catch (error) {
    console.error('❌ Error adding demo emails:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addDemoEmails();
