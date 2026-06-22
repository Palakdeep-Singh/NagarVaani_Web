"""
database.py — Supabase backend for NagarVaani
Mapped to EXISTING schema: users, complaints, sessions.
"""

import os
import hashlib
import json
from datetime import datetime
from supabase import create_client, Client
from security import crypto, ENCRYPTED_FIELDS
from dotenv import load_dotenv
import pathlib

# Load .env from the same directory as this file
load_dotenv(pathlib.Path(__file__).parent / ".env")

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
    "address": "village",
    "pincode": "pincode",
    "registered": "profile_complete"
}

def init_db():
    print("[Supabase] Connected to Existing Tables")

def hash_aadhaar(aadhaar: str) -> str:
    return hashlib.sha256(aadhaar.encode()).hexdigest()

def decrypt_user_fields(data: dict) -> dict:
    """Decrypt all encrypted fields in a user row using AES-256-GCM."""
    if not data:
        return data
    out = dict(data)
    for field in ENCRYPTED_FIELDS:
        if field in out and out[field]:
            try:
                out[field] = crypto.decrypt(str(out[field]))
            except Exception:
                pass  # Leave as-is if decryption fails
    return out

def encrypt_user_fields(data: dict) -> dict:
    """Encrypt all sensitive fields before storing to Supabase."""
    if not data:
        return data
    out = dict(data)
    for field in ENCRYPTED_FIELDS:
        if field in out and out[field]:
            try:
                out[field] = crypto.encrypt(str(out[field]))
            except Exception:
                pass
    return out

def get_citizen(phone: str) -> dict:
    try:
        response = supabase.table("users").select("*").eq("phone", phone).execute()
        if response.data:
            return decrypt_user_fields(response.data[0])
    except Exception as e:
        print(f"[Supabase] Error fetching user: {e}")
    return None

def lookup_user_by_whatsapp(wa_phone: str) -> dict:
    """Look up user by WhatsApp phone, decrypt sensitive fields."""
    try:
        # Try full WhatsApp number
        response = supabase.table("users").select("*").eq("phone", wa_phone).execute()
        if response.data:
            return decrypt_user_fields(response.data[0])
        # Try stripping country code 91
        if wa_phone.startswith("91") and len(wa_phone) > 10:
            local = wa_phone[2:]
            response = supabase.table("users").select("*").eq("phone", local).execute()
            if response.data:
                return decrypt_user_fields(response.data[0])
    except Exception as e:
        print(f"[Supabase] Error in lookup: {e}")
    return None


def get_user_schemes(user_id: str) -> list:
    """Fetch schemes a user is enrolled in from user_schemes + schemes tables."""
    try:
        response = supabase.table("user_schemes").select("*, schemes(*)").eq("user_id", user_id).execute()
        if response.data:
            return response.data
    except Exception as e:
        print(f"[Supabase] Error fetching user schemes: {e}")
    # Fallback: return all active schemes
    try:
        response = supabase.table("schemes").select("*").eq("is_active", "true").limit(10).execute()
        return [{"schemes": s} for s in (response.data or [])]
    except:
        pass
    return []

def get_user_complaints(user_id: str, phone: str = None) -> list:
    """Fetch complaints filed by a user. Falls back to phone lookup."""
    try:
        if user_id:
            response = supabase.table("complaints").select("*").eq("user_id", user_id).order("filed_at", desc=True).execute()
            if response.data:
                return response.data
        # Fallback: look up user_id by phone
        if phone:
            local = phone[2:] if phone.startswith("91") and len(phone) > 10 else phone
            u = supabase.table("users").select("id").eq("phone", local).execute()
            if u.data:
                uid = u.data[0]["id"]
                response = supabase.table("complaints").select("*").eq("user_id", uid).order("filed_at", desc=True).execute()
                return response.data or []
    except Exception as e:
        print(f"[Supabase] Error fetching complaints: {e}")
    return []

def is_registered(phone: str) -> bool:
    """Check if a citizen is fully registered."""
    try:
        response = supabase.table("users").select("profile_complete").eq("phone", phone).execute()
        if response.data:
            val = response.data[0].get("profile_complete")
            return val in [True, "true", "1", 1]
    except Exception as e:
        print(f"[Supabase] Error checking registration: {e}")
    return False

def save_citizen(phone: str, data: dict):
    try:
        db_data = {"phone": phone}
        for bot_key, val in data.items():
            db_key = USER_MAP.get(bot_key, bot_key)
            db_data[db_key] = val
        
        if "registered" in data:
            db_data["profile_complete"] = "true" if data["registered"] else "false"
        
        # Encrypt sensitive fields before saving
        db_data = encrypt_user_fields(db_data)
        supabase.table("users").upsert(db_data, on_conflict="phone").execute()
    except Exception as e:
        print(f"[Supabase] Error saving user: {e}")

