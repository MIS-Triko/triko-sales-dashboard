from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import logging

# Google Sheets API imports
try:
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
    GOOGLE_SHEETS_AVAILABLE = True
except ImportError:
    GOOGLE_SHEETS_AVAILABLE = False
    print("Google Sheets API not available. Install with: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
SHEET_ID = os.getenv('GOOGLE_SHEET_ID', 'your_sheet_id_here')
CREDENTIALS_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleSheetsService:
    def __init__(self):
        self.service = None
        self.setup_service()
    
    def setup_service(self):
        """Initialize Google Sheets service"""
        if not GOOGLE_SHEETS_AVAILABLE:
            logger.warning("Google Sheets API not available")
            return
            
        if not os.path.exists(CREDENTIALS_FILE):
            logger.warning(f"Credentials file {CREDENTIALS_FILE} not found")
            return
            
        try:
            credentials = Credentials.from_service_account_file(
                CREDENTIALS_FILE, scopes=SCOPES
            )
            self.service = build('sheets', 'v4', credentials=credentials)
            logger.info("Google Sheets service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Google Sheets service: {e}")
    
    def append_row(self, values):
        """Append a row to the Google Sheet"""
        if not self.service:
            raise Exception("Google Sheets service not available")
        
        try:
            body = {
                'values': [values]
            }
            
            result = self.service.spreadsheets().values().append(
                spreadsheetId=SHEET_ID,
                range='Sheet1!A:F',  # Adjust range as needed
                valueInputOption='RAW',
                body=body
            ).execute()
            
            logger.info(f"Row appended successfully: {result.get('updates', {}).get('updatedRows', 0)} rows updated")
            return result
            
        except Exception as e:
            logger.error(f"Failed to append row: {e}")
            raise
    
    def get_all_data(self):
        """Get all data from the Google Sheet"""
        if not self.service:
            raise Exception("Google Sheets service not available")
        
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='Sheet1!A:F'  # Adjust range as needed
            ).execute()
            
            values = result.get('values', [])
            logger.info(f"Retrieved {len(values)} rows from Google Sheets")
            return values
            
        except Exception as e:
            logger.error(f"Failed to get data: {e}")
            raise

# Initialize Google Sheets service
sheets_service = GoogleSheetsService()

