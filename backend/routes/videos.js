import express from "express";
import { validateAllAnswers } from "../services/validation.js";

const router = express.Router();

// In-memory storage for user progress (replace with database in production)
const userProgress = new Map();

/**
 * POST /api/videos/:videoId/complete
 * Mark video as complete (only if all questions answered correctly)
 * Body: { userId?, answers: { questionId: answer } }
 */
router.post("/:videoId/complete", (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId = "default", answers } = req.body;
    
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ 
        error: "Missing or invalid answers object" 
      });
    }
    
    // Validate all answers
    const validation = validateAllAnswers(videoId, answers);
    
    if (!validation.allAnswered) {
      return res.status(400).json({
        error: "Not all questions have been answered",
        ...validation
      });
    }
    
    if (!validation.allCorrect) {
      return res.status(400).json({
        error: "Not all answers are correct. 100% correctness required.",
        ...validation
      });
    }
    
    // Store completion
    const userKey = `${userId}-${videoId}`;
    userProgress.set(userKey, {
      videoId,
      userId,
      completed: true,
      completedAt: new Date().toISOString(),
      answers
    });
    
    res.json({
      success: true,
      message: "Video module completed successfully",
      videoId,
      completedAt: userProgress.get(userKey).completedAt
    });
  } catch (error) {
    console.error("Error completing video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/videos/:videoId/progress
 * Get progress for a specific video
 * Query: ?userId=default
 */
router.get("/:videoId/progress", (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId = "default" } = req.query;
    
    const userKey = `${userId}-${videoId}`;
    const progress = userProgress.get(userKey);
    
    if (!progress) {
      return res.json({
        videoId,
        userId,
        completed: false,
        progress: null
      });
    }
    
    res.json({
      videoId,
      userId,
      completed: progress.completed,
      completedAt: progress.completedAt,
      progress
    });
  } catch (error) {
    console.error("Error getting progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/videos/progress
 * Get all progress for a user
 * Query: ?userId=default
 */
router.get("/progress", (req, res) => {
  try {
    const { userId = "default" } = req.query;
    
    const allProgress = Array.from(userProgress.entries())
      .filter(([key]) => key.startsWith(`${userId}-`))
      .map(([key, value]) => ({
        videoId: value.videoId,
        completed: value.completed,
        completedAt: value.completedAt
      }));
    
    res.json({
      userId,
      progress: allProgress,
      totalCompleted: allProgress.length
    });
  } catch (error) {
    console.error("Error getting all progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

