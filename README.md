# Triko Pharmaceutical Sales Dashboard

A modern, responsive sales dashboard for tracking and managing sales data with Google Sheets integration.

## Features

- **Modern UI/UX**: Professional design with gradient backgrounds and smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Real-time Stats**: Live updating statistics for total boxes sold, weekly performance, and entry counts
- **Data Entry Form**: Easy-to-use form with validation for entering sales data
- **Google Sheets Integration**: Automatic synchronization with Google Sheets for data storage
- **Local Storage Backup**: Fallback storage when Google Sheets is unavailable
- **Data Visualization**: Clean table display with category badges and action buttons
- **Export Functionality**: CSV export capability for data analysis

## File Structure

```
sales-dashboard/
├── index.html              # Main dashboard page
├── styles.css              # Stylesheet with modern design
├── script.js               # Frontend JavaScript (standalone version)
├── script-with-backend.js   # Frontend JavaScript (with backend integration)
├── backend.py              # Flask backend for Google Sheets integration
├── requirements.txt        # Python dependencies
├── logo.png                # Organization logo
├── google-sheets-setup.md  # Google Sheets setup instructions
└── README.md               # This documentation
```

## Quick Start

### Option 1: Standalone Frontend (No Backend Required)

1. **Open the dashboard**:
   ```bash
   # Simply open index.html in your web browser
   open index.html
   # or double-click the file
   ```

2. **Replace the JavaScript file**:
   - Rename `script.js` to `script-standalone.js`
   - Rename `script-with-backend.js` to `script.js`
   - This version uses local storage only

### Option 2: Full Setup with Google Sheets Integration

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up Google Sheets** (see `google-sheets-setup.md` for detailed instructions):
   - Create a Google Cloud project
   - Enable Google Sheets API
   - Create service account credentials
   - Download `credentials.json` file
   - Create and share a Google Sheet

3. **Configure the backend**:
   ```bash
   # Edit backend.py and update:
   SHEET_ID = 'your_actual_google_sheet_id'
   ```

4. **Start the backend server**:
   ```bash
   python backend.py
   ```

5. **Open the dashboard**:
   - Navigate to `http://localhost:5000` in your web browser

## Dashboard Components

### Header Section
- **Organization Logo**: Displays the Triko Pharmaceutical logo
- **Company Name**: "Triko Pharmaceutical"
- **Subtitle**: "Sales Dashboard"
- **User Welcome**: Shows current employee name

### Statistics Cards
- **Total Boxes Sold**: Cumulative count of all boxes sold
- **This Week**: Boxes sold in the current week
- **Entries Made**: Total number of data entries

### Data Entry Form
- **Employee Name**: Name of the sales person (default: Johny)
- **Number of Boxes Sold**: Numeric input for weekly sales count
- **Category**: Dropdown selection (A, B, C)
- **Week Ending Date**: Date picker for the week ending
- **Remarks**: Optional text area for additional notes

### Recent Entries Table
- Displays the last 10 sales entries
- Shows date, employee, boxes sold, category, and remarks
- Includes edit and delete action buttons
- Color-coded category badges

## Google Sheets Integration

### Sheet Structure
Your Google Sheet should have the following columns:
1. **Timestamp** (A): Automatic timestamp when data is entered
2. **Employee Name** (B): Name of the sales person
3. **Boxes Sold** (C): Number of boxes sold
4. **Category** (D): Product category (A, B, or C)
5. **Week Date** (E): Week ending date
6. **Remarks** (F): Additional notes

### API Configuration
The dashboard supports two integration methods:

1. **Service Account** (Recommended for production):
   - More secure
   - No user authentication required
   - Suitable for server deployment

2. **API Key** (Simple setup):
   - Requires public sheet access
   - Good for testing and development

## Customization

### Branding
- Replace `logo.png` with your organization's logo
- Update company name in `index.html`
- Modify color scheme in `styles.css`

### Categories
To change product categories, update both:
1. HTML options in `index.html`
2. Category validation in `script.js`

### Styling
The dashboard uses CSS custom properties for easy theming:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #48bb78;
  --error-color: #f56565;
}
```

## Deployment Options

### 1. Static Hosting (Frontend Only)
- Upload HTML, CSS, JS, and logo files to any web server
- Works with GitHub Pages, Netlify, Vercel, etc.
- Uses local storage for data persistence

### 2. Full-Stack Deployment
- Deploy Flask backend to platforms like Heroku, Railway, or DigitalOcean
- Host frontend files on CDN or same server
- Configure environment variables for production

### 3. Local Network
- Run the Flask server on a local machine
- Access dashboard from any device on the same network
- Perfect for small teams or office environments

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Responsive design works on all modern mobile browsers

## Security Considerations

1. **Credentials**: Never commit `credentials.json` to version control
2. **HTTPS**: Use HTTPS in production for secure data transmission
3. **Access Control**: Implement user authentication for production use
4. **Data Validation**: All inputs are validated on both client and server side

## Troubleshooting

### Common Issues

1. **Google Sheets API errors**:
   - Check if the API is enabled
   - Verify service account has access to the sheet
   - Ensure Sheet ID is correct

2. **Backend connection issues**:
   - Verify Flask server is running
   - Check firewall settings
   - Update API base URL in frontend

3. **Styling issues**:
   - Clear browser cache
   - Check for CSS file loading errors
   - Verify font and icon CDN availability

### Debug Mode
Enable debug mode in the backend:
```python
app.run(host='0.0.0.0', port=5000, debug=True)
```

## Support

For technical support or feature requests:
1. Check the troubleshooting section
2. Review Google Sheets setup documentation
3. Verify all dependencies are installed correctly

## License

This project is created for Triko Pharmaceutical internal use. All rights reserved.

---

**Version**: 1.0  
**Last Updated**: July 2025  
**Created by**: Manus AI Assistant

