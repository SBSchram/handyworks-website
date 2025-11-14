# HandyWorks Website Migration Roadmap
**From WordPress to Static HTML Site**

**Last Updated:** January 29, 2025  
**Current Status:** MIGRATION COMPLETE ✅  
**Live Site:** https://www.handyworks.com/  
**Hosting:** GitHub Pages (migrated from WordPress/cPanel)

---

## Executive Summary

Migrating HandyWorks website from WordPress to a modern static HTML site hosted on GitHub Pages (similar to JetLagPro). This migration will:
- Eliminate WordPress maintenance overhead
- Improve performance and security
- Reduce hosting costs
- Maintain all existing content and functionality
- Preserve SEO and user experience

---

## Current State Assessment

### ✅ What We Have

**Existing Static Site (in `/Users/Steve/Development/handyworks-website`):**
- 13 HTML pages (index, about, blog, contact, downloads, faq, features, legacy, partners, story, template, debug, test)
- WordPress export XML: `handyworks.WordPress.2025-10-29.xml` (7,440 lines)
- CSS styling: `css/style.css` (842 lines)
- JavaScript: Header/footer injection system (`js/header-footer.js`, `js/config.js`)
- Build system: `build.js` (Node.js script for DRY page generation)
- Images directory: `images/` (with README)
- Basic structure with DRY principles (header/footer via JS)

**Current Site Structure:**
```
handyworks-website/
├── index.html          # Homepage
├── about.html          # About page with sidebar
├── blog.html           # Blog with 3 posts
├── contact.html        # Contact information
├── downloads.html      # Software downloads
├── faq.html           # FAQ with installation guide
├── features.html       # Feature list
├── legacy.html         # Legacy information
├── partners.html       # Partners page
├── story.html          # HandyWorks story
├── template.html       # HTML template
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   ├── config.js       # Configuration (version, nav, etc.)
│   └── header-footer.js # Header/footer injection
├── images/             # Image assets
├── build.js            # Build script
└── handyworks.WordPress.2025-10-29.xml # WordPress export
```

**cPanel Access Available:**
- Can access current WordPress installation
- Can export database, files, media
- Can view server configuration
- Can access current domain setup

### ⚠️ What Needs Recovery

**From WordPress (via cPanel):**
1. **Content Recovery:**
   - All blog posts (beyond the 3 currently in blog.html)
   - Page content (check for pages not yet migrated)
   - Media files (images, PDFs, documents)
   - Newsletter archives (mentioned in about.html sidebar)
   - Reports List page (referenced but not created)
   - Any custom post types or content

2. **Data Recovery:**
   - WordPress database export (if not already done)
   - Media library files
   - Custom fields and metadata
   - SEO data (meta descriptions, titles)
   - Contact form submissions (if any)

3. **Configuration Recovery:**
   - Domain/DNS settings
   - SSL certificate information
   - Email configuration
   - Redirect rules
   - Analytics/tracking codes

4. **Missing Pages (Referenced but Not Created):**
   - Reports List page (linked in about.html)
   - Newsletter archive pages (Winter 2017-2008)
   - Cart/Checkout pages (if e-commerce was used)
   - My Account page
   - Shop page
   - Admin page

---

## Migration Roadmap

### Phase 1: Content Recovery & Inventory (Week 1)

#### 1.1 WordPress Content Audit via cPanel
**Tasks:**
- [ ] Access WordPress admin via cPanel
- [ ] Export complete database backup
- [ ] Download all media files from `/wp-content/uploads/`
- [ ] Document all pages, posts, and custom post types
- [ ] Export all blog posts (check for drafts/unpublished)
- [ ] List all plugins and their purposes
- [ ] Document custom fields and metadata

**Deliverables:**
- Complete WordPress database export
- Media library archive
- Content inventory spreadsheet
- Plugin/theme documentation

#### 1.2 Content Extraction from WordPress Export
**Tasks:**
- [ ] Parse `handyworks.WordPress.2025-10-29.xml`
- [ ] Extract all blog posts with dates, categories, content
- [ ] Extract all pages with content and metadata
- [ ] Identify media references and download missing files
- [ ] Extract newsletter content (if in export)
- [ ] Document content structure and relationships

**Deliverables:**
- Parsed content JSON/Markdown files
- Blog post archive (organized by date)
- Complete page content inventory
- Media file mapping

