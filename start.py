#!/usr/bin/env python3
"""
Triko Pharmaceutical Sales Dashboard - Quick Start Script
This script helps you get the sales dashboard running quickly.
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def print_banner():
    print("=" * 60)
    print("  TRIKO PHARMACEUTICAL SALES DASHBOARD")
    print("  Quick Start Setup")
    print("=" * 60)
    print()

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python {sys.version.split()[0]} detected")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    print("\n📦 Checking dependencies...")
    
    required_packages = [
        'flask',
        'flask-cors',
        'google-auth',
        'google-auth-oauthlib',
        'google-auth-httplib2',
        'google-api-python-client'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            missing_packages.append(package)
    
    return missing_packages

def install_dependencies(missing_packages):
    """Install missing dependencies"""
    if not missing_packages:
        return True
    
    print(f"\n🔧 Installing {len(missing_packages)} missing packages...")
    
    try:
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
        ])
        print("✅ All dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        print("   Please run: pip install -r requirements.txt")
        return False

def check_google_sheets_setup():
    """Check if Google Sheets is configured"""
    print("\n🔍 Checking Google Sheets configuration...")
    
    credentials_file = Path('credentials.json')
    if credentials_file.exists():
        print("✅ credentials.json found")
        return True
    else:
        print("⚠️  credentials.json not found")
        print("   Google Sheets integration will not work")
        print("   See google-sheets-setup.md for instructions")
        return False

def get_user_choice():
    """Get user's preferred startup mode"""
    print("\n🚀 Choose startup mode:")
    print("1. Frontend Only (Local Storage)")
    print("2. Full Stack (with Google Sheets)")
    print("3. Exit")
    
    while True:
        choice = input("\nEnter your choice (1-3): ").strip()
        if choice in ['1', '2', '3']:
            return choice
        print("Please enter 1, 2, or 3")

def start_frontend_only():
    """Start frontend-only version"""
    print("\n🌐 Starting frontend-only version...")
    
    # Check if index.html exists
    if not Path('index.html').exists():
        print("❌ index.html not found")
        return False
    
    # Try to open in browser
    try:
        file_path = Path('index.html').absolute()
        webbrowser.open(f'file://{file_path}')
        print("✅ Dashboard opened in your default browser")
        print("📝 Data will be stored in browser local storage")
        return True
    except Exception as e:
        print(f"❌ Failed to open browser: {e}")
        print(f"   Please manually open: file://{Path('index.html').absolute()}")
        return False

def start_full_stack():
    """Start full-stack version with backend"""
    print("\n🖥️  Starting full-stack version...")
    
    # Check if backend.py exists
    if not Path('backend.py').exists():
        print("❌ backend.py not found")
        return False
    
    print("🔄 Starting Flask backend server...")
    print("   Server will start on http://localhost:5000")
    print("   Press Ctrl+C to stop the server")
    print()
    
    try:
        # Start the backend server
        subprocess.run([sys.executable, 'backend.py'])
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False
    
    return True

def main():
    """Main function"""
    print_banner()
    
    # Check Python version
    if not check_python_version():
        return
    
    # Check dependencies
    missing_packages = check_dependencies()
    
    # Install missing dependencies if needed
    if missing_packages:
        install_choice = input(f"\n📥 Install missing packages? (y/n): ").strip().lower()
        if install_choice == 'y':
            if not install_dependencies(missing_packages):
                return
        else:
            print("⚠️  Some features may not work without dependencies")
    
    # Check Google Sheets setup
    google_sheets_available = check_google_sheets_setup()
    
    # Get user choice
    choice = get_user_choice()
    
    if choice == '1':
        start_frontend_only()
    elif choice == '2':
        if not google_sheets_available:
            print("⚠️  Google Sheets not configured, but starting anyway...")
            print("   Dashboard will use local storage as fallback")
        start_full_stack()
    else:
        print("👋 Goodbye!")

if __name__ == '__main__':
    main()

