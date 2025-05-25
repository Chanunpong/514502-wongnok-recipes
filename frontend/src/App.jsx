import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import './App.css';
import Header from "./components/header";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Footer from "./components/Footer";
import RecipeList from "./pages/RecipeList";
import RecipeForm from "./pages/RecipeForm";
import RecipeDetail from "./pages/RecipeDetail";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("เข้าสู่ระบบสำเร็จ!");
    } catch (error) {
      alert("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert("ออกจากระบบไม่สำเร็จ: " + error.message);
    }
  };

  return (
    <>
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/add-recipe" element={<RecipeForm user={user} />} />
          <Route path="/recipe/:id" element={<RecipeDetail user={user} />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
