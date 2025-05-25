import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import "./header.css";
import { getIdToken } from "../firebase";

function Header({ user, onLogin, onLogout }) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [allMenus, setAllMenus] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleLoginSubmit = async () => {
    try {
      await onLogin(email, password);
      setShowLoginForm(false);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchMenus = async () => {
      try {
        const token = await getIdToken();
        const res = await fetch("http://localhost:5000/recipes", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Failed to fetch recipes");

        const data = await res.json();
        const titles = data
          .filter((recipe) => recipe.title)
          .map((recipe) => recipe.title);

        setAllMenus(titles);
      } catch (error) {
        console.error("Error fetching menus: ", error);
      }
    };
    fetchMenus();
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = allMenus.filter((menu) =>
        menu.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    }
  }, [searchTerm, allMenus]);

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/recipes?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate("/recipes");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
    navigate(`/recipes?search=${encodeURIComponent(suggestion)}`);
  };

  return (
    <header className="header">
      <img
        src="/logo.png"
        alt="Logo"
        className="logo"
        onClick={() => navigate("/")}
      />

      <div className="search-bar" style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="ค้นหาเมนูอาหาร..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          autoComplete="off"
        />
        <button onClick={handleSearch}>ค้นหา</button>

        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((item, index) => (
              <li
                key={index}
                style={{ padding: "5px 0", cursor: "pointer" }}
                onClick={() => handleSuggestionClick(item)}
                onMouseDown={(e) => e.preventDefault()}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!user && !showLoginForm && (
        <button onClick={() => setShowLoginForm(true)}>เข้าสู่ระบบ</button>
      )}

      {!user && showLoginForm && (
        <div className="login-form">
          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLoginSubmit}>เข้าสู่ระบบ</button>
          <button onClick={() => navigate("/signup")}>สมัครสมาชิก</button>
        </div>
      )}

      {user && (
        <button onClick={() => navigate("/add-recipe")}>เพิ่มสูตรอาหาร</button>
      )}

      {user && (
        <div className="user-menu">
          <span>{user.email}</span>
          <button onClick={onLogout}>ออกจากระบบ</button>
        </div>
      )}
    </header>
  );
}

export default Header;
