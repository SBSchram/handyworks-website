// Header and Footer inclusion for DRY principle
// Uses configuration from config.js for single source of truth
(function() {
    'use strict';
    
    // Function to initialize header and footer
    function initHeaderFooter() {
        console.log('Initializing header and footer...');
        
        // Wait for config to be available
        if (typeof window.HandyWorksConfig === 'undefined') {
            console.error('HandyWorksConfig not found. Make sure config.js is loaded first.');
            return;
        }
        
        const config = window.HandyWorksConfig;
        
        // Detect if we're in a subdirectory and adjust paths
        const pathPrefix = window.location.pathname.includes('/billing/') ? '../' : '';
        
        // Create navigation HTML from config
        const navItems = config.header.navigation.map(item => 
            `<li><a href="${pathPrefix}${item.href}">${item.text}</a></li>`
        ).join('\n                    ');
        
        // Create header HTML from config
        const logoHTML = config.header.logo 
            ? `<a href="${pathPrefix}index.html" class="logo-link"><img src="${pathPrefix}${config.header.logo}" alt="${config.header.logoAlt || 'Logo'}" class="site-logo"></a>`
            : '';
        
        const headerHTML = `
            <div class="header-container">
                ${logoHTML}
                <div class="site-title">
                    <h1>${config.header.title}</h1>
                    <p>${config.header.subtitle}</p>
                </div>
            </div>
            <nav>
                <ul>
                    ${navItems}
                </ul>
            </nav>
        `;

        // Create footer HTML from config
        let footerHTML = `<p>${config.footer.copyright}</p>`;
        
        // Add footer links if they exist
        if (config.footer.links && config.footer.links.length > 0) {
            const footerLinks = config.footer.links.map(link => 
                `<a href="${pathPrefix}${link.href}">${link.text}</a>`
            ).join(' | ');
            footerHTML += `<p class="footer-links">${footerLinks}</p>`;
        }

        // Insert header
        const header = document.querySelector('header');
        if (header) {
            header.innerHTML = headerHTML;
            console.log('Header inserted successfully');
        } else {
            console.error('Header element not found');
        }

        // Insert footer
        const footer = document.querySelector('footer');
        if (footer) {
            footer.innerHTML = footerHTML;
            console.log('Footer inserted successfully');
        } else {
            console.error('Footer element not found');
        }

        // Add active class to current page navigation item
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Handle index.html and empty path as same
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
        
        console.log('Header and footer initialization complete');
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeaderFooter);
    } else {
        // DOM is already ready
        initHeaderFooter();
    }
})();
