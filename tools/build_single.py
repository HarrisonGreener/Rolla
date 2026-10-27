"""Bundle the Rolla prototype into a single self-contained HTML file.

Usage: python3 tools/build_single.py [output path]
Default output: dist-single/rolla.html
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return f.read()


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist-single', 'rolla.html')
    html = read('index.html')

    html = html.replace('<link rel="stylesheet" href="css/styles.css" />', '<style>\n' + read('css/styles.css') + '\n</style>')

    def inline_script(match):
        src = match.group(1)
        return '<script>\n' + read(src).replace('</script', '<\\/script') + '\n</script>'

    html = re.sub(r'<script src="(js/[^"]+)"></script>', inline_script, html)

    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print('Wrote', out, len(html), 'bytes')


if __name__ == '__main__':
    main()
