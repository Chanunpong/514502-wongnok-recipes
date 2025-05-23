import React, { useEffect, useState } from "react";

function RecipeCreator({ uid }) {
  const [creatorName, setCreatorName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      if (!uid) {
        setCreatorName("ไม่ระบุ");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/users/${uid}`);
        const data = await res.json();
        setCreatorName(data.displayName || data.email || "ไม่ระบุชื่อ");
      } catch {
        setCreatorName("ไม่ระบุชื่อ");
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [uid]);

  return (
    <p style={{ margin: 0, fontSize: "0.9em", color: "#555" }}>
      {loading ? "กำลังโหลด..." : creatorName}
    </p>
  );
}

export default RecipeCreator;
