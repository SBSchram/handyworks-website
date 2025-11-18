// Configuration file for DRY principle
// Single source of truth for cache busting and other settings
window.HandyWorksConfig = {
    version: '20250129v5',
    cacheBust: true,
    
    // Header configuration
    header: {
        logo: 'images/logos/cropped-hwlogo.gif',
        logoAlt: 'HandyWorks Logo',
        title: 'HandyWorks',
        subtitle: 'Chiropractic Office Management software',
        navigation: [
            { href: 'index.html', text: 'HOME' },
            { href: 'downloads.html', text: 'UPGRADES & DOWNLOADS' },
            { href: 'about.html', text: 'ABOUT HANDYWORKS' },
            { href: 'contact.html', text: 'CONTACT US' },
            { href: 'legacy.html', text: 'LEGACY' }
        ]
    },
    
    // Footer configuration
    footer: {
        copyright: '&copy; 2025 HandyWorks Software. All rights reserved.',
        links: [
            { href: 'newsletters.html', text: 'Newsletter Archive' }
        ]
    },
    
    // Get cache busted URL for a file
    getCacheBustedUrl: function(filePath) {
        return this.cacheBust ? `${filePath}?v=${this.version}` : filePath;
    },
    
    // Firebase configuration for HandyWorks Billing
    firebase: {
        apiKey: "AIzaSyBBEcYul9EkvhaYehpR2wBKkvi7W9s-zVo",
        authDomain: "handyworks-billing.firebaseapp.com",
        projectId: "handyworks-billing",
        storageBucket: "handyworks-billing.firebasestorage.app",
        messagingSenderId: "326712635528",
        appId: "1:326712635528:web:5c408a30fd44de2f9e2f3d",
        measurementId: "G-3ZDBCGXH4D"
    },
    
    // Stripe configuration (Test Mode)
    stripe: {
        publishableKey: "pk_test_51SUrHgQwduOvSBAvwzESLZuJQK7SwwkCcqWjAQaPa1oAvX0QWWEwUiGE9moXNg5yJeu5V3NLnNIGZuBlIFNvy6uE00JNXqBy2l"
    }
};