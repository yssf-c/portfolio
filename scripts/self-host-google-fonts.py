"""Download the Google Fonts in app/layout.tsx as full TTFs and subset each to
the ranges Google serves for the subsets we keep, one woff2 per weight/style.

Needs fonttools and brotli. Usage: python self-host-google-fonts.py <repo> <tmp dir>"""
import os, re, sys, json, urllib.request, urllib.parse
from fontTools import subset
from fontTools.ttLib import TTFont

REPO = sys.argv[1]
DL = sys.argv[2]
OUT = os.path.join(REPO, "app/fonts")
MODERN_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
             "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
KEEP = {"latin", "latin-ext", "greek", "greek-ext", "arabic", "math", "symbols"}

FONTS = [
    ("Inter", "inter", ["300", "400", "500", "600"], ["normal"]),
    ("Hanken Grotesk", "hanken-grotesk", ["400", "500", "600", "700"], ["normal"]),
    ("Aref Ruqaa", "aref-ruqaa", ["400", "700"], ["normal"]),
    ("Amiri", "amiri", ["400", "700"], ["normal"]),
    ("Roboto Mono", "roboto-mono", ["300", "400", "500"], ["normal"]),
    ("Oswald", "oswald", ["400", "500", "600", "700"], ["normal"]),
    ("Pinyon Script", "pinyon-script", ["400"], ["normal"]),
    ("Newsreader", "newsreader", ["300", "400", "500"], ["normal", "italic"]),
    ("DM Mono", "dm-mono", ["300", "400", "500"], ["normal"]),
    ("Cormorant Garamond", "cormorant-garamond", ["400", "500", "600", "700"], ["normal"]),
    ("IBM Plex Mono", "ibm-plex-mono", ["400", "500", "600"], ["normal"]),
    ("Fraunces", "fraunces", ["400", "500", "600", "700", "900"], ["normal", "italic"]),
    ("Nunito", "nunito", ["400", "500", "600", "700", "800", "900"], ["normal"]),
]


def fetch(url, ua=None):
    req = urllib.request.Request(url, headers={"User-Agent": ua} if ua else {})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def css_url(family, weights, styles):
    if styles == ["normal"]:
        axes = "wght@" + ";".join(weights)
    else:
        axes = "ital,wght@" + ";".join(
            f"{1 if s == 'italic' else 0},{w}" for s in sorted(styles, key=lambda s: s != "normal") for w in weights)
    return "https://fonts.googleapis.com/css2?family=" + urllib.parse.quote_plus(family) + ":" + axes


FACE = re.compile(r"(?:/\* ([\w-]+) \*/\s*)?@font-face \{(.*?)\}", re.S)


def parse(css):
    faces = []
    for subset_name, body in FACE.findall(css):
        style = re.search(r"font-style: (\w+)", body).group(1)
        weight = re.search(r"font-weight: (\d+)", body).group(1)
        src = re.search(r"url\((.*?)\)", body).group(1)
        ur = re.search(r"unicode-range: ([^;]+);", body)
        faces.append(dict(subset=subset_name, style=style, weight=weight, src=src,
                          ranges=ur.group(1).replace(" ", "") if ur else None))
    return faces


def main():
    os.makedirs(DL, exist_ok=True)
    manifest = {}
    for family, slug, weights, styles in FONTS:
        url = css_url(family, weights, styles)
        modern = parse(fetch(url, MODERN_UA).decode())
        full = parse(fetch(url).decode())  # no UA -> one full TTF per face
        subsets_seen = sorted({f["subset"] for f in modern})
        os.makedirs(os.path.join(OUT, slug), exist_ok=True)
        entries = []
        for face in full:
            w, s = face["weight"], face["style"]
            ranges = sorted({r for f in modern if f["weight"] == w and f["style"] == s
                             and f["subset"] in KEEP for r in f["ranges"].split(",")})
            assert ranges, (family, w, s)
            assert face["src"].endswith(".ttf"), face["src"]
            ttf = os.path.join(DL, f"{slug}-{w}-{s}.ttf")
            with open(ttf, "wb") as fh:
                fh.write(fetch(face["src"]))
            name = f"{slug}-{w}{'-italic' if s == 'italic' else ''}.woff2"
            out = os.path.join(OUT, slug, name)
            opts = subset.Options()
            opts.flavor = "woff2"
            opts.layout_features = ["*"]
            opts.name_IDs = ["*"]
            opts.hinting = False
            opts.notdef_outline = True
            font = TTFont(ttf)
            sub = subset.Subsetter(opts)
            sub.populate(unicodes=subset.parse_unicodes(",".join(ranges)))
            sub.subset(font)
            font.flavor = "woff2"
            font.save(out)
            entries.append(dict(path=f"./fonts/{slug}/{name}", weight=w, style=s, bytes=os.path.getsize(out)))
        manifest[family] = dict(subsets=subsets_seen, faces=entries)
        print(family, subsets_seen, [e["bytes"] // 1024 for e in entries], flush=True)
    with open(os.path.join(DL, "manifest.json"), "w") as fh:
        json.dump(manifest, fh, indent=1)


main()
