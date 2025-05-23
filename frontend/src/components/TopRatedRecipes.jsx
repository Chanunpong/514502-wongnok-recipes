import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./TopRatedRecipes.css";
import RecipeCreator from "../components/RecipeCreator";

function TopRatedRecipes() {
  const [topRecipes, setTopRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTopRecipes() {
      try {
        const response = await fetch("http://localhost:5000/recipes");
        if (!response.ok) throw new Error("ไม่สามารถโหลดข้อมูลสูตรอาหารได้");
        const data = await response.json();

        const filtered = data
          .filter(r => r.average_rating !== null && r.average_rating !== undefined)
          .sort((a, b) => b.average_rating - a.average_rating)
          .slice(0, 10);

        setTopRecipes(filtered);
        setLoading(false);
      } catch (err) {
        setError(err.message || "เกิดข้อผิดพลาด");
        setLoading(false);
      }
    }
    fetchTopRecipes();
  }, []);

  if (loading) return <div>กำลังโหลดเมนูที่ได้รับคะแนนสูงสุด...</div>;
  if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;

  return (
    <div className="top-rated-container">
      <h3>เมนูที่ได้รับคะแนนสูงสุด</h3>
      <div className="recipe-list">
        {topRecipes.map((r) => (
          <Link
            key={r.id}
            to={`/recipe/${r.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="recipe-card">
              <img
                src={r.image || "/images/default.jpg"}
                alt={r.title}
                className="recipe-image"
              />
              <div className="recipe-info">
                <p>{r.title}</p>
                <p>{r.average_rating?.toFixed(1)} ⭐</p>
                <p style={{ fontSize: "0.9em", color: "#555" }}>
                  ลงข้อมูลโดย: <RecipeCreator uid={r.created_by} />
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TopRatedRecipes;
