import express from "express";
import { validateAllAnswers } from "../services/validation.js";

const router = express.Router();

// In-memory storage for user progress (replace with database in production)
const userProgress = new Map();

// Store active conversations (videoId -> conversationId mapping)
const activeConversations = new Map();

/**
 * POST /api/elevenlabs/webhook
 * Receives webhook callbacks from ElevenLabs when conversation events occur
 * Expected payload structure (adjust based on ElevenLabs webhook format):
 * {
 *   event: "conversation.completed" | "conversation.started" | etc,
 *   conversation_id: string,
 *   video_id?: string,  // If passed via custom data
 *   user_id?: string,
 *   metadata?: object,
 *   answers?: { [questionId: string]: string }  // If validation data is included
 * }
 */
router.post("/webhook", (req, res) => {
  try {
    const { event, conversation_id, video_id, user_id, metadata, answers } = req.body;
    
    console.log("ElevenLabs webhook received:", { event, conversation_id, video_id, user_id });

    // Handle different event types
    switch (event) {
      case "conversation.started":
        // Track that a conversation has started
        if (conversation_id && video_id) {
          activeConversations.set(conversation_id, {
            videoId: video_id,
            userId: user_id || "default",
            startedAt: new Date().toISOString(),
          });
        }
        return res.json({ 
          success: true, 
          message: "Conversation started",
          conversation_id 
        });

      case "conversation.completed":
        // Handle completion - validate and mark video as complete
        return handleConversationCompleted(
          conversation_id,
          video_id,
          user_id,
          answers,
          metadata,
          res
        );

      case "subagent.completed":
        // Handle sub-agent completion (if ElevenLabs sends this)
        console.log("Sub-agent completed:", { conversation_id, video_id, metadata });
        return res.json({ 
          success: true, 
          message: "Sub-agent completed",
          conversation_id 
        });

      default:
        // Unknown event type - log but don't error
        console.log("Unknown webhook event:", event);
        return res.json({ 
          success: true, 
          message: "Event received" 
        });
    }
  } catch (error) {
    console.error("Error processing ElevenLabs webhook:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

/**
 * Handle conversation completion
 */
async function handleConversationCompleted(
  conversation_id,
  video_id,
  user_id,
  answers,
  metadata,
  res
) {
  try {
    // Get video ID from active conversation if not provided
    const conversation = activeConversations.get(conversation_id);
    const finalVideoId = video_id || conversation?.videoId;
    const finalUserId = user_id || conversation?.userId || "default";

    if (!finalVideoId) {
      return res.status(400).json({
        error: "Video ID not found",
        conversation_id
      });
    }

    // If answers are provided in webhook, validate them
    if (answers && typeof answers === "object") {
      const validation = validateAllAnswers(finalVideoId, answers);
      
      if (!validation.allAnswered) {
        return res.status(400).json({
          error: "Not all questions have been answered",
          conversation_id,
          ...validation
        });
      }

      if (!validation.allCorrect) {
        return res.status(400).json({
          error: "Not all answers are correct. 100% correctness required.",
          conversation_id,
          ...validation
        });
      }
    }

    // Mark video as complete
    const userKey = `${finalUserId}-${finalVideoId}`;
    userProgress.set(userKey, {
      videoId: finalVideoId,
      userId: finalUserId,
      completed: true,
      completedAt: new Date().toISOString(),
      conversationId: conversation_id,
      answers: answers || {},
      metadata: metadata || {}
    });

    // Clean up active conversation
    activeConversations.delete(conversation_id);

    console.log("Video marked as complete:", { videoId: finalVideoId, userId: finalUserId });

    res.json({
      success: true,
      message: "Video module completed successfully",
      videoId: finalVideoId,
      userId: finalUserId,
      completedAt: userProgress.get(userKey).completedAt,
      conversation_id
    });
  } catch (error) {
    console.error("Error handling conversation completion:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}

/**
 * GET /api/elevenlabs/conversation/:conversationId/status
 * Check status of an active conversation
 */
router.get("/conversation/:conversationId/status", (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = activeConversations.get(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        error: "Conversation not found",
        conversationId
      });
    }

    res.json({
      conversationId,
      ...conversation
    });
  } catch (error) {
    console.error("Error getting conversation status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/elevenlabs/start-conversation
 * Initialize a conversation for a video
 * Body: { videoId, userId?, conversationId? }
 */
router.post("/start-conversation", (req, res) => {
  try {
    const { videoId, userId = "default", conversationId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        error: "videoId is required"
      });
    }

    const finalConversationId = conversationId || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    activeConversations.set(finalConversationId, {
      videoId,
      userId,
      startedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      conversationId: finalConversationId,
      videoId,
      userId
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

