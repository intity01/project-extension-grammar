# Requirements Document

## Introduction

Project Extension Grammar เป็นระบบสถาปัตยกรรมแบบครอบคลุมสำหรับการสร้างส่วนขยายภาษาโปรแกรมมิ่งบน Kiro IDE ที่ไม่เพียงแต่รองรับการไฮไลท์ไวยากรณ์แบบดั้งเดิม แต่ยังผสานรวมเข้ากับขีดความสามารถของ AI Agent อย่างลึกซึ้ง ระบบนี้ประกอบด้วย 5 เลเยอร์หลัก: Syntactic Layer (วากยสัมพันธ์), Semantic Layer (ความหมาย), Steering Layer (การกำกับดูแล), Workflow Layer (กระบวนการทำงาน), และ Contextual Layer (บริบท) เพื่อเปลี่ยน Kiro IDE จากเครื่องมือแก้ไขโค้ดทั่วไปให้กลายเป็น Context Engine ที่ AI สามารถเข้าใจและทำงานร่วมกับโครงการได้อย่างมีประสิทธิภาพ

## Glossary

- **Kiro IDE**: แพลตฟอร์มการพัฒนาซอฟต์แวร์ที่ขับเคลื่อนด้วย AI Agent พัฒนาโดย AWS บนพื้นฐานของ VS Code
- **Project Extension Grammar**: ชุดกฎและโครงสร้างที่กำหนดวิธีการที่ AI Agent เข้าใจและทำงานกับภาษาโปรแกรมมิ่งหรือเฟรมเวิร์กเฉพาะ
- **TextMate Grammar**: มาตรฐานการกำหนดไวยากรณ์ภาษาโปรแกรมมิ่งโดยใช้ Regular Expression สำหรับ Syntax Highlighting
- **LSP (Language Server Protocol)**: โปรโตคอลมาตรฐานสำหรับการสื่อสารระหว่าง Editor และ Language Server เพื่อให้ข้อมูลเชิงความหมาย
- **Steering Files**: ไฟล์ Markdown ที่เก็บในโฟลเดอร์ .kiro/steering/ เพื่อกำหนดกฎและความรู้ให้กับ AI Agent
- **Agent Hooks**: ระบบอัตโนมัติที่ทำงานตามเหตุการณ์ (Event-Driven) เช่น onSave หรือ onFileCreate
- **MCP (Model Context Protocol)**: โปรโตคอลสำหรับเชื่อมต่อ AI กับแหล่งข้อมูลภายนอกแบบ Dynamic
- **Spec-Driven Development (SDD)**: กระบวนการพัฒนาที่เริ่มจากการสร้างข้อกำหนด (Requirements) แล้วแปลงเป็นแผนงาน (Design) และงานย่อย (Tasks)
- **EARS (Easy Approach to Requirements Syntax)**: รูปแบบมาตรฐานในการเขียนข้อกำหนดที่มีโครงสร้างชัดเจน
- **Extension**: ส่วนขยายสำหรับ IDE ที่เพิ่มความสามารถใหม่ๆ
- **Scope Names**: ชื่อมาตรฐานที่ใช้ใน TextMate Grammar เพื่อระบุประเภทของ Token เช่น keyword, string, comment

## Requirements

### Requirement 1

**User Story:** ในฐานะนักพัฒนาส่วนขยาย ผมต้องการสร้าง TextMate Grammar ที่ถูกต้องตามมาตรฐาน เพื่อให้ทั้งมนุษย์และ AI Agent สามารถมองเห็นและเข้าใจโครงสร้างโค้ดได้อย่างถูกต้อง

#### Acceptance Criteria

