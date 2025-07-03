# Deployment Guide - Triko Pharmaceutical Sales Dashboard

This guide provides step-by-step instructions for deploying the sales dashboard in different environments.

## Deployment Options

### 1. Quick Start (Local Development)

**For immediate testing without Google Sheets:**

1. Download all files to a folder
2. Open `index.html` in your web browser
3. The dashboard will work with local storage only

**For full functionality with Google Sheets:**

1. Install Python and pip
2. Run: `pip install -r requirements.txt`
3. Follow Google Sheets setup (see `google-sheets-setup.md`)
4. Run: `python backend.py`
5. Open: `http://localhost:5000`

### 2. Production Deployment

#### Option A: Static Website (Frontend Only)

**Best for**: Simple deployment without backend requirements

**Steps**:
1. Upload these files to your web server:
   - `index.html`
   - `styles.css`
   - `script.js` (rename from `script-with-backend.js` if needed)
   - `logo.png`

2. Configure your web server to serve `index.html` as the default page

3. Data will be stored in browser local storage

**Hosting Platforms**:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web hosting service

#### Option B: Full-Stack Deployment

**Best for**: Production use with Google Sheets integration

**Platform: Heroku**
1. Create a new Heroku app
2. Add Python buildpack
3. Upload all files including `backend.py` and `requirements.txt`
4. Set environment variables:
   ```
   GOOGLE_SHEET_ID=your_sheet_id
   ```
5. Upload `credentials.json` securely (use Heroku config vars for JSON content)
6. Deploy the application

**Platform: Railway**
1. Connect your GitHub repository
2. Railway will auto-detect Python app
3. Set environment variables in Railway dashboard
4. Deploy automatically

**Platform: DigitalOcean App Platform**
1. Create new app from GitHub
2. Configure Python environment
3. Set environment variables
4. Deploy with automatic scaling

#### Option C: Self-Hosted Server

**Requirements**:
- Ubuntu/CentOS server
- Python 3.8+
- Nginx (recommended)
- SSL certificate (Let's Encrypt)

**Setup Steps**:

1. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip nginx
   pip3 install -r requirements.txt
   ```

2. **Configure application**:
   ```bash
   # Create app directory
   sudo mkdir /var/www/sales-dashboard
   sudo cp -r * /var/www/sales-dashboard/
   
   # Set permissions
   sudo chown -R www-data:www-data /var/www/sales-dashboard
   ```

3. **Create systemd service**:
   ```bash
   sudo nano /etc/systemd/system/sales-dashboard.service
   ```
   
   Add content:
   ```ini
   [Unit]
   Description=Sales Dashboard Flask App
   After=network.target
   
   [Service]
   User=www-data
   WorkingDirectory=/var/www/sales-dashboard
   ExecStart=/usr/bin/python3 backend.py
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

4. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/sales-dashboard
   ```
   
   Add content:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. **Enable and start services**:
   ```bash
   sudo systemctl enable sales-dashboard
   sudo systemctl start sales-dashboard
   sudo ln -s /etc/nginx/sites-available/sales-dashboard /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

### 3. Docker Deployment

**Create Dockerfile**:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "backend.py"]
```

**Build and run**:
```bash
docker build -t sales-dashboard .
docker run -p 5000:5000 -e GOOGLE_SHEET_ID=your_sheet_id sales-dashboard
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  sales-dashboard:
    build: .
    ports:
      - "5000:5000"
    environment:
      - GOOGLE_SHEET_ID=your_sheet_id
    volumes:
      - ./credentials.json:/app/credentials.json
```

## Environment Configuration

### Environment Variables

For production deployment, set these environment variables:

```bash
# Required
GOOGLE_SHEET_ID=your_google_sheet_id

# Optional
FLASK_ENV=production
PORT=5000
```

### Security Configuration

1. **HTTPS**: Always use HTTPS in production
2. **CORS**: Configure CORS for your domain only
3. **Credentials**: Use environment variables, not files
4. **Firewall**: Restrict access to necessary ports only

### Performance Optimization

1. **CDN**: Use CDN for static assets
2. **Caching**: Enable browser caching for CSS/JS
3. **Compression**: Enable gzip compression
4. **Monitoring**: Set up application monitoring

## Testing Deployment

### Pre-deployment Checklist

- [ ] All files are present
- [ ] Google Sheets credentials are configured
- [ ] Environment variables are set
- [ ] Dependencies are installed
- [ ] Application starts without errors
- [ ] Form submission works
- [ ] Data appears in Google Sheets
- [ ] Responsive design works on mobile

### Testing Steps

1. **Functionality Test**:
   - Open the dashboard
   - Fill out the form completely
   - Submit the entry
   - Verify data appears in table
   - Check Google Sheets for new row

2. **Responsive Test**:
   - Test on desktop browser
   - Test on tablet (iPad)
   - Test on mobile phone
   - Verify all elements are accessible

3. **Performance Test**:
   - Check page load time
   - Test form submission speed
   - Verify Google Sheets sync time

## Maintenance

### Regular Tasks

1. **Monitor logs** for errors
2. **Update dependencies** monthly
3. **Backup Google Sheets** data
4. **Check SSL certificate** expiration
5. **Monitor server resources**

### Troubleshooting

**Common Issues**:

1. **500 Internal Server Error**:
   - Check application logs
   - Verify Google Sheets credentials
   - Ensure all dependencies are installed

2. **CORS Errors**:
   - Update CORS configuration in backend
   - Check domain whitelist

3. **Google Sheets API Errors**:
   - Verify API quotas
   - Check service account permissions
   - Ensure Sheet ID is correct

### Backup Strategy

1. **Code Backup**: Use Git repository
2. **Data Backup**: Regular Google Sheets exports
3. **Configuration Backup**: Document all environment variables
4. **Database Backup**: If using additional database

## Scaling Considerations

### For High Traffic

1. **Load Balancer**: Use multiple server instances
2. **Database**: Consider dedicated database for high volume
3. **Caching**: Implement Redis for session management
4. **CDN**: Use CDN for global distribution

### For Multiple Teams

1. **Multi-tenancy**: Add team/department filtering
2. **User Authentication**: Implement login system
3. **Role-based Access**: Different permissions for users
4. **Data Segregation**: Separate sheets per team

---

**Need Help?**
- Review the main README.md for basic setup
- Check google-sheets-setup.md for API configuration
- Test locally before production deployment

