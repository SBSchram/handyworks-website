// Configuration file for DRY principle
// Single source of truth for cache busting and other settings
window.HandyWorksConfig = {
    version: '20251219v6',
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
    
    // Stripe configuration
    stripe: {
        // LIVE MODE (active)
        publishableKey: "pk_live_51SUrHJQpwWRwVGzVWV1l917fITkntY4mht7tvji4it8CLq6JjJYS4bxwIvPQWmAmwQ0GL021Su111MExDUjQcsuY00ERGQ92MJ",
        // secretKey is stored securely in Vercel environment variable (StripeLiveKey)
        productId: "prod_TRmYEaGZp9ljTX",
        priceId: "price_1SUszbQpwWRwVGzVy8VmOuV2",
        
        // TEST MODE (commented out - for testing only)
        // publishableKey: "pk_test_51SUrHgQwduOvSBAvwzESLZuJQK7SwwkCcqWjAQaPa1oAvX0QWWEwUiGE9moXNg5yJeu5V3NLnNIGZuBlIFNvy6uE00JNXqBy2l",
        // secretKey: "sk_test_51SUrHgQwduOvSBAv8srnPsP2sFRXX887e6BUDqYdG4K0DJOwbtGkJ6jifrXxr1PV98JwtN9ViLWesVSokrKtmj5500CLLYtkHu",
        // productId: "prod_TbIHqgMUQAEuVi",
        // priceId: "price_1Se5gWQwduOvSBAvaev9M9dx",
        
        // For check payments (optional - $540 instead of $555)
        checkPriceId: null,  // Set to price ID if you create a $540 product
        // Serverless Function URL
        // Vercel deployment: https://handyworks-website.vercel.app/api/createCheckoutSession
        // Leave null to use direct API call for test mode (exposes secret key - test only!)
        cloudFunctionUrl: "https://handyworks-website.vercel.app/api/createCheckoutSession"
    }
};