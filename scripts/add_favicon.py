#!/usr/bin/env python3
"""
Add favicon link to all HTML files
"""

import os
import re
from pathlib import Path

# Get the project root directory
ROOT_DIR = Path(__file__).parent.parent

# Favicon link to add
FAVICON_LINK = '    <link rel="icon" type="image/gif" href="images/logos/cropped-hwlogo.gif">'

def add_favicon_to_html(file_path):
    """Add favicon link to an HTML file if not already present"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if favicon is already present
    if 'rel="icon"' in content or 'rel="shortcut icon"' in content:
        print(f"✓ Favicon already present in {file_path.name}")
        return False
    
    # Find the </head> tag and insert favicon before it
    if '</head>' in content:
        # Insert before </head>
        content = content.replace('</head>', f'{FAVICON_LINK}\n</head>')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Added favicon to {file_path.name}")
        return True
    else:
        print(f"✗ No </head> tag found in {file_path.name}")
        return False

def main():
    """Add favicon to all HTML files in the root directory"""
    html_files = list(ROOT_DIR.glob('*.html'))
    
    print(f"Found {len(html_files)} HTML files")
    print("-" * 50)
    
    updated_count = 0
    for html_file in sorted(html_files):
        if add_favicon_to_html(html_file):
            updated_count += 1
    
    print("-" * 50)
    print(f"Updated {updated_count} files")

if __name__ == '__main__':
    main()

