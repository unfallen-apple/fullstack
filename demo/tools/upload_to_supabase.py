"""
Usage:
  Set environment variables SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET and run:
    python tools/upload_to_supabase.py

This script uploads files found in ./uploads/ and ./src/main/resources/static/uploads/ to
Supabase Storage public bucket and prints public URLs. It won't delete or change DB entries.

Requires: Python 3.8+, requests
"""
import os
import sys
import requests
from pathlib import Path

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SUPABASE_BUCKET = os.getenv('SUPABASE_BUCKET')

if not SUPABASE_URL or not SUPABASE_KEY or not SUPABASE_BUCKET:
    print('Missing SUPABASE_URL, SUPABASE_KEY or SUPABASE_BUCKET environment variables.')
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
CANDIDATES = [ROOT / 'uploads', ROOT / 'src' / 'main' / 'resources' / 'static' / 'uploads']

uploaded = []

for folder in CANDIDATES:
    if not folder.exists():
        continue
    for p in folder.rglob('*'):
        if p.is_file():
            rel = p.name  # we will upload with name only to avoid nesting
            print(f'Uploading {p} -> {rel} ...')
            url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{rel}"
            headers = {
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'x-upsert': 'true',
                'Content-Type': 'application/octet-stream'
            }
            with open(p, 'rb') as f:
                r = requests.put(url, headers=headers, data=f)
            if r.status_code in (200, 201, 204):
                public = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{rel}"
                print('OK ->', public)
                uploaded.append(public)
            else:
                print('Failed:', r.status_code, r.text)

print('\nUploaded:\n')
for u in uploaded:
    print(u)

print('\nNext steps:')
print(' - For each DB record whose image points to /uploads/FILE, update the database to the public URL above.')
print(' - Or keep both: your backend now prefers SUPABASE when env vars are set; redeploy backend with SUPABASE_* env vars.')
