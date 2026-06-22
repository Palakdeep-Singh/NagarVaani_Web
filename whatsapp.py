"""
whatsapp.py — Meta WhatsApp Cloud API sender
"""

import os
import httpx

PHONE_ID = os.getenv("WHATSAPP_PHONE_ID", "")
TOKEN    = os.getenv("WHATSAPP_TOKEN", "")
API_URL  = f"https://graph.facebook.com/v18.0/{PHONE_ID}/messages"


async def send(phone: str, message: str):
    """Send WhatsApp text message to citizen."""
    if not TOKEN or not PHONE_ID:
        print(f"[WhatsApp] DEMO MODE — To: {phone}\n{message}\n")
        return

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
        async with httpx.AsyncClient() as client:
            r = await client.post(API_URL, json=payload, headers=headers)
            if r.status_code != 200:
                print(f"[WhatsApp] Error {r.status_code}: {r.text}")
    except Exception as e:
        print(f"[WhatsApp] Send failed: {e}")
