import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase";

const uploadToCloudinary = async (file, token) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:5000/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("อัปโหลดรูปไม่สำเร็จ");

  const data = await res.json();
  return data.url;
};

const getIdToken = async () => {
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
};

function RecipeForm({ user }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    image: null,
    ingredients: '',
    instructions: '',
    time: '',
    difficulty: '',
    category: ''
  });

  useEffect(() => {
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนเพิ่มสูตรอาหาร");
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getIdToken();
      if (!token) {
        alert("กรุณาเข้าสู่ระบบอีกครั้ง");
        return;
      }

      console.log("✅ Token:", token);

      let uploadedImageUrl = "";
      if (formData.image) {
        uploadedImageUrl = await uploadToCloudinary(formData.image, token);
        console.log("✅ Image URL:", uploadedImageUrl);
      }

      const recipeData = {
        title: formData.title,
        ingredients: formData.ingredients,
        instructions: formData.instructions,
        time: formData.time,
        difficulty: formData.difficulty,
        category: formData.category,
        image: uploadedImageUrl,
      };

      console.log("📦 Sending recipe data:", recipeData);

      const res = await fetch("http://localhost:5000/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });

      console.log("📬 Response status:", res.status);
      const resData = await res.json();
      console.log("📨 Response body:", resData);

      if (!res.ok) throw new Error(resData.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");

      alert("เพิ่มสูตรอาหารเรียบร้อยแล้ว!");
      navigate("/");
    } catch (err) {
      console.error("❌ Error:", err);
      alert("ไม่สามารถเพิ่มสูตรได้");
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: '70px' }}>
      <h2>เพิ่มสูตรอาหาร</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">ชื่อเมนู:</label>
        <input type="text" id="name" name="title" value={formData.title} onChange={handleChange} required />

        <label htmlFor="image">รูปอาหาร:</label>
        <input type="file" id="image" name="image" accept="image/*" onChange={handleChange} required />

        <label htmlFor="ingredients">วัตถุดิบ:</label>
        <textarea id="ingredients" name="ingredients" value={formData.ingredients} onChange={handleChange} rows="5" required />

        <label htmlFor="instructions">ขั้นตอนการทำ:</label>
        <textarea id="instructions" name="instructions" value={formData.instructions} onChange={handleChange} rows="5" required />

        <label htmlFor="time">ระยะเวลา:</label>
        <select id="time" name="time" value={formData.time} onChange={handleChange} required>
          <option value="">-- เลือกเวลา --</option>
          <option value="5-10 นาที">5-10 นาที</option>
          <option value="11-30 นาที">11-30 นาที</option>
          <option value="31-60 นาที">31-60 นาที</option>
          <option value="60+ นาที">60+ นาที</option>
        </select>

        <label htmlFor="difficulty">ระดับความยากง่าย:</label>
        <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange} required>
          <option value="">-- เลือกระดับความยาก --</option>
          <option value="เมนูมือใหม่">เมนูมือใหม่</option>
          <option value="เมนูระดับปานกลาง">เมนูระดับปานกลาง</option>
          <option value="เมนูระดับเซียน">เมนูระดับเซียน</option>
          <option value="เมนูระดับเชฟ">เมนูระดับเชฟ</option>
        </select>

        <label htmlFor="category">ประเภทอาหาร:</label>
        <select id="category" name="category" value={formData.category} onChange={handleChange} required>
          <option value="">-- เลือกประเภท --</option>
          <option value="อาหาร">อาหาร</option>
          <option value="เครื่องดื่ม/ของหวาน">เครื่องดื่ม/ของหวาน</option>
        </select>

        <button type="submit">บันทึกสูตร</button>
      </form>
    </div>
  );
}

export default RecipeForm;
