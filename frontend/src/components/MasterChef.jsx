import React from "react";
import "./MasterChef.css";

const topUsers = [
  { name: "เชฟต้น", avatar: "/chef1.png", points: 980 },
  { name: "เชฟเอ", avatar: "/chef2.png", points: 940 },
  { name: "เชฟบี", avatar: "/chef3.png", points: 910 },
  { name: "เชฟซี", avatar: "/chef4.png", points: 900 },
  { name: "เชฟดี", avatar: "/chef4.png", points: 890 },
  { name: "เชฟอี", avatar: "/chef4.png", points: 880 },
  { name: "เชฟเอฟ", avatar: "/chef4.png", points: 870 },
  { name: "เชฟจี", avatar: "/chef4.png", points: 860 },
  { name: "เชฟเอช", avatar: "/chef4.png", points: 850 },
  { name: "เชฟไอ", avatar: "/chef4.png", points: 840 },
  { name: "เชฟเจ", avatar: "/chef4.png", points: 830 }, 
];

function MasterChef() {
  return (
    <div className="masterchef-container">
      <h3>Master Chef(ยังไม่ได้ทำ)</h3>
      <div className="chef-list">
        {topUsers.slice(0, 10).map((u) => (
          <div className="chef-card" key={u.name}>
            <img src={u.avatar} alt={u.name} className="chef-avatar" />
            <div>{u.name}</div>
            <small>{u.points} คะแนน</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MasterChef;
