import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';

const Rating = ({ recipeId, recipeOwnerId }) => {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/recipes/${recipeId}`);
        const data = await res.json();
        setAverageRating(data.average_rating || 0);

        if (user && user.uid !== recipeOwnerId) {
          const token = await user.getIdToken();
          const res2 = await fetch(`http://localhost:5000/user-rating/${recipeId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const ratingData = await res2.json();
          if (ratingData.rating) setRating(ratingData.rating);
        }
      } catch (err) {
        console.error('ไม่สามารถโหลดข้อมูลสูตรหรือคะแนนได้', err);
      }
    };

    if (recipeId) fetchData();
  }, [submitted, recipeId, user, recipeOwnerId]);

  const handleRating = async (value) => {
    if (!user) {
      alert("กรุณาเข้าสู่ระบบเพื่อให้คะแนน");
      return;
    }

    if (user.uid === recipeOwnerId) {
      alert("ไม่สามารถให้คะแนนสูตรของตัวเองได้");
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch(`http://localhost:5000/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId, rating: value })
      });

      if (!res.ok) throw new Error("ให้คะแนนไม่สำเร็จ");

      setRating(value);
      setSubmitted(prev => !prev);
    } catch (err) {
      console.error("❌ Error:", err);
    }
  };

  return (
    <div>
      <h4>ให้คะแนนสูตรอาหาร</h4>
      {averageRating !== null && <p>คะแนนเฉลี่ย: ⭐ {averageRating.toFixed(1)}</p>}
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          onClick={() => handleRating(value)}
          style={{
            cursor: user && user.uid !== recipeOwnerId ? "pointer" : "not-allowed",
            color: value <= rating ? "gold" : "gray",
            fontSize: "24px"
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default Rating;