1. WHEN นักพัฒนาสร้างไฟล์ .tmLanguage.json THEN ระบบ SHALL ใช้ Standard Scope Names ตามมาตรฐาน TextMate เท่านั้น
2. WHEN ระบบประมวลผล Token THEN ระบบ SHALL แยกแยะระหว่าง comment.line, keyword.control, storage.type, string.quoted และ entity.name ได้อย่างถูกต้อง
3. WHEN ภาษาเป้าหมายปรากฏในบล็อกโค้ด Markdown THEN ระบบ SHALL รองรับ Injection Grammar เพื่อให้ AI มองเห็นโครงสร้างภายในบล็อกโค้ด
4. WHEN นักพัฒนากำหนดไฟล์ language-configuration.json THEN ระบบ SHALL ระบุ Comment Rules และ Bracket Rules อย่างชัดเจน
5. WHEN AI Agent ต้องการ Comment โค้ด THEN ระบบ SHALL ใช้ Comment Syntax ที่กำหนดใน language-configuration.json

### Requirement 2

**User Story:** ในฐานะนักพัฒนาส่วนขยาย ผมต้องการบูรณาการ Language Server Protocol เพื่อให้ AI Agent เข้าถึงข้อมูลเชิงความหมายของโค้ดได้อย่างแม่นยำ

#### Acceptance Criteria

1. WHEN ส่วนขยายเริ่มทำงาน THEN ระบบ SHALL เปิดใช้งาน Language Server Process และจัดการ Lifecycle ของมัน
2. WHEN Language Server ประกาศความสามารถ THEN ระบบ SHALL รองรับ textDocument/definition, textDocument/references และ textDocument/hover
3. WHEN AI Agent ร้องขอข้อมูล Definition THEN Language Server SHALL ตอบสนองภายในเวลาไม่เกิน 500 มิลลิวินาที
4. WHEN ระบบแสดง Syntax Highlighting THEN ระบบ SHALL ใช้ Semantic Highlighting จาก LSP เพื่อแยกแยะ Local Variable และ Class Field
5. WHEN AI Agent วิเคราะห์โค้ด THEN ระบบ SHALL ใช้ข้อมูลจาก LSP เป็น Ground Truth แทนการเดาจากบริบท

### Requirement 3

**User Story:** ในฐานะนักพัฒนาส่วนขยาย ผมต้องการสร้าง Steering Files เพื่อกำหนดกฎพฤติกรรมและความรู้ให้กับ AI Agent สำหรับภาษาหรือเฟรมเวิร์กเฉพาะ

#### Acceptance Criteria

1. WHEN ส่วนขยายถูกติดตั้ง THEN ระบบ SHALL จัดเตรียม Template ของ Steering Files ในโฟลเดอร์ assets/steering
2. WHEN ผู้ใช้รันคำสั่ง initializeKiro THEN ระบบ SHALL คัดลอก Steering Templates ไปยัง .kiro/steering/ ของโปรเจกต์
3. WHEN Steering File ใช้ Frontmatter inclusion: fileMatch THEN ระบบ SHALL โหลดไฟล์นั้นเฉพาะเมื่อไฟล์ที่ตรงกับ fileMatchPattern ถูกเปิด
4. WHEN Steering File กำหนดกฎการตั้งชื่อ THEN AI Agent SHALL ปฏิบัติตามกฎนั้นเมื่อสร้างโค้ดใหม่
5. WHEN Steering File ระบุไลบรารีที่แนะนำ THEN AI Agent SHALL ใช้ไลบรารีนั้นแทนทางเลือกอื่น

### Requirement 4

**User Story:** ในฐานะนักพัฒนาส่วนขยาย ผมต้องการสร้าง Agent Hooks เพื่อทำงานอัตโนมัติตามเหตุการณ์ต่างๆ ในกระบวนการพัฒนา

#### Acceptance Criteria

