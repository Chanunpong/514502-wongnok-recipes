import React from "react";

import TopRatedRecipes from "../components/TopRatedRecipes";
import MasterChef from "../components/MasterChef";

function Home() {
  return (
    <div style={{ paddingTop: "50px", paddingBottom: "50px" }}>
      <TopRatedRecipes />
      <MasterChef />
    </div>
  );
}

export default Home;
