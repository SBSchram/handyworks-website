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
            
            // Load 2026 invoices for payment status
            const currentYear = new Date().getFullYear();
            const targetYear = currentYear + 1; // 2026 for billing
            const invoicesSnapshot = await db.collection('handyworks_invoices')
                .where('year', '==', targetYear)
                .get();
            
            // Create a map of account number to invoice status
            const invoiceMap = {};
            invoicesSnapshot.docs.forEach(doc => {
                const invoice = doc.data();
                invoiceMap[invoice.acct_num] = {
                    payment_status: invoice.payment_status || 'pending',
                    invoice_id: doc.id,
                    amount: invoice.amount,
                    due_date: invoice.due_date,
                    stripe_payment_link_url: invoice.stripe_payment_link_url
                };
            });
            
            // Calculate payment status for each user (for 2026)
            allUsers.forEach(user => {
                user.invoice2026 = invoiceMap[user.acct_num] || null;
                user.paymentStatus = calculatePaymentStatus(user);
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
            const paymentStatus = user.paymentStatus || 'no-invoice';
            const statusClass = `status-${paymentStatus}`;
            
            // Format status text for display
            let statusText;
            if (paymentStatus === 'no-invoice') {
                statusText = 'No Invoice';
            } else {
                statusText = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
            }
            
            row.innerHTML = `
                <td>${fullName}</td>
                <td>${user.clinic || '<em style="color: #999;">No clinic name</em>'}</td>
                <td>${user.email || 'N/A'}</td>
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
        
        const headers = ['First Name', 'Last Name', 'Clinic', 'Email', 'Amount Owed', 'Payment Status'];
        const rows = filteredUsers.map(user => [
            user.fname || '',
            user.lname || '',
            user.clinic || '',
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
    let invoiceYear = null;
    let invoiceDescription = null;
    let invoiceDueDate = null;
    let modalSuccessMessage = null;
    let modalErrorMessage = null;
    let paymentLinkResult = null;
    let paymentLinkUrl = null;
    let emailTemplate = null;
    let copyLinkButton = null;
    let copyEmailButton = null;
    let sendViaGmailButton = null;
    
    let currentUser = null;
    let modalInitialized = false;
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
        invoiceYear = document.getElementById('invoiceYear');
        invoiceDescription = document.getElementById('invoiceDescription');
        modalSuccessMessage = document.getElementById('modalSuccessMessage');
        modalErrorMessage = document.getElementById('modalErrorMessage');
        paymentLinkResult = document.getElementById('paymentLinkResult');
        paymentLinkUrl = document.getElementById('paymentLinkUrl');
        emailTemplate = document.getElementById('emailTemplate');
        copyLinkButton = document.getElementById('copyLinkButton');
        copyEmailButton = document.getElementById('copyEmailButton');
        sendViaGmailButton = document.getElementById('sendViaGmailButton');
        
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
        
        // Update description when year changes
        invoiceYear.addEventListener('change', (e) => {
            invoiceDescription.value = `Annual Maintenance ${e.target.value}`;
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
        
        modalInitialized = true;
        console.log('Invoice modal initialized successfully');
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
        document.getElementById('invoiceName').value = `${user.fname || ''} ${user.lname || ''}`.trim();
        document.getElementById('invoiceEmail').value = user.email || '';
        document.getElementById('invoiceClinic').value = user.clinic || '';
        
        // Set defaults
        const currentYear = new Date().getFullYear();
        invoiceYear.value = currentYear + 1; // Default to next year
        invoiceAmount.value = '555';
        invoiceAmountPreset.value = '555';
        invoiceDescription.value = `Annual Maintenance ${currentYear + 1}`;
        
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
        console.log('Stripe Config Check:', {
            exists: !!stripeConfig,
            hasSecretKey: !!stripeConfig?.secretKey,
            secretKeyPreview: stripeConfig?.secretKey?.substring(0, 20) + '...',
            hasPriceId: !!stripeConfig?.priceId,
            priceId: stripeConfig?.priceId
        });
        
        if (!stripeConfig || !stripeConfig.secretKey || stripeConfig.secretKey.includes('YOUR_')) {
            console.error('Stripe validation failed:', {
                configExists: !!stripeConfig,
                secretKeyExists: !!stripeConfig?.secretKey,
                containsPlaceholder: stripeConfig?.secretKey?.includes('YOUR_')
            });
            showModalError('Stripe is not configured. Please add your API keys to js/config.js (see scripts/STRIPE_PAYMENT_LINKS_SETUP.md)');
            return;
        }
        
        if (!stripeConfig.priceId || stripeConfig.priceId.includes('YOUR_')) {
            showModalError('Stripe Price ID is not configured. Please create a product in Stripe Dashboard and add the price ID to js/config.js');
            return;
        }
        
        // Get form values
        const invoiceData = {
            acct_num: currentUser.acct_num,
            customer_name: `${currentUser.fname || ''} ${currentUser.lname || ''}`.trim(),
            customer_email: currentUser.email || '',
            clinic_name: currentUser.clinic || '',
            year: parseInt(invoiceYear.value),
            amount: parseFloat(invoiceAmount.value),
            description: invoiceDescription.value
        };
        
        // Validate
        if (!invoiceData.amount || invoiceData.amount <= 0) {
            showModalError('Please enter a valid amount');
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
            
            // Step 3: Generate email template
            const emailText = generateEmailTemplate(invoiceData, paymentLink);
            
            // Step 4: Show success
            showInvoiceSuccess(paymentLink, emailText);
            
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
                    priceId: stripeConfig.priceId,
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
    
    // Generate email template
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
        
        // Format phone number (remove formatting, keep digits only, then format)
        const phoneDigits = settings.phone.replace(/\D/g, '');
        const formattedPhone = phoneDigits.length === 10 
            ? `(${phoneDigits.slice(0,3)}) ${phoneDigits.slice(3,6)}-${phoneDigits.slice(6)}`
            : settings.phone;
        
        // Build invoice number section
        const invoiceNumberLine = settings.showInvoiceNumber 
            ? `INVOICE #: INV-${invoiceData.year}-${invoiceData.acct_num}\n` 
            : '';
        
        // Build check memo instruction
        const checkMemoLine = (settings.showInvoiceNumber && settings.showCheckMemo)
            ? `\n   Please include invoice number (INV-${invoiceData.year}-${invoiceData.acct_num}) on check memo line.`
            : '';
        
        return `Subject: HandyWorks Annual Maintenance Invoice - ${invoiceData.year}

${greeting}

Your annual HandyWorks maintenance fee for ${invoiceData.year} is due.

${invoiceNumberLine}AMOUNT DUE: $${invoiceData.amount.toFixed(2)}

PAYMENT OPTIONS:

1. PAY ONLINE via Stripe: ${paymentLink.url}

2. PAY BY CHECK ($${checkDiscount.toFixed(0)} discount - $${settings.checkAmount}):
   Payment Due upon receipt
   Mail check to:
   Chapter 1 Software Inc
   140 E 28th Street
   Suite 1F
   New York City, NY 10016${checkMemoLine}

3. PAY BY PHONE: Call us at ${formattedPhone} with your credit card information and we'll process it securely.

4. PAY BY FAX: Send your credit card information to (212) 889-8830. We'll need CC#, expiration date, CV2 code and billing zip code.

We charge maintenance once per calendar year and this invoice covers HandyWork support charges for the current year. This includes all upgrades, all fixes, all modifications, as well as unlimited toll-free technical support. In good faith while awaiting your payment, we will continue to provide phone support until January 31.

Remember that the HandyWorks.com website always has the latest version of our software. We encourage you to stay current.

Thank you for your continued business! We appreciate your support and look forward to serving you in ${invoiceData.year}.

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,

Dr. Steve`;
    }
    
    // Build Gmail compose URL
    function buildGmailComposeUrl(to, subject, body) {
        const params = new URLSearchParams({
            to: to,
            su: subject,
            body: body
        });
        return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
    }
    
    // Show invoice success with payment link and email template
    function showInvoiceSuccess(paymentLink, emailText) {
        document.getElementById('invoiceForm').style.display = 'none';
        paymentLinkResult.style.display = 'block';
        generateInvoiceButton.disabled = true;
        
        paymentLinkUrl.textContent = paymentLink.url;
        emailTemplate.value = emailText;
        
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
        
        showModalSuccess('✅ Invoice created successfully! Send via Gmail or copy the template.');
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