1. WHEN ส่วนขยายถูกติดตั้ง THEN ระบบ SHALL จัดเตรียม Template ของ Hooks ในโฟลเดอร์ assets/hooks
2. WHEN ผู้ใช้รันคำสั่ง initializeKiro THEN ระบบ SHALL คัดลอก Hook Templates ไปยัง .kiro/hooks/ ของโปรเจกต์
3. WHEN Hook ถูกกำหนดด้วย trigger type onSave THEN ระบบ SHALL เรียกใช้ Hook เมื่อไฟล์ที่ตรงกับ filePattern ถูกบันทึก
4. WHEN Hook Action ทำการแก้ไขไฟล์ THEN ระบบ SHALL ป้องกัน Recursive Trigger ที่อาจเกิด Infinite Loop
5. WHEN Hook ทำงานเสร็จสิ้น THEN ระบบ SHALL แสดงผลลัพธ์หรือข้อผิดพลาดให้ผู้ใช้ทราบ

### Requirement 5

**User Story:** ในฐานะนักพัฒนาส่วนขยาย ผมต้องการบูรณาการ MCP Server เพื่อให้ AI Agent เข้าถึงข้อมูล Dynamic เช่น Documentation หรือ Runtime Information

#### Acceptance Criteria

1. WHEN ส่วนขยายมี MCP Server THEN ระบบ SHALL บรรจุ Server ไว้ในโฟลเดอร์ server/ ของส่วนขยาย
2. WHEN ส่วนขยายเริ่มทำงาน THEN ระบบ SHALL ลงทะเบียน MCP Server ใน mcpServers Configuration
3. WHEN AI Agent ร้องขอข้อมูล Documentation THEN MCP Server SHALL ดึงข้อมูลจาก Official Documentation หรือ Source Code ในเครื่อง
4. WHEN AI Agent ต้องการวิเคราะห์ Dependencies THEN MCP Server SHALL อ่านไฟล์ Manifest และสรุปรายการไลบรารีพร้อมเวอร์ชัน
5. WHEN MCP Server ตอบสนองคำร้องขอ THEN ระบบ SHALL ส่งข้อมูลกลับภายในเวลาไม่เกิน 2 วินาที

### Requirement 6

**User Story:** ในฐานะนักพัฒนาส่วนขยาย ผมต้องการสร้างไฟล์ package.json ที่ครอบคลุมเพื่อประกาศความสามารถทั้งหมดของส่วนขยาย

#### Acceptance Criteria

1. WHEN ส่วนขยายถูกสร้าง THEN ไฟล์ package.json SHALL ระบุ engines.vscode เวอร์ชัน ^1.80.0 ขึ้นไป
2. WHEN ส่วนขยายประกาศภาษา THEN ไฟล์ package.json SHALL มี contributes.languages ที่ระบุ extensions และ configuration
3. WHEN ส่วนขยายมี Grammar THEN ไฟล์ package.json SHALL มี contributes.grammars ที่ชี้ไปยังไฟล์ .tmLanguage.json
4. WHEN ส่วนขยายมีคำสั่ง THEN ไฟล์ package.json SHALL ประกาศคำสั่งใน contributes.commands
5. WHEN ส่วนขยายต้องการ Validate JSON THEN ไฟล์ package.json SHALL มี contributes.jsonValidation สำหรับไฟล์เป้าหมาย

### Requirement 7

**User Story:** ในฐานะนักพัฒนาส่วนขยาย ผมต้องการทดสอบส่วนขยายทั้งในระดับ Syntactic และ Agentic เพื่อให้มั่นใจในคุณภาพ

#### Acceptance Criteria

1. WHEN นักพัฒนาทดสอบ Syntax Highlighting THEN ระบบ SHALL ใช้เครื่องมือ vscode-tmgrammar-test เพื่อตรวจสอบความถูกต้อง
2. WHEN นักพัฒนาทดสอบ Agent Behavior THEN ระบบ SHALL เปิด Kiro IDE ในโหมด Debug และติดตั้งส่วนขยาย
3. WHEN นักพัฒนาทดสอบ Steering Rules THEN ระบบ SHALL ยืนยันว่า AI Agent ปฏิบัติตามกฎที่กำหนด
4. WHEN นักพัฒนาทดสอบ Hooks THEN ระบบ SHALL ยืนยันว่า Hooks ทำงานตามเหตุการณ์ที่กำหนด
5. WHEN นักพัฒนาทดสอบ MCP Server THEN ระบบ SHALL ยืนยันว่า Server ตอบสนองคำร้องขอได้ถูกต้อง

