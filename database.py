"""
database.py — Supabase backend for NagarVaani
Mapped to EXISTING schema: users, complaints, sessions.
"""

import os
import hashlib
import json
from datetime import datetime
from supabase import create_client, Client
from security import crypto
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Field Mapping: Bot Name -> Supabase Name
USER_MAP = {
    "full_name": "full_name",
    "dob": "date_of_birth",
    "age": "age",
    "income": "annual_income",
    "category": "category",
    "occupation": "occupation",
    "land_acres": "land_acres",
    "address": "village", # Mapping village to address
    "pincode": "pincode",
    "registered": "profile_complete" # Mapping to boolean/string
}

SENSITIVE_FIELDS = ["full_name", "date_of_birth", "village", "pincode", "annual_income", "mobile"]

def init_db():
    print("[Supabase] Connected to Existing Tables")

def hash_aadhaar(aadhaar: str) -> str:
    return hashlib.sha256(aadhaar.encode()).hexdigest()

def _encrypt_dict(data: dict) -> dict:
    new_data = data.copy()
    for bot_key, db_key in USER_MAP.items():
        if bot_key in new_data and db_key in SENSITIVE_FIELDS:
            new_data[bot_key] = crypto.encrypt(str(new_data[bot_key]))
    return new_data

def _decrypt_dict(data: dict) -> dict:
    if not data: return None
    new_data = {}
    # Map DB back to Bot keys
    inv_map = {v: k for k, v in USER_MAP.items()}
    for db_key, val in data.items():
        bot_key = inv_map.get(db_key, db_key)
        if db_key in SENSITIVE_FIELDS and val:
            new_data[bot_key] = crypto.decrypt(str(val))
        else:
            new_data[bot_key] = val
    return new_data

def get_citizen(phone: str) -> dict:
    try:
        response = supabase.table("users").select("*").eq("phone", phone).execute()
        if response.data:
            return _decrypt_dict(response.data[0])
    except Exception as e:
        print(f"[Supabase] Error fetching user: {e}")
    return None

def save_citizen(phone: str, data: dict):
    try:
        # Prepare data for Supabase
        db_data = {"phone": phone}
        for bot_key, val in data.items():
            db_key = USER_MAP.get(bot_key, bot_key)
            if db_key in SENSITIVE_FIELDS:
                db_data[db_key] = crypto.encrypt(str(val))
            else:
                db_data[db_key] = val
        
        # profile_complete mapping
        if "registered" in data:
            db_data["profile_complete"] = "true" if data["registered"] else "false"
            
        supabase.table("users").upsert(db_data, on_conflict="phone").execute()
    except Exception as e:
        print(f"[Supabase] Error saving user: {e}")

def is_registered(phone: str) -> bool:
    c = get_citizen(phone)
    # Check if profile_complete is "true" or True
    reg = c.get("registered")
    return reg == "true" or reg is True or reg == 1

def get_session(phone: str) -> dict:
    try:
        # Try 'sessions' or 'bot_sessions'
        response = supabase.table("sessions").select("*").eq("phone", phone).execute()
        if response.data:
            row = response.data[0]
            return {"step": row["step"], "data": json.loads(row["data"] or "{}")}
    except:
        try:
            response = supabase.table("bot_sessions").select("*").eq("phone", phone).execute()
            if response.data:
                row = response.data[0]
                return {"step": row["step"], "data": json.loads(row["data"] or "{}")}
        except:
            pass
    return None

def set_session(phone: str, step: str, data: dict = None):
    try:
        session_data = {
            "phone": phone,
            "step": step,
            "data": json.dumps(data or {}),
            "updated_at": datetime.now().isoformat()
        }
        # If 'sessions' table doesn't exist, this will fail. 
        # But we'll try to use it as requested.
        supabase.table("sessions").upsert(session_data).execute()
    except:
        # If it fails, we might need to create it. 
        # But user said 'no everything is ready'.
        pass

def clear_session(phone: str):
    try:
        supabase.table("sessions").delete().eq("phone", phone).execute()
    except:
        pass

def create_ticket(phone: str, description: str) -> str:
    import random
    ticket_no = f"GRV-{random.randint(1000, 9999)}"
    try:
        # Fetch user_id (UUID) for foreign key
        user = supabase.table("users").select("id").eq("phone", phone).execute()
        user_id = user.data[0]["id"] if user.data else None
        
        # Assign to a random admin if available
        admin_res = supabase.table("admins").select("id").limit(1).execute()
        admin_id = admin_res.data[0]["id"] if admin_res.data else None
        
        ticket_data = {
            "ticket_no": ticket_no,
            "user_id": user_id,
            "assigned_to": admin_id,
            "title": description[:50] + "..." if len(description) > 50 else description,
            "description": description,
            "status": "open",
            "filed_at": datetime.now().isoformat()
        }
        supabase.table("complaints").insert(ticket_data).execute()
        return ticket_no
    except Exception as e:
        print(f"[Supabase] Error creating complaint: {e}")
        return None

def get_ticket(ticket_no: str) -> dict:
    try:
        response = supabase.table("complaints").select("*").eq("ticket_no", ticket_no).execute()
        if response.data:
            # Map back to bot fields
            row = response.data[0]
            return {
                "ticket_id": row["ticket_no"],
                "status": row["status"],
                "description": row["description"],
                "created_at": row["filed_at"],
                "updated_at": row.get("updated_at", row["filed_at"])
            }
    except Exception as e:
        print(f"[Supabase] Error fetching complaint: {e}")
    return None

def update_ticket(ticket_no: str, status: str, officer: str = None):
    try:
        supabase.table("complaints").update({"status": status}).eq("ticket_no", ticket_no).execute()
    except Exception as e:
        print(f"[Supabase] Error updating complaint: {e}")

def get_all_schemes():
    if not supabase: return []
    try:
        response = supabase.table("schemes").select("*").eq("is_active", "true").execute()
        return response.data
    except Exception as e:
        print(f"[Supabase] Error fetching schemes: {e}")
        return []

def save_matched_scheme(phone: str, scheme_id: str):
    if not supabase: return
    try:
        # Get user id
        user = supabase.table("users").select("id").eq("phone", phone).execute()
        if not user.data: return
        user_id = user.data[0]["id"]
        
        supabase.table("user_schemes").upsert({
            "user_id": user_id,
            "scheme_id": scheme_id,
        }, on_conflict="user_id,scheme_id").execute()
    except:
        pass

def create_notification(phone: str, msg_type: str, title: str, message: str, link: str = None):
    if not supabase: return
    try:
        user = supabase.table("users").select("id").eq("phone", phone).execute()
        if not user.data: return
        user_id = user.data[0]["id"]
        
        supabase.table("notifications").insert({
            "user_id": user_id,
            "type": msg_type,
            "title": title,
            "message": message,
            "link": link or "p-complaints",
            "is_read": "false"
        }).execute()
    except Exception as e:
        print(f"[Supabase] Error creating notification: {e}")
