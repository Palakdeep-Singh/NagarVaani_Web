"""
whatsapp.py — Meta WhatsApp Cloud API sender
"""

import os
import httpx
from dotenv import load_dotenv

# We load .env on every send call so token updates are picked up without a server restart
def get_credentials():
    load_dotenv(override=True)
    PHONE_ID = os.getenv("WHATSAPP_PHONE_ID", "")
    TOKEN    = os.getenv("WHATSAPP_TOKEN", "")
    return PHONE_ID, TOKEN

async def send(phone: str, message: str):
    """Send WhatsApp text message to citizen."""
    PHONE_ID, TOKEN = get_credentials()
    
    if not TOKEN or not PHONE_ID:
        print(f"[WhatsApp] DEMO MODE — To: {phone}\n{message}\n")
        return

    API_URL  = f"https://graph.facebook.com/v18.0/{PHONE_ID}/messages"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type":  "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to":   phone,
        "type": "text",
        "text": {"body": message}
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(API_URL, json=payload, headers=headers)
            if r.status_code == 200:
                print(f"[WhatsApp] SENT to {phone}")
            else:
                print(f"[WhatsApp] ERROR {r.status_code}: {r.text[:300]}")
    except Exception as e:
        print(f"[WhatsApp] Send exception: {e}")
