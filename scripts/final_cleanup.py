#!/usr/bin/env python3
"""
Final cleanup: Remove outdated files and migration artifacts
"""

import os
import shutil
from pathlib import Path

# Get the project root directory
ROOT_DIR = Path(__file__).parent.parent

# Files and directories to remove
TO_REMOVE = [
    # Migration documentation (no longer needed)
    'CPANEL_DNS_SETUP.md',
    'DNS_MIGRATION_GUIDE.md',
    'DNS_SWITCH_TO_NAMECHEAP.md',
    'NAMECHEAP_DNS_SETUP.md',
    'FORM_SECURITY.md',
    
    # WordPress export (no longer needed)
    'handyworks.WordPress.2025-10-29.xml',
    
    # Extracted content (migration artifacts)
    'extracted_content',
    'blog_excerpts.json',
    
    # Legacy downloads folder (everything moved to public/)
    'downloads',
    
    # Old cursor documentation
    '.cursor/cpanel-recovery-checklist.md',
    '.cursor/github-pages-setup.md',
    '.cursor/layout-analysis.md',
    '.cursor/migration-complete.md',
    '.cursor/organization-complete.md',
    '.cursor/ready-for-github.md',
    '.cursor/recovery-status.md',
    '.cursor/step-by-step-cpanel-guide.md',
    
    # Migration scripts (one-time use)
    'scripts/parse_wordpress_export.py',
    'scripts/extract_excerpts.py',
    'scripts/organize_assets.py',
    'scripts/generate_html.py',
    'scripts/create_newsletter_archive.py',
    'scripts/cleanup_directory.py',
    'scripts/fix_all_blog_posts.py',
    'scripts/update_blog_with_excerpts.py',
    'scripts/__pycache__',
    
    # Unused pages
    'blog.html',  # Duplicate of index.html
    'template.html',  # No longer needed
    
    # Legacy images folder
    'images/legacy',
    
    # Assets folder (if empty or unused)
    'assets',
    
    # Build script (not used)
    'build.js',
]

# Files to KEEP for future use
KEEP_SCRIPTS = [
    'scripts/clean_wordpress_content.py',  # May need for future posts
    'scripts/regenerate_blog_index.py',  # Useful for regenerating blog
    'scripts/add_meta_tags.py',  # Useful for new pages
    'scripts/test_site.py',  # Testing tool
    'scripts/add_favicon.py',  # Just created, may need again
    'scripts/final_cleanup.py',  # This script
]

def remove_item(item_path):
    """Remove a file or directory"""
    if item_path.is_file():
        item_path.unlink()
        print(f"✓ Removed file: {item_path.relative_to(ROOT_DIR)}")
    elif item_path.is_dir():
        shutil.rmtree(item_path)
        print(f"✓ Removed directory: {item_path.relative_to(ROOT_DIR)}")
    else:
        print(f"✗ Not found: {item_path.relative_to(ROOT_DIR)}")

def main():
    """Remove outdated files and migration artifacts"""
    print("HandyWorks Website - Final Cleanup")
    print("=" * 50)
    print("\nRemoving migration artifacts and outdated files...\n")
    
    removed_count = 0
    not_found_count = 0
    
    for item in TO_REMOVE:
        item_path = ROOT_DIR / item
        if item_path.exists():
            remove_item(item_path)
            removed_count += 1
        else:
            not_found_count += 1
    
    print("\n" + "=" * 50)
    print(f"Removed: {removed_count} items")
    print(f"Not found: {not_found_count} items")
    print("\nScripts kept for future use:")
    for script in KEEP_SCRIPTS:
        print(f"  - {script}")
    print("\nCleanup complete!")

if __name__ == '__main__':
    main()

