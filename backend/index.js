require('dotenv').config();

const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const serviceAccount = require("./serviceAccountKey.json");

const multer = require("multer");
const { cloudinary, storage } = require("./cloudinary");
const upload = multer({ storage });

const uploadRouter = require("./routes/upload");

const supabase = require("./supabaseClient");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.use(express.json());

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/recipes", async (req, res) => {
  try {
    const { data, error } = await supabase.from("recipes").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงสูตร" });
  }
});

app.get("/recipes/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ error: "ไม่พบสูตรอาหาร" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงสูตร" });
  }
});

app.post("/recipes", authenticate, async (req, res) => {
  console.log("POST /recipes - Body:", req.body);

  try {
    const { title, ingredients, instructions } = req.body;
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ error: "กรุณาระบุข้อมูลสูตรให้ครบถ้วน" });
    }

    const newRecipe = {
      ...req.body,
      created_by: req.user.uid,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("recipes")
      .insert([newRecipe])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "เพิ่มสูตรไม่สำเร็จ" });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มสูตรอาหาร" });
  }
});

app.put("/recipes/:id", authenticate, async (req, res) => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from("recipes")
      .select("created_by")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "ไม่พบสูตรอาหาร" });
    }

    if (existing.created_by !== req.user.uid) {
      return res.status(403).json({ error: "ไม่มีสิทธิ์แก้ไขสูตรนี้" });
    }

    const allowedUpdates = ["title", "ingredients", "instructions", "category", "image"];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const { error: updateError } = await supabase
      .from("recipes")
      .update(updates)
      .eq("id", req.params.id);

    if (updateError) throw updateError;

    res.json({ message: "แก้ไขสูตรสำเร็จ" });
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขสูตร" });
  }
});

app.delete("/recipes/:id", authenticate, async (req, res) => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from("recipes")
      .select("created_by")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "ไม่พบสูตรอาหาร" });
    }

    if (existing.created_by !== req.user.uid) {
      return res.status(403).json({ error: "ไม่มีสิทธิ์ลบสูตรนี้" });
    }

    const { error: deleteError } = await supabase
      .from("recipes")
      .delete()
      .eq("id", req.params.id);

    if (deleteError) throw deleteError;

    res.json({ message: "ลบสูตรสำเร็จ" });
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบสูตร" });
  }
});

app.post("/ratings", authenticate, async (req, res) => {
  try {
    const { recipeId, rating } = req.body;
    if (!recipeId || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วนหรือคะแนนไม่ถูกต้อง" });
    }

    console.log("ให้คะแนน:", { uid: req.user.uid, recipeId, rating });

    const { data: existing, error: checkError } = await supabase
      .from("ratings")
      .select("*")
      .eq("user_id", req.user.uid)
      .eq("recipe_id", recipeId);

    if (checkError) throw checkError;

    if (existing.length > 0) {
      const { data: updatedRating, error: updateRatingError } = await supabase
        .from("ratings")
        .update({
          rating: rating,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", req.user.uid)
        .eq("recipe_id", recipeId)
        .select();
      if (updateRatingError) throw updateRatingError;
    } else {
      const { error: insertError } = await supabase.from("ratings").insert([{
        user_id: req.user.uid,
        recipe_id: recipeId,
        rating: rating,
        created_at: new Date().toISOString()
      }]);
      if (insertError) throw insertError;
    }

    const { data: allRatings, error: fetchRatingsError } = await supabase
      .from("ratings")
      .select("rating")
      .eq("recipe_id", recipeId);
    if (fetchRatingsError) throw fetchRatingsError;

    const total = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const average = total / allRatings.length;

    const { data: updatedRecipe, error: updateError } = await supabase
      .from("recipes")
      .update({ average_rating: parseFloat(average.toFixed(2)) })
      .eq("id", recipeId)
      .select();
    if (updateError) throw updateError;

    res.status(201).json({ message: "เพิ่มคะแนนสำเร็จ และอัปเดตคะแนนเฉลี่ยแล้ว" });
  } catch (error) {
    console.error("Supabase Rating Error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการให้คะแนน" });
  }
});

app.get("/user-rating/:recipeId", authenticate, async (req, res) => {
  try {
    const { recipeId } = req.params;

    const { data, error } = await supabase
      .from("ratings")
      .select("rating")
      .eq("user_id", req.user.uid)
      .eq("recipe_id", recipeId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    res.json({ rating: data?.rating || null });
  } catch (error) {
    console.error("Error loading user rating:", error);
    res.status(500).json({ error: "ไม่สามารถโหลดคะแนนของผู้ใช้ได้" });
  }
});

app.get("/users/:uid", async (req, res) => {
  const { uid } = req.params;
  console.log(`[BACKEND] Attempting to fetch Firebase user with UID: ${uid}`);
  try {
    const userRecord = await admin.auth().getUser(uid);
    console.log(`[BACKEND] Successfully fetched user: ${userRecord.email} for UID: ${uid}`);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email || null,
      displayName: userRecord.displayName || null,
    });
  } catch (error) {
    console.error(`[BACKEND] Error fetching user ${uid} from Firebase Auth. Code: ${error.code}, Message: ${error.message}`);
    console.error('[BACKEND] Full Firebase error object:', JSON.stringify(error, null, 2)); // Log a readable full error object
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ error: `User with UID ${uid} not found in Firebase (as per SDK).` });
    } else {
      res.status(500).json({ error: "An error occurred while fetching user data from Firebase." });
    }
  }
});

app.use("/upload", uploadRouter);

app.get("/recipes/meta", async (req, res) => {
  try {
    const [catRes, timeRes, diffRes] = await Promise.all([
      supabase.from("recipes").select("category"),
      supabase.from("recipes").select("time"),
      supabase.from("recipes").select("difficulty"),
    ]);

    if (catRes.error || timeRes.error || diffRes.error) {
      throw catRes.error || timeRes.error || diffRes.error;
    }

    const getUniqueValues = (arr, key) =>
      [...new Set(arr.map(item => item[key]).filter(Boolean))];

    const categories = getUniqueValues(catRes.data, "category");
    const times = getUniqueValues(timeRes.data, "time");
    const difficulties = getUniqueValues(diffRes.data, "difficulty");

    res.json({ categories, times, difficulties });
  } catch (err) {
    console.error("❌ Error loading metadata:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดข้อมูล metadata" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});