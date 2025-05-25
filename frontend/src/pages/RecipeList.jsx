import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Fuse from "fuse.js";
import RecipeCreator from "../components/RecipeCreator";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function RecipeList() {
  const query = useQuery();
  const search = query.get("search") || "";
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    time: "",
    difficulty: "",
    category: "",
    rating: "",
  });
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("http://localhost:5000/recipes");
        const data = await res.json();
        setRecipes(data);
      } catch (err) {
        console.error("ดึงสูตรอาหารล้มเหลว:", err);
      }
    };
    fetchRecipes();
  }, []);

  const fuse = new Fuse(recipes, {
    keys: ["title"],
    threshold: 0.4,
  });

  const filteredBySearch =
    search.trim() === ""
      ? recipes
      : fuse.search(search).map((result) => result.item);

  const filteredRecipes = filteredBySearch.filter((recipe) => {
    const { time, difficulty, category, rating } = filters;
    const matchTime = time ? recipe.time === time : true;
    const matchDifficulty = difficulty ? recipe.difficulty === difficulty : true;
    const matchCategory = category ? recipe.category === category : true;
    const matchRating = rating
      ? Math.floor(recipe.average_rating || 0) === parseInt(rating)
      : true;
    return matchTime && matchDifficulty && matchCategory && matchRating;
  });

  filteredRecipes.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const displayedRecipes = filteredRecipes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE);

  const goToPage = (num) => {
    if (num < 1 || num > totalPages) return;
    setPage(num);
  };

  const handleFilterChange = (e) => {
    setPage(1);
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="container"
      style={{ maxWidth: "800px", margin: "auto", padding: "20px", paddingTop: "50px" }}
    >
      <h2>ผลการค้นหา: {search}</h2>

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}
      >
        <select name="time" value={filters.time} onChange={handleFilterChange}>
          <option value="">⏱ ระยะเวลา</option>
          <option value="5-10 นาที">5-10 นาที</option>
          <option value="11-30 นาที">11-30 นาที</option>
          <option value="31-60 นาที">31-60 นาที</option>
          <option value="60+ นาที">60+ นาที</option>
        </select>

        <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
          <option value="">🎯 ระดับความยาก</option>
          <option value="เมนูมือใหม่">เมนูมือใหม่</option>
          <option value="เมนูระดับปานกลาง">เมนูระดับปานกลาง</option>
          <option value="เมนูระดับเซียน">เมนูระดับเซียน</option>
          <option value="เมนูระดับเชฟ">เมนูระดับเชฟ</option>
        </select>

        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">🍱 ประเภทอาหาร</option>
          <option value="อาหาร">อาหาร</option>
          <option value="เครื่องดื่ม/ของหวาน">เครื่องดื่ม/ของหวาน</option>
        </select>

        <select name="rating" value={filters.rating} onChange={handleFilterChange}>
          <option value="">คะแนน</option>
          <option value="5">5 ดาว ⭐⭐⭐⭐⭐</option>
          <option value="4">4 ดาว ⭐⭐⭐⭐</option>
          <option value="3">3 ดาว ⭐⭐⭐</option>
          <option value="2">2 ดาว ⭐⭐</option>
          <option value="1">1 ดาว ⭐</option>
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: "20px",
        }}
      >
        {displayedRecipes.length === 0 ? (
          <p>ไม่พบสูตรอาหารที่ใกล้เคียง</p>
        ) : (
          displayedRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/recipe/${recipe.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
              >
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  style={{ width: "100%", height: "140px", objectFit: "cover" }}
                />
                <div style={{ padding: "10px" }}>
                  <h4 style={{ margin: "0 0 5px" }}>{recipe.title}</h4>
                  <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#f39c12" }}>
                    ⭐ คะแนน: {recipe.average_rating?.toFixed(1) || "ยังไม่มีคะแนน"}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.9em", color: "#555" }}>
                    ลงข้อมูลโดย: <RecipeCreator uid={recipe.created_by} />
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
            ก่อนหน้า
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              style={{
                fontWeight: page === i + 1 ? "bold" : "normal",
                textDecoration: page === i + 1 ? "underline" : "none",
              }}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}

export default RecipeList;
