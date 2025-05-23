import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import Rating from "../components/Rating";

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

const multilineText = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));
};

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div style={{ fontSize: '24px', color: '#f39c12', marginTop: '10px' }}>
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`}>&#9733;</span>)}
      {halfStar && <span>&#9734;</span>}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`}>&#9734;</span>)}
    </div>
  );
};

function RecipeDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newImageFile, setNewImageFile] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const canEdit = user && recipe && user.uid === recipe.created_by;

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`http://localhost:5000/recipes/${id}`);
        const data = await res.json();
        setRecipe(data);
        setFormData(data);

        if (data.userRating) {
          setUserRating(data.userRating);
        } else {
          setUserRating(0);
        }
      } catch (err) {
        console.error("Error loading recipe:", err);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setNewImageFile(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = await getIdToken();
      if (!token) {
        alert("กรุณาเข้าสู่ระบบอีกครั้ง");
        return;
      }

      let updatedImageUrl = recipe.image;
      if (newImageFile) {
        updatedImageUrl = await uploadToCloudinary(newImageFile, token);
      }

      const updatedRecipe = {
        ...formData,
        image: updatedImageUrl,
      };

      const res = await fetch(`http://localhost:5000/recipes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRecipe),
      });

      if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการอัปเดต");

      alert("อัปเดตสูตรเรียบร้อยแล้ว");
      setRecipe(updatedRecipe);
      setEditing(false);
    } catch (err) {
      console.error("Error updating recipe:", err);
      alert("ไม่สามารถอัปเดตสูตรได้");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าจะลบสูตรนี้?")) return;

    try {
      const token = await getIdToken();
      if (!token) {
        alert("กรุณาเข้าสู่ระบบอีกครั้ง");
        return;
      }

      const res = await fetch(`http://localhost:5000/recipes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการลบสูตร");

      alert("ลบสูตรอาหารเรียบร้อยแล้ว");
      navigate("/");
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("ไม่สามารถลบสูตรอาหารได้");
    }
  };

  if (!recipe) return <div>กำลังโหลด...</div>;

  return (
    <div className="container" style={{ paddingTop: '70px', position: 'relative' }}>
      <h2>รายละเอียดสูตรอาหาร</h2>
      {editing ? (
        <div className="container">
          <h2>แก้ไขสูตรอาหาร</h2>
          <form onSubmit={handleUpdate}>
            <label htmlFor="title">ชื่อเมนู:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label htmlFor="image">รูปอาหาร:</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />

            <label htmlFor="ingredients">วัตถุดิบ:</label>
            <textarea
              id="ingredients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              rows="5"
              required
            />

            <label htmlFor="instructions">ขั้นตอนการทำ:</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="5"
              required
            />

            <label htmlFor="time">ระยะเวลา:</label>
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            >
              <option value="">-- เลือกเวลา --</option>
              <option value="5-10 นาที">5-10 นาที</option>
              <option value="11-30 นาที">11-30 นาที</option>
              <option value="31-60 นาที">31-60 นาที</option>
              <option value="60+ นาที">60+ นาที</option>
            </select>

            <label htmlFor="difficulty">ระดับความยากง่าย:</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
            >
              <option value="">-- เลือกระดับความยาก --</option>
              <option value="เมนูมือใหม่">เมนูมือใหม่</option>
              <option value="เมนูระดับปานกลาง">เมนูระดับปานกลาง</option>
              <option value="เมนูระดับเซียน">เมนูระดับเซียน</option>
              <option value="เมนูระดับเชฟ">เมนูระดับเชฟ</option>
            </select>

            <label htmlFor="category">ประเภทอาหาร:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">-- เลือกประเภท --</option>
              <option value="อาหาร">อาหาร</option>
              <option value="เครื่องดื่ม/ของหวาน">เครื่องดื่ม/ของหวาน</option>
            </select>

            <button type="submit">บันทึกสูตร</button>
            <button type="button" onClick={() => setEditing(false)} style={{ marginLeft: '10px' }}>
              ยกเลิก
            </button>
            <button type="button" onClick={handleDelete} style={{
                 marginLeft: '10px',
                 padding: '10px 16px',
                 backgroundColor: 'orange',
                 color: 'white',
                 fontWeight: 'bold',
                 borderRadius: '6px',
                 cursor: 'pointer',
                 fontSize: '16px'
            }}>      ลบสูตร
            </button>
          </form>
        </div>
      ) : (
        <div className="container" style={{ textAlign: 'left' }}>
          <h3>{recipe.title}</h3>
          <img
            src={recipe.image}
            alt={recipe.title}
          />
          <p style={{ whiteSpace: 'pre-wrap' }}>
            <strong>วัตถุดิบ:</strong><br />
            {multilineText(recipe.ingredients)}
          </p>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            <strong>ขั้นตอน:</strong><br />
            {multilineText(recipe.instructions)}
          </p>
          <p><strong>ระยะเวลา:</strong> {recipe.time}</p>
          <p><strong>ความยาก:</strong> {recipe.difficulty}</p>
          <p><strong>หมวดหมู่:</strong> {recipe.category}</p>

          {!canEdit && (
            <div style={{ marginTop: '15px' }}>
              <Rating recipeId={id} recipeOwnerId={recipe.ownerId} />
            </div>
          )}

          {canEdit && <button onClick={handleEditToggle} style={{ marginTop: '15px' }}>แก้ไข</button>}
        </div>
      )}

    
    </div>
  );
}

export default RecipeDetail;
