# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d75c2a49-0921-4ed9-be7f-0749c8d28ff4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d75c2a49-0921-4ed9-be7f-0749c8d28ff4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d75c2a49-0921-4ed9-be7f-0749c8d28ff4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## EmailJS Setup

The contact form is configured to use EmailJS with the following credentials:
- Service ID: service_36ir31n
- Template ID: template_o7ly4st
- Public Key: fgIKeHPKwZTZx28Nn

To use the provided HTML email template:
1. Log in to [EmailJS](https://www.emailjs.com/)
2. Go to "Email Templates" and open the template with ID "template_o7ly4st"
3. Delete the existing HTML content
4. Paste the entire contents of `email_template.html` from the project root
5. Make sure your template contains the following variables:
   - `{{from_name}}` - The sender's name
   - `{{from_email}}` - The sender's email
   - `{{subject}}` - The email subject
   - `{{message}}` - The email message
6. Save the template

The contact form will now send beautifully formatted emails to levin.fritz@bluewin.ch when users submit the form.

## Supabase Database Setup

To fix the history entry deletion issue and set up the database correctly:

1. Go to the [Supabase dashboard](https://app.supabase.com) and select your project
2. Navigate to "SQL Editor"
3. Create a new query and paste the entire contents of the updated `supabase/pdf_history_cleanup.sql` file
4. Run the SQL query to create:
   - The pdf_history table with proper structure
   - Row-level security policies to ensure users can only access their own data
   - Stored procedures for safely deleting history entries
   - A cleanup function to remove entries older than 7 days

Note: The original script included a scheduled task using pg_cron, but this extension may not be available in your Supabase instance. The updated script implements a manual cleanup function that runs when users visit the History page.

This implementation ensures:
- Users can only view, create, and delete their own history entries
- The "delete entry" and "clear history" functions work properly and persist changes
- Old entries are automatically cleaned up to save database space

After implementing these changes, history deletion will work correctly and persist across page refreshes.

## Ubuntu Server Deployment Guide

This guide explains how to deploy the Web2PDF application on an Ubuntu server.

### System Requirements

- Ubuntu Server (tested on Ubuntu 24.04)
- Node.js (v16 or higher)
- Apache2
- Cloudflare Tunnel (optional, for external access)

### Step 1: System Preparation

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Apache and required tools
sudo apt install -y apache2 git curl

# Enable required Apache modules
sudo a2enmod proxy proxy_http rewrite headers ssl

# Install Node.js (if not present)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Install Ubuntu 24.04 Specific Dependencies

For Ubuntu 24.04, the package names have changed for many libraries (they now end with t64):

```bash
# Install Puppeteer dependencies for PDF generation
sudo apt install -y libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libdrm2 libgbm1 libgtk-3-0t64 libnss3 libxss1 libxtst6 xauth xvfb
```

### Step 3: Application Setup

```bash
# Clone the repository
cd /var/www
git clone https://github.com/levinfritz/web2pdf-refined-export.git
sudo chown -R $USER:$USER /var/www/web2pdf-refined-export

# Install frontend dependencies
cd web2pdf-refined-export
npm install

# Configure environment variables for frontend
cat > .env.production << EOL
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_ENDPOINT=/api
EOL

# Build frontend
npx update-browserslist-db@latest
npm run build

# Setup backend
cd server
npm install

# Configure environment variables for backend
cat > .env << EOL
PORT=3000
JWT_SECRET=$(openssl rand -base64 32)
PDF_RETENTION_DAYS=14
NODE_ENV=production
EOL

# Create output directories
mkdir -p output/temp
sudo chown -R $USER:$USER output
chmod -R 755 output
```

### Step 4: Configure Apache

```bash
sudo nano /etc/apache2/sites-available/web2pdf.conf
```

Paste this configuration (change the ServerName to your server's IP or domain):

```apache
<VirtualHost *:80>
    ServerName 192.168.1.205
    DocumentRoot /var/www/web2pdf-refined-export/dist

    <Directory /var/www/web2pdf-refined-export/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA-Routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} !^/api/
        RewriteRule . /index.html [L]
    </Directory>

    # API-Proxy
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # CSP-Header with frame support
    Header set Content-Security-Policy "default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* https://gbssg.gitlab.io https://*.gitlab.io; font-src 'self' data:; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; frame-src 'self' http://localhost:3000 http://192.168.1.205:3000;"
    
    # Alias for PDF-Output
    Alias /output "/var/www/web2pdf-refined-export/server/output"
    <Directory "/var/www/web2pdf-refined-export/server/output">
        Require all granted
        Options Indexes FollowSymLinks
        AllowOverride None
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/web2pdf-frontend-error.log
    CustomLog ${APACHE_LOG_DIR}/web2pdf-frontend-access.log combined
</VirtualHost>
```

Then enable the site:

```bash
sudo a2dissite 000-default.conf
sudo a2ensite web2pdf.conf
sudo systemctl restart apache2
```

### Step 5: Start the Backend Service

```bash
cd /var/www/web2pdf-refined-export/server
pm2 start index.js --name "web2pdf-backend"
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save
```

### Step 6: Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/web2pdf-refined-export/dist
sudo chmod -R 755 /var/www/web2pdf-refined-export/dist
sudo chown -R www-data:www-data /var/www/web2pdf-refined-export/server/output
sudo chmod -R 755 /var/www/web2pdf-refined-export/server/output
```

### Step 7: Cloudflare Tunnel (Optional)

If you're using a Cloudflare Tunnel to expose your local server to the internet:

1. Configure the Cloudflare Tunnel to point domains to these endpoints:
   - `stiefelinho.ch` → `http://192.168.1.205`
   - `api.stiefelinho.ch` → `http://192.168.1.205/api`

### Maintenance and Troubleshooting

```bash
# Check Apache status
sudo systemctl status apache2

# View Apache logs
tail -f /var/log/apache2/web2pdf-frontend-error.log

# Check backend service status
pm2 status

# View backend logs
pm2 logs web2pdf-backend

# Update code from repository
cd /var/www/web2pdf-refined-export
git pull
npm install
npm run build

# Restart backend after updates
cd server
pm2 restart web2pdf-backend
```

### Important Security Notes

1. The application requires proper JWT token authentication.
2. Make sure to set secure values for environment variables.
3. Consider implementing HTTPS for production use.
4. Regularly update system packages and dependencies.