def save_new_user(phone: str, data: dict):
    """Save a new user from quick registration. Encrypts sensitive fields."""
    try:
        db_data = {
            "phone": phone,
            "full_name": data.get("full_name", ""),
            "age": data.get("age"),
            "gender": data.get("gender", ""),
            "category": data.get("category", ""),
            "annual_income": str(data.get("income", "")),
            "occupation": data.get("occupation", ""),
            "pincode": data.get("pincode", ""),
            "profile_complete": "true",
        }
        # Encrypt sensitive fields
        db_data = encrypt_user_fields(db_data)
        supabase.table("users").upsert(db_data, on_conflict="phone").execute()
        print(f"[Supabase] New user saved: {phone}")
    except Exception as e:
        print(f"[Supabase] Error saving new user: {e}")

def file_complaint(user_id: str, phone: str, description: str, category: str = "General") -> str:
    """File a complaint matching the exact Supabase complaints table schema."""
    import random
    year = datetime.now().strftime("%Y")
    ticket_no = f"GEN-{year}-{random.randint(1000, 9999)}"
    try:
        # Strip country code for phone lookup
        local_phone = phone[2:] if phone.startswith("91") and len(phone) > 10 else phone

        # If no user_id, look it up
        if not user_id:
            try:
                user = supabase.table("users").select("id, district, state").eq("phone", local_phone).execute()
                if user.data:
                    user_id = user.data[0]["id"]
            except:
                pass

        # Get user district/state for the complaint
        district = None
        state = None
        try:
            u = supabase.table("users").select("district, state").eq("phone", local_phone).execute()
            if u.data:
                district = u.data[0].get("district")
                state = u.data[0].get("state")
        except:
            pass

        now = datetime.now()
        due = now + __import__('datetime').timedelta(days=14)

        ticket_data = {
            "ticket_no": ticket_no,
            "user_id": user_id if user_id else None,
            "title": description[:50] + "..." if len(description) > 50 else description,
            "category": category,
            "description": description,
            "status": "pending",
            "priority": "normal",
            "filed_at": now.isoformat(),
            "due_at": due.isoformat(),
            "district": district,
            "state": state,
        }
        supabase.table("complaints").insert(ticket_data).execute()
        print(f"[Supabase] Complaint filed: {ticket_no}")
        return ticket_no
    except Exception as e:
        print(f"[Supabase] Error filing complaint: {e}")
        return None


# In-memory session fallback (used when Supabase sessions table fails)
_memory_sessions = {}

def get_session(phone: str) -> dict:
    # Try Supabase first
    try:
        response = supabase.table("sessions").select("*").eq("phone", phone).execute()
        if response.data:
            row = response.data[0]
            return {"step": row["step"], "data": json.loads(row["data"] or "{}")}
    except Exception as e:
        print(f"[Session] Supabase get failed: {e}")
    # Fallback to memory
    if phone in _memory_sessions:
        return _memory_sessions[phone]
    return None

def set_session(phone: str, step: str, data: dict = None):
    session_data = {"step": step, "data": data or {}}
    # Always save to memory first (guaranteed to work)
    _memory_sessions[phone] = session_data
    # Try Supabase too
    try:
        supabase.table("sessions").upsert({
            "phone": phone,
            "step": step,
            "data": json.dumps(data or {}),
            "updated_at": datetime.now().isoformat()
        }).execute()
    except Exception as e:
        print(f"[Session] Supabase set failed (using memory): {e}")

def clear_session(phone: str):
    _memory_sessions.pop(phone, None)
    try:
        supabase.table("sessions").delete().eq("phone", phone).execute()
    except Exception as e:
        print(f"[Session] Supabase clear failed: {e}")


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

def delete_citizen(phone: str):
    """Delete a citizen record by phone number."""
    try:
        supabase.table("users").delete().eq("phone", phone).execute()
        print(f"[Supabase] Deleted user: {phone}")
    except Exception as e:
        print(f"[Supabase] Error deleting user: {e}")

def get_citizen_grievances(phone: str) -> list:
    """Get all grievances filed by a citizen."""
    try:
        user = supabase.table("users").select("id").eq("phone", phone).execute()
        if not user.data:
            return []
        user_id = user.data[0]["id"]
        response = supabase.table("complaints").select("*").eq("user_id", user_id).order("filed_at", desc=True).execute()
        return response.data or []
    except Exception as e:
        print(f"[Supabase] Error fetching grievances: {e}")
        return []

def init_db():
    """Initialize database — verify Supabase connection."""
    try:
        supabase.table("users").select("id").limit(1).execute()
        print("[Supabase] Connection verified ✓")
    except Exception as e:
        print(f"[Supabase] Connection check failed: {e}")

def get_all_schemes():
    if not supabase: return []
    try:
        response = supabase.table("schemes").select("*").execute()
        return response.data or []
    except Exception as e:
        print(f"[Supabase] Error fetching schemes: {e}")
        return []

def save_matched_scheme(phone: str, scheme_id: str):
    if not supabase: return
    try:
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
