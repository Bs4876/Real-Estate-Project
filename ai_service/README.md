# AI Service - Real Estate Chat Agent

## Setup Instructions

### Step 1 - Add your OpenAI API Key
Open the `.env` file and replace `sk-proj-YOUR_KEY_HERE` with your actual key:
```
OPENAI_API_KEY=sk-proj-...your real key here...
```

### Step 2 - Install dependencies
Open a terminal in this folder and run:
```bash
pip install -r requirements.txt
```

### Step 3 - Run the service
```bash
uvicorn chat_service:app --port 8001 --reload
```

### Step 4 - Test
Open http://localhost:8001/docs in your browser.
Click POST /chat → Try it out → paste this body:
```json
{
  "message": "Hi, I am looking for an apartment to rent",
  "history": []
}
```

## Endpoints
- `POST /chat` - AI chat with conversation history and product context
- `POST /search` - Semantic search for properties by meaning

## Files
- `chat_service.py` - Main Python AI service
- `.env` - API key and store configuration (never commit this!)
- `requirements.txt` - Python dependencies
