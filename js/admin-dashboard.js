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
    const settingsButton = document.getElementById('settingsButton');
    const invoiceTemplateEditorButton = document.getElementById('invoiceTemplateEditorButton');
    
    // Stats elements
    const totalUsersEl = document.getElementById('totalUsers');
    const noInvoiceCountEl = document.getElementById('noInvoiceCount');
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
    
    // Settings handler
    settingsButton.addEventListener('click', openSettingsModal);
    
    // Invoice Template Editor handler
    if (invoiceTemplateEditorButton) {
        invoiceTemplateEditorButton.addEventListener('click', openInvoiceTemplateEditor);
    }
    
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
            
            // Load ALL invoices for all users
            const invoicesSnapshot = await db.collection('handyworks_invoices')
                .orderBy('year', 'desc')
                .get();
            
            // Group invoices by account number
            const invoicesByAcctNum = {};
            invoicesSnapshot.docs.forEach(doc => {
                const invoice = { id: doc.id, ...doc.data() };
                const acctNum = invoice.acct_num;
                
                if (!invoicesByAcctNum[acctNum]) {
                    invoicesByAcctNum[acctNum] = [];
                }
                invoicesByAcctNum[acctNum].push(invoice);
            });
            
            // Load ALL payments
            const paymentsSnapshot = await db.collection('handyworks_payments')
                .get();
            
            // Group payments by invoice_id
            const paymentsByInvoiceId = {};
            paymentsSnapshot.docs.forEach(doc => {
                const payment = { id: doc.id, ...doc.data() };
                const invoiceId = payment.invoice_id;
                
                if (!paymentsByInvoiceId[invoiceId]) {
                    paymentsByInvoiceId[invoiceId] = [];
                }
                paymentsByInvoiceId[invoiceId].push(payment);
            });
            
            // Calculate payment totals and status for each invoice
            allUsers.forEach(user => {
                const userInvoices = invoicesByAcctNum[user.acct_num] || [];
                
                // Process each invoice: calculate paid amount and owed amount
                user.invoices = userInvoices.map(invoice => {
                    const payments = paymentsByInvoiceId[invoice.invoice_id] || [];
                    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
                    const amountOwed = (invoice.amount || 0) - totalPaid;
                    
                    // Determine current payment status
                    let paymentStatus = invoice.payment_status || 'pending';
                    
                    // Auto-update status based on payments
                    if (totalPaid >= invoice.amount) {
                        paymentStatus = 'paid';
                    } else if (paymentStatus !== 'cancelled' && invoice.due_date) {
                        const dueDate = invoice.due_date.toDate ? invoice.due_date.toDate() : new Date(invoice.due_date);
                        if (new Date() > dueDate && amountOwed > 0) {
                            paymentStatus = 'overdue';
                        }
                    }
                    
                    return {
                        ...invoice,
                        payments: payments,
                        totalPaid: totalPaid,
                        amountOwed: amountOwed,
                        paymentStatus: paymentStatus
                    };
                });
                
                // Sort invoices by year (newest first)
                user.invoices.sort((a, b) => (b.year || 0) - (a.year || 0));
                
                // For backward compatibility, set 2026 invoice and overall payment status
                const currentYear = new Date().getFullYear();
                const targetYear = currentYear + 1;
                user.invoice2026 = user.invoices.find(inv => inv.year === targetYear) || null;
                user.paymentStatus = user.invoice2026 ? user.invoice2026.paymentStatus : 'no-invoice';
            });
            
            // Sort users by last name (ascending), then first name
            allUsers.sort((a, b) => {
                const aLname = (a.lname || '').toLowerCase();
                const bLname = (b.lname || '').toLowerCase();
                const aFname = (a.fname || '').toLowerCase();
                const bFname = (b.fname || '').toLowerCase();
                
                // Sort by last name first
                if (aLname !== bLname) {
                    return aLname.localeCompare(bLname);
                }
                // If last names are the same, sort by first name
                return aFname.localeCompare(bFname);
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
    
    // Calculate payment status based on 2026 invoice
    function calculatePaymentStatus(user) {
        // Check if there's a 2026 invoice for this user
        if (!user.invoice2026) {
            return 'no-invoice'; // No invoice generated yet for 2026
        }
        
        const invoice = user.invoice2026;
        
        // Check invoice payment status
        if (invoice.payment_status === 'paid') {
            return 'paid';
        } else if (invoice.payment_status === 'pending') {
            // Check if overdue based on due date
            if (invoice.due_date) {
                const dueDate = invoice.due_date.toDate ? invoice.due_date.toDate() : new Date(invoice.due_date);
                const now = new Date();
                if (now > dueDate) {
                    return 'overdue';
                }
            }
            return 'pending';
        } else {
            return invoice.payment_status; // 'cancelled', etc.
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
    
    // Display users in table (one row per invoice, one row per payment)
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
            const fullName = formatCustomerName(user);
            const activeInvoices = user.invoices?.filter(inv => inv.payment_status !== 'cancelled') || [];
            
            // Sort invoices oldest to newest
            activeInvoices.sort((a, b) => (a.year || 0) - (b.year || 0));
            
            if (activeInvoices.length === 0) {
                // No invoices - show one row with Generate Invoice button
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 0.75rem;">${fullName}</td>
                    <td style="padding: 0.75rem;">${user.email || 'N/A'}</td>
                    <td style="padding: 0.75rem; color: #999;">No invoices</td>
                    <td style="text-align: right; padding: 0.75rem;">$0.00</td>
                    <td style="text-align: right; padding: 0.75rem;">$0.00</td>
                    <td style="text-align: right; padding: 0.75rem;">$0.00</td>
                    <td style="padding: 0.75rem;">
                        <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" 
                                onclick="generateBillForUser('${user.acct_num}', '${fullName}')">
                            Generate Invoice
                        </button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            } else {
                let isFirstRow = true;
                
                // Show one row per invoice, then one row per payment with running balance
                activeInvoices.forEach((invoice) => {
                    const billed = invoice.amount || 0;
                    
                    // Format invoice date as YYYY-MM-DD
                    let invoiceDate = 'N/A';
                    if (invoice.created_at?.toDate) {
                        const date = invoice.created_at.toDate();
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        invoiceDate = `${year}-${month}-${day}`;
                    }
                    
                    // Invoice row shows: billed amount, blank paid, initial owed
                    let runningBalance = billed;
                    const dateColor = runningBalance > 0 ? '#dc3545' : '#28a745';
                    
                    // Action button - only show if there's an amount owed
                    const totalOwed = invoice.amountOwed || 0;
                    let actionButton = '';
                    if (totalOwed > 0) {
                        actionButton = `
                            <button class="btn" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                                    onclick="recordPaymentForInvoice('${invoice.id}', '${user.acct_num}')">
                                Record Payment
                            </button>
                        `;
                    }
                    
                    // Delete button (X) - only show if no payments exist
                    const hasPayments = invoice.payments && invoice.payments.length > 0;
                    const deleteButton = !hasPayments ? `
                        <button onclick="deleteInvoice('${invoice.id}', '${invoice.invoice_id}', '${user.acct_num}', event)" 
                                style="background: transparent; color: #dc3545; border: none; padding: 0.2rem 0.4rem; cursor: pointer; font-size: 1.1rem; margin-left: 0.5rem;"
                                title="Delete invoice">✕</button>
                    ` : '';
                    
                    // Invoice row
                    const invoiceRow = document.createElement('tr');
                    invoiceRow.style.background = '#f8f9fa';
                    invoiceRow.style.borderTop = '2px solid #dee2e6';
                    invoiceRow.innerHTML = `
                        <td style="padding: 0.75rem;">${isFirstRow ? fullName : ''}</td>
                        <td style="padding: 0.75rem;">${isFirstRow ? (user.email || 'N/A') : ''}</td>
                        <td style="padding: 0.75rem;"><span style="color: ${dateColor}; font-weight: 500;">${invoiceDate}</span></td>
                        <td style="text-align: right; padding: 0.75rem;">$${formatCurrency(billed)}</td>
                        <td style="text-align: center; padding: 0.75rem; color: #999; font-size: 1.1rem;">—</td>
                        <td style="text-align: right; padding: 0.75rem; font-weight: bold; color: ${dateColor};">$${formatCurrency(runningBalance)}</td>
                        <td style="padding: 0.75rem;">${actionButton}${deleteButton}</td>
                    `;
                    usersTableBody.appendChild(invoiceRow);
                    isFirstRow = false;
                    
                    // Payment rows (if any)
                    if (invoice.payments && invoice.payments.length > 0) {
                        // Sort payments oldest to newest
                        const sortedPayments = [...invoice.payments].sort((a, b) => {
                            const dateA = a.payment_date?.toDate ? a.payment_date.toDate() : new Date(0);
                            const dateB = b.payment_date?.toDate ? b.payment_date.toDate() : new Date(0);
                            return dateA - dateB;
                        });
                        
                        sortedPayments.forEach(payment => {
                            const paymentRow = document.createElement('tr');
                            paymentRow.style.background = '#ffffff';
                            
                            // Format payment date as YYYY-MM-DD
                            let paymentDate = 'N/A';
                            if (payment.payment_date?.toDate) {
                                const date = payment.payment_date.toDate();
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                paymentDate = `${year}-${month}-${day}`;
                            }
                            
                            const method = payment.payment_method || 'Unknown';
                            const reference = payment.payment_reference ? ` #${payment.payment_reference}` : '';
                            const paymentAmount = payment.amount || 0;
                            
                            // Update running balance
                            runningBalance -= paymentAmount;
                            const balanceColor = runningBalance > 0 ? '#dc3545' : '#28a745';
                            
                            const deletePaymentButton = `
                                <button onclick="deletePayment('${payment.id}', '${invoice.id}', event)" 
                                        style="background: transparent; color: #dc3545; border: none; padding: 0.2rem 0.4rem; cursor: pointer; font-size: 1rem;"
                                        title="Delete payment">✕</button>
                            `;
                            
                            paymentRow.innerHTML = `
                                <td style="padding: 0.5rem;"></td>
                                <td style="padding: 0.5rem;"></td>
                                <td style="padding: 0.5rem 0.5rem 0.5rem 2rem; color: #666; font-size: 0.9rem;">
                                    ${paymentDate} ${method}${reference}
                                </td>
                                <td style="text-align: right; padding: 0.5rem; color: #999; font-size: 1rem;">—</td>
                                <td style="text-align: right; padding: 0.5rem; color: #28a745; font-size: 0.9rem;">$${formatCurrency(paymentAmount)}</td>
                                <td style="text-align: right; padding: 0.5rem; font-weight: bold; color: ${balanceColor}; font-size: 0.9rem;">$${formatCurrency(runningBalance)}</td>
                                <td style="padding: 0.5rem;">${deletePaymentButton}</td>
                            `;
                            usersTableBody.appendChild(paymentRow);
                        });
                    }
                });
            }
        });
    }
    
    // Format invoice pill (compact display)
    function formatInvoicePill(invoice, acctNum) {
        const year = invoice.year || '?';
        const billed = invoice.amount || 0;
        const paid = invoice.totalPaid || 0;
        const owed = invoice.amountOwed || 0;
        const status = invoice.paymentStatus || 'pending';
        
        // Color based on status
        let pillColor, textColor;
        if (status === 'paid') {
            pillColor = '#d4edda';
            textColor = '#155724';
        } else if (status === 'overdue') {
            pillColor = '#f8d7da';
            textColor = '#721c24';
        } else if (status === 'pending') {
            pillColor = '#fff3cd';
            textColor = '#856404';
        } else {
            pillColor = '#e7e7e7';
            textColor = '#555';
        }
        
        // Build pill content
        let content = '';
        if (status === 'paid') {
            content = `${year}: PAID ✓`;
        } else {
            content = `${year}: $${formatCurrency(billed)} | $${formatCurrency(paid)}↓ | <strong>$${formatCurrency(owed)} owed</strong>`;
        }
        
        return `
            <span class="invoice-pill" style="
                display: inline-block;
                background: ${pillColor};
                color: ${textColor};
                padding: 0.35rem 0.75rem;
                border-radius: 6px;
                font-size: 0.85rem;
                margin: 0.15rem;
                white-space: nowrap;
                border: 1px solid ${textColor}33;
            ">
                ${content}
                <button onclick="deleteInvoice('${invoice.id}', '${invoice.invoice_id}', '${acctNum}', event)" 
                        style="
                            background: none;
                            border: none;
                            color: ${textColor};
                            cursor: pointer;
                            font-weight: bold;
                            margin-left: 0.5rem;
                            padding: 0;
                            font-size: 1rem;
                        " 
                        title="Delete invoice">×</button>
            </span>
        `;
    }
    
    // Update statistics
    function updateStats() {
        totalUsersEl.textContent = allUsers.length;
        
        const noInvoice = allUsers.filter(u => u.paymentStatus === 'no-invoice').length;
        const pending = allUsers.filter(u => u.paymentStatus === 'pending').length;
        const paid = allUsers.filter(u => u.paymentStatus === 'paid').length;
        const overdue = allUsers.filter(u => u.paymentStatus === 'overdue').length;
        
        noInvoiceCountEl.textContent = noInvoice;
        pendingCountEl.textContent = pending;
        paidCountEl.textContent = paid;
        overdueCountEl.textContent = overdue;
    }
    
    // Export to CSV
    function exportToCSV() {
        if (filteredUsers.length === 0) {
            alert('No users to export.');
            return;
        }
        
        const headers = ['First Name', 'Last Name', 'Email', 'Amount Owed', 'Payment Status'];
        const rows = filteredUsers.map(user => [
            user.fname || '',
            user.lname || '',
            user.email || '',
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
    
    // Generate bill for specific user - Opens invoice modal
    window.generateBillForUser = function(acctNum, name) {
        const user = allUsers.find(u => u.acct_num == acctNum);
        if (!user) {
            alert('User not found');
            return;
        }
        
        // Check if modal exists
        const modal = document.getElementById('invoiceModal');
        if (!modal) {
            console.error('Invoice modal not found in DOM');
            alert('Invoice modal not available. Please refresh the page.');
            return;
        }
        
        openInvoiceModal(user);
    };
    
    // Record payment for existing invoice
    window.recordPaymentForInvoice = function(invoiceFirestoreId, acctNum) {
        const user = allUsers.find(u => u.acct_num == acctNum);
        if (!user) {
            alert('User not found');
            return;
        }
        
        const invoice = user.invoices?.find(inv => inv.id === invoiceFirestoreId);
        if (!invoice) {
            alert('Invoice not found');
            return;
        }
        
        openPaymentModal(user, invoice);
    };
    
    // Delete payment record
    window.deletePayment = async function(paymentFirestoreId, invoiceFirestoreId, event) {
        event.stopPropagation(); // Prevent any parent clicks
        
        try {
            // Get payment directly from Firebase
            const paymentDoc = await db.collection('handyworks_payments').doc(paymentFirestoreId).get();
            
            if (!paymentDoc.exists) {
                alert('Payment not found. It may have already been deleted.');
                return;
            }
            
            const payment = paymentDoc.data();
            const invoiceId = payment.invoice_id;
            
            // Get invoice to show details in confirmation
            let invoice = null;
            if (invoiceId) {
                const invoiceQuery = await db.collection('handyworks_invoices')
                    .where('invoice_id', '==', invoiceId)
                    .limit(1)
                    .get();
                
                if (!invoiceQuery.empty) {
                    invoice = invoiceQuery.docs[0].data();
                }
            }
            
            // Confirm deletion
            const confirmMsg = 
                `DELETE this payment record?\n\n` +
                `Amount: $${formatCurrency(payment.amount)}\n` +
                `Method: ${payment.payment_method || 'Unknown'}\n` +
                `Date: ${payment.payment_date?.toDate ? payment.payment_date.toDate().toLocaleDateString() : 'N/A'}\n` +
                `Reference: ${payment.payment_reference || 'None'}\n` +
                `Recorded by: ${payment.recorded_by || 'Unknown'}\n\n` +
                `This will PERMANENTLY DELETE the payment record.\n` +
                `This action cannot be undone.`;
            
            if (!confirm(confirmMsg)) {
                return;
            }
            
            // Delete payment from Firebase
            await db.collection('handyworks_payments').doc(paymentFirestoreId).delete();
            console.log(`Payment ${paymentFirestoreId} permanently deleted`);
            
            // Recalculate invoice status after payment deletion
            if (invoiceId) {
                // Get remaining payments for this invoice
                const paymentsSnapshot = await db.collection('handyworks_payments')
                    .where('invoice_id', '==', invoiceId)
                    .get();
                
                const totalPaid = paymentsSnapshot.docs.reduce((sum, doc) => {
                    return sum + (doc.data().amount || 0);
                }, 0);
                
                // Get invoice document ID
                const invoiceQuery = await db.collection('handyworks_invoices')
                    .where('invoice_id', '==', invoiceId)
                    .limit(1)
                    .get();
                
                if (!invoiceQuery.empty) {
                    const invoiceDoc = invoiceQuery.docs[0];
                    const invoiceAmount = invoiceDoc.data().amount || 0;
                    
                    // Update invoice status
                    const updateData = {
                        updated_at: firebase.firestore.Timestamp.now(),
                        updated_by: auth.currentUser?.email || 'admin'
                    };
                    
                    if (totalPaid >= invoiceAmount) {
                        updateData.payment_status = 'paid';
                        updateData.paid_date = firebase.firestore.Timestamp.now();
                    } else if (totalPaid === 0) {
                        updateData.payment_status = 'pending';
                        updateData.paid_date = null;
                    } else {
                        updateData.payment_status = 'pending'; // Partial payment
                    }
                    
                    await invoiceDoc.ref.update(updateData);
                }
            }
            
            // Reload users to refresh display
            await loadUsers();
            
            // Close payment modal if it's open
            if (currentPaymentInvoice) {
                closePaymentModal();
            }
            
            alert('Payment deleted successfully.');
            
        } catch (error) {
            console.error('Error deleting payment:', error);
            alert(`Failed to delete payment: ${error.message}`);
        }
    };
    
    // Delete invoice with confirmation
    window.deleteInvoice = async function(invoiceFirestoreId, invoiceId, acctNum, event) {
        event.stopPropagation(); // Prevent row click
        
        const user = allUsers.find(u => u.acct_num == acctNum);
        if (!user) {
            alert('User not found');
            return;
        }
        
        const invoice = user.invoices?.find(inv => inv.id === invoiceFirestoreId);
        if (!invoice) {
            alert('Invoice not found');
            return;
        }
        
        // Check if there are any payments
        const hasPayments = invoice.payments && invoice.payments.length > 0;
        
        if (hasPayments) {
            alert(
                `Cannot delete invoice with payments.\n\n` +
                `Invoice: ${invoiceId}\n` +
                `Amount Billed: $${formatCurrency(invoice.amount)}\n` +
                `Amount Paid: $${formatCurrency(invoice.totalPaid)}\n` +
                `Payments: ${invoice.payments.length} payment(s)\n\n` +
                `You must delete the payment records first.`
            );
            return;
        }
        
        // Confirm deletion
        const customerName = formatCustomerName(user);
        const confirmMsg = 
            `DELETE this invoice?\n\n` +
            `Customer: ${customerName}\n` +
            `Invoice: ${invoiceId}\n` +
            `Amount: $${formatCurrency(invoice.amount)}\n` +
            `Year: ${invoice.year}\n\n` +
            `This will PERMANENTLY DELETE the invoice from the database.\n` +
            `This action cannot be undone.`;
        
        if (!confirm(confirmMsg)) {
            return;
        }
        
        try {
            // Hard delete - completely remove from database
            await db.collection('handyworks_invoices').doc(invoiceFirestoreId).delete();
            
            console.log(`Invoice ${invoiceId} permanently deleted`);
            
            // Reload users to refresh display
            await loadUsers();
            
            alert('Invoice deleted successfully.');
            
        } catch (error) {
            console.error('Error deleting invoice:', error);
            alert(`Failed to delete invoice: ${error.message}`);
        }
    };
    
    // ====================================================================
    // PAYMENT RECORDING MODAL MANAGEMENT
    // ====================================================================
    
    let paymentModal = null;
    let paymentModalClose = null;
    let paymentCancelButton = null;
    let recordPaymentButton = null;
    let recordPaymentText = null;
    let recordPaymentSpinner = null;
    let paymentSuccessMessage = null;
    let paymentErrorMessage = null;
    let paymentAmount = null;
    let paymentMethod = null;
    let paymentReference = null;
    let paymentNotes = null;
    let currentPaymentInvoice = null;
    let currentPaymentUser = null;
    let paymentModalInitialized = false;
    
    // Initialize payment modal
    function initializePaymentModal() {
        if (paymentModalInitialized) return;
        
        paymentModal = document.getElementById('paymentModal');
        paymentModalClose = document.getElementById('paymentModalClose');
        paymentCancelButton = document.getElementById('paymentCancelButton');
        recordPaymentButton = document.getElementById('recordPaymentButton');
        recordPaymentText = document.getElementById('recordPaymentText');
        recordPaymentSpinner = document.getElementById('recordPaymentSpinner');
        paymentSuccessMessage = document.getElementById('paymentSuccessMessage');
        paymentErrorMessage = document.getElementById('paymentErrorMessage');
        paymentAmount = document.getElementById('paymentAmount');
        paymentMethod = document.getElementById('paymentMethod');
        paymentReference = document.getElementById('paymentReference');
        paymentNotes = document.getElementById('paymentNotes');
        
        if (!paymentModal) {
            console.error('Payment modal not found');
            return;
        }
        
        // Event listeners
        paymentModalClose.addEventListener('click', closePaymentModal);
        paymentCancelButton.addEventListener('click', closePaymentModal);
        recordPaymentButton.addEventListener('click', submitPayment);
        
        // Close on outside click
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                closePaymentModal();
            }
        });
        
        // Auto-select amount field on open
        paymentAmount.addEventListener('focus', function() {
            this.select();
        });
        
        paymentModalInitialized = true;
    }
    
    // Open payment modal
    function openPaymentModal(user, invoice) {
        initializePaymentModal();
        
        if (!paymentModal) {
            alert('Payment modal could not be initialized. Please refresh the page.');
            return;
        }
        
        currentPaymentUser = user;
        currentPaymentInvoice = invoice;
        
        // Populate invoice details
        const customerName = formatCustomerName(user);
        document.getElementById('paymentCustomerName').textContent = customerName;
        document.getElementById('paymentInvoiceId').textContent = invoice.invoice_id || 'N/A';
        document.getElementById('paymentYear').textContent = invoice.year || 'N/A';
        document.getElementById('paymentBilled').textContent = `$${formatCurrency(invoice.amount || 0)}`;
        document.getElementById('paymentPaidSoFar').textContent = `$${formatCurrency(invoice.totalPaid || 0)}`;
        document.getElementById('paymentOwed').textContent = `$${formatCurrency(invoice.amountOwed || 0)}`;
        
        // Show payment history if exists
        const paymentHistorySection = document.getElementById('paymentHistorySection');
        const paymentHistoryList = document.getElementById('paymentHistoryList');
        
        if (invoice.payments && invoice.payments.length > 0) {
            paymentHistorySection.style.display = 'block';
            paymentHistoryList.innerHTML = invoice.payments.map(p => {
                const date = p.payment_date?.toDate ? p.payment_date.toDate().toLocaleDateString() : 'N/A';
                const method = p.payment_method || 'Unknown';
                const amount = formatCurrency(p.amount || 0);
                const reference = p.payment_reference ? ` (${p.payment_reference})` : '';
                const recordedBy = p.recorded_by || 'Unknown';
                return `<div style="padding: 0.25rem 0; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                    <span>${date}: <strong>$${amount}</strong> via ${method}${reference} <small style="color: #666;">(by ${recordedBy})</small></span>
                    <button onclick="deletePayment('${p.id}', '${invoice.id}', event)" 
                            style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.75rem;"
                            title="Delete payment">Delete</button>
                </div>`;
            }).join('');
        } else {
            paymentHistorySection.style.display = 'none';
        }
        
        // Pre-fill amount with remaining owed
        paymentAmount.value = (invoice.amountOwed || 0).toFixed(2);
        paymentMethod.value = '';
        paymentReference.value = '';
        paymentNotes.value = '';
        
        // Reset state
        hidePaymentMessages();
        recordPaymentButton.disabled = false;
        
        // Show modal
        paymentModal.style.display = 'flex';
        
        // Focus amount field
        setTimeout(() => paymentAmount.focus(), 100);
    }
    
    // Close payment modal
    function closePaymentModal() {
        if (paymentModal) {
            paymentModal.style.display = 'none';
            currentPaymentUser = null;
            currentPaymentInvoice = null;
        }
    }
    
    // Submit payment
    async function submitPayment() {
        if (!currentPaymentUser || !currentPaymentInvoice) {
            showPaymentError('No invoice selected');
            return;
        }
        
        // Validate form
        const amount = parseFloat(paymentAmount.value);
        const method = paymentMethod.value;
        
        if (!amount || amount <= 0) {
            showPaymentError('Please enter a valid payment amount');
            paymentAmount.focus();
            return;
        }
        
        if (!method) {
            showPaymentError('Please select a payment method');
            paymentMethod.focus();
            return;
        }
        
        // Confirm payment
        const confirmMsg = 
            `Record this payment?\n\n` +
            `Customer: ${currentPaymentUser.fname} ${currentPaymentUser.lname}\n` +
            `Invoice: ${currentPaymentInvoice.invoice_id}\n` +
            `Amount: $${amount.toFixed(2)}\n` +
            `Method: ${method}\n` +
            `Reference: ${paymentReference.value || '(none)'}\n\n` +
            `This will create a payment record in the database.`;
        
        if (!confirm(confirmMsg)) {
            return;
        }
        
        try {
            setRecordPaymentLoading(true);
            hidePaymentMessages();
            
            // Create payment record
            const paymentData = {
                invoice_id: currentPaymentInvoice.invoice_id,
                acct_num: currentPaymentUser.acct_num,
                customer_name: formatCustomerName(currentPaymentUser),
                customer_email: currentPaymentUser.email || '',
                amount: amount,
                payment_date: firebase.firestore.Timestamp.now(),
                payment_method: method,
                payment_reference: paymentReference.value.trim() || '',
                notes: paymentNotes.value.trim() || '',
                stripe_payment_intent_id: null,
                stripe_session_id: null,
                recorded_by: auth.currentUser?.email || 'admin',
                created_at: firebase.firestore.Timestamp.now(),
                status: 'completed'
            };
            
            await db.collection('handyworks_payments').add(paymentData);
            
            console.log('Payment recorded successfully:', paymentData);
            
            // Update invoice status if fully paid
            const newTotalPaid = (currentPaymentInvoice.totalPaid || 0) + amount;
            if (newTotalPaid >= currentPaymentInvoice.amount) {
                await db.collection('handyworks_invoices').doc(currentPaymentInvoice.id).update({
                    payment_status: 'paid',
                    paid_date: firebase.firestore.Timestamp.now(),
                    updated_at: firebase.firestore.Timestamp.now(),
                    updated_by: auth.currentUser?.email || 'admin'
                });
                console.log('Invoice marked as paid');
            }
            
            showPaymentSuccess('✅ Payment recorded successfully!');
            
            // Reload users after 1 second
            setTimeout(async () => {
                await loadUsers();
                closePaymentModal();
            }, 1000);
            
        } catch (error) {
            console.error('Error recording payment:', error);
            showPaymentError(`Failed to record payment: ${error.message}`);
        } finally {
            setRecordPaymentLoading(false);
        }
    }
    
    // Payment modal message helpers
    function showPaymentSuccess(message) {
        paymentSuccessMessage.textContent = message;
        paymentSuccessMessage.style.display = 'block';
        paymentErrorMessage.style.display = 'none';
    }
    
    function showPaymentError(message) {
        paymentErrorMessage.textContent = message;
        paymentErrorMessage.style.display = 'block';
        paymentSuccessMessage.style.display = 'none';
    }
    
    function hidePaymentMessages() {
        if (paymentSuccessMessage) paymentSuccessMessage.style.display = 'none';
        if (paymentErrorMessage) paymentErrorMessage.style.display = 'none';
    }
    
    function setRecordPaymentLoading(isLoading) {
        if (isLoading) {
            recordPaymentText.style.display = 'none';
            recordPaymentSpinner.style.display = 'inline-block';
            recordPaymentButton.disabled = true;
        } else {
            recordPaymentText.style.display = 'inline';
            recordPaymentSpinner.style.display = 'none';
            recordPaymentButton.disabled = false;
        }
    }
    
    // ====================================================================
    // SETTINGS MODAL MANAGEMENT
    // ====================================================================
    
    let settingsModal = null;
    let settingsModalClose = null;
    let settingsCancelButton = null;
    let saveSettingsButton = null;
    let saveSettingsText = null;
    let saveSettingsSpinner = null;
    let settingsSuccessMessage = null;
    let settingsErrorMessage = null;
    let settingsBusinessName = null;
    let settingsBusinessAddress = null;
    let settingsBusinessCity = null;
    let settingsBusinessPhone = null;
    let settingsBusinessEmail = null;
    let settingsCardAmount = null;
    let settingsCheckAmount = null;
    let settingsPaymentTerms = null;
    let settingsSalutation = null;
    let settingsShowInvoiceNumber = null;
    let settingsShowCheckMemo = null;
    let settingsInitialized = false;
    
    // Initialize settings modal
    function initializeSettingsModal() {
        if (settingsInitialized) return;
        
        settingsModal = document.getElementById('settingsModal');
        settingsModalClose = document.getElementById('settingsModalClose');
        settingsCancelButton = document.getElementById('settingsCancelButton');
        saveSettingsButton = document.getElementById('saveSettingsButton');
        saveSettingsText = document.getElementById('saveSettingsText');
        saveSettingsSpinner = document.getElementById('saveSettingsSpinner');
        settingsSuccessMessage = document.getElementById('settingsSuccessMessage');
        settingsErrorMessage = document.getElementById('settingsErrorMessage');
        settingsBusinessName = document.getElementById('settingsBusinessName');
        settingsBusinessAddress = document.getElementById('settingsBusinessAddress');
        settingsBusinessCity = document.getElementById('settingsBusinessCity');
        settingsBusinessPhone = document.getElementById('settingsBusinessPhone');
        settingsBusinessEmail = document.getElementById('settingsBusinessEmail');
        settingsCardAmount = document.getElementById('settingsCardAmount');
        settingsCheckAmount = document.getElementById('settingsCheckAmount');
        settingsPaymentTerms = document.getElementById('settingsPaymentTerms');
        settingsSalutation = document.getElementById('settingsSalutation');
        settingsShowInvoiceNumber = document.getElementById('settingsShowInvoiceNumber');
        settingsShowCheckMemo = document.getElementById('settingsShowCheckMemo');
        
        if (!settingsModal) {
            console.error('Settings modal not found');
            return;
        }
        
        // Event listeners
        settingsModalClose.addEventListener('click', closeSettingsModal);
        settingsCancelButton.addEventListener('click', closeSettingsModal);
        saveSettingsButton.addEventListener('click', saveSettings);
        
        // Close on outside click
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                closeSettingsModal();
            }
        });
        
        settingsInitialized = true;
    }
    
    // Open settings modal
    function openSettingsModal() {
        initializeSettingsModal();
        
        if (!settingsModal) {
            alert('Settings modal could not be initialized. Please refresh the page.');
            return;
        }
        
        // Load current settings
        loadSettings();
        
        settingsModal.style.display = 'flex';
        hideSettingsMessages();
    }
    
    // Close settings modal
    function closeSettingsModal() {
        if (settingsModal) {
            settingsModal.style.display = 'none';
            hideSettingsMessages();
        }
    }
    
    // Open invoice template editor (opens dedicated editor page)
    function openInvoiceTemplateEditor() {
        // Open the dedicated template editor page
        window.open('template-editor.html', '_blank');
    }
    
    // Global variables for invoice editor
    let invoiceEditorQuill = null;
    let invoiceEditorModal = null;
    let isHtmlSourceView = false;
    let editedInvoiceHtml = null;
    let invoiceTemplateHead = null; // Store the <head> section separately
    
    // Load invoice template and replace placeholders
    async function loadInvoiceTemplate(invoiceData, paymentLink) {
        try {
            let templateHtml = null;
            let source = 'unknown';
            
            // Try Firebase first
            try {
                const templateDoc = await db.collection('handyworks_settings').doc('invoice_template').get();
                if (templateDoc.exists) {
                    templateHtml = templateDoc.data().html;
                    source = 'Firebase';
                    console.log('Template loaded from Firebase');
                }
            } catch (firebaseError) {
                console.log('Firebase load failed, trying file:', firebaseError);
            }
            
            // Fallback to file if Firebase doesn't have it
            if (!templateHtml) {
                const templateUrl = 'templates/invoice-template.html';
                const response = await fetch(templateUrl);
                
                if (!response.ok) {
                    throw new Error(`Template not found in Firebase or file: ${templateUrl}. Please create the template.`);
                }
                
                templateHtml = await response.text();
                source = 'File';
                console.log('Template loaded from file');
            }
            
            // Get business settings
            const settings = getBusinessSettings();
            const checkDiscount = settings.cardAmount - settings.checkAmount;
            
            // Format customer name
            const nameParts = invoiceData.customer_name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts[nameParts.length - 1] || '';
            const fullName = invoiceData.customer_name;
            
            // Generate greeting
            let greeting;
            if (settings.salutation === 'none') {
                greeting = `Hi ${firstName},`;
            } else {
                greeting = `Hi ${settings.salutation} ${lastName},`;
            }
            
            // Format address
            const address = settings.address 
                ? `${settings.address}\n${settings.city || ''}`.trim()
                : `Chapter 1 Software Inc
140 E 28th Street
Suite 1F
New York City, NY 10016`;
            
            // Replace placeholders
            const replacements = {
                '[Greeting]': greeting,
                '[Lastname]': lastName,
                '[Firstname]': firstName,
                '[Fullname]': fullName,
                '[Year]': invoiceData.year.toString(),
                '[CardAmount]': settings.cardAmount.toString(),
                '[CheckAmount]': settings.checkAmount.toString(),
                '[CheckDiscount]': checkDiscount.toString(),
                '[PaymentLink]': paymentLink.url,
                '[PaymentLinkText]': 'Pay Online via Stripe',
                '[Address]': address,
                '[SupportPhone]': settings.phone || '212-889-8878',
                '[FaxNumber]': settings.fax || '',
                '[Signature]': 'Dr. Steve'
            };
            
            // Replace all placeholders
            for (const [placeholder, value] of Object.entries(replacements)) {
                templateHtml = templateHtml.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
            }
            
            // Extract head and body sections
            const headMatch = templateHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
            const bodyMatch = templateHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            
            return {
                full: templateHtml,
                head: headMatch ? headMatch[0] : '',
                body: bodyMatch ? bodyMatch[1] : templateHtml // Fallback to full if no body tag
            };
        } catch (error) {
            console.error('Error loading template:', error);
            // Fallback to programmatic generation
            return generateEmailHTMLTemplate(invoiceData, paymentLink);
        }
    }
    
    // Open invoice editor modal
    async function openInvoiceEditorModal(invoiceData, paymentLink, emailData) {
        // Get modal elements
        invoiceEditorModal = document.getElementById('invoiceEditorModal');
        if (!invoiceEditorModal) {
            alert('Invoice editor modal not found. Please refresh the page.');
            return;
        }
        
        // Show modal
        invoiceEditorModal.style.display = 'flex';
        
        // Load template and replace placeholders
        try {
            const templateData = await loadInvoiceTemplate(invoiceData, paymentLink);
            
            // Handle both old format (string) and new format (object)
            let bodyContent, fullHtml;
            if (typeof templateData === 'string') {
                // Legacy format - extract body content
                const bodyMatch = templateData.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                bodyContent = bodyMatch ? bodyMatch[1] : templateData;
                fullHtml = templateData;
                invoiceTemplateHead = templateData.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[0] || '';
            } else {
                // New format - use body content for editing
                bodyContent = templateData.body;
                fullHtml = templateData.full;
                invoiceTemplateHead = templateData.head;
            }
            
            // Initialize Quill editor if not already initialized
            if (!invoiceEditorQuill) {
                const editorContainer = document.getElementById('invoiceEditor');
                if (!editorContainer) {
                    alert('Editor container not found.');
                    return;
                }
                
                invoiceEditorQuill = new Quill('#invoiceEditor', {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'script': 'sub'}, { 'script': 'super' }],
                            [{ 'indent': '-1'}, { 'indent': '+1' }],
                            [{ 'direction': 'rtl' }],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'font': [] }],
                            [{ 'align': [] }],
                            ['link', 'image', 'video'],
                            ['blockquote', 'code-block'],
                            ['clean']
                        ]
                    }
                });
            }
            
            // Set content (only body content for editing)
            invoiceEditorQuill.root.innerHTML = bodyContent;
            isHtmlSourceView = false;
            editedInvoiceHtml = null;
            
            // Update HTML source textarea with full HTML
            const htmlSourceTextarea = document.getElementById('invoiceEditorHtmlSource');
            if (htmlSourceTextarea) {
                htmlSourceTextarea.value = fullHtml;
            }
            
            // Show editor, hide source
            document.getElementById('invoiceEditor').style.display = 'block';
            if (htmlSourceTextarea) {
                htmlSourceTextarea.style.display = 'none';
            }
            
            // Store current data for copy operation
            window.currentEditorInvoiceData = invoiceData;
            window.currentEditorPaymentLink = paymentLink;
            window.currentEditorEmailData = emailData;
            
        } catch (error) {
            console.error('Error opening editor:', error);
            alert('Error loading invoice template: ' + error.message);
            closeInvoiceEditorModal();
        }
    }
    
    // Close invoice editor modal
    function closeInvoiceEditorModal() {
        if (invoiceEditorModal) {
            invoiceEditorModal.style.display = 'none';
        }
        isHtmlSourceView = false;
    }
    
    // Toggle HTML source view
    function toggleHtmlSourceView() {
        if (!invoiceEditorQuill) return;
        
        const editorContainer = document.getElementById('invoiceEditor');
        const htmlSourceTextarea = document.getElementById('invoiceEditorHtmlSource');
        const toggleButton = document.getElementById('toggleHtmlSourceButton');
        
        if (!editorContainer || !htmlSourceTextarea || !toggleButton) return;
        
        isHtmlSourceView = !isHtmlSourceView;
        
        if (isHtmlSourceView) {
            // Switch to HTML source view - reconstruct full HTML
            const bodyContent = invoiceEditorQuill.root.innerHTML;
            const fullHtml = `<!DOCTYPE html>
<html>
${invoiceTemplateHead || '<head><meta charset="UTF-8"></head>'}
<body>
${bodyContent}
</body>
</html>`;
            htmlSourceTextarea.value = fullHtml;
            editorContainer.style.display = 'none';
            htmlSourceTextarea.style.display = 'block';
            toggleButton.textContent = 'View WYSIWYG Editor';
        } else {
            // Switch to WYSIWYG view - extract body content
            const fullHtml = htmlSourceTextarea.value;
            const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            const bodyContent = bodyMatch ? bodyMatch[1] : fullHtml;
            invoiceEditorQuill.root.innerHTML = bodyContent;
            editorContainer.style.display = 'block';
            htmlSourceTextarea.style.display = 'none';
            toggleButton.textContent = 'View HTML Source';
        }
    }
    
    // Copy edited invoice and open Gmail
    async function copyEditedInvoiceAndOpenGmail() {
        if (!invoiceEditorQuill) {
            alert('Editor not initialized.');
            return;
        }
        
        const editorContainer = document.getElementById('invoiceEditor');
        const htmlSourceTextarea = document.getElementById('invoiceEditorHtmlSource');
        
        // Get HTML content (from source view if active, otherwise reconstruct from editor)
        let htmlContent;
        if (isHtmlSourceView && htmlSourceTextarea) {
            htmlContent = htmlSourceTextarea.value;
        } else {
            // Reconstruct full HTML document from edited body content
            const bodyContent = invoiceEditorQuill.root.innerHTML;
            htmlContent = `<!DOCTYPE html>
<html>
${invoiceTemplateHead || '<head><meta charset="UTF-8"></head>'}
<body>
${bodyContent}
</body>
</html>`;
        }
        
        // Store edited HTML
        editedInvoiceHtml = htmlContent;
        
        // Get email data
        const emailData = window.currentEditorEmailData;
        if (!emailData) {
            alert('Email data not available.');
            return;
        }
        
        // Generate plain text fallback
        const invoiceData = window.currentEditorInvoiceData;
        const paymentLink = window.currentEditorPaymentLink;
        const plainTextContent = generateEmailTemplate(invoiceData, paymentLink);
        const plainTextBody = plainTextContent.split('\n').slice(2).join('\n');
        
        try {
            // Copy to clipboard with both HTML and plain text formats
            const clipboardItem = new ClipboardItem({
                'text/html': new Blob([htmlContent], { type: 'text/html' }),
                'text/plain': new Blob([plainTextBody], { type: 'text/plain' })
            });
            
            await navigator.clipboard.write([clipboardItem]);
            
            // Open Gmail
            const gmailUrl = buildGmailComposeUrl(
                emailData.to,
                emailData.subject,
                null,
                false // Don't include body - user will paste HTML
            );
            
            window.open(gmailUrl, '_blank');
            
            // Show success message
            const successMsg = document.getElementById('editorSuccessMessage');
            if (successMsg) {
                successMsg.textContent = '✅ Formatted invoice copied to clipboard! Gmail opened. Paste (Ctrl+V / Cmd+V) into the email body.';
                successMsg.style.display = 'block';
            }
            
            // Close modal after a short delay
            setTimeout(() => {
                closeInvoiceEditorModal();
            }, 2000);
            
        } catch (error) {
            console.error('Error copying invoice:', error);
            
            // Fallback to plain text
            try {
                await navigator.clipboard.writeText(plainTextBody);
                alert('HTML copy failed, but plain text was copied. Please paste into Gmail.');
                
                const gmailUrl = buildGmailComposeUrl(
                    emailData.to,
                    emailData.subject,
                    null,
                    false
                );
                window.open(gmailUrl, '_blank');
            } catch (fallbackError) {
                console.error('Fallback copy also failed:', fallbackError);
                alert('Failed to copy to clipboard. Your browser may not support this feature.');
            }
        }
    }
    
    // Load settings from localStorage
    function loadSettings() {
        const settings = getBusinessSettings();
        settingsBusinessName.value = settings.businessName;
        settingsBusinessAddress.value = settings.address;
        settingsBusinessCity.value = settings.city;
        settingsBusinessPhone.value = settings.phone;
        settingsBusinessEmail.value = settings.email;
        settingsCardAmount.value = settings.cardAmount;
        settingsCheckAmount.value = settings.checkAmount;
        settingsPaymentTerms.value = settings.paymentTerms;
        settingsSalutation.value = settings.salutation;
        settingsShowInvoiceNumber.checked = settings.showInvoiceNumber;
        settingsShowCheckMemo.checked = settings.showCheckMemo;
    }
    
    // Save settings to localStorage
    function saveSettings() {
        const settings = {
            businessName: settingsBusinessName.value.trim(),
            address: settingsBusinessAddress.value.trim(),
            city: settingsBusinessCity.value.trim(),
            phone: settingsBusinessPhone.value.trim(),
            email: settingsBusinessEmail.value.trim(),
            cardAmount: parseFloat(settingsCardAmount.value) || 555,
            checkAmount: parseFloat(settingsCheckAmount.value) || 540,
            paymentTerms: parseInt(settingsPaymentTerms.value) || 30,
            salutation: settingsSalutation.value,
            showInvoiceNumber: settingsShowInvoiceNumber.checked,
            showCheckMemo: settingsShowCheckMemo.checked
        };
        
        // Validate required fields
        if (!settings.address || !settings.city || !settings.phone) {
            showSettingsError('Please fill in all required fields (Address, City, Phone)');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('handyworks_business_settings', JSON.stringify(settings));
        
        showSettingsSuccess('✅ Settings saved successfully!');
        
        // Close modal after 1 second
        setTimeout(() => {
            closeSettingsModal();
        }, 1000);
    }
    
    // Get business settings (with defaults)
    function getBusinessSettings() {
        const defaults = {
            businessName: 'HandyWorks Software',
            address: '',
            city: '',
            phone: '',
            email: '',
            cardAmount: 555,
            checkAmount: 540,
            paymentTerms: 30,
            salutation: 'Dr.',
            showInvoiceNumber: true,
            showCheckMemo: true
        };
        
        const saved = localStorage.getItem('handyworks_business_settings');
        if (saved) {
            try {
                return { ...defaults, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error loading settings:', e);
                return defaults;
            }
        }
        return defaults;
    }
    
    // Settings modal message helpers
    function showSettingsSuccess(message) {
        settingsSuccessMessage.textContent = message;
        settingsSuccessMessage.style.display = 'block';
        settingsErrorMessage.style.display = 'none';
    }
    
    function showSettingsError(message) {
        settingsErrorMessage.textContent = message;
        settingsErrorMessage.style.display = 'block';
        settingsSuccessMessage.style.display = 'none';
    }
    
    function hideSettingsMessages() {
        if (settingsSuccessMessage) settingsSuccessMessage.style.display = 'none';
        if (settingsErrorMessage) settingsErrorMessage.style.display = 'none';
    }
    
    // ====================================================================
    // INVOICE MODAL MANAGEMENT
    // ====================================================================
    
    // Invoice Modal Management - Initialize lazily
    let invoiceModal = null;
    let modalClose = null;
    let cancelButton = null;
    let generateInvoiceButton = null;
    let generateButtonText = null;
    let generateButtonSpinner = null;
    let invoiceAmountPreset = null;
    let invoiceAmount = null;
    let invoiceDueDate = null;
    let modalSuccessMessage = null;
    let modalErrorMessage = null;
    let paymentLinkResult = null;
    let paymentLinkUrl = null;
    let emailTemplate = null;
    let copyLinkButton = null;
    let copyEmailButton = null;
    let sendViaGmailButton = null;
    let copyHTMLInvoiceButton = null;
    
    let currentUser = null;
    let modalInitialized = false;
    let currentInvoiceData = null; // Store full invoice data (id, invoice_id, amount, year, etc.)
    let currentEmailData = null; // Store email data for Gmail integration
    
    // Initialize modal elements and event listeners
    function initializeModal() {
        if (modalInitialized) return;
        
        invoiceModal = document.getElementById('invoiceModal');
        modalClose = document.getElementById('modalClose');
        cancelButton = document.getElementById('cancelButton');
        generateInvoiceButton = document.getElementById('generateInvoiceButton');
        generateButtonText = document.getElementById('generateButtonText');
        generateButtonSpinner = document.getElementById('generateButtonSpinner');
        invoiceAmountPreset = document.getElementById('invoiceAmountPreset');
        invoiceAmount = document.getElementById('invoiceAmount');
        modalSuccessMessage = document.getElementById('modalSuccessMessage');
        modalErrorMessage = document.getElementById('modalErrorMessage');
        paymentLinkResult = document.getElementById('paymentLinkResult');
        paymentLinkUrl = document.getElementById('paymentLinkUrl');
        emailTemplate = document.getElementById('emailTemplate');
        copyLinkButton = document.getElementById('copyLinkButton');
        copyEmailButton = document.getElementById('copyEmailButton');
        sendViaGmailButton = document.getElementById('sendViaGmailButton');
        copyHTMLInvoiceButton = document.getElementById('copyHTMLInvoiceButton');
        
        if (!invoiceModal) {
            console.error('Could not find invoice modal elements');
            return;
        }
        
        // Set up event listeners
        modalClose.addEventListener('click', closeInvoiceModal);
        cancelButton.addEventListener('click', closeInvoiceModal);
        
        // Close modal when clicking outside
        invoiceModal.addEventListener('click', (e) => {
            if (e.target === invoiceModal) {
                closeInvoiceModal();
            }
        });
        
        // Amount preset change handler
        invoiceAmountPreset.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                invoiceAmount.focus();
            } else {
                invoiceAmount.value = e.target.value;
            }
        });
        
        // Generate invoice button handler
        generateInvoiceButton.addEventListener('click', async () => {
            await generateInvoice();
        });
        
        // Copy buttons
        copyLinkButton.addEventListener('click', () => {
            navigator.clipboard.writeText(paymentLinkUrl.textContent)
                .then(() => {
                    const originalText = copyLinkButton.textContent;
                    copyLinkButton.textContent = '✓ Copied!';
                    setTimeout(() => {
                        copyLinkButton.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Copy failed:', err);
                    alert('Failed to copy. Please select and copy manually.');
                });
        });
        
        copyEmailButton.addEventListener('click', () => {
            emailTemplate.select();
            document.execCommand('copy');
            
            const originalText = copyEmailButton.textContent;
            copyEmailButton.textContent = '✓ Copied!';
            setTimeout(() => {
                copyEmailButton.textContent = originalText;
            }, 2000);
        });
        
        // Send via Gmail button
        sendViaGmailButton.addEventListener('click', () => {
            if (!currentEmailData) {
                alert('Email data not available. Please regenerate the invoice.');
                return;
            }
            
            // Build Gmail compose URL
            const gmailUrl = buildGmailComposeUrl(
                currentEmailData.to,
                currentEmailData.subject,
                currentEmailData.body
            );
            
            // Open in new window
            window.open(gmailUrl, '_blank');
        });
        
        // Copy HTML Invoice button - now opens editor instead of direct copy
        if (copyHTMLInvoiceButton) {
            copyHTMLInvoiceButton.addEventListener('click', async () => {
            if (!currentEmailData || !currentUser) {
                alert('Email data not available. Please regenerate the invoice.');
                return;
            }
            
            // Get payment link URL from the displayed element
            const paymentUrl = paymentLinkUrl.textContent.trim();
            if (!paymentUrl) {
                alert('Payment link not available. Please regenerate the invoice.');
                return;
            }
            
            // Use stored invoice data if available, otherwise rebuild from current data
            let invoiceData = currentInvoiceData;
            if (!invoiceData) {
                invoiceData = {
                    customer_name: formatCustomerName(currentUser) !== 'N/A' ? formatCustomerName(currentUser) : (currentUser.email || 'Customer'),
                    customer_email: currentUser.email || '',
                    year: getInvoiceYear(currentEmailData?.subject),
                    acct_num: currentUser.acct_num
                };
            }
            
            const paymentLink = { url: paymentUrl };
            
            // Open editor modal with template
            await openInvoiceEditorModal(invoiceData, paymentLink, currentEmailData);
        });
        }
        
        // Record Payment button (replaces "Mark as Paid" - opens Payment Recording Modal)
        const recordPaymentFromInvoiceButton = document.getElementById('markAsPaidButton');
        const manualPaymentMethod = document.getElementById('manualPaymentMethod');
        
        if (recordPaymentFromInvoiceButton) {
            // Change button text to reflect new functionality
            recordPaymentFromInvoiceButton.textContent = '✓ Record Payment';
            
            recordPaymentFromInvoiceButton.addEventListener('click', async () => {
                if (!currentInvoiceData || !currentUser) {
                    alert('Invoice data not available. Please regenerate the invoice first.');
                    return;
                }
                
                // Find the invoice in allUsers to get full invoice object with payments
                const user = allUsers.find(u => u.acct_num === currentUser.acct_num);
                if (!user || !user.invoices) {
                    alert('User or invoice data not found. Please refresh the page.');
                    return;
                }
                
                // Find the invoice by invoice_id
                const invoice = user.invoices.find(inv => 
                    inv.invoice_id === currentInvoiceData.invoice_id || 
                    inv.id === currentInvoiceData.id
                );
                
                if (!invoice) {
                    alert('Invoice not found. Please refresh the page.');
                    return;
                }
                
                // Close invoice modal and open payment recording modal
                closeInvoiceModal();
                
                // Small delay to ensure modal closes before opening new one
                setTimeout(() => {
                    openPaymentModal(user, invoice);
                }, 200);
            });
        }
        
        modalInitialized = true;
        console.log('Invoice modal initialized successfully');
    }
    
    // Initialize invoice editor modal event listeners
    function initializeInvoiceEditorModal() {
        // Get modal elements
        invoiceEditorModal = document.getElementById('invoiceEditorModal');
        const editorModalClose = document.getElementById('invoiceEditorModalClose');
        const editorCancelButton = document.getElementById('invoiceEditorCancelButton');
        const toggleHtmlSourceButton = document.getElementById('toggleHtmlSourceButton');
        const copyAndOpenGmailButton = document.getElementById('copyAndOpenGmailButton');
        
        // Close button
        if (editorModalClose) {
            editorModalClose.addEventListener('click', closeInvoiceEditorModal);
        }
        
        // Cancel button
        if (editorCancelButton) {
            editorCancelButton.addEventListener('click', closeInvoiceEditorModal);
        }
        
        // Toggle HTML source button
        if (toggleHtmlSourceButton) {
            toggleHtmlSourceButton.addEventListener('click', toggleHtmlSourceView);
        }
        
        // Copy & Open Gmail button
        if (copyAndOpenGmailButton) {
            copyAndOpenGmailButton.addEventListener('click', copyEditedInvoiceAndOpenGmail);
        }
        
        // Close modal when clicking outside
        if (invoiceEditorModal) {
            invoiceEditorModal.addEventListener('click', (e) => {
                if (e.target === invoiceEditorModal) {
                    closeInvoiceEditorModal();
                }
            });
        }
    }
    
    // Initialize editor modal when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeInvoiceEditorModal);
    } else {
        initializeInvoiceEditorModal();
    }
    
    // Open modal with user data
    function openInvoiceModal(user) {
        // Initialize modal if not already done
        initializeModal();
        
        if (!invoiceModal) {
            alert('Invoice modal could not be initialized. Please refresh the page.');
            return;
        }
        
        currentUser = user;
        
        // Populate form
        document.getElementById('invoiceAcctNum').value = user.acct_num || '';
        document.getElementById('invoiceName').value = formatCustomerName(user);
        document.getElementById('invoiceEmail').value = user.email || '';
        
        // Set defaults
        invoiceAmount.value = '555';
        invoiceAmountPreset.value = '555';
        
        // Reset modal state
        hideModalMessages();
        paymentLinkResult.style.display = 'none';
        document.getElementById('invoiceForm').style.display = 'block';
        generateInvoiceButton.disabled = false;
        
        // Show modal
        invoiceModal.classList.add('active');
    }
    
    // Close modal
    function closeInvoiceModal() {
        invoiceModal.classList.remove('active');
        currentUser = null;
    }
    
    // Main invoice generation function
    async function generateInvoice() {
        if (!currentUser) {
            showModalError('No user selected');
            return;
        }
        
        // Validate Stripe configuration
        const stripeConfig = window.HandyWorksConfig.stripe;
        
        if (!stripeConfig) {
            showModalError('Stripe configuration not found. Please check js/config.js');
            return;
        }
        
        // If using Vercel function (secure), we don't need secretKey in config
        // If using direct API (test mode), we need secretKey in config
        if (stripeConfig.cloudFunctionUrl) {
            // Using Vercel function - secret key is stored server-side (secure)
            if (!stripeConfig.priceId || stripeConfig.priceId === null) {
                showModalError('Stripe Price ID is not configured. Please create a product in Stripe Dashboard and add the price ID to js/config.js');
                return;
            }
        } else {
            // Using direct API (test mode only) - need secretKey in config
            if (!stripeConfig.secretKey || stripeConfig.secretKey.includes('YOUR_')) {
                showModalError('Stripe is not configured. Please add your API keys to js/config.js or configure Vercel function URL.');
                return;
            }
            
            if (!stripeConfig.priceId || stripeConfig.priceId.includes('YOUR_')) {
                showModalError('Stripe Price ID is not configured. Please create a product in Stripe Dashboard and add the price ID to js/config.js');
                return;
            }
        }
        
        // Get form values
        const currentYear = new Date().getFullYear();
        const billingYear = currentYear + 1; // We always bill next year
        const invoiceData = {
            acct_num: currentUser.acct_num,
            customer_name: formatCustomerName(currentUser),
            customer_email: currentUser.email || '',
            clinic_name: currentUser.clinic || '', // Keep for database if present, not shown in form
            year: billingYear,
            amount: parseFloat(invoiceAmount.value),
            description: `Annual Maintenance ${billingYear}`
        };
        
        // Validate
        if (!invoiceData.amount || invoiceData.amount <= 0) {
            showModalError('Please enter a valid amount');
            return;
        }
        
        // Check for existing invoice (enhanced with payment checking)
        try {
            showModalSuccess('Loading...');
            const existingInvoice = await checkExistingInvoice(invoiceData.acct_num, invoiceData.year);
            
            if (existingInvoice) {
                hideModalMessages();
                
                // Get payments for this invoice
                const paymentsSnapshot = await db.collection('handyworks_payments')
                    .where('invoice_id', '==', existingInvoice.invoice_id)
                    .get();
                
                const payments = paymentsSnapshot.docs.map(doc => doc.data());
                const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const amountOwed = existingInvoice.amount - totalPaid;
                
                const statusText = existingInvoice.payment_status === 'paid' ? 'PAID' : 
                                 existingInvoice.payment_status === 'pending' ? 'PENDING' : 
                                 existingInvoice.payment_status === 'cancelled' ? 'CANCELLED' :
                                 existingInvoice.payment_status.toUpperCase();
                
                // Block if invoice is fully paid
                if (existingInvoice.payment_status === 'paid' || amountOwed <= 0) {
                    showModalError(
                        `Cannot create new invoice: ${invoiceData.year} invoice is already PAID.\n\n` +
                        `Amount Billed: $${existingInvoice.amount}\n` +
                        `Amount Paid: $${totalPaid.toFixed(2)}\n\n` +
                        `This customer has already paid for ${invoiceData.year}.`
                    );
                    setTimeout(() => closeInvoiceModal(), 3000);
                    return;
                }
                
                // Block if there are partial payments
                if (payments.length > 0 && totalPaid > 0) {
                    showModalError(
                        `Cannot create new invoice: Existing invoice has PARTIAL PAYMENTS.\n\n` +
                        `Invoice: ${existingInvoice.invoice_id}\n` +
                        `Amount Billed: $${existingInvoice.amount}\n` +
                        `Amount Paid: $${totalPaid.toFixed(2)}\n` +
                        `Amount Owed: $${amountOwed.toFixed(2)}\n` +
                        `Payments: ${payments.length} payment(s)\n\n` +
                        `Please either:\n` +
                        `• Record remaining payments on existing invoice\n` +
                        `• Delete existing invoice first (will lose payment history)`
                    );
                    setTimeout(() => closeInvoiceModal(), 5000);
                    return;
                }
                
                // Allow replacing if cancelled or pending with no payments
                if (existingInvoice.payment_status === 'cancelled' || payments.length === 0) {
                    const message = 
                        `An invoice for ${invoiceData.year} already exists with status: ${statusText}.\n\n` +
                        `Invoice: ${existingInvoice.invoice_id}\n` +
                        `Amount: $${existingInvoice.amount}\n` +
                        `Created: ${new Date(existingInvoice.created_at.seconds * 1000).toLocaleDateString()}\n` +
                        `Payments: ${payments.length}\n\n` +
                        `Do you want to REPLACE this invoice with a new one?\n` +
                        `(The old invoice will be marked as cancelled)`;
                    
                    const replaceInvoice = confirm(message);
                    
                    if (!replaceInvoice) {
                        // User chose not to replace - show existing invoice if it has a payment link
                        if (existingInvoice.payment_status === 'pending' && existingInvoice.stripe_payment_link_url) {
                            // Store full invoice data
                            currentInvoiceData = {
                                id: existingInvoice.id,
                                invoice_id: existingInvoice.invoice_id,
                                acct_num: existingInvoice.acct_num,
                                customer_name: existingInvoice.customer_name,
                                customer_email: existingInvoice.customer_email,
                                year: existingInvoice.year,
                                amount: existingInvoice.amount,
                                ...existingInvoice
                            };
                            showInvoiceSuccess(
                                { url: existingInvoice.stripe_payment_link_url },
                                generateEmailTemplate(invoiceData, { url: existingInvoice.stripe_payment_link_url }),
                                true
                            );
                        } else {
                            showModalError('Cancelled. Use the existing invoice or delete it first.');
                            setTimeout(() => closeInvoiceModal(), 2000);
                        }
                        return;
                    }
                    
                    // Mark old invoice as cancelled
                    await db.collection('handyworks_invoices').doc(existingInvoice.id).update({
                        payment_status: 'cancelled',
                        updated_at: firebase.firestore.Timestamp.now(),
                        updated_by: auth.currentUser?.email || 'admin'
                    });
                    
                    console.log(`Old invoice ${existingInvoice.invoice_id} marked as cancelled`);
                }
                // If user clicked OK, continue to create new invoice
            }
        } catch (error) {
            console.error('Error checking for existing invoice:', error);
            showModalError(`Error checking for existing invoice: ${error.message}`);
            return;
        }
        
        // Show loading state
        setGenerateButtonLoading(true);
        hideModalMessages();
        
        try {
            // Step 1: Create Stripe Payment Link
            showModalSuccess('Creating Stripe payment link...');
            const paymentLink = await createStripePaymentLink(invoiceData);
            
            // Step 2: Save invoice to Firestore
            showModalSuccess('Saving invoice to database...');
            const invoiceId = await saveInvoiceToFirestore(invoiceData, paymentLink);
            
            // Store full invoice data for later use
            currentInvoiceData = {
                id: invoiceId,
                invoice_id: invoiceData.invoice_id || `INV-${invoiceData.year}-${invoiceData.acct_num}`,
                acct_num: invoiceData.acct_num,
                customer_name: invoiceData.customer_name,
                customer_email: invoiceData.customer_email,
                year: invoiceData.year,
                amount: invoiceData.amount,
                ...invoiceData
            };
            
            // Step 3: Generate email template
            const emailText = generateEmailTemplate(invoiceData, paymentLink);
            
            // Step 4: New invoice flow: open Gmail immediately
            showInvoiceSuccess(paymentLink, emailText, false);
            
        } catch (error) {
            console.error('Invoice generation error:', error);
            showModalError(`Failed to generate invoice: ${error.message}`);
        } finally {
            setGenerateButtonLoading(false);
        }
    }
    
    // Create Stripe Payment Link
    // Create Stripe Checkout Session (replaces Payment Links for better pre-fill)
    async function createStripePaymentLink(invoiceData) {
        const stripeConfig = window.HandyWorksConfig.stripe;
        
        // If Cloud Function URL is configured, use it (secure - for production)
        if (stripeConfig.cloudFunctionUrl) {
            const response = await fetch(stripeConfig.cloudFunctionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    acct_num: invoiceData.acct_num,
                    customer_name: invoiceData.customer_name,
                    customer_email: invoiceData.customer_email,
                    year: invoiceData.year,
                    amount: invoiceData.amount,
                    description: invoiceData.description
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to create checkout session');
            }
            
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to create checkout session');
            }
            
            return {
                id: data.id,
                url: data.url
            };
        }
        
        // Fallback: Direct API call (for test mode only - exposes secret key)
        // TODO: Remove this once Cloud Function is deployed and working
        const body = new URLSearchParams({
            'mode': 'payment',
            'line_items[0][price]': stripeConfig.priceId,
            'line_items[0][quantity]': '1',
            // Pre-fill customer information
            'customer_email': invoiceData.customer_email || '',
            'billing_address_collection': 'auto',
            'phone_number_collection[enabled]': 'true',
            // Success/Cancel URLs (required for Checkout Sessions)
            'success_url': 'https://handyworks.com/?payment=success',
            'cancel_url': 'https://handyworks.com/?payment=cancelled',
            // Metadata for tracking
            'metadata[acct_num]': invoiceData.acct_num.toString(),
            'metadata[customer_name]': invoiceData.customer_name,
            'metadata[year]': invoiceData.year.toString(),
            'metadata[invoice_amount]': invoiceData.amount.toString(),
            // Custom fields for name pre-fill
            'custom_text[submit][message]': `Payment for ${invoiceData.customer_name} - ${invoiceData.year} Annual Maintenance`
        });
        
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeConfig.secretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to create checkout session');
        }
        
        const data = await response.json();
        return {
            id: data.id,
            url: data.url
        };
    }
    
    // Save invoice to Firestore
    async function saveInvoiceToFirestore(invoiceData, paymentLink) {
        const invoice = {
            invoice_id: `INV-${invoiceData.year}-${invoiceData.acct_num}`,
            acct_num: invoiceData.acct_num,
            customer_name: invoiceData.customer_name,
            customer_email: invoiceData.customer_email,
            clinic_name: invoiceData.clinic_name,
            year: invoiceData.year,
            amount: invoiceData.amount,
            description: invoiceData.description,
            invoice_date: firebase.firestore.Timestamp.now(),
            payment_status: 'pending',
            payment_method: null,
            stripe_payment_link_id: paymentLink.id,
            stripe_payment_link_url: paymentLink.url,
            stripe_payment_intent_id: null,
            paid_date: null,
            paid_amount: null,
            transaction_ref: null,
            created_at: firebase.firestore.Timestamp.now(),
            updated_at: firebase.firestore.Timestamp.now(),
            created_by: auth.currentUser?.email || 'admin',
            updated_by: null
        };
        
        const docRef = await db.collection('handyworks_invoices').add(invoice);
        return docRef.id;
    }
    
    // Check for existing invoice (finds active and cancelled invoices)
    async function checkExistingInvoice(acctNum, year) {
        try {
            // Get all invoices for this account and year (including cancelled)
            const query = db.collection('handyworks_invoices')
                .where('acct_num', '==', acctNum)
                .where('year', '==', year)
                .orderBy('created_at', 'desc')
                .limit(1);
            
            const snapshot = await query.get();
            
            if (snapshot.empty) {
                return null;
            }
            
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('Error checking existing invoice:', error);
            return null;
        }
    }
    
    // Removed markInvoiceAsPaid() - use Payment Recording Modal instead
    // This ensures payment records are created in handyworks_payments collection
    // which is the source of truth for payment totals
    
    // Generate email template (plain text)
    function generateEmailTemplate(invoiceData, paymentLink) {
        // Get business settings
        const settings = getBusinessSettings();
        
        // Calculate check discount
        const checkDiscount = settings.cardAmount - settings.checkAmount;
        
        // Format customer name based on salutation setting
        let greeting;
        if (settings.salutation === 'none') {
            // Use first name only
            greeting = `Hi ${invoiceData.customer_name.split(' ')[0]},`;
        } else {
            // Use title + last name (e.g., "Dr. Smith")
            const nameParts = invoiceData.customer_name.split(' ');
            const lastName = nameParts[nameParts.length - 1];
            greeting = `Hi ${settings.salutation} ${lastName},`;
        }
        
        return `Subject: HandyWorks Annual Maintenance Invoice - ${invoiceData.year}

${greeting}

We are doing our billing differently this year!

Rather than mail the invoice, we are using this email with a payment link included. While you can still call us with your credit card info or send via a fax, we thought this method would be easier. And rather than wait till January 1 to send the invoice, we are doing it just before the end of the year. With that in mind...

Your annual HandyWorks maintenance fee for ${invoiceData.year} is coming due. We are keeping the amount the same as last year ($${settings.cardAmount}), even while our expenses have gone up.

Options:
Pay $${settings.cardAmount} via Stripe: ${paymentLink.url}

-or-

Pay $${settings.checkAmount} by check and save $${checkDiscount}. You can send a check to:

Chapter 1 Software Inc
140 E 28th Street
Suite 1F
New York City, NY 10016

As in the past, we charge maintenance once per calendar year and this invoice covers HandyWork support charges for ${invoiceData.year}. This includes all upgrades, all fixes, all modifications, as well as unlimited toll-free technical support. In good faith while awaiting your payment, we will continue to provide phone support until January 31.

Thank you for your continued business! We appreciate your support and look forward to serving you in ${invoiceData.year}.

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,

Dr. Steve`;
    }
    
    // Generate HTML email template (formatted for rich text email)
    function generateEmailHTMLTemplate(invoiceData, paymentLink) {
        // Get business settings
        const settings = getBusinessSettings();
        
        // Calculate check discount
        const checkDiscount = settings.cardAmount - settings.checkAmount;
        
        // Format customer name based on salutation setting
        let greeting;
        if (settings.salutation === 'none') {
            // Use first name only
            greeting = `Hi ${invoiceData.customer_name.split(' ')[0]},`;
        } else {
            // Use title + last name (e.g., "Dr. Smith")
            const nameParts = invoiceData.customer_name.split(' ');
            const lastName = nameParts[nameParts.length - 1];
            greeting = `Hi ${settings.salutation} ${lastName},`;
        }
        
        // Escape HTML to prevent XSS
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .greeting {
            font-weight: normal;
            margin-bottom: 20px;
        }
        .intro {
            margin-bottom: 20px;
        }
        .amount-section {
            background-color: #f8f9fa;
            border-left: 4px solid #008080;
            padding: 15px;
            margin: 20px 0;
        }
        .options {
            margin: 20px 0;
        }
        .payment-option {
            margin: 15px 0;
            padding: 10px;
        }
        .payment-link {
            display: inline-block;
            background-color: #008080;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 10px;
        }
        .payment-link:hover {
            background-color: #006666;
        }
        .check-address {
            background-color: #fff;
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            font-family: monospace;
            white-space: pre-line;
        }
        .terms {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 0.95em;
            color: #666;
        }
        .closing {
            margin-top: 30px;
        }
        .signature {
            margin-top: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="greeting">${escapeHtml(greeting)}</div>
    
    <div class="intro">
        <p>We are doing our billing differently this year!</p>
        
        <p>Rather than mail the invoice, we are using this email with a payment link included. While you can still call us with your credit card info or send via a fax, we thought this method would be easier. And rather than wait till January 1 to send the invoice, we are doing it just before the end of the year. With that in mind...</p>
    </div>
    
    <div class="amount-section">
        <p><strong>Your annual HandyWorks maintenance fee for ${escapeHtml(invoiceData.year.toString())} is coming due.</strong> We are keeping the amount the same as last year ($${escapeHtml(settings.cardAmount.toString())}), even while our expenses have gone up.</p>
    </div>
    
    <div class="options">
        <p><strong>Options:</strong></p>
        
        <div class="payment-option">
            <p><strong>Pay $${escapeHtml(settings.cardAmount.toString())} via Stripe:</strong></p>
            <a href="${escapeHtml(paymentLink.url)}" class="payment-link">Pay Online via Stripe</a>
        </div>
        
        <div class="payment-option">
            <p><strong>-or-</strong></p>
        </div>
        
        <div class="payment-option">
            <p><strong>Pay $${escapeHtml(settings.checkAmount.toString())} by check and save $${escapeHtml(checkDiscount.toString())}.</strong> You can send a check to:</p>
            <div class="check-address">Chapter 1 Software Inc
140 E 28th Street
Suite 1F
New York City, NY 10016</div>
        </div>
    </div>
    
    <div class="terms">
        <p>As in the past, we charge maintenance once per calendar year and this invoice covers HandyWork support charges for ${escapeHtml(invoiceData.year.toString())}. This includes all upgrades, all fixes, all modifications, as well as unlimited toll-free technical support. In good faith while awaiting your payment, we will continue to provide phone support until January 31.</p>
    </div>
    
    <div class="closing">
        <p>Thank you for your continued business! We appreciate your support and look forward to serving you in ${escapeHtml(invoiceData.year.toString())}.</p>
        
        <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
    </div>
    
    <div class="signature">
        <p>Best regards,</p>
        <p>Dr. Steve</p>
    </div>
</body>
</html>`;
    }
    
    // Build Gmail compose URL
    // includeBody: if false, only includes to/subject (for HTML paste workflow)
    function buildGmailComposeUrl(to, subject, body = null, includeBody = true) {
        const params = new URLSearchParams({
            to: to,
            su: subject
        });
        if (includeBody && body) {
            params.append('body', body);
        }
        return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
    }
    
    // Show invoice success with payment link and email template
    // isExistingInvoice:
    // - false (new invoice): open Gmail immediately, close modal
    // - true (existing invoice reused): show results screen so admin can record manual payment
    function showInvoiceSuccess(paymentLink, emailText, isExistingInvoice = false) {
        // Extract subject and body from email text
        const lines = emailText.split('\n');
        const subject = lines[0].replace('Subject: ', '');
        const body = lines.slice(2).join('\n'); // Skip subject and blank line
        
        // Store email data for Gmail integration
        currentEmailData = {
            to: currentUser.email,
            subject: subject,
            body: body
        };
        
        if (isExistingInvoice) {
            document.getElementById('invoiceForm').style.display = 'none';
            paymentLinkResult.style.display = 'block';
            generateInvoiceButton.disabled = true;
            
            paymentLinkUrl.textContent = paymentLink.url;
            emailTemplate.value = emailText;
            
            showModalSuccess('✅ Existing invoice loaded. You can record a manual payment or resend the email.');
            return;
        }
        
        // New invoice: show results instead of auto-opening Gmail (due to redirect issues on some machines)
        document.getElementById('invoiceForm').style.display = 'none';
        paymentLinkResult.style.display = 'block';
        generateInvoiceButton.disabled = true;
        
        paymentLinkUrl.textContent = paymentLink.url;
        emailTemplate.value = emailText;
        
        showModalSuccess('✅ Invoice created successfully! Click "Send via Gmail" button below or copy the template.');
    }
    
    // Modal message helpers
    function showModalSuccess(message) {
        modalSuccessMessage.textContent = message;
        modalSuccessMessage.style.display = 'block';
        modalErrorMessage.style.display = 'none';
    }
    
    function showModalError(message) {
        modalErrorMessage.textContent = message;
        modalErrorMessage.style.display = 'block';
        modalSuccessMessage.style.display = 'none';
    }
    
    function hideModalMessages() {
        modalSuccessMessage.style.display = 'none';
        modalErrorMessage.style.display = 'none';
    }
    
    // Removed showModalLoading() - use showModalSuccess('Loading...') directly
    // Removed hideModalLoading() - use hideModalMessages() directly
    
    function setGenerateButtonLoading(isLoading) {
        if (isLoading) {
            generateButtonText.style.display = 'none';
            generateButtonSpinner.style.display = 'inline-block';
            generateInvoiceButton.disabled = true;
        } else {
            generateButtonText.style.display = 'inline';
            generateButtonSpinner.style.display = 'none';
            generateInvoiceButton.disabled = false;
        }
    }
    
    // Utility functions
    function formatCurrency(amount) {
        // Amount is already in dollars (not cents)
        return parseFloat(amount || 0).toFixed(2);
    }
    
    // Format customer name from user object
    function formatCustomerName(user) {
        if (!user) return 'N/A';
        return `${user.fname || ''} ${user.lname || ''}`.trim() || 'N/A';
    }
    
    // Extract year from invoice subject or use next year
    function getInvoiceYear(subject = null) {
        if (subject) {
            const yearMatch = subject.match(/\d{4}/);
            if (yearMatch) return parseInt(yearMatch[0]);
        }
        return new Date().getFullYear() + 1;
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

