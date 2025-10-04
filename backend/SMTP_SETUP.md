# SMTP Server Implementation

## Overview
Your ChitBox application now includes a custom SMTP server that can receive incoming emails and store them in your database.

## Features
- ✅ **Incoming Email Reception**: Receives emails on port 2525
- ✅ **Email Parsing**: Parses headers, body, and attachments
- ✅ **Database Storage**: Stores emails in your existing database schema
- ✅ **Real-time Notifications**: Sends Socket.IO events for new emails
- ✅ **User Validation**: Only accepts emails for registered users
- ✅ **Graceful Shutdown**: Properly handles server shutdown

## Configuration

### Environment Variables
Add these to your `.env` file:
```env
# SMTP Server Configuration (Incoming Email Server)
SMTP_SERVER_PORT=2525
SMTP_SERVER_HOST=localhost
SMTP_SERVER_BANNER=ChitBox SMTP Server
```

### Port Configuration
- **Backend API**: Port 3005 (default)
- **SMTP Server**: Port 2525 (default)
- **Frontend**: Port 3004 (default)

## How It Works

### 1. Email Reception
When an email is sent to your SMTP server:
1. Server validates the recipient exists in your database
2. Email is parsed (headers, body, attachments)
3. Email is stored in the database
4. Real-time notification is sent via Socket.IO

### 2. Database Storage
Emails are stored using your existing schema:
- `mail_threads` table for email threads
- `mail_messages` table for individual messages
- `attachments` table for file attachments
- `folders` table for user folders (creates inbox if needed)

### 3. Real-time Updates
When a new email arrives:
- Socket.IO event `new_email` is emitted
- Frontend receives the email data immediately
- User sees the new email without refreshing

## Testing

### 1. Start the Backend
```bash
cd backend
npm run dev
```

You should see:
```
🚀 ChitBox Backend running on port 3005
📧 SMTP server running on port 2525
🔌 Socket.IO server ready for real-time updates
```

### 2. Test with Node.js
```bash
cd backend
node test-smtp.js
```

### 3. Test with External Email Client
Configure your email client to send emails to:
- **SMTP Server**: localhost:2525
- **Recipient**: Any user email in your database

## Integration with Existing System

### Outgoing Emails
Your existing `MailService` continues to work for sending emails via external SMTP providers.

### Incoming Emails
The new SMTP server handles incoming emails and integrates with your existing:
- Database schema
- Socket.IO real-time updates
- User authentication system
- Frontend email display

## Security Considerations

### Development Mode
- Authentication is optional (`authOptional: true`)
- All connections are accepted
- All senders are accepted

### Production Mode
For production, consider:
- Enabling authentication
- Implementing rate limiting
- Adding IP whitelisting
- Using TLS/SSL encryption
- Implementing spam filtering

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 2525
   lsof -i :2525
   # Kill the process
   sudo kill -9 $(lsof -t -i:2525)
   ```

2. **Email Not Stored**
   - Check if recipient exists in database
   - Check database connection
   - Check console logs for errors

3. **Real-time Updates Not Working**
   - Verify Socket.IO connection
   - Check if user is logged in
   - Check browser console for errors

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Next Steps

### Potential Enhancements
1. **IMAP Server**: Add IMAP server for email client access
2. **Email Filtering**: Implement spam and content filtering
3. **Email Forwarding**: Add email forwarding capabilities
4. **Webhooks**: Add webhook support for external integrations
5. **Email Templates**: Add email template system
6. **Analytics**: Add email analytics and reporting

### Production Deployment
1. Use a proper domain name
2. Configure DNS MX records
3. Set up SSL certificates
4. Implement proper authentication
5. Add monitoring and logging
6. Set up backup and recovery

## API Reference

### SMTP Server Events
- `connect`: New connection established
- `mailFrom`: Sender address received
- `rcptTo`: Recipient address received
- `data`: Email data received and processed
- `close`: Connection closed

### Socket.IO Events
- `new_email`: New email received and stored
  ```javascript
  {
    folderId: number,
    email: {
      id: number,
      threadId: number,
      fromEmail: string,
      fromName: string,
      subject: string,
      bodyText: string,
      bodyHtml: string,
      isRead: boolean,
      sentAt: string,
      createdAt: string
    }
  }
  ```

## Support
For issues or questions, check the console logs and ensure all dependencies are properly installed.
