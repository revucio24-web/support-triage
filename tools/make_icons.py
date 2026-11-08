from PIL import Image, ImageDraw
import os

S = 1024
TOP = (27, 42, 85)
BOTTOM = (11, 16, 32)

def hintergrund():
    img = Image.new('RGB', (S, S))
    d = ImageDraw.Draw(img)
    for y in range(S):
        t = y / (S - 1)
        r = int(TOP[0] + (BOTTOM[0] - TOP[0]) * t)
        g = int(TOP[1] + (BOTTOM[1] - TOP[1]) * t)
        b = int(TOP[2] + (BOTTOM[2] - TOP[2]) * t)
        d.line([(0, y), (S, y)], fill=(r, g, b))
    return img

def blitz_ebene(skala=1.0):
    basis = [(620, 120), (340, 560), (500, 560), (410, 900), (700, 430), (530, 430)]
    cx, cy = S / 2, S / 2
    punkte = [(cx + (x - cx) * skala, cy + (y - cy) * skala) for x, y in basis]
    grad = Image.new('RGB', (S, S))
    dg = ImageDraw.Draw(grad)
    for y in range(S):
        t = y / (S - 1)
        r = int(76 + (143 - 76) * t)
        g = int(194 + (155 - 194) * t)
        b = int(247 + (250 - 247) * t)
        dg.line([(0, y), (S, y)], fill=(r, g, b))
    maske = Image.new('L', (S, S), 0)
    ImageDraw.Draw(maske).polygon(punkte, fill=255)
    ebene = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ebene.paste(grad, (0, 0), maske)
    schatten = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    schatten.paste(Image.new('RGBA', (S, S), (76, 194, 247, 90)), (0, 0), maske.filter(__import__('PIL.ImageFilter', fromlist=['GaussianBlur']).GaussianBlur(24)))
    return schatten, ebene

def icon(skala=1.0):
    img = hintergrund().convert('RGBA')
    schatten, ebene = blitz_ebene(skala)
    img.alpha_composite(schatten)
    img.alpha_composite(ebene)
    return img

basis = icon(1.0)
maskierbar = icon(0.86)
os.makedirs('icons', exist_ok=True)
os.makedirs('store', exist_ok=True)
for groesse, ziel in [(512, 'icons/icon-512.png'), (192, 'icons/icon-192.png'), (180, 'icons/apple-touch-icon.png'), (32, 'icons/favicon-32.png')]:
    basis.resize((groesse, groesse), Image.LANCZOS).save(ziel)
maskierbar.resize((512, 512), Image.LANCZOS).save('icons/icon-maskable-512.png')
basis.resize((300, 300), Image.LANCZOS).save('store/icon-300.png')
basis.resize((1024, 1024), Image.LANCZOS).save('store/icon-1024.png')
print('Icons erzeugt')
