import React, { useEffect, useState } from "react";

function RecipeCreator({ uid }) {
  const [creatorName, setCreatorName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      if (!uid) {
        setCreatorName("ไม่ระบุชื่อุ");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/users/${uid}`);
        if (!res.ok) { 
          console.error(`Error fetching user ${uid}: ${res.status}`);
          setCreatorName("ไม่พบผู้ใช้");
          return;
        }
        const data = await res.json();
        setCreatorName(data.displayName || data.email || "ไม่ระบุชื่อ");
      } catch (error) { 
        console.error("Fetch creator error:", error);
        setCreatorName("เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [uid]);

 
  return (
    <span>
      {loading ? "กำลังโหลด..." : creatorName}
    </span>
  );
}

export default RecipeCreator;