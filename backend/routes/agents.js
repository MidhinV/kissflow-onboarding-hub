import express from "express";
import { getAgentIdForVideo } from "../config/agents.js";

const router = express.Router();

/**
 * GET /api/agents/:videoId
 * Get agent ID for a specific video
 */
router.get("/:videoId", (req, res) => {
  try {
    const { videoId } = req.params;
    const agentId = getAgentIdForVideo(videoId);
    
    if (!agentId) {
      return res.status(404).json({ 
        error: "Agent not found for this video",
        videoId 
      });
    }
    
    res.json({ 
      videoId,
      agentId 
    });
  } catch (error) {
    console.error("Error getting agent ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/agents
 * Get all agent mappings
 */
router.get("/", (req, res) => {
  try {
    const agentIds = getAllAgentIds();
    
    res.json({ 
      totalAgents: agentIds.length,
      agents: agentIds 
    });
  } catch (error) {
    console.error("Error getting agents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