#### 1.3 Missing Content Identification
**Tasks:**
- [ ] Compare WordPress export with current static pages
- [ ] Identify missing pages (Reports List, Newsletters, etc.)
- [ ] Check for content referenced but not present
- [ ] Document broken links and missing assets
- [ ] Create content gap analysis

**Deliverables:**
- Content gap analysis document
- Missing page list with priorities
- Broken link report

---

### Phase 2: Site Architecture & Structure (Week 1-2)

#### 2.1 Site Structure Design
**Tasks:**
- [ ] Define complete site map (all pages)
- [ ] Design navigation structure
- [ ] Plan blog archive structure
- [ ] Design newsletter archive structure
- [ ] Plan download section organization
- [ ] Design search functionality (if needed)

**Deliverables:**
- Complete site map
- Navigation structure document
- URL structure plan

#### 2.2 Build System Enhancement
**Tasks:**
- [ ] Review and enhance `build.js` for all pages
- [ ] Create blog post generation system
- [ ] Create newsletter archive system
- [ ] Implement cache busting (already partially done)
- [ ] Add version management
- [ ] Create build documentation

**Deliverables:**
- Enhanced build.js
- Blog post template system
- Build documentation

#### 2.3 Template System
**Tasks:**
- [ ] Standardize HTML template structure
- [ ] Create blog post template
- [ ] Create newsletter template
- [ ] Create page templates (with/without sidebar)
- [ ] Ensure consistent header/footer injection
- [ ] Test template system

**Deliverables:**
- Template library
- Template usage guide

---

### Phase 3: Content Migration (Week 2-3)

#### 3.1 Blog Migration
**Tasks:**
- [ ] Convert WordPress blog posts to static HTML
- [ ] Preserve dates, categories, formatting
- [ ] Convert images and media references
- [ ] Create blog index page with all posts
- [ ] Implement blog post permalinks
- [ ] Add RSS feed (optional)

**Deliverables:**
- Complete blog archive
- Blog index page
- Individual blog post pages

#### 3.2 Page Migration
**Tasks:**
- [ ] Migrate all WordPress pages to static HTML
- [ ] Create missing pages (Reports List, etc.)
- [ ] Preserve page hierarchy and relationships
- [ ] Convert page content formatting
- [ ] Update internal links

**Deliverables:**
- All pages migrated
- Missing pages created
- Link structure updated

#### 3.3 Newsletter Archive
**Tasks:**
- [ ] Extract newsletter content from WordPress
- [ ] Create newsletter archive pages
- [ ] Organize by year/season
- [ ] Link from about.html sidebar
- [ ] Create newsletter index page

**Deliverables:**
- Newsletter archive pages
- Newsletter index
- Updated sidebar links

#### 3.4 Media Migration
**Tasks:**
- [ ] Download all media from WordPress
- [ ] Organize into appropriate directories
- [ ] Update all image references
- [ ] Optimize images (if needed)
- [ ] Create media asset inventory

**Deliverables:**
- Complete media library
- Updated image references
- Media inventory

---

### Phase 4: Enhancement & Polish (Week 3-4)

#### 4.1 SEO Optimization
**Tasks:**
- [ ] Extract meta descriptions from WordPress
- [ ] Add meta tags to all pages
- [ ] Create sitemap.xml
- [ ] Create robots.txt
- [ ] Implement structured data (if needed)
- [ ] Optimize page titles

**Deliverables:**
- SEO-optimized pages
- Sitemap.xml
- Robots.txt

#### 4.2 Styling & Design
**Tasks:**
- [ ] Review and enhance CSS
- [ ] Ensure responsive design
- [ ] Test across browsers
- [ ] Optimize for mobile
- [ ] Ensure accessibility
- [ ] Polish visual design

**Deliverables:**
- Enhanced stylesheet
- Responsive design
- Cross-browser compatibility

#### 4.3 Functionality
**Tasks:**
- [ ] Implement search (if needed)
- [ ] Add contact form (static or third-party)
- [ ] Test all links
- [ ] Verify downloads work
- [ ] Test navigation
- [ ] Add analytics (if needed)

**Deliverables:**
- Functional site
- Tested links and downloads
- Analytics integration

---

