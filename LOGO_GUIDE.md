# 🎨 Logo Guide

## ไฟล์ที่สร้างแล้ว

✅ `logo.svg` - Logo ในรูปแบบ SVG

## วิธีแปลงเป็น PNG (128x128)

### ตัวเลือกที่ 1: ใช้เว็บไซต์ (ง่ายที่สุด)

1. **ไปที่:** https://cloudconvert.com/svg-to-png
2. **Upload:** logo.svg
3. **ตั้งค่า:**
   - Width: 128
   - Height: 128
4. **Convert และ Download**
5. **เปลี่ยนชื่อเป็น:** icon.png

### ตัวเลือกที่ 2: ใช้ Inkscape (ฟรี)

```bash
# ดาวน์โหลด Inkscape: https://inkscape.org/

# แปลงผ่าน command line:
inkscape logo.svg --export-type=png --export-width=128 --export-height=128 --export-filename=icon.png
```

### ตัวเลือกที่ 3: ใช้ ImageMagick

```bash
# ติดตั้ง ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# แปลง:
magick convert -background none -resize 128x128 logo.svg icon.png
```

### ตัวเลือกที่ 4: ใช้ Online Editor

1. **ไปที่:** https://www.photopea.com/
2. **File → Open:** logo.svg
3. **Image → Image Size:** 128x128
4. **File → Export As → PNG**
5. **Save as:** icon.png

---

## เพิ่ม Logo ใน Extension

### 1. วางไฟล์

```
project-extension-grammar/
├── icon.png          # วางไฟล์ที่นี่
├── package.json
└── ...
```

### 2. อัพเดท package.json

เพิ่มบรรทัดนี้ใน package.json:

```json
{
  "name": "project-extension-grammar",
  "displayName": "Project Extension Grammar",
  "icon": "icon.png",
  ...
}
```

### 3. Package ใหม่

```bash
npm run package
```

---

## ดีไซน์ของ Logo

**แนวคิด:**
- 5 ชั้นสี = 5 layers ของสถาปัตยกรรม
- สัญลักษณ์ AI = AI integration
- `</>` = Code/Programming
- สี gradient = Modern & Tech

**สี:**
- 🟣 Purple (MCP) - Contextual Layer
- 🔵 Blue (Hooks) - Workflow Layer  
- 🟢 Green (Rules) - Steering Layer
- 🟠 Orange (LSP) - Semantic Layer
- 🔴 Red (Grammar) - Syntactic Layer

---

## ทางเลือกอื่น: ใช้ Logo Generator

### Canva (ฟรี)
1. ไปที่: https://www.canva.com/
2. สร้าง Custom Size: 128x128
3. ใช้ template "Tech Logo"
4. ปรับแต่งตามต้องการ
5. Download เป็น PNG

### Figma (ฟรี)
1. ไปที่: https://www.figma.com/
2. สร้าง Frame: 128x128
3. ออกแบบ logo
4. Export เป็น PNG

### Logo.com (มีค่าใช้จ่าย)
1. ไปที่: https://logo.com/
2. ใส่ชื่อ: Project Extension Grammar
3. เลือกสไตล์: Tech/Modern
4. Generate และ Download

---

## Quick Fix: ใช้ Emoji

ถ้าต้องการแก้ไขเร็วๆ สามารถใช้ emoji:

```json
{
  "icon": "📚"
}
```

หรือสร้าง simple icon:

```bash
# ใช้ text-to-image online
# ไปที่: https://www.text2image.com/
# พิมพ์: 📚 หรือ </> หรือ 🔤
# ขนาด: 128x128
# Background: Dark gray
# Save เป็น icon.png
```

---

## ตรวจสอบ Logo

หลังเพิ่ม logo แล้ว:

1. **Package ใหม่:**
   ```bash
   npm run package
   ```

2. **ตรวจสอบ:**
   - ติดตั้ง extension
   - ดูใน Extensions view
   - Logo ควรแสดงข้างชื่อ extension

---

## Tips

- ใช้ขนาด 128x128 pixels (ขนาดมาตรฐาน)
- ใช้ PNG format (รองรับ transparency)
- ใช้สีที่เด่นชัด เห็นได้ง่าย
- ทดสอบทั้ง light และ dark theme
- ไฟล์ไม่ควรใหญ่เกิน 50KB

---

**พร้อมแล้วครับ!** เลือกวิธีที่ชอบแล้วสร้าง icon.png ได้เลย! 🎨
