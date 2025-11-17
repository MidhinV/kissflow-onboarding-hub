// Single agent ID for all videos (sub-agents configured in ElevenLabs)
const MAIN_AGENT_ID = process.env.ELEVENLABS_AGENT_ID || "";

// Map video IDs to the same main agent (sub-agents handled in ElevenLabs)
export const videoAgentIds = {
  "1": MAIN_AGENT_ID,
  "2": MAIN_AGENT_ID,
  "3": MAIN_AGENT_ID,
  "4": MAIN_AGENT_ID,
  "5": MAIN_AGENT_ID,
};

// Helper function to get agent ID for a video
export const getAgentIdForVideo = (videoId) => {
  return MAIN_AGENT_ID || null;
};

// Get all agent IDs (for validation)
export const getAllAgentIds = () => {
  return MAIN_AGENT_ID ? [MAIN_AGENT_ID] : [];
};