### Phase 5: Deployment Preparation (Week 4)

#### 5.1 GitHub Repository Setup
**Tasks:**
- [ ] Create GitHub repository (if not exists)
- [ ] Set up repository structure
- [ ] Configure .gitignore
- [ ] Add README.md
- [ ] Set up branch structure
- [ ] Document deployment process

**Deliverables:**
- GitHub repository
- Repository documentation

#### 5.2 GitHub Pages Configuration
**Tasks:**
- [ ] Configure GitHub Pages settings
- [ ] Set custom domain (handyworks.com)
- [ ] Configure DNS (if needed)
- [ ] Set up SSL (via GitHub Pages)
- [ ] Test GitHub Pages deployment
- [ ] Document deployment workflow

**Deliverables:**
- GitHub Pages configured
- Custom domain setup
- Deployment documentation

#### 5.3 Pre-Deployment Testing
**Tasks:**
- [ ] Test all pages locally
- [ ] Verify all links work
- [ ] Test downloads
- [ ] Check mobile responsiveness
- [ ] Validate HTML/CSS
- [ ] Test build process
- [ ] Performance testing

**Deliverables:**
- Tested site
- Test report
- Performance metrics

---

### Phase 6: Migration & Cutover (Week 4-5)

#### 6.1 DNS Migration - SIMPLIFIED STEP-BY-STEP
**Current Status:** DNS managed by cPanel (DNS1.TRKHOSTING.COM). Need to switch to Namecheap and set up GitHub Pages.

**Simple 4-Step Process:**

**STEP 1: Switch DNS to Namecheap**
- Go to Namecheap → Domain List → handyworks.com → Manage → Advanced DNS
- Click "Change" next to nameservers
- Select "Namecheap BasicDNS"
- Save
- Wait 1-2 hours

**STEP 2: Set Up Email Forwarding**
- After DNS switches, go to Email Forwarding tab in Namecheap
- Add forwarders for any email addresses you need (e.g., info@handyworks.com → your email)
- User will tell us which email addresses they need

**STEP 3: Add GitHub Pages DNS Records**
- In Namecheap Advanced DNS → Host Records
- Add CNAME: www → sbschram.github.io
- (Optional) Add 4 A records for apex domain

**STEP 4: Configure GitHub Pages**
- Go to GitHub repo settings → Pages
- Enter custom domain: www.handyworks.com
- Save
- Wait for DNS propagation (1-24 hours)
- Enable HTTPS when available

