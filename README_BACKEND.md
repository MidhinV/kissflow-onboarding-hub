# Backend Setup Guide

## Overview
This backend provides API endpoints for the KissFlow Onboarding Hub, including:
- Video completion tracking
- Quiz validation (100% correctness required)
- ElevenLabs agent management
- User progress tracking

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:

```env
PORT=3001
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_AGENT_ID_1=your-agent-id-for-video-1
ELEVENLABS_AGENT_ID_2=your-agent-id-for-video-2
ELEVENLABS_AGENT_ID_3=your-agent-id-for-video-3
ELEVENLABS_AGENT_ID_4=your-agent-id-for-video-4
ELEVENLABS_AGENT_ID_5=your-agent-id-for-video-5
FRONTEND_URL=http://localhost:8080
```

### 3. Get ElevenLabs Agent IDs

For each of the 5 videos, you need to:
1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/)
2. Create a Conversational AI agent for each video
3. Configure each agent with:
   - Knowledge base about that specific video topic
   - Conversation flow for asking quiz questions
   - Response handling
4. Copy the agent ID from each agent's settings
5. Add them to your `.env` file

### 4. Start the Backend Server
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Agents
- `GET /api/agents/:videoId` - Get agent ID for a video
- `GET /api/agents` - Get all agent mappings

### Quiz
- `GET /api/quiz/:videoId/questions` - Get questions for a video
- `POST /api/quiz/validate` - Validate a single answer
- `POST /api/quiz/:videoId/validate-all` - Validate all answers

### Videos
- `POST /api/videos/:videoId/complete` - Mark video as complete (requires 100% correctness)
- `GET /api/videos/:videoId/progress` - Get progress for a video
- `GET /api/videos/progress` - Get all progress for a user

## Frontend Integration

The frontend is configured to proxy API requests through Vite. The `vite.config.ts` includes:
```typescript
proxy: {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true,
  },
}
```

This means frontend requests to `/api/*` will be proxied to the backend.

## Features

### 100% Correctness Requirement
- All answers must be correct before a video can be marked complete
- Backend validates each answer server-side
- Final validation ensures all questions are answered correctly

### Agent Management
- Each video has its own ElevenLabs agent
- Agent IDs are stored securely in environment variables
- Frontend fetches agent ID from backend (keeps API keys secure)

### Progress Tracking
- User progress is stored in-memory (replace with database for production)
- Tracks which videos are completed
- Stores answers and completion timestamps

## Next Steps

1. **Database Integration**: Replace in-memory storage with a database (SQLite for dev, PostgreSQL for production)
2. **User Authentication**: Add user management and authentication
3. **Analytics**: Track completion rates, time spent, common wrong answers
4. **Error Handling**: Enhanced error handling and logging

