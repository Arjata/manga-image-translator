import sys
import os
from PIL import Image
__DIR__ = os.path.abspath(__file__+"/..")
infile = __DIR__+"/../../result/final.png"
outfile = sys.argv[1]
toFormat = sys.argv[2]
print("main():toFormat:"+toFormat)
print("main():infile:"+infile)
print("main():outfile:"+outfile)
if os.path.exists(infile) != True:
    exit("main():file not exist.")
im = Image.open(infile)
if toFormat == "png":
    im.save(outfile, "PNG")
elif toFormat == "jpg":
    im.convert("RGB")
    im.save(outfile, "JPEG", quality=95)
elif toFormat == "jpeg":
    im.convert("RGB")
    im.save(outfile, "JPEG", quality=95)