### Requirement 8

**User Story:** ในฐานะนักพัฒนาส่วนขยาย ผมต้องการแจกจ่ายส่วนขยายพร้อมกับ Templates และ Configuration ที่จำเป็น

#### Acceptance Criteria

1. WHEN ส่วนขยายถูก Bundle THEN ระบบ SHALL รวมไฟล์ Steering และ Hooks Templates ไว้ใน .vsix
2. WHEN ผู้ใช้เปิดไฟล์ภาษาเป้าหมายครั้งแรก THEN ระบบ SHALL แสดงข้อความเสนอให้ Initialize Kiro Support
3. WHEN ผู้ใช้ยอมรับการ Initialize THEN ระบบ SHALL คัดลอกไฟล์จาก Assets ไปยัง .kiro/ ของโปรเจกต์
4. WHEN ส่วนขยายถูกแจกจ่าย THEN ระบบ SHALL รองรับการติดตั้งจาก OpenVSX หรือไฟล์ .vsix
5. WHEN ส่วนขยายมีเอกสาร THEN ไฟล์ README.md SHALL อธิบายการใช้งานฟีเจอร์ AI อย่างชัดเจน

### Requirement 9

**User Story:** ในฐานะผู้ใช้ส่วนขยาย ผมต้องการให้ AI Agent เข้าใจโครงสร้างสถาปัตยกรรมของโปรเจกต์เพื่อวางไฟล์ในตำแหน่งที่ถูกต้อง

#### Acceptance Criteria

1. WHEN Steering File ชื่อ architecture.md มีอยู่ THEN AI Agent SHALL อ่านและปฏิบัติตามโครงสร้างที่กำหนด
2. WHEN AI Agent สร้างไฟล์ใหม่ THEN ระบบ SHALL วางไฟล์ในโฟลเดอร์ที่ระบุใน architecture.md
3. WHEN โครงสร้างโปรเจกต์มีกฎพิเศษ THEN architecture.md SHALL อธิบายกฎนั้นอย่างชัดเจน
4. WHEN AI Agent ต้องการสร้างโมดูลใหม่ THEN ระบบ SHALL ใช้ MCP Tool scaffold_module หากมี
5. WHEN architecture.md ใช้ inclusion: always THEN ระบบ SHALL โหลดไฟล์นั้นในทุกบริบท

### Requirement 10

**User Story:** ในฐานะผู้ใช้ส่วนขยาย ผมต้องการให้ระบบป้องกันข้อผิดพลาดที่อาจเกิดจากการกำหนดค่าที่ไม่ถูกต้อง

#### Acceptance Criteria

1. WHEN Steering File มี Syntax Error THEN ระบบ SHALL แสดงข้อความเตือนและระบุตำแหน่งข้อผิดพลาด
2. WHEN Hook มี Configuration ที่ไม่ถูกต้อง THEN ระบบ SHALL ปฏิเสธการโหลด Hook และแสดงข้อความอธิบาย
3. WHEN MCP Server ไม่สามารถเริ่มทำงานได้ THEN ระบบ SHALL แสดงข้อความข้อผิดพลาดและแนะนำวิธีแก้ไข
4. WHEN fileMatchPattern ใน Steering File ไม่ถูกต้อง THEN ระบบ SHALL แสดงคำเตือนและใช้ค่า Default
5. WHEN ส่วนขยายตรวจพบความขัดแย้งใน Configuration THEN ระบบ SHALL แจ้งเตือนผู้ใช้และให้คำแนะนำในการแก้ไข
