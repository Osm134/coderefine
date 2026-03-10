import os
import json
import uvicorn
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv # New Import

app = FastAPI()
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gro
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

class AuditRequest(BaseModel):
    code: str

def safe_int(value):
    """Cleans AI strings like '85%' into 85 to prevent 500 errors."""
    if isinstance(value, int): return value
    if isinstance(value, str):
        digits = "".join(re.findall(r'\d+', value))
        return int(digits) if digits else 0
    return 0

@app.post("/audit")
async def run_audit(request: AuditRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="No code provided")

    system_prompt = (
        "Analyze the code and return ONLY a JSON object. "
        "Structure: { "
        "'bug_count': int, "
        "'bug_details': 'string', "
        "'how_to_fix': 'string', "
        "'rewritten_code': 'string', "
        "'complexity_score': int, "
        "'security_score': int, "
        "'feature_suggestions': ['string'] "
        "}"
    )

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Audit this code:\n\n{request.code}"}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )

        data = json.loads(completion.choices[0].message.content)
        
        return {
            "bug_count": safe_int(data.get("bug_count", 0)),
            "bug_details": str(data.get("bug_details", "No major bugs.")),
            "how_to_fix": str(data.get("how_to_fix", "Ready for deployment.")),
            "rewritten_code": str(data.get("rewritten_code", request.code)),
            "complexity_score": min(100, safe_int(data.get("complexity_score", 0))),
            "security_score": min(100, safe_int(data.get("security_score", 0))),
            "feature_suggestions": data.get("feature_suggestions", ["Optimize imports", "Add logging"])
        }

    except Exception as e:
        print(f"Error: {e}")
        return {"bug_count": 0, "rewritten_code": "Processing Error.", "complexity_score": 0, "security_score": 0}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)