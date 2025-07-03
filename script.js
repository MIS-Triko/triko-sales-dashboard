// Sales Dashboard JavaScript with Backend Integration
class SalesDashboard {
    constructor() {
        this.salesData = [];
        this.apiBaseUrl = 'https://script.google.com/macros/s/AKfycbxiyWluKmhoA03jJ3p8Y6-6JzAp_76sun_8MQgx0uAWbam0Ehpr6iA9Lzlnu8BCd17IdQ/exec'; // Change this to your backend URL
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.loadSalesData();
        this.updateStats();
        this.checkBackendHealth();
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

    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const health = await response.json();
            
            if (health.status === 'healthy') {
                this.showMessage('Backend connected successfully', 'success');
                console.log('Backend health:', health);
            } else {
                this.showMessage('Backend health check failed', 'error');
            }
        } catch (error) {
            console.error('Backend health check failed:', error);
            this.showMessage('Backend not available - using local storage', 'error');
        }
    }

    async handleFormSubmission() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        this.showLoading(true);

        try {
            // Try to send to backend first
            const success = await this.sendToBackend(formData);
            
            if (success) {
                // If backend successful, also update local storage for immediate UI update
                this.addToLocalStorage(formData);
            } else {
                // Fallback to local storage only
                this.addToLocalStorage(formData);
                this.showMessage('Saved locally - backend not available', 'success');
            }
            
            // Update UI
            this.updateTable();
            this.updateStats();
            this.clearForm();
            
        } catch (error) {
            console.error('Error saving data:', error);
            // Fallback to local storage
            this.addToLocalStorage(formData);
            this.updateTable();
            this.updateStats();
            this.clearForm();
            this.showMessage('Saved locally - backend error', 'error');
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

    async sendToBackend(data) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/sales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showMessage(result.message || 'Sales entry saved successfully!', 'success');
                return true;
            } else {
                console.error('Backend error:', result);
                return false;
            }
        } catch (error) {
            console.error('Network error:', error);
            return false;
        }
    }

    addToLocalStorage(data) {
        let salesData = JSON.parse(localStorage.getItem('salesData') || '[]');
        salesData.unshift(data); // Add to beginning
        // Keep only last 50 entries in local storage
        salesData = salesData.slice(0, 50);
        localStorage.setItem('salesData', JSON.stringify(salesData));
        this.salesData = salesData;
    }

    async loadSalesData() {
        this.showLoading(true);
        
        try {
            // Try to load from backend first
            const backendData = await this.loadFromBackend();
            
            if (backendData && backendData.length > 0) {
                this.salesData = backendData;
                this.showMessage('Data loaded from server', 'success');
            } else {
                // Fallback to local storage
                this.salesData = JSON.parse(localStorage.getItem('salesData') || '[]');
                if (this.salesData.length === 0) {
                    this.loadSampleData();
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to local storage
            this.salesData = JSON.parse(localStorage.getItem('salesData') || '[]');
            if (this.salesData.length === 0) {
                this.loadSampleData();
            }
        } finally {
            this.updateTable();
            this.updateStats();
            this.showLoading(false);
        }
    }

    async loadFromBackend() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/sales`);
            const result = await response.json();

            if (response.ok && result.success) {
                console.log(`Data loaded from ${result.source}`);
                return result.data || [];
            } else {
                console.error('Backend error:', result);
                return null;
            }
        } catch (error) {
            console.error('Network error:', error);
            return null;
        }
    }

    loadSampleData() {
        const sampleData = [
            {
                id: '1',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                employeeName: 'Johny',
                boxesSold: 25,
                category: 'A',
                weekDate: '2025-07-05',
                remarks: 'Good week, met targets'
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                employeeName: 'Sarah',
                boxesSold: 18,
                category: 'B',
                weekDate: '2025-06-28',
                remarks: 'Steady performance'
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 259200000).toISOString(),
                employeeName: 'Mike',
                boxesSold: 32,
                category: 'A',
                weekDate: '2025-06-21',
                remarks: 'Exceeded expectations'
            }
        ];
        
        this.salesData = sampleData;
        localStorage.setItem('salesData', JSON.stringify(sampleData));
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

        this.salesData.slice(0, 10).forEach(entry => {
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
        const totalBoxes = this.salesData.reduce((sum, entry) => sum + (entry.boxesSold || 0), 0);
        const totalEntries = this.salesData.length;
        
        // Calculate this week's sales
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyBoxes = this.salesData
            .filter(entry => new Date(entry.timestamp) >= oneWeekAgo)
            .reduce((sum, entry) => sum + (entry.boxesSold || 0), 0);

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

        // Remove the entry from local data (will be re-added when form is submitted)
        this.deleteEntry(id, false);

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        this.showMessage('Entry loaded for editing', 'success');
    }

    deleteEntry(id, showConfirm = true) {
        if (showConfirm && !confirm('Are you sure you want to delete this entry?')) {
            return;
        }

        // Remove from local storage
        this.salesData = this.salesData.filter(entry => entry.id !== id);
        localStorage.setItem('salesData', JSON.stringify(this.salesData));
        
        this.updateTable();
        this.updateStats();
        
        if (showConfirm) {
            this.showMessage('Entry deleted from local storage', 'success');
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

    // Sync local data with backend
    async syncWithBackend() {
        this.showLoading(true);
        
        try {
            const localData = JSON.parse(localStorage.getItem('salesData') || '[]');
            
            for (const entry of localData) {
                await this.sendToBackend(entry);
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
            }
            
            this.showMessage('Local data synced with backend', 'success');
            this.loadSalesData(); // Reload from backend
            
        } catch (error) {
            console.error('Sync error:', error);
            this.showMessage('Sync failed - check backend connection', 'error');
        } finally {
            this.showLoading(false);
        }
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new SalesDashboard();
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

