# HandyWorks Website Development Scratchpad

## Background and Motivation

**PROJECT OVERVIEW - 2025-01-09**

**Repository**: https://github.com/SBSchram/handyworks-website  
**Local Path**: `C:\Users\sbsch\Documents\handyworks-website`  
**Live Site**: https://handyworks.com/

### Project Description

HandyWorks Website is a static HTML website for HandyWorks Chiropractic Office Management Software. The site was migrated from WordPress in January 2025 and is now hosted on GitHub Pages.

### Key Features

- **Blog Homepage**: 61 blog posts (2015-2025) with expandable entries
- **Newsletter Archive**: 43 newsletters (1992-2017) in PDF format
- **Software Downloads**: Upgrade files and installation packages in `public/` directory
- **Desktop Software Integration**: `LatestVersion.txt` for automatic update checking
- **Billing System**: Firebase-based billing system with admin dashboard
- **SEO Optimized**: Meta tags, sitemap.xml, robots.txt
- **Email Forwarding**: steve@handyworks.com via Namecheap

### Technology Stack

- **Hosting**: GitHub Pages
- **DNS**: Namecheap
- **SSL**: Automatic via GitHub Pages
- **Email**: Namecheap email forwarding
- **Contact Form**: Formspree
- **Backend**: Firebase (for billing system)
- **Payment Processing**: Stripe (test mode configured)
- **Analytics**: None (privacy-focused)

### Project Structure

```
handyworks-website/
├── index.html              # Blog homepage
├── about.html              # About HandyWorks
├── contact.html            # Contact form (Formspree)
├── downloads.html          # Software downloads
├── faq.html                # FAQ page
├── features.html           # Features page
├── legacy.html             # Legacy information
├── newsletters.html        # Newsletter archive
├── partners.html           # Partners page
├── story.html              # The HandyWorks Story
├── billing/                # Billing system pages
│   ├── admin-login.html
│   └── admin.html
├── blog/                   # Blog posts (organized by year/month)
├── css/                    # Stylesheets
├── js/                     # JavaScript (config, header/footer, blog, sidebar)
├── images/                 # Images and logos
├── newsletters/            # Newsletter PDFs
├── public/                 # Download files (accessible via https://handyworks.com/public/)
├── scripts/                # Maintenance scripts
├── CNAME                   # Custom domain configuration
├── robots.txt              # Search engine directives
└── sitemap.xml             # Site map for SEO
```

### DNS Configuration

- **A Records** (apex domain):
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
- **CNAME Record** (www subdomain):
  - www → sbschram.github.io

## Key Challenges and Analysis

### Current System Architecture

**Static Site Generation**:
- All pages are static HTML files
- JavaScript handles dynamic content injection (header/footer, blog expansion)
- No build process required - direct HTML/CSS/JS

**Billing System Integration**:
- Firebase authentication and Firestore database
- Admin dashboard for billing management
- Stripe integration for payment processing (currently in test mode)
- Documentation available in `scripts/` directory:
  - `FIREBASE_SETUP_GUIDE.md`
  - `STRIPE_SETUP_GUIDE.md`
  - `BILLING_SYSTEM_ARCHITECTURE.md`
  - `FIRESTORE_STRUCTURE.md`

**Firebase User Repository**:
- **Firebase Console**: https://console.firebase.google.com/u/0/project/handyworks-billing/firestore/databases/-default-/data/~2Fhandyworks_users
- **Collection**: `handyworks_users` in Firestore database
- **Document Structure**: Each user document uses `acct_num` as the document ID (e.g., "1573", "1696", "110")
- **User Fields**:
  - `acct_num` (number) - Account number (used as document ID)
  - `fname`, `lname` (string) - User name
  - `clinic` (string) - Clinic name
  - `EMAIL` (string) - Email address (for Firebase Auth login)
  - `HomePhone`, `tele1`, `CellPhone` (string) - Phone numbers
  - `addr1`, `addr2`, `city`, `state`, `zip` (string) - Address
  - `status` (string) - Account status (A=Active, etc.)
  - `maint_billed`, `maint_paid`, `owed` (number) - Current billing amounts
  - `maintbilldt`, `maintpddt` (timestamp) - Billing dates
  - `imported_at` (timestamp) - Import metadata
  - `source` (string) - Data source
- **Management Scripts**:
  - `import_handyworks_data.js` - Import users from TSV file
  - `import_hwsales_csv.js` - Import from CSV format
  - `create_firebase_users.js` - Create Firebase Auth accounts from Firestore users

**Content Management**:
- Blog posts are individual HTML files organized by year/month
- Blog index is regenerated using `scripts/regenerate_blog_index.py`
- Newsletters are PDF files in `newsletters/` directory

**Maintenance Scripts**:
- `add_favicon.py`: Add favicon to HTML pages
- `add_meta_tags.py`: Add SEO meta tags to pages
- `clean_wordpress_content.py`: Clean WordPress HTML (for future blog posts)
- `regenerate_blog_index.py`: Regenerate blog homepage
- `test_site.py`: Test all links and downloads
- `final_cleanup.py`: Remove outdated files

## High-level Task Breakdown

### Current Status

**Project Status**: ✅ **REPOSITORY CLONED AND READY FOR DEVELOPMENT**

- Repository successfully cloned to local machine
- Project structure verified
- Configuration files reviewed
- Ready for development tasks

## Project Status Board

### ✅ **COMPLETED TASKS**

#### **Project Setup** ✅ **COMPLETE**
- [x] Repository cloned from GitHub
- [x] Project structure verified
- [x] Configuration files reviewed
- [x] Scratchpad created for project tracking
- [x] Firebase user repository verified and documented

