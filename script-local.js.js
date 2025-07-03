// Sales Dashboard JavaScript
class SalesDashboard {
    constructor() {
        this.salesData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.loadSalesData();
        this.updateStats();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('salesForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadSalesData();
        });

        // Employee name sync
        document.getElementById('employeeNameInput').addEventListener('input', (e) => {
            document.getElementById('employeeName').textContent = e.target.value || 'Employee';
        });

        // Form reset
        document.getElementById('salesForm').addEventListener('reset', () => {
            setTimeout(() => {
                this.setDefaultDate();
                document.getElementById('employeeName').textContent = 'Johny';
            }, 100);
        });
    }

    setDefaultDate() {
        const today = new Date();
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + (6 - today.getDay())); // Next Saturday
        document.getElementById('weekDate').value = weekEnd.toISOString().split('T')[0];
    }

    async handleFormSubmission() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        this.showLoading(true);

        try {
            // Add to local storage first
            this.addToLocalStorage(formData);
            
            // Try to send to Google Sheets
            await this.sendToGoogleSheets(formData);
            
            // Update UI
            this.updateTable();
            this.updateStats();
            this.clearForm();
            this.showMessage('Sales entry saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving data:', error);
            this.showMessage('Error saving data. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    getFormData() {
        return {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            employeeName: document.getElementById('employeeNameInput').value,
            boxesSold: parseInt(document.getElementById('boxesSold').value),
            category: document.getElementById('category').value,
            weekDate: document.getElementById('weekDate').value,
            remarks: document.getElementById('remarks').value
        };
    }

    validateFormData(data) {
        if (!data.employeeName.trim()) {
            this.showMessage('Please enter employee name', 'error');
            return false;
        }
        if (!data.boxesSold || data.boxesSold < 0) {
            this.showMessage('Please enter a valid number of boxes sold', 'error');
            return false;
        }
        if (!data.category) {
            this.showMessage('Please select a category', 'error');
            return false;
        }
        if (!data.weekDate) {
            this.showMessage('Please select a week ending date', 'error');
            return false;
        }
        return true;
    }

    addToLocalStorage(data) {
        let salesData = JSON.parse(localStorage.getItem('salesData') || '[]');
        salesData.unshift(data); // Add to beginning
        localStorage.setItem('salesData', JSON.stringify(salesData));
        this.salesData = salesData;
    }

    async sendToGoogleSheets(data) {
        // Google Sheets API configuration
        const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace with actual sheet ID
        const API_KEY = 'YOUR_API_KEY'; // Replace with actual API key
        const RANGE = 'Sheet1!A:G'; // Adjust range as needed

        // For demonstration, we'll use a mock API call
        // In production, replace this with actual Google Sheets API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate API call
                if (Math.random() > 0.1) { // 90% success rate
                    resolve({ success: true });
                } else {
                    reject(new Error('API Error'));
                }
            }, 1000);
        });

        /* 
        // Actual Google Sheets API implementation would look like this:
        
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}:append?valueInputOption=RAW&key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [[
                    data.timestamp,
                    data.employeeName,
                    data.boxesSold,
                    data.category,
                    data.weekDate,
                    data.remarks
                ]]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save to Google Sheets');
        }

        return await response.json();
        */
    }

    loadSalesData() {
        this.salesData = JSON.parse(localStorage.getItem('salesData') || '[]');
        this.updateTable();
        this.updateStats();
    }

    updateTable() {
        const tbody = document.getElementById('salesTableBody');
        tbody.innerHTML = '';

        if (this.salesData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #718096;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        No sales entries found. Add your first entry above!
                    </td>
                </tr>
            `;
            return;
        }

        this.salesData.slice(0, 10).forEach(entry => { // Show last 10 entries
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(entry.weekDate)}</td>
                <td>${entry.employeeName}</td>
                <td><strong>${entry.boxesSold}</strong></td>
                <td><span class="category-badge category-${entry.category.toLowerCase()}">${entry.category}</span></td>
                <td>${entry.remarks || '-'}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="dashboard.editEntry('${entry.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="dashboard.deleteEntry('${entry.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateStats() {
        const totalBoxes = this.salesData.reduce((sum, entry) => sum + entry.boxesSold, 0);
        const totalEntries = this.salesData.length;
        
        // Calculate this week's sales
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyBoxes = this.salesData
            .filter(entry => new Date(entry.timestamp) >= oneWeekAgo)
            .reduce((sum, entry) => sum + entry.boxesSold, 0);

        document.getElementById('totalBoxes').textContent = totalBoxes.toLocaleString();
        document.getElementById('weeklyBoxes').textContent = weeklyBoxes.toLocaleString();
        document.getElementById('totalEntries').textContent = totalEntries.toLocaleString();

        // Animate numbers
        this.animateNumber('totalBoxes', totalBoxes);
        this.animateNumber('weeklyBoxes', weeklyBoxes);
        this.animateNumber('totalEntries', totalEntries);
    }

    animateNumber(elementId, finalValue) {
        const element = document.getElementById(elementId);
        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(startValue + (finalValue - startValue) * progress);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    editEntry(id) {
        const entry = this.salesData.find(e => e.id === id);
        if (!entry) return;

        // Populate form with entry data
        document.getElementById('employeeNameInput').value = entry.employeeName;
        document.getElementById('boxesSold').value = entry.boxesSold;
        document.getElementById('category').value = entry.category;
        document.getElementById('weekDate').value = entry.weekDate;
        document.getElementById('remarks').value = entry.remarks;

        // Remove the entry from data (will be re-added when form is submitted)
        this.deleteEntry(id, false);

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        this.showMessage('Entry loaded for editing', 'success');
    }

    deleteEntry(id, showConfirm = true) {
        if (showConfirm && !confirm('Are you sure you want to delete this entry?')) {
            return;
        }

        this.salesData = this.salesData.filter(entry => entry.id !== id);
        localStorage.setItem('salesData', JSON.stringify(this.salesData));
        
        this.updateTable();
        this.updateStats();
        
        if (showConfirm) {
            this.showMessage('Entry deleted successfully', 'success');
        }
    }

    clearForm() {
        document.getElementById('salesForm').reset();
        this.setDefaultDate();
        document.getElementById('employeeName').textContent = 'Johny';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }

    showMessage(text, type = 'success') {
        const container = document.getElementById('messageContainer');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        message.innerHTML = `
            <i class="${icon}"></i>
            <span>${text}</span>
        `;
        
        container.appendChild(message);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }

    // Export data to CSV
    exportToCSV() {
        if (this.salesData.length === 0) {
            this.showMessage('No data to export', 'error');
            return;
        }

        const headers = ['Date', 'Employee Name', 'Boxes Sold', 'Category', 'Week Date', 'Remarks'];
        const csvContent = [
            headers.join(','),
            ...this.salesData.map(entry => [
                entry.timestamp,
                entry.employeeName,
                entry.boxesSold,
                entry.category,
                entry.weekDate,
                `"${entry.remarks || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showMessage('Data exported successfully', 'success');
    }

    // Google Sheets Integration Setup Instructions
    setupGoogleSheets() {
        const instructions = `
        To connect this dashboard to Google Sheets:
        
        1. Go to Google Cloud Console (console.cloud.google.com)
        2. Create a new project or select existing one
        3. Enable Google Sheets API
        4. Create credentials (API Key)
        5. Create a Google Sheet with these columns:
           - Timestamp
           - Employee Name
           - Boxes Sold
           - Category
           - Week Date
           - Remarks
        6. Get the Sheet ID from the URL
        7. Replace 'YOUR_GOOGLE_SHEET_ID' and 'YOUR_API_KEY' in script.js
        8. Make the sheet publicly editable or use OAuth for authentication
        
        For detailed instructions, visit: https://developers.google.com/sheets/api/quickstart/js
        `;
        
        alert(instructions);
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new SalesDashboard();
});

// Add some sample data for demonstration
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is the first visit
    if (!localStorage.getItem('salesData')) {
        const sampleData = [
            {
                id: '1',
                timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                employeeName: 'Johny',
                boxesSold: 25,
                category: 'A',
                weekDate: '2025-07-05',
                remarks: 'Good week, met targets'
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                employeeName: 'Sarah',
                boxesSold: 18,
                category: 'B',
                weekDate: '2025-06-28',
                remarks: 'Steady performance'
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                employeeName: 'Mike',
                boxesSold: 32,
                category: 'A',
                weekDate: '2025-06-21',
                remarks: 'Exceeded expectations'
            }
        ];
        
        localStorage.setItem('salesData', JSON.stringify(sampleData));
    }
});

// Add CSS for category badges
const style = document.createElement('style');
style.textContent = `
    .category-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .category-a {
        background: rgba(72, 187, 120, 0.2);
        color: #2f855a;
    }
    
    .category-b {
        background: rgba(66, 153, 225, 0.2);
        color: #2c5282;
    }
    
    .category-c {
        background: rgba(237, 137, 54, 0.2);
        color: #c05621;
    }
`;
document.head.appendChild(style);

