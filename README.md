# Project Extension Grammar

[![GitHub release](https://img.shields.io/github/v/release/intity01/project-extension-grammar)](https://github.com/intity01/project-extension-grammar/releases/latest)
[![GitHub downloads](https://img.shields.io/github/downloads/intity01/project-extension-grammar/total)](https://github.com/intity01/project-extension-grammar/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-260%20passing-brightgreen)](TESTING_GUIDE.md)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.80%2B-blue)](https://code.visualstudio.com/)

VS Code/Kiro IDE extension สำหรับเพิ่มการรองรับภาษาโปรแกรมมิ่ง พร้อมฟีเจอร์ AI ในตัว

## 📥 ดาวน์โหลด

**[⬇️ ดาวน์โหลด v0.1.0 (77.75 KB)](https://github.com/intity01/project-extension-grammar/releases/download/v0.1.0/project-extension-grammar-0.1.0.vsix)**

หรือดูทุกเวอร์ชันที่ [Releases](https://github.com/intity01/project-extension-grammar/releases)

## คืออะไร?

ส่วนขยายนี้ช่วยให้คุณสร้าง language support สำหรับภาษาโปรแกรมมิ่งใหม่ๆ ได้ง่ายๆ พร้อมทั้งรองรับการทำงานร่วมกับ AI

**ฟีเจอร์หลัก:**
- ✅ Syntax highlighting (สีโค้ด)
- ✅ Auto-completion (เติมโค้ดอัตโนมัติ)
- ✅ Go to definition (กระโดดไปที่คำจำกัดความ)
- ✅ AI integration (ทำงานร่วมกับ AI ใน Kiro IDE)

## 📦 ติดตั้ง

### วิธีที่ 1: ติดตั้งจาก VSIX (แนะนำ)

1. **[⬇️ ดาวน์โหลด .vsix](https://github.com/intity01/project-extension-grammar/releases/latest)**
2. เปิด VS Code หรือ Kiro IDE
3. กด `Ctrl+Shift+X` → คลิก `...` → "Install from VSIX..."
4. เลือกไฟล์ที่ดาวน์โหลด
5. Reload window

### วิธีที่ 2: ติดตั้งผ่าน Command Line

```bash
code --install-extension project-extension-grammar-0.1.0.vsix
```

### วิธีที่ 3: Drag & Drop

ลากไฟล์ .vsix วางลงใน VS Code window

## ใช้งาน

### พื้นฐาน (ใช้ได้ทุก IDE)

สร้างไฟล์ `.targetlang` หรือ `.tlang` แล้วเขียนโค้ด:

```targetlang
// ตัวอย่าง
function hello() {
    let message = "Hello, World!";
    print(message);
}

class Person {
    constructor(name) {
        this.name = name;
    }
}
```

คุณจะได้:
- สีโค้ดสวยงาม
- กด `Ctrl+/` เพื่อ comment
- กด `Ctrl+Space` เพื่อ auto-complete
- กด `F12` เพื่อ go to definition

### ขั้นสูง (Kiro IDE เท่านั้น)

**1. เปิดใช้งาน AI:**
```
กด Ctrl+Shift+P → พิมพ์ "Initialize Kiro Support"
```

**2. กำหนดกฎให้ AI:**
แก้ไขไฟล์ `.kiro/steering/rules.md`:
```markdown
---
inclusion: always
---

# กฎการเขียนโค้ด
- ใช้ camelCase สำหรับตัวแปร
- เพิ่ม comment สำหรับฟังก์ชันที่ซับซ้อน
- ฟังก์ชันไม่ควรยาวเกิน 50 บรรทัด
```

**3. ตั้งค่า automation:**
แก้ไขไฟล์ `.kiro/hooks/auto-test.json`:
```json
{
  "name": "ทดสอบอัตโนมัติ",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/*.targetlang"
  },
  "action": {
    "type": "prompt",
    "prompt": "รันเทสและรายงานปัญหา"
  }
}
```

## สถาปัตยกรรม

ส่วนขยายนี้ใช้สถาปัตยกรรม 5 ชั้น:

```
1. Syntactic  → สีโค้ด (TextMate Grammar)
2. Semantic   → ความหมายโค้ด (LSP)
3. Steering   → กฎสำหรับ AI
4. Workflow   → Automation (Hooks)
5. Contextual → ข้อมูลเพิ่มเติม (MCP)
```

แต่ละชั้นทำงานอิสระ ใช้เฉพาะที่ต้องการได้

## ตั้งค่า

เปิด Settings → ค้นหา "Project Extension Grammar"

**ตัวเลือกที่มี:**
- `lsp.enabled` - เปิด/ปิด LSP (default: เปิด)
- `steering.autoLoad` - โหลด steering files อัตโนมัติ (default: เปิด)
- `hooks.enabled` - เปิด/ปิด hooks (default: เปิด)
- `mcp.enabled` - เปิด/ปิด MCP (default: เปิด)

## ใช้ทำอะไรได้บ้าง?

1. **สร้าง language support** - เพิ่มภาษาโปรแกรมมิ่งใหม่
2. **Custom DSL** - สร้าง Domain-Specific Language
3. **Framework support** - เพิ่มฟีเจอร์สำหรับ framework เฉพาะ
4. **AI-enhanced coding** - ให้ AI ช่วยเขียนโค้ดตามกฎที่กำหนด
5. **Automation** - ทดสอบ/สร้างเอกสารอัตโนมัติ

## พัฒนาต่อ

```bash
# ติดตั้ง dependencies
npm install

# Compile
npm run compile

# รันเทส (260 tests)
npm test

# สร้าง package
npm run package
```

## โครงสร้างโปรเจกต์

```
src/          # Source code
test/         # Tests (260 tests)
assets/       # Templates
docs/         # เอกสาร
syntaxes/     # Grammar files
```

## เอกสารเพิ่มเติม

- [INSTALLATION.md](INSTALLATION.md) - คู่มือติดตั้งละเอียด
- [QUICK_START.md](QUICK_START.md) - เริ่มใช้งาน 5 นาที
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - คู่มือทดสอบ
- [DEVELOPMENT.md](DEVELOPMENT.md) - คู่มือพัฒนา
- [docs/](docs/) - เอกสารเพิ่มเติม

## สถิติ

- ✅ 260 tests ผ่านทั้งหมด
- ✅ 90 ไฟล์
- ✅ 24,000+ บรรทัดโค้ด
- ✅ Package ขนาด 50 KB
- ✅ พร้อมใช้งานจริง

## License

MIT License - ดู [LICENSE](LICENSE) สำหรับรายละเอียด

## ขอบคุณ

- สร้างสำหรับ **Kiro IDE** โดย AWS
- ใช้ **VS Code Extension API**
- ใช้ **TextMate Grammar**
- ใช้ **Language Server Protocol**
- ใช้ **Model Context Protocol**

---

## 🔗 ลิงก์ที่เป็นประโยชน์

- 📦 [Releases](https://github.com/intity01/project-extension-grammar/releases) - ดาวน์โหลดเวอร์ชันต่างๆ
- 🐛 [Issues](https://github.com/intity01/project-extension-grammar/issues) - รายงานปัญหา
- 📖 [Documentation](https://github.com/intity01/project-extension-grammar/tree/main/docs) - เอกสารทั้งหมด
- 💬 [Discussions](https://github.com/intity01/project-extension-grammar/discussions) - ถาม-ตอบ

---

**Version**: 0.1.0 | **Status**: ✅ Production Ready | **Compatibility**: VS Code 1.80+, Kiro IDE

**Made with ❤️ for Kiro IDE**