@app.route('/')
def index():
    """Serve the main dashboard page"""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sales Dashboard API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .method { color: #007bff; font-weight: bold; }
        </style>
    </head>
    <body>
        <h1>Sales Dashboard API</h1>
        <p>Backend service for the Triko Pharmaceutical Sales Dashboard</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
            <span class="method">POST</span> /api/sales
            <br>Submit new sales entry
        </div>
        
        <div class="endpoint">
            <span class="method">GET</span> /api/sales
            <br>Get all sales entries
        </div>
        
        <div class="endpoint">
            <span class="method">GET</span> /api/health
            <br>Check service health
        </div>
        
        <h2>Setup Instructions:</h2>
        <ol>
            <li>Place your Google Sheets credentials.json file in the same directory as this script</li>
            <li>Set the GOOGLE_SHEET_ID environment variable or update the SHEET_ID in the code</li>
            <li>Install required packages: pip install flask flask-cors google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client</li>
            <li>Run the server: python backend.py</li>
        </ol>
    </body>
    </html>
    '''

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    status = {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'google_sheets_available': GOOGLE_SHEETS_AVAILABLE,
        'credentials_file_exists': os.path.exists(CREDENTIALS_FILE),
        'service_initialized': sheets_service.service is not None
    }
    return jsonify(status)

@app.route('/api/sales', methods=['POST'])
def submit_sales_entry():
    """Submit a new sales entry"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['employeeName', 'boxesSold', 'category', 'weekDate']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Prepare data for Google Sheets
        timestamp = datetime.now().isoformat()
        row_data = [
            timestamp,
            data['employeeName'],
            int(data['boxesSold']),
            data['category'],
            data['weekDate'],
            data.get('remarks', '')
        ]
        
        # Try to append to Google Sheets
        try:
            if sheets_service.service:
                result = sheets_service.append_row(row_data)
                logger.info("Data successfully saved to Google Sheets")
                return jsonify({
                    'success': True,
                    'message': 'Sales entry saved successfully',
                    'timestamp': timestamp,
                    'sheets_result': result.get('updates', {})
                })
            else:
                # Fallback: save to local file if Google Sheets not available
                save_to_local_file(data, timestamp)
                return jsonify({
                    'success': True,
                    'message': 'Sales entry saved locally (Google Sheets not configured)',
                    'timestamp': timestamp
                })
                
        except Exception as e:
            logger.error(f"Failed to save to Google Sheets: {e}")
            # Fallback: save to local file
            save_to_local_file(data, timestamp)
            return jsonify({
                'success': True,
                'message': 'Sales entry saved locally (Google Sheets error)',
                'timestamp': timestamp,
                'warning': str(e)
            })
            
    except Exception as e:
        logger.error(f"Error processing sales entry: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sales', methods=['GET'])
def get_sales_entries():
    """Get all sales entries"""
    try:
        # Try to get data from Google Sheets first
        if sheets_service.service:
            try:
                data = sheets_service.get_all_data()
                if data:
                    # Convert to JSON format
                    headers = data[0] if data else []
                    entries = []
                    for row in data[1:]:  # Skip header row
                        if len(row) >= 6:  # Ensure row has enough columns
                            entry = {
                                'timestamp': row[0],
                                'employeeName': row[1],
                                'boxesSold': int(row[2]) if row[2].isdigit() else 0,
                                'category': row[3],
                                'weekDate': row[4],
                                'remarks': row[5] if len(row) > 5 else ''
                            }
                            entries.append(entry)
                    
                    return jsonify({
                        'success': True,
                        'data': entries,
                        'source': 'google_sheets'
                    })
            except Exception as e:
                logger.error(f"Failed to get data from Google Sheets: {e}")
        
        # Fallback: get data from local file
        local_data = get_from_local_file()
        return jsonify({
            'success': True,
            'data': local_data,
            'source': 'local_file'
        })
        
    except Exception as e:
        logger.error(f"Error getting sales entries: {e}")
        return jsonify({'error': str(e)}), 500

def save_to_local_file(data, timestamp):
    """Save data to local JSON file as backup"""
    try:
        filename = 'sales_data_backup.json'
        
        # Load existing data
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                existing_data = json.load(f)
        else:
            existing_data = []
        
        # Add new entry
        entry = {
            'timestamp': timestamp,
            'employeeName': data['employeeName'],
            'boxesSold': int(data['boxesSold']),
            'category': data['category'],
            'weekDate': data['weekDate'],
            'remarks': data.get('remarks', '')
        }
        existing_data.insert(0, entry)  # Add to beginning
        
        # Keep only last 100 entries
        existing_data = existing_data[:100]
        
        # Save back to file
        with open(filename, 'w') as f:
            json.dump(existing_data, f, indent=2)
            
        logger.info(f"Data saved to local file: {filename}")
        
    except Exception as e:
        logger.error(f"Failed to save to local file: {e}")

def get_from_local_file():
    """Get data from local JSON file"""
    try:
        filename = 'sales_data_backup.json'
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                return json.load(f)
        return []
    except Exception as e:
        logger.error(f"Failed to read from local file: {e}")
        return []

if __name__ == '__main__':
    print("Starting Sales Dashboard Backend...")
    print(f"Google Sheets API Available: {GOOGLE_SHEETS_AVAILABLE}")
    print(f"Credentials file exists: {os.path.exists(CREDENTIALS_FILE)}")
    print(f"Sheet ID: {SHEET_ID}")
    print("\nServer starting on http://0.0.0.0:5000")
    print("Access the dashboard at: http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

