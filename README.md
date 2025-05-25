# 514502-wongnok-recipes


`โครงสร้างโฟลเดอร์`

-   `/frontend`: โค้ดสำหรับส่วนหน้าบ้าน (React App)
-   `/backend`: โค้ดสำหรับส่วนหลังบ้าน (Node.js API)


`สิ่งที่ต้องมีก่อนเริ่ม`
-   Git
-   Node.js


`ขั้นตอนการ Setup และ Run โปรเจกต์`

- Clone Repository

git clone https://github.com/Chanunpong/514502-wongnok-recipes.git
cd 514502-wongnok-recipes




`Backend:`
1. เลือก Open folder ชื่อว่า backend หรือ พิมพ์ cd backend จาก Folder ที่ Clone มาไว้ (cd backend)

2. Download ไฟล์ชื่อว่า serviceAccountKey.json และ  .env ไว้ในโฟลเดอร์ backend/ ของโปรเจกต์นี้

https://drive.google.com/drive/folders/1uMRCiuzmvSeDABDo_WzwlprnUfRJeBqG?usp=sharing


3. ติดตั้ง Dependencies ของ Backend:
npm install

4. รัน Backend Server:
npm run dev

เซิร์ฟเวอร์ควรจะทำงานที่ http://localhost:5000 (หรือ Port ที่คุณตั้งค่าไว้)



`Frontend:`
1. เลือก Open folder ชื่อว่า frontend หรือ พิมพ์ cd frontend จาก Folder ที่ Clone มาไว้ (cd frontend)

2. ติดตั้ง Dependencies ของ Frontend:
npm install

3.รัน Frontend Development Server:
npm run dev

แอปพลิเคชันควรจะเปิดในเบราว์เซอร์ที่ http://localhost:5173 (หรือ Port ที่ Vite/React กำหนด)



`การใช้งาน`
เมื่อ Frontend และ Backend ทำงานเรียบร้อยแล้ว คุณสามารถเข้าชมเว็บไซต์ผ่าน URL ของ Frontend

คุณสามารถตั้ง Search รายการอาหาร โดยไม่จำเป็นต้องเข้าสู่ระบบ โดยสามารถ Filter ข้อมูลต่างๆ ตามที่ต้องการได้
และหาต้องการให้คะแนน(1-5 ดาว) เมนูไหนที่คุณชอบคลิกปุ่มสามารถเข้าสู่ระบบ จากนั้นเลือกสมัครสมาชิก ตาม อีเมลและพาสเวิร์ดของคุณ

เมื่อเข้าสู่ระบบแล้ว คุณสามารถเพิ่ม/แก้ไขสูตรอาหาร ของตัวเองได้ และให้คะแนนเมนูผู้อื่นได้ยกเว้นของตัวเอง


