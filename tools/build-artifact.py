"""Write artifact.html: index.html without the document shell, for hosts that add their own
<!doctype>/<head>/<body> (a claude.ai Artifact). The <html> attributes are set by a small script."""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'index.html').read_text()
attrs = dict(re.findall(r'(\w[\w-]*)="([^"]*)"', re.search(r'<html([^>]*)>', src).group(1)))
attrs.update({k: '' for k in re.findall(r'<html[^>]*\s(data-motion)>', src)})
head = re.search(r'<head>(.*?)</head>', src, re.S).group(1)
body = re.search(r'<body>(.*?)</body>', src, re.S).group(1)
head = re.sub(r'<meta (charset|name="viewport")[^>]*>\n?', '', head)
set_attrs = ';'.join(f"d.setAttribute('{k}','{v}')" for k, v in attrs.items())
head = re.sub(r"<title>.*?</title>", "<title>Supernatural Guess Who?</title>", head)
out = f"<script>(d=>{{{set_attrs}}})(document.documentElement)</script>\n" + head.strip() + "\n<style>:root{{color-scheme:dark}}</style>\n" + body.strip() + "\n"
(root / 'artifact.html').write_text(out)
print('wrote artifact.html')
