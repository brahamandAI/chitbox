#!/bin/bash

echo "🔐 Configuring TLS Encryption for ChitBox Mail Server..."

# Backup current config
sudo cp /etc/postfix/main.cf /etc/postfix/main.cf.backup-$(date +%Y%m%d)

# Configure TLS in Postfix
echo "📧 Updating Postfix TLS configuration..."

# Add/Update TLS settings
sudo postconf -e "smtp_tls_security_level = may"
sudo postconf -e "smtp_tls_loglevel = 1"
sudo postconf -e "smtp_tls_session_cache_database = btree:\${data_directory}/smtp_scache"
sudo postconf -e "smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt"

# SMTPD (incoming) TLS settings
sudo postconf -e "smtpd_tls_security_level = may"
sudo postconf -e "smtpd_tls_loglevel = 1"
sudo postconf -e "smtpd_tls_session_cache_database = btree:\${data_directory}/smtpd_scache"
sudo postconf -e "smtpd_tls_cert_file = /etc/ssl/certs/ssl-cert-snakeoil.pem"
sudo postconf -e "smtpd_tls_key_file = /etc/ssl/private/ssl-cert-snakeoil.key"

# Enable TLS for submission port (587)
if ! grep -q "submission inet" /etc/postfix/master.cf; then
    echo "
# Submission port with TLS
submission inet n       -       y       -       -       smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=encrypt
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_tls_auth_only=yes
  -o smtpd_reject_unlisted_recipient=no
  -o smtpd_client_restrictions=permit_sasl_authenticated,reject
  -o milter_macro_daemon_name=ORIGINATING
" | sudo tee -a /etc/postfix/master.cf
fi

echo "🔄 Restarting services..."
sudo systemctl restart postfix
sudo systemctl restart opendkim

echo ""
echo "✅ TLS Configuration Complete!"
echo ""
echo "📊 Verify TLS is working:"
echo "  postconf smtp_tls_security_level"
echo "  postconf smtpd_tls_security_level"
echo ""
echo "🧪 Test sending an email from ChitBox to Gmail."
echo "   The 'not encrypted' warning should now be gone!"

