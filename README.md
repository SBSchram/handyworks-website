# HandyWorks Website

Official website for HandyWorks Chiropractic Office Management Software.

**Live Site:** https://handyworks.com/

## Overview

Static HTML website hosted on GitHub Pages. Migrated from WordPress in January 2025.

## Features

- **Blog Homepage**: 61 blog posts (2015-2025) with expandable entries
- **Newsletter Archive**: 43 newsletters (1992-2017)
- **Software Downloads**: Upgrade files and installation packages in `public/` directory
- **Desktop Software Integration**: `LatestVersion.txt` for automatic update checking
- **SEO Optimized**: Meta tags, sitemap.xml, robots.txt
- **Email Forwarding**: steve@handyworks.com via Namecheap

## Directory Structure

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

## Maintenance Scripts

Located in `scripts/`:

- **add_favicon.py**: Add favicon to HTML pages
- **add_meta_tags.py**: Add SEO meta tags to pages
- **clean_wordpress_content.py**: Clean WordPress HTML (for future blog posts)
- **regenerate_blog_index.py**: Regenerate blog homepage
- **test_site.py**: Test all links and downloads
- **final_cleanup.py**: Remove outdated files

## Technology Stack

- **Hosting**: GitHub Pages
- **DNS**: Namecheap
- **SSL**: Automatic via GitHub Pages
- **Email**: Namecheap email forwarding
- **Contact Form**: Formspree
- **Analytics**: None (privacy-focused)

## DNS Configuration

- **A Records** (apex domain):
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
- **CNAME Record** (www subdomain):
  - www → sbschram.github.io

## Development

### Local Testing

```bash
# Serve locally (Python)
python3 -m http.server 8000

# Visit http://localhost:8000
```

### Adding a New Blog Post

1. Create HTML file in `blog/YYYY/MM/post-slug.html`
2. Use existing post as template
3. Run `python3 scripts/regenerate_blog_index.py` to update homepage
4. Commit and push to GitHub

### Deployment

All changes pushed to `main` branch are automatically deployed to GitHub Pages.

```bash
git add .
git commit -m "Description of changes"
git push
```

## Contact

- **Website**: https://handyworks.com/
- **Email**: steve@handyworks.com
- **Support**: Via contact form

## License

© 2025 HandyWorks Software. All rights reserved.
