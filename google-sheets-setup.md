# Google Sheets Integration Setup Guide

## Prerequisites
1. Google account
2. Google Cloud Console access
3. Basic understanding of APIs

## Step-by-Step Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Sales Dashboard"
4. Click "Create"

### 2. Enable Google Sheets API
1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 3. Create Service Account (Recommended for server-side access)
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Enter service account name: "sales-dashboard-service"
4. Click "Create and Continue"
5. Skip role assignment for now (click "Continue")
6. Click "Done"

### 4. Generate Service Account Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Click "Create" - this downloads the credentials file
6. Save this file as `credentials.json` in your project folder

### 5. Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Sales Dashboard Data"
4. Set up columns in row 1:
   - A1: Timestamp
   - B1: Employee Name
   - C1: Boxes Sold
   - D1: Category
   - E1: Week Date
   - F1: Remarks

### 6. Share Sheet with Service Account
1. Copy the service account email from the credentials.json file (client_email field)
2. In your Google Sheet, click "Share"
3. Paste the service account email
4. Set permission to "Editor"
5. Uncheck "Notify people"
6. Click "Share"

### 7. Get Sheet ID
1. From your Google Sheet URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
2. Copy the SHEET_ID part
3. Update the configuration in your application

## Configuration Files

### For JavaScript Frontend (Client-side)
```javascript
// Replace these values in script.js
const SHEET_ID = 'your_actual_sheet_id_here';
const API_KEY = 'your_api_key_here'; // If using API key method
```

### For Python Backend (Server-side)
```python
# credentials.json should be in your project root
SHEET_ID = 'your_actual_sheet_id_here'
CREDENTIALS_FILE = 'credentials.json'
```

## Security Notes
- Never commit credentials.json to version control
- For production, use environment variables
- Consider using OAuth 2.0 for user-specific access
- Service accounts are best for server-side applications

## Testing the Integration
1. Run your application
2. Submit a test entry through the dashboard
3. Check your Google Sheet to verify data appears
4. Monitor browser console for any API errors

## Troubleshooting
- **403 Forbidden**: Check if the service account has access to the sheet
- **404 Not Found**: Verify the Sheet ID is correct
- **API Key errors**: Ensure the API is enabled and key is valid
- **CORS errors**: Use server-side integration instead of client-side

## Alternative: Using Google Apps Script
For a simpler setup without backend server:
1. Create a Google Apps Script project
2. Deploy as web app
3. Use the web app URL as your API endpoint
4. Handle CORS in the Apps Script

This method requires less setup but has some limitations in terms of customization and control.