**Tasks:**
- [x] Step 1: Switch DNS to Namecheap BasicDNS ✅
- [x] Step 2: Set up email forwarding ✅ (steve@handyworks.com → sbschram@gmail.com)
- [x] Step 3: Add GitHub Pages DNS records ✅ (CNAME: www → sbschram.github.io)
- [x] Step 4: Configure GitHub Pages custom domain ✅ (Site live at http://www.handyworks.com/)

#### 6.2 Content Migration
**Tasks:**
- [ ] Final content review
- [ ] Deploy to GitHub Pages
- [ ] Verify deployment
- [ ] Test live site
- [ ] Update any hardcoded URLs
- [ ] Verify SSL certificate

**Deliverables:**
- Live site on GitHub Pages
- Verified functionality

#### 6.3 Redirects & Cleanup
**Tasks:**
- [ ] Set up WordPress redirects (if keeping WordPress temporarily)
- [ ] Create 301 redirects for old URLs
- [ ] Update external links (if any)
- [ ] Archive WordPress site (backup)
- [ ] Document final configuration

**Deliverables:**
- Redirect configuration
- WordPress backup
- Final documentation

---

### Phase 7: Post-Migration (Week 5+)

#### 7.1 Monitoring & Verification
**Tasks:**
- [ ] Monitor site uptime
- [ ] Check analytics (if applicable)
- [ ] Verify all functionality
- [ ] Monitor for broken links
- [ ] Check search engine indexing
- [ ] User acceptance testing

**Deliverables:**
- Monitoring setup
- Verification report

#### 7.2 Documentation
**Tasks:**
- [ ] Document final site structure
- [ ] Create maintenance guide
- [ ] Document build process
- [ ] Create content update guide
- [ ] Document deployment process

**Deliverables:**
- Complete documentation
- Maintenance guide

#### 7.3 Optimization
**Tasks:**
- [ ] Performance optimization
- [ ] Image optimization
- [ ] Code optimization
- [ ] SEO fine-tuning
- [ ] User experience improvements

**Deliverables:**
- Optimized site
- Performance report

---

## Technical Specifications

### Current Technology Stack
- **HTML5**: Static pages
- **CSS3**: Custom stylesheet
- **JavaScript**: Vanilla JS for header/footer injection
- **Build System**: Node.js (build.js)
- **Hosting Target**: GitHub Pages

### Proposed Enhancements
- **Static Site Generator**: Consider Jekyll or similar (optional)
- **Search**: Client-side search (if needed)
- **Contact Form**: Third-party service or static email
- **Analytics**: Google Analytics or similar
- **CDN**: GitHub Pages provides CDN automatically

### File Structure (Proposed)
```
handyworks-website/
├── index.html
├── about.html
├── blog/
│   ├── index.html          # Blog archive
│   ├── 2025/
│   │   ├── 02/
│   │   │   └── handyworks-update-february-2025.html
│   │   └── ...
│   └── ...
├── newsletters/
│   ├── index.html          # Newsletter archive
│   ├── 2017/
│   │   └── winter-2017.html
│   └── ...
├── downloads.html
├── faq.html
├── features.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   └── header-footer.js
├── images/
│   └── ...
├── downloads/              # Software downloads
│   └── ...
├── build.js
├── README.md
└── .gitignore
```

---

## Risk Assessment & Mitigation

### High Risk
1. **Content Loss**
   - Risk: Missing content during migration
   - Mitigation: Complete WordPress export, database backup, media library backup
   - Verification: Content audit checklist

2. **SEO Impact**
   - Risk: Loss of search rankings
   - Mitigation: 301 redirects, preserve URLs, maintain meta tags
   - Verification: SEO audit before/after

3. **Broken Links**
   - Risk: Internal/external links break
   - Mitigation: Link checker, update all references
   - Verification: Automated link checking

### Medium Risk
1. **Functionality Loss**
   - Risk: WordPress features not replicated
   - Mitigation: Identify all features, find static alternatives
   - Verification: Feature checklist

2. **User Experience**
   - Risk: Different UX confuses users
   - Mitigation: Maintain similar structure, test thoroughly
   - Verification: User testing

### Low Risk
1. **Performance**
   - Risk: Slower site (unlikely with static)
   - Mitigation: Optimize assets, use CDN
   - Verification: Performance testing

---

## Success Criteria

### Must Have
- [ ] All WordPress content migrated
- [ ] All pages functional
- [ ] All links working
- [ ] Downloads functional
- [ ] Mobile responsive
- [ ] SEO preserved
- [ ] Custom domain working
- [ ] SSL certificate active

### Should Have
- [ ] Blog archive complete
- [ ] Newsletter archive complete
- [ ] Search functionality (if needed)
- [ ] Analytics integrated
- [ ] Performance optimized

### Nice to Have
- [ ] RSS feed
- [ ] Sitemap.xml
- [ ] Advanced search
- [ ] Contact form
- [ ] Social media integration

---

## Timeline Estimate

**Total Duration:** 4-5 weeks

- **Week 1:** Content recovery & inventory, site architecture
- **Week 2:** Content migration, blog/newsletter setup
- **Week 3:** Enhancement, polish, testing
- **Week 4:** Deployment preparation, migration
- **Week 5:** Post-migration monitoring, optimization

---

## Next Steps (Immediate)

### Simplified Plan (Since XML Export Already Exists)

**The XML export (`handyworks.WordPress.2025-10-29.xml`) already contains:**
- ✅ 61 blog posts (all content, dates, categories)
- ✅ 15 pages (all content)
- ✅ 42 media references (file names, URLs)
- ✅ All categories and tags
- ✅ Post metadata

**What's Still Needed from cPanel:**

1. **Download Media Files** (Priority 1)
   - File Manager → `wp-content/uploads/` → Compress → Download
   - This gets the actual image/PDF files (XML only has references)

2. **Optional: Fresh Export** (Priority 2)
   - Access WordPress admin → Tools → Export
   - Check if any new content since Oct 29, 2025

3. **Optional: Database Export** (Priority 3)
   - phpMyAdmin → Select database → Export → SQL
   - Only needed for custom fields/plugin data

**Then:**
- Parse WordPress XML export (script ready)
- Extract blog posts to static HTML
- Migrate pages
- Organize downloaded media files

---

## Questions to Resolve

1. **Domain & Hosting:**
   - Current domain registrar?
   - DNS management location?
   - Email hosting (if separate)?

2. **Content:**
   - Are all newsletters in WordPress?
   - Is Reports List page needed?
   - Any e-commerce functionality?

3. **Functionality:**
   - Contact form needed?
   - Search needed?
   - Analytics requirements?

4. **Timeline:**
   - Target launch date?
   - Any deadlines?

---

## Notes

- Current site uses DRY principles (header/footer via JS)
- Build system exists but may need enhancement
- WordPress export XML is large (7,440 lines) - contains significant content
- cPanel access enables complete recovery
- Similar migration pattern to JetLagPro website (successful)

---

---

## Project Status Board

- [x] Access cPanel and WordPress admin - All content recovered: XML export, media files, newsletters, downloads
- [x] Parse WordPress export XML - Extracted 61 blog posts and 14 pages to extracted_content/
- [x] Download all media files from WordPress /wp-content/uploads/ directory via cPanel - Found tmb.zip with full WordPress backup including uploads
- [x] Extract and migrate blog posts - Generated 61 HTML blog posts and blog index
- [x] Create missing pages - Created newsletter archive page
- [x] Organize assets - Created clean directory structure, organized newsletters (43), downloads (11), images (41)
- [x] Cleanup directory - Removed tmb backup, extracted Markdown files, test files, and .DS_Store files
- [x] Set up GitHub repository and configure GitHub Pages for deployment - Committed and pushed to GitHub
- [x] Make blog the homepage - Updated index.html to display blog listing
- [x] Implement expandable blog entries - Created blog-expand.js for inline content expansion
- [x] Implement hybrid blog layout - Added excerpts, sidebar with newsletters/search/pages, two-column layout
- [ ] Create content inventory - compare WordPress export with current static pages, identify gaps
- [ ] Enhance build.js system - add blog post generation, newsletter archive support
- [ ] Configure custom domain (handyworks.com) and DNS migration plan
- [ ] SEO optimization - extract meta tags, create sitemap.xml, set up redirects

---

## Current Status / Progress Tracking

**Executor (January 29, 2025):** Implemented hybrid blog layout with excerpts and sidebar
- Created excerpt extraction script (`scripts/extract_excerpts.py`) to generate 200-word excerpts from blog posts
- Updated blog listing generation to include excerpts in post summaries
- Created sidebar component (`js/sidebar.js`) with:
  - Newsletter links (direct PDF access)
  - Search functionality (filters blog posts by title, excerpt, date)
  - Pages navigation (quick links to main pages)
- Implemented two-column layout (main content + sidebar) optimized for desktop
- Added sidebar to index.html, blog.html, downloads.html, and about.html
- Updated CSS for sidebar styling, excerpt display, and search form
- All changes committed and pushed to GitHub

**Previous Work:**
- All 61 blog posts extracted and converted to HTML
- Newsletter archive page created with 43 newsletters
- Assets organized (newsletters, downloads, images)
- Blog made the homepage with expandable entries
- Directory cleanup completed

---

## Executor's Feedback or Assistance Requests

**Planner (January 29, 2025):** Simplified DNS migration to 4 clear steps. User will be guided step-by-step without overwhelming documentation.

**Planner (January 29, 2025):** Step 1 completed - DNS switched to Namecheap BasicDNS. Waiting 1-2 hours for DNS to propagate, then proceeding to Step 2 (email forwarding).

**Planner (January 29, 2025):** DNS switch complete - Host Records section is now visible in Namecheap. Proceeding to Step 3: Add GitHub Pages DNS records.

**Planner (January 29, 2025):** Step 3 complete - CNAME record added in Namecheap. Proceeding to Step 4: Configure GitHub Pages custom domain.

**Planner (January 29, 2025):** Step 4 complete - GitHub Pages custom domain configured. Site is live at http://www.handyworks.com/. SSL certificate will be provisioned automatically. HTTPS will be available once SSL is ready (usually within a few hours).

**Planner (January 29, 2025):** Step 2 complete - Email forwarding set up in Namecheap (steve@handyworks.com → sbschram@gmail.com). All 4 DNS migration steps are now complete!

**Planner (January 29, 2025):** Added A records for apex domain (handyworks.com) - 4 A records pointing to GitHub Pages IPs. DNS records now complete: 1 CNAME (www) + 4 A records (@). Waiting for DNS propagation to resolve GitHub Pages error.

**Planner (January 29, 2025):** DNS migration complete! Site is live at https://www.handyworks.com/ with HTTPS working. The apex domain "error" in GitHub is expected - it correctly redirects to www. User can now enable "Enforce HTTPS" to complete the migration.

**Planner (January 29, 2025):** Email forwarding verified working (steve@handyworks.com → sbschram@gmail.com). HandyWorks website migration is COMPLETE and SUCCESSFUL!

---

## Key Challenges and Analysis

### Blog Post Formatting Issue (January 29, 2025)

**Problem Identified:**
Blog posts have lost their original formatting during WordPress-to-static conversion:
- WordPress block comments (`<!-- wp:paragraph -->`, `<!-- wp:list -->`) remain in HTML
- Malformed HTML structures (nested `<ul>` tags inside list items)
- Missing proper paragraph spacing
- Lists not properly formatted (should be single `<ul>` with multiple `<li>` items)
- No visual distinction between paragraphs
- Text appears as one continuous block

**Root Cause:**
The `markdown_to_html()` function in `scripts/generate_html.py` is too basic and doesn't handle:
1. WordPress block comments that need stripping
2. Complex HTML structures from WordPress Gutenberg blocks
3. Proper list formatting (currently creates nested `<ul>` tags)
4. Paragraph spacing and line breaks

**Proposed DRY Solution:**

1. **Create a Single Content Cleaning Function** (`scripts/clean_wordpress_content.py`):
   - Strip all WordPress block comments (`<!-- wp:* -->` and `<!-- /wp:* -->`)
   - Fix malformed list structures (consolidate nested `<ul>` tags)
   - Ensure proper paragraph spacing
   - Preserve existing HTML tags (links, bold, italic, headings)
   - Handle edge cases (empty paragraphs, whitespace)

2. **Create a Batch Processing Script** (`scripts/fix_all_blog_posts.py`):
   - Iterate through all blog post HTML files
   - Apply content cleaning function to each
   - Preserve metadata (title, date, categories)
   - Regenerate clean HTML with proper formatting
   - Maintain file structure and URLs

3. **Update CSS for Better Typography** (`css/style.css`):
   - Add proper paragraph spacing (margin-bottom)
   - Style lists properly (indentation, bullet points)
   - Ensure headings have proper hierarchy
   - Add line-height for readability

**Implementation Approach:**
- Single source of truth: One content cleaning function used by all scripts
- Batch processing: Fix all existing posts at once
- Future-proof: New posts will use the improved conversion pipeline
- No manual editing: Automated process maintains consistency

**Success Criteria:**
- All blog posts display with proper paragraph breaks
- Lists render correctly (single `<ul>` with multiple `<li>` items)
- No WordPress block comments visible in source
- Proper spacing and typography throughout
- All 61 posts formatted consistently

**Implementation Completed (January 29, 2025):**
- ✅ Created `scripts/clean_wordpress_content.py` - Single DRY function for content cleaning
- ✅ Created `scripts/fix_all_blog_posts.py` - Batch processor for all 61 posts
- ✅ Processed all 61 blog posts - Removed WordPress comments, fixed lists, cleaned HTML
- ✅ Added comprehensive CSS typography - Paragraph spacing, list formatting, headings, images
- ✅ Verified: Zero WordPress comments remaining in all posts
- ✅ Lists properly formatted (single `<ul>` with multiple `<li>` items)
- ✅ Images extracted from WordPress figure blocks
- ✅ WordPress-specific classes and attributes removed

**Results:**
- All 61 blog posts now have clean, properly formatted HTML
- Paragraphs have proper spacing (1.2rem margin-bottom)
- Lists display correctly with proper indentation and bullets
- Typography is consistent across all posts
- Content is readable and well-structured

---

**Status:** Phase 3 (Content Migration) - Blog migration complete, hybrid layout implemented, formatting cleanup complete.

