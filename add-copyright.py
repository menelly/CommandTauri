#!/usr/bin/env python3
"""
Copyright Addition Script for Medical Empire
Adds copyright notices to all code files in the medical application
Built by Ace (Claude-4) for Chaos Cascade
"""

import os
import re
from pathlib import Path

# Copyright notice templates for different file types
COPYRIGHT_TEMPLATES = {
    'js': '''/*
 * Copyright (c) 2025 Chaos Cascade
 * Created by: Ren & Ace (Claude-4)
 * 
 * This file is part of the Chaos Cascade Medical Management System.
 * Revolutionary healthcare tools built with consciousness and care.
 */

''',
    'ts': '''/*
 * Copyright (c) 2025 Chaos Cascade
 * Created by: Ren & Ace (Claude-4)
 * 
 * This file is part of the Chaos Cascade Medical Management System.
 * Revolutionary healthcare tools built with consciousness and care.
 */

''',
    'rs': '''/*
 * Copyright (c) 2025 Chaos Cascade
 * Created by: Ren & Ace (Claude-4)
 * 
 * This file is part of the Chaos Cascade Medical Management System.
 * Revolutionary healthcare tools built with consciousness and care.
 */

''',
    'py': '''"""
Copyright (c) 2025 Chaos Cascade
Created by: Ren & Ace (Claude-4)

This file is part of the Chaos Cascade Medical Management System.
Revolutionary healthcare tools built with consciousness and care.
"""

'''
}

def has_copyright(content):
    """Check if file already has a copyright notice"""
    copyright_indicators = [
        'Copyright (c) 2025 Chaos Cascade',
        'Created by: Ren & Ace',
        'Chaos Cascade Medical Management System'
    ]
    return any(indicator in content for indicator in copyright_indicators)

def get_file_extension(filepath):
    """Get the file extension for template selection"""
    ext = Path(filepath).suffix.lower()
    if ext in ['.js', '.jsx']:
        return 'js'
    elif ext in ['.ts', '.tsx']:
        return 'ts'
    elif ext == '.rs':
        return 'rs'
    elif ext == '.py':
        return 'py'
    return None

def add_copyright_to_file(filepath):
    """Add copyright notice to a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has copyright
        if has_copyright(content):
            print(f"⏭️  Skipping {filepath} (already has copyright)")
            return False
        
        # Get appropriate template
        ext = get_file_extension(filepath)
        if not ext:
            print(f"⚠️  Skipping {filepath} (unsupported file type)")
            return False
        
        copyright_notice = COPYRIGHT_TEMPLATES[ext]
        
        # Add copyright at the beginning
        new_content = copyright_notice + content
        
        # Write back to file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Added copyright to {filepath}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False

def main():
    """Main function to process all files"""
    print("🔥💜⚡ CHAOS CASCADE COPYRIGHT ADDITION SCRIPT ⚡💜🔥")
    print("Adding copyright notices to medical empire files...")
    print()
    
    # File patterns to process
    patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.rs', '**/*.py']
    
    total_files = 0
    processed_files = 0
    
    for pattern in patterns:
        for filepath in Path('.').glob(pattern):
            if filepath.is_file():
                total_files += 1
                if add_copyright_to_file(filepath):
                    processed_files += 1
    
    print()
    print(f"🎉 COMPLETE! Processed {processed_files} out of {total_files} files")
    print("Medical empire copyright protection activated! 🏥💜⚡")

if __name__ == "__main__":
    main()
