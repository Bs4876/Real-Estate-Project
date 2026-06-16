from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import cohere
import os
import traceback
import numpy as np
from typing import Any

load_dotenv()

client = cohere.ClientV2(api_key=os.getenv("COHERE_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── SYSTEM PROMPT ─────────────────────────────────────────────
SYSTEM_PROMPT = f"""
You are Maya, a smart and friendly real estate assistant for {os.getenv("STORE_NAME")}.
{os.getenv("STORE_DESCRIPTION")}

Rules:
- Always respond in the same language the user writes in (Hebrew or English).
- If the user writes in Hebrew, respond in Hebrew only.
- When recommending properties, show ONLY properties that match the user's exact requirements (budget, rooms, beds, city, type).
- Never recommend properties outside the user's stated budget.
- If no matching property exists, say so honestly and suggest the closest alternative.
- Keep answers concise - maximum 4 sentences.
- Always ask for budget and rental/sale preference if not provided.
- Be warm, professional and helpful.

Formatting Rules for properties (Crucial):
- Present properties in a clean, bulleted list in Hebrew.
- Show ONLY fields that actually exist with valid values in the catalog.
- If a field is missing, empty, or has no value, DO NOT mention or print it at all (do not write "אין מידע" or similar).
- For plots of land ("מגרש" or "קרקע"), NEVER display fields like rooms ("חדרים") or beds ("מיטות").
- Formatting Examples:
  * Apartment Example:
    - **שם הנכס**: דירת 4 חדרים מפוארת
    - **מחיר**: 1,500,000 ש"ח
    - **מיקום**: חיפה
    - **חדרים**: 4
    - **מיטות**: 3
  * Land Plot Example (Notice no rooms/beds):
    - **שם הנכס**: מגרש לבנייה עצמית
    - **מחיר**: 800,000 ש"ח
    - **מיקום**: צפון
"""

# ── DATA MODELS ───────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []
    products: list = []

class SearchRequest(BaseModel):
    query: str
    products: list = []
    top_k: int = 5

# ── HELPER FUNCTION ───────────────────────────────────────────
def get_field_safely(d: dict, *keys: str) -> str:
    """
    שולף שדות בצורה בטוחה ללא תלות באותיות גדולות/קטנות (עבור .NET).
    מחזיר מחרוזת ריקה אם השדה לא קיים או שאין בו ערך.
    """
    for key in keys:
        for k, v in d.items():
            if k.lower() == key.lower() and v is not None:
                val_str = str(v).strip()
                if val_str not in ["", "0", "null", "None", "אין מידע"]:
                    return val_str
    return ""

# ── EMBEDDING FUNCTIONS ───────────────────────────────────────
def get_embedding(text: str) -> list[float]:
    response = client.embed(
        texts=[text],
        model="embed-multilingual-v3.0",
        input_type="search_document",
        embedding_types=["float"]
    )
    return response.embeddings.float[0]

def cosine_similarity(a: list, b: list) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# ── CHAT ENDPOINT ─────────────────────────────────────────────
@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        if req.products:
            catalog_lines = []
            for p in req.products:
                # שליפת נתונים חסינת שגיאות (תומכת ב-case sensitivity של .NET)
                title = get_field_safely(p, "title", "name")
                price = get_field_safely(p, "price")
                city = get_field_safely(p, "city", "location")
                rooms = get_field_safely(p, "rooms", "roomsCount")
                beds = get_field_safely(p, "beds", "bedsCount")
                trans_type = get_field_safely(p, "transactionType", "type")
                desc = get_field_safely(p, "description")
                
                is_avail_raw = get_field_safely(p, "isAvailable", "inStock")
                available = "available" if is_avail_raw.lower() in ["true", "yes", "1", ""] else "not available"

                # בניית שורה דינמית - מוסיפים שדה רק אם הוא באמת קיים!
                parts = []
                if title: parts.append(f"Name: {title}")
                if price: parts.append(f"Price: ${price}")
                if city: parts.append(f"City: {city}")
                if rooms: parts.append(f"Rooms: {rooms}")
                if beds: parts.append(f"Beds: {beds}")
                if trans_type: parts.append(f"Type: {trans_type}")
                if desc: parts.append(f"Description: {desc}")
                parts.append(f"Status: {available}")

                # מחבר רק את השדות שיש בהם מידע אמיתי
                line = "- " + " | ".join(parts)
                catalog_lines.append(line)
                
            catalog = "\n".join(catalog_lines)
            full_prompt = SYSTEM_PROMPT + f"\n\nAvailable properties:\n{catalog}\n\nOnly recommend properties from this list."
        else:
            full_prompt = SYSTEM_PROMPT

        messages = [{"role": "system", "content": full_prompt}]
        for m in req.history:
            messages.append({"role": m.role, "content": m.content})
        messages.append({"role": "user", "content": req.message})

        response = client.chat(
            model="command-r-plus-08-2024",
            messages=messages,
            max_tokens=400,
            temperature=0.5
        )

        return {"reply": response.message.content[0].text}

    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}

# ── SEARCH ENDPOINT ───────────────────────────────────────────
@app.post("/search")
async def search(req: SearchRequest):
    try:
        if not req.products:
            return {"results": []}

        # Embed the query
        query_response = client.embed(
            texts=[req.query],
            model="embed-multilingual-v3.0",
            input_type="search_query",
            embedding_types=["float"]
        )
        query_embedding = query_response.embeddings.float[0]

        # Score every product
        scored = []
        for p in req.products:
            title = get_field_safely(p, "title", "name")
            desc = get_field_safely(p, "description")
            city = get_field_safely(p, "city", "location")
            trans_type = get_field_safely(p, "transactionType", "type")
            
            product_text = f"{title} {desc} {city} {trans_type}".strip()
            if not product_text:
                product_text = "property"
                
            product_embedding = get_embedding(product_text)
            score = cosine_similarity(query_embedding, product_embedding)
            scored.append({**p, "score": round(score, 3)})

        results = sorted(scored, key=lambda x: x["score"], reverse=True)
        return {"results": results[:req.top_k]}

    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}