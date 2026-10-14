import os
from typing import Optional
from dotenv import load_dotenv

# Load .env file if present
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

_client = None

def get_client():
    global _client
    if _client is None and SUPABASE_URL and SUPABASE_KEY:
        try:
            from supabase import create_client
            _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            print(f"[SUPABASE] init failed: {e}")
            return None
    return _client

def is_connected() -> bool:
    client = get_client()
    if not client:
        return False
    try:
        # Check connection with a quick select on events table
        client.table("events").select("event_id").limit(1).execute()
        return True
    except Exception:
        return False
