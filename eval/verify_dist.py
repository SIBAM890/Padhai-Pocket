import os
import re

bundle_path = r'app/dist-FINAL\_expo\static\js\web\AppEntry-93922694cb16d6c7bc1f669e9a7cb81e.js'
with open(bundle_path, 'r', encoding='utf-8', errors='ignore') as f:
    code = f.read()

print('Bundle read len:', len(code))

forbidden = ['"wrong"', '"gap"', '"diagnosis"', '"Error:"', '"stack trace"']
for fb in forbidden:
    count = code.count(fb.strip('"'))
    exact_quoted = code.count(fb)
    print(f'Occurrences of raw {fb}: exact quoted={exact_quoted}, unquoted={count}')

# Check localStorage keys
ls_matches = set(re.findall(r'localStorage\.(?:getItem|setItem|removeItem)\(["\']([^"\']+)["\']\)', code))
print('localStorage keys:', ls_matches)

# External network calls
urls = set(re.findall(r'https?://[^\s"\'<>]+', code))
print('URLs count:', len(urls))
external_urls = [u for u in sorted(urls) if 'localhost' not in u]
print('External URLs:', external_urls[:10])

# Fonts
fonts = [os.path.join(r, file_item) for r, d, fs in os.walk('app/dist-FINAL') for file_item in fs if any(file_item.endswith(ext) for ext in ['.woff', '.ttf', '.otf', '.woff2']) or 'noto' in file_item.lower()]
print('Fonts in dist-FINAL:', fonts)

# Font imports in css / html
with open('app/dist-FINAL/index.html', 'r', encoding='utf-8') as html_file:
    html = html_file.read()
print('index.html font mentions:', [line for line in html.splitlines() if 'font' in line.lower() or 'noto' in line.lower()])

# Analytics
analytics = ['gtag', 'analytics', 'sentry', 'mixpanel', 'amplitude']
for a in analytics:
    print(f'Analytics term "{a}":', a in code.lower())

