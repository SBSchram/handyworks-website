// Admin Dashboard JavaScript
// Handles Firebase authentication, Firestore queries, and user display

(function() {
    'use strict';
    
    // Wait for config and Firebase to be available
    if (typeof window.HandyWorksConfig === 'undefined') {
        console.error('HandyWorksConfig not found');
        showError('Configuration error. Please refresh the page.');
        return;
    }
    
    // Initialize Firebase
    const config = window.HandyWorksConfig.firebase;
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
    
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // State
    let allUsers = [];
    let filteredUsers = [];
    
    // DOM Elements
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const usersTable = document.getElementById('usersTable');
    const usersTableBody = document.getElementById('usersTableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const userStatusFilter = document.getElementById('userStatusFilter');
    const logoutButton = document.getElementById('logoutButton');
    const generateBillButton = document.getElementById('generateBillButton');
    const exportButton = document.getElementById('exportButton');
    
    // Stats elements
    const totalUsersEl = document.getElementById('totalUsers');
    const paidCountEl = document.getElementById('paidCount');
    const pendingCountEl = document.getElementById('pendingCount');
    const overdueCountEl = document.getElementById('overdueCount');
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // Not logged in, redirect to login
            window.location.href = 'admin-login.html';
        } else {
            // Logged in, load users
            loadUsers();
        }
    });
    
    // Logout handler
    logoutButton.addEventListener('click', async () => {
        try {
            await auth.signOut();
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error('Logout error:', error);
            showError('Logout failed. Please try again.');
        }
    });
    
    // Search and filter handlers
    searchInput.addEventListener('input', filterUsers);
    statusFilter.addEventListener('change', filterUsers);
    userStatusFilter.addEventListener('change', filterUsers);
    
    // Generate bill handler (placeholder for now)
    generateBillButton.addEventListener('click', () => {
        alert('Generate Bill functionality will be implemented in Phase 2 (Stripe Payment Links)');
    });
    
    // Export handler
    exportButton.addEventListener('click', exportToCSV);
    
    // Load users from Firestore
    async function loadUsers() {
        try {
            showLoading();
            hideError();
            
            const usersSnapshot = await db.collection('handyworks_users').get();
            
            allUsers = usersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    acct_num: data.acct_num || '',
                    fname: data.fname || '',
                    lname: data.lname || '',
                    email: data.EMAIL || '',
                    clinic: data.clinic || '',
                    status: data.status || '',
                    maint_billed: data.maint_billed || 0,
                    maint_paid: data.maint_paid || 0,
                    owed: data.owed || 0,
                    maintbilldt: data.maintbilldt || null,
                    maintpddt: data.maintpddt || null
                };
            });
            
            // Calculate payment status for each user
            allUsers.forEach(user => {
                user.paymentStatus = calculatePaymentStatus(user);
            });
            
            // Update stats
            updateStats();
            
            // Apply filters and display
            filterUsers();
            
        } catch (error) {
            console.error('Error loading users:', error);
            showError('Failed to load users. Please refresh the page.');
        } finally {
            hideLoading();
        }
    }
    
    // Calculate payment status
    function calculatePaymentStatus(user) {
        const owed = user.owed || 0;
        const maint_billed = user.maint_billed || 0;
        const maint_paid = user.maint_paid || 0;
        
        if (owed <= 0 && maint_paid >= maint_billed) {
            return 'paid';
        } else if (owed > 0) {
            // Check if overdue (more than 30 days since bill date)
            if (user.maintbilldt) {
                const billDate = user.maintbilldt.toDate ? user.maintbilldt.toDate() : new Date(user.maintbilldt);
                const daysSinceBill = Math.floor((new Date() - billDate) / (1000 * 60 * 60 * 24));
                if (daysSinceBill > 30) {
                    return 'overdue';
                }
            }
            return 'pending';
        } else {
            return 'pending';
        }
    }
    
    // Filter users based on search and filters
    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusFilterValue = statusFilter.value;
        const userStatusFilterValue = userStatusFilter.value;
        
        filteredUsers = allUsers.filter(user => {
            // Search filter
            if (searchTerm) {
                const searchableText = [
                    user.fname,
                    user.lname,
                    user.email,
                    user.acct_num?.toString(),
                    user.clinic
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            // Payment status filter
            if (statusFilterValue !== 'all' && user.paymentStatus !== statusFilterValue) {
                return false;
            }
            
            // User status filter
            if (userStatusFilterValue !== 'all' && user.status !== userStatusFilterValue) {
                return false;
            }
            
            return true;
        });
        
        displayUsers();
    }
    
    // Display users in table
    function displayUsers() {
        usersTableBody.innerHTML = '';
        
        if (filteredUsers.length === 0) {
            usersTable.style.display = 'none';
            noDataMessage.style.display = 'block';
            return;
        }
        
        usersTable.style.display = 'table';
        noDataMessage.style.display = 'none';
        
        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            
            const fullName = `${user.fname || ''} ${user.lname || ''}`.trim() || 'N/A';
            const paymentStatus = user.paymentStatus || 'pending';
            const statusClass = `status-${paymentStatus}`;
            const statusText = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
            
            row.innerHTML = `
                <td>${user.acct_num || 'N/A'}</td>
                <td>${fullName}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.clinic || 'N/A'}</td>
                <td>${user.status || 'N/A'}</td>
                <td>$${formatCurrency(user.owed || 0)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" 
                            onclick="generateBillForUser('${user.acct_num}', '${fullName}')">
                        Generate Bill
                    </button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
    }
    
    // Update statistics
    function updateStats() {
        totalUsersEl.textContent = allUsers.length;
        
        const paid = allUsers.filter(u => u.paymentStatus === 'paid').length;
        const pending = allUsers.filter(u => u.paymentStatus === 'pending').length;
        const overdue = allUsers.filter(u => u.paymentStatus === 'overdue').length;
        
        paidCountEl.textContent = paid;
        pendingCountEl.textContent = pending;
        overdueCountEl.textContent = overdue;
    }
    
    // Export to CSV
    function exportToCSV() {
        if (filteredUsers.length === 0) {
            alert('No users to export.');
            return;
        }
        
        const headers = ['Account #', 'First Name', 'Last Name', 'Email', 'Clinic', 'Status', 'Amount Owed', 'Payment Status'];
        const rows = filteredUsers.map(user => [
            user.acct_num || '',
            user.fname || '',
            user.lname || '',
            user.email || '',
            user.clinic || '',
            user.status || '',
            user.owed || 0,
            user.paymentStatus || 'pending'
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `handyworks-users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    // Generate bill for specific user (placeholder)
    window.generateBillForUser = function(acctNum, name) {
        alert(`Generate Bill for ${name} (Account #${acctNum})\n\nThis functionality will be implemented in Phase 2 (Stripe Payment Links).`);
    };
    
    // Utility functions
    function formatCurrency(amount) {
        // Amount is already in dollars (not cents)
        return parseFloat(amount || 0).toFixed(2);
    }
    
    function showLoading() {
        loadingMessage.style.display = 'block';
        usersTable.style.display = 'none';
        noDataMessage.style.display = 'none';
    }
    
    function hideLoading() {
        loadingMessage.style.display = 'none';
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
    }
})();