#### **Firestore Security Rules** 🔄 **IN PROGRESS**
- [x] Security rules file created (`firestore.rules`)
- [x] Deployment guide created (`scripts/FIRESTORE_SECURITY_RULES.md`)
- [x] Admin claim script created (`scripts/set_admin_claim.js`)
- [x] Security rules deployed to Firebase
- [ ] Admin access tested
- [ ] User access tested
- [ ] Test Mode warning resolved
- [ ] Testing guide created (`scripts/test_security_rules.md`)

### 🎯 **CURRENT TASK**

**🔴 URGENT: Firestore Security Rules Deployment** ⏳ **IN PROGRESS**
- **Deadline**: 4 days until Test Mode expires
- **Status**: Security rules created, ready for deployment
- **Files Created**:
  - `firestore.rules` - Security rules file
  - `scripts/FIRESTORE_SECURITY_RULES.md` - Deployment guide
  - `scripts/set_admin_claim.js` - Admin user setup script
- **Next Steps**:
  1. Deploy security rules via Firebase Console
  2. Test admin and user access
  3. Set admin custom claims for admin users
  4. Verify Test Mode warning disappears

### 📋 **FUTURE ENHANCEMENTS** (Optional)

#### **Potential Improvements** (Future Development)
- [ ] Enhanced blog post management system
- [ ] Automated newsletter archive organization
- [ ] Enhanced SEO optimization
- [ ] Performance optimization
- [ ] Mobile responsiveness improvements
- [ ] Analytics integration (if desired)
- [ ] Automated testing for links and downloads

## Executor's Feedback or Assistance Requests

### ✅ **RESOLVED: File Write Permission Issue**

**Problem**: Attempted to write to `scratchpad.md` but encountered "EBADF: bad file descriptor" error.

**Root Cause**: Protected folder permissions preventing file writes.

**Resolution**: User granted write permissions to the protected folder.

**Status**: ✅ **RESOLVED** - File writes now working correctly.

### 🔴 **URGENT: Firestore Security Rules Deployment**

**Problem**: Firebase Firestore database is in Test Mode and will expire in 4 days, blocking all client requests.

**Root Cause**: Database was created in Test Mode (open access) which automatically expires after 30 days for security.

**Solution Implemented**:
- Created comprehensive security rules file (`firestore.rules`)
- Created deployment guide (`scripts/FIRESTORE_SECURITY_RULES.md`)
- Created admin claim setup script (`scripts/set_admin_claim.js`)

**Security Rules Features**:
- Requires authentication for all access
- Users can read their own data (email matching)
- Admins can read/write all data
- Protects all collections: `handyworks_users`, `handyworks_billing`, `handyworks_transactions`

**Status**: ✅ **DEPLOYED** - Rules deployed to Firebase

---

### 🔴 **URGENT: Firebase Authorized Domains**

**Problem**: Firebase Authentication blocking requests from `https://handyworks.com` with error: `auth/requests-from-referer-https://handyworks.com-are-blocked`

**Root Cause**: Domain `handyworks.com` not added to Firebase Authorized Domains list.

**Solution Required**:
1. Go to Firebase Console → Authentication → Settings
2. Add `handyworks.com` to Authorized Domains list
3. Clear browser cache and test login

**Documentation Created**:
- `scripts/FIRESTORE_AUTHORIZED_DOMAINS.md` - Step-by-step guide

**Status**: 🔄 **IN PROGRESS** - Referrer Policy issue being debugged
- **Root Cause**: Browser `Referrer Policy: no-referrer` preventing Referer header from being sent
- **Attempted Solutions**: 
  - Added `<meta name="referrer" content="unsafe-url">` to admin-login.html and admin.html
  - Added JavaScript to force referrer policy
  - Added cache-control headers
  - Updated cache-busting to `?v=20251212` (always update on changes)
- **Current Issue**: Referrer Policy still shows "not set" in console - likely GitHub Pages HTTP header override
- **Next Steps**: Check if GitHub Pages sets Referrer-Policy HTTP header, consider Firebase Hosting if needed
- Domain `handyworks.com` is correctly in authorized domains list

## Lessons

### 🏗️ **Architecture Lessons**

*Lessons will be documented here as development progresses.*

### 🔧 **Technical Lessons**

**File Write Permissions** ✅ **LEARNED**
- **Problem**: "EBADF: bad file descriptor" error when writing to files in protected folders
- **Solution**: Ensure write permissions are granted to the folder/directory
- **Lesson**: Protected folders (like Documents) may require explicit permission grants for file operations
- **Application**: Always verify folder permissions before attempting file writes

### 📱 **Development Lessons**

*Lessons will be documented here as development progresses.*

## Operating Guidelines

### Core Philosophy

- **Static Site Simplicity**: Keep the site simple and maintainable
- **Direct HTML/CSS/JS**: No unnecessary build processes
- **GitHub Pages Deployment**: Automatic deployment on push to main
- **Content-First**: Focus on content and user experience

### Project-Specific Defaults

- **Static HTML**: All pages are static HTML files
- **JavaScript Injection**: Use JS for header/footer and dynamic content
- **Cache Busting**: Use version query parameters in config.js
- **SEO Optimization**: Meta tags and sitemap for search engines
- **Privacy-Focused**: No analytics tracking

### Development Workflow

1. **Local Testing**: Use `python3 -m http.server 8000` for local testing
2. **Content Updates**: Edit HTML files directly
3. **Blog Posts**: Create in `blog/YYYY/MM/` and regenerate index
4. **Deployment**: Push to main branch for automatic GitHub Pages deployment

## Documentation Updates

### ✅ **COMPLETED: Initial Project Setup**

**Project Documentation** ✅ **COMPLETE**
- Repository cloned and verified
- Project structure documented
- Configuration files reviewed
- Scratchpad created for development tracking
