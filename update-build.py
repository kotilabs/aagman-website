#!/usr/bin/env python3
"""Update the aagman-build marker in every HTML file before committing."""
import os, re
from datetime import datetime, timezone

BUILD_ID = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')

for fname in os.listdir('.'):
    if not fname.endswith('.html'):
        continue
    with open(fname, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    new_text, n = re.subn(
        r'(<meta[^>]*name=["\']aagman-build["\'][^>]*content=["\'])[^"\']+(["\'])',
        r'\g<1>' + BUILD_ID + r'\g<2>',
        text,
        count=1,
        flags=re.I
    )
    new_text, m = re.subn(
        r'support\.js\?v=\d+',
        'support.js?v=' + BUILD_ID,
        new_text,
        flags=re.I
    )
    if n or m:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(new_text)
        print(f'{fname} -> {BUILD_ID}')

print(f'Build marker set to {BUILD_ID}')
