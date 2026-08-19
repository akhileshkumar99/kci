from PIL import Image

img = Image.open('frontend/public/logo.png').convert('RGB')
w, h = img.size
print('Original size:', w, h)

bg = img.getpixel((0, 0))
print('BG color:', bg)

def is_bg(px, tol=12):
    return abs(px[0]-bg[0])<=tol and abs(px[1]-bg[1])<=tol and abs(px[2]-bg[2])<=tol

top = 0
for y in range(h):
    if not all(is_bg(img.getpixel((x, y))) for x in range(w)):
        top = y
        break

bot = h - 1
for y in range(h-1, -1, -1):
    if not all(is_bg(img.getpixel((x, y))) for x in range(w)):
        bot = y
        break

left = 0
for x in range(w):
    if not all(is_bg(img.getpixel((x, y))) for y in range(h)):
        left = x
        break

right = w - 1
for x in range(w-1, -1, -1):
    if not all(is_bg(img.getpixel((x, y))) for y in range(h)):
        right = x
        break

print('Content bbox: L=%d T=%d R=%d B=%d' % (left, top, right, bot))
print('Left pad:%d | Right pad:%d' % (left, w-right-1))
print('Top pad:%d  | Bottom pad:%d' % (top, h-bot-1))
cw = right - left + 1
ch = bot - top + 1
print('Content size: %dx%d' % (cw, ch))

# Crop content
content = img.crop((left, top, right+1, bot+1))

# Make square canvas with equal padding (10px each side)
pad = 10
size = max(cw, ch) + pad * 2
canvas = Image.new('RGB', (size, size), bg)
paste_x = (size - cw) // 2
paste_y = (size - ch) // 2
canvas.paste(content, (paste_x, paste_y))
canvas.save('frontend/public/logo.png')
print('Saved: %dx%d, content centered at (%d,%d)' % (size, size, paste_x, paste_y))
