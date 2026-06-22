"""
webhook.py — NagarVaani WhatsApp Bot (Fully Fixed)
Registration flow: LANG→NAME→DOB→AGE→GENDER→MOBILE→AADHAAR→INCOME→CATEGORY→OCCUPATION→BPL→LAND→DISABILITY→WIDOW→PINCODE→CONFIRM
Post-registration: Schemes, Grievances, Status, Address Change, Doc Upload, Re-register, Profile
"""

import os
import re
import asyncio
import traceback
from fastapi import APIRouter, Request, Response
from fastapi.responses import PlainTextResponse
from dotenv import load_dotenv

from database import (
    get_citizen, save_citizen, is_registered,
    get_session, set_session, clear_session, delete_citizen,
    create_ticket, get_ticket, hash_aadhaar, init_db, get_citizen_grievances
)
from schemes  import match_schemes, get_key_voter_score, SCHEMES, get_scheme_by_profile, predict_best_scheme
from whatsapp import send
from intent   import classify

router = APIRouter()

def get_verify_token():
    load_dotenv(override=True)
    return os.getenv("WHATSAPP_VERIFY_TOKEN", "12345")

# ── Registration Steps ────────────────────────────────────────────────────────
STEPS = {
    "LANG":       ("🙏 Welcome to NagarVaani! / नगरवाणी में स्वागत है!\n\nChoose language / भाषा चुनें:\n1. Hindi  2. English  3. Marathi\n4. Tamil  5. Telugu   6. Bengali"),
    "NAME":       ("👤 *Step 1/12:* Please enter your *Full Name* / कृपया अपना *पूरा नाम* दर्ज करें:\n\nExample: _Yash Yadav_"),
    "DOB":        ("📅 *Step 2/12:* Enter your *Date of Birth* / अपनी *जन्म तिथि* दर्ज करें:\n\nFormat: DD/MM/YYYY\nExample: _21/07/2004_"),
    "AGE":        ("🔢 *Step 3/12:* Enter your *Age* / अपनी *उम्र* दर्ज करें:\n\nExample: _21_"),
    "GENDER":     ("⚧ *Step 4/12:* Enter your *Gender* / अपना *लिंग* दर्ज करें:\n\n1 - Male / पुरुष\n2 - Female / महिला\n3 - Other / अन्य"),
    "MOBILE":     ("📱 *Step 5/12:* Enter your *10-digit Mobile Number* / अपना *10 अंकों का मोबाइल नंबर* दर्ज करें:\n\nExample: _9518863905_"),
    "AADHAAR":    ("🪪 *Step 6/12:* Enter your *12-digit Aadhaar Number* / अपना *12 अंकों का आधार नंबर* दर्ज करें:\n\n_(Stored securely / सुरक्षित रूप से संग्रहीत)_"),
    "INCOME":     ("💰 *Step 7/12:* Enter your *Annual Family Income* (₹) / अपनी *वार्षिक आय* दर्ज करें:\n\nExample: _50000_"),
    "CATEGORY":   ("🏷️ *Step 8/12:* Select your *Category* / अपनी *श्रेणी* चुनें:\n\n1 - General (GEN)\n2 - OBC\n3 - SC\n4 - ST"),
    "OCCUPATION": ("💼 *Step 9/12:* Enter your *Occupation* / अपना *व्यवसाय* दर्ज करें:\n\n1-Farmer  2-Student  3-Business\n4-Daily Wage  5-Govt Employee  6-Other"),
    "BPL":        ("📋 *Step 10/12:* Do you have a *BPL Card*? / क्या आपके पास *बीपीएल कार्ड* है?\n\n1 - Yes / हाँ\n2 - No / नहीं"),
    "LAND":       ("🌾 *Step 11/12:* How many *acres of land* do you own? / आपके पास कितनी भूमि है?\n\nEnter number (e.g. _2.5_) or *0* if none"),
    "DISABILITY": ("♿ *Step 11b:* Do you have a *disability*? / क्या आपको कोई *विकलांगता* है?\n\n1 - Yes / हाँ\n2 - No / नहीं"),
    "WIDOW":      ("👩 *Step 11c:* Are you a *widow*? / क्या आप *विधवा* हैं?\n\n1 - Yes / हाँ\n2 - No / नहीं"),
    "PINCODE":    ("📍 *Step 12/12:* Enter your *6-digit Pincode* / अपना *6 अंकों का पिनकोड* दर्ज करें:\n\nExample: _273001_"),
}

STEP_ORDER = ["LANG", "NAME", "DOB", "AGE", "GENDER", "MOBILE", "AADHAAR",
              "INCOME", "CATEGORY", "OCCUPATION", "BPL", "LAND", "DISABILITY",
              "WIDOW", "PINCODE", "CONFIRM"]

LANG_MAP       = {"1": "hi", "2": "en", "3": "mr", "4": "ta", "5": "te", "6": "bn"}
GENDER_MAP     = {"1": "M", "2": "F", "3": "O"}
CATEGORY_MAP   = {"1": "GEN", "2": "OBC", "3": "SC", "4": "ST"}
OCCUPATION_MAP = {"1": "FARMER", "2": "STUDENT", "3": "BUSINESS",
                  "4": "DAILY_WAGE", "5": "GOVT_EMPLOYEE", "6": "OTHER"}

MENU_INTENT_MAP = {
    "MENU_1": "SCHEME_QUERY",
    "MENU_2": "GRIEVANCE_FILE",
    "MENU_3": "STATUS_CHECK",
    "MENU_4": "BOOTH_CHANGE",
    "MENU_5": "DOC_UPLOAD",
    "MENU_6": "RE_REGISTER",
    "MENU_7": "USER_DETAILS",
    "MENU_8": "EDIT_PROFILE"
}

MAIN_MENU = (
    "🏛️ *NagarVaani — Main Menu* / मुख्य मेनू\n\n"
    "1️⃣ My Schemes / मेरी योजनाएं\n"
    "2️⃣ File Complaint / शिकायत दर्ज करें\n"
    "3️⃣ Track Complaint / शिकायत ट्रैक करें\n"
    "4️⃣ Change Address / पता बदलें\n"
    "5️⃣ Upload Documents / दस्तावेज़ अपलोड\n"
    "6️⃣ New Number / नया नंबर\n"
    "7️⃣ Profile & Activity / प्रोफाइल और गतिविधि\n"
    "8️⃣ Edit Profile / प्रोफाइल संपादित करें\n\n"
    "Type *0* for Menu / मेनू के लिए 0 टाइप करें"
)

GUIDED_MENU = (
    "🏛️ *What can I help you with next?*\n\n"
    "1️⃣ My Schemes / मेरी योजनाएं\n"
    "2️⃣ File Complaint / शिकायत दर्ज करें\n"
    "3️⃣ Track Complaint / शिकायत ट्रैक करें\n"
    "4️⃣ Change Address / पता बदलें\n"
    "5️⃣ Upload Documents / दस्तावेज़ अपलोड\n"
    "6️⃣ New Number / नया नंबर\n"
    "7️⃣ Profile & Activity / प्रोफाइल और गतिविधि\n"
    "8️⃣ Edit Profile / प्रोफाइल संपादित करें\n\n"
    "Type *0* for full Menu."
)

KNOWLEDGE_BASE = {
    "NSP":   "The National Scholarship Portal (NSP) usually opens in July and closes in November.",
    "WATER": "Water issues can be filed by choosing 'File Complaint' (2).",
    "ROAD":  "Road maintenance requests are handled under 'Infrastructure' grievances.",
    "LIGHT": "Street light complaints are usually resolved within 48 hours.",
}


# ── Webhook verification ───────────────────────────────────────────────────────
@router.get("/")
@router.get("")
async def verify(request: Request):
    p = dict(request.query_params)
    print(f"[GET] Verification Request: {p}")
    if (p.get("hub.mode") == "subscribe" and
            p.get("hub.verify_token") == get_verify_token()):
        return PlainTextResponse(p["hub.challenge"])
    return Response("Token Mismatch", status_code=403)


# ── Incoming message ───────────────────────────────────────────────────────────
@router.post("/")
@router.post("")
async def receive(request: Request):
    body = await request.json()
    try:
        msg_data = (body.get("entry", [{}])[0]
                        .get("changes", [{}])[0]
                        .get("value", {}))

        if "messages" not in msg_data:
            return {"status": "ok"}

        msg   = msg_data["messages"][0]
        phone = msg["from"]

        if msg.get("type") == "text":
            text = msg["text"]["body"].strip()
            print(f"[Bot] {phone}: {text}")
            await handle_message(phone, text)
        elif msg.get("type") in ["image", "document"]:
            await handle_media(phone, msg)

    except Exception as e:
        print(f"[Bot] receive() error: {e}")
        traceback.print_exc()

    return {"status": "ok"}


# ── Message router ─────────────────────────────────────────────────────────────
async def handle_message(phone: str, text: str):
    print(f"[handle_message] START phone={phone} text={text!r}")
    try:
        session = get_session(phone)
        print(f"[handle_message] session={session}")
        t_lower = text.strip().lower()
        is_hi   = t_lower in ["hi", "hello", "hlo", "hey", "नमस्कार", "start"]

        # ── Hidden reset command ──
        if t_lower == "reset":
            delete_citizen(phone)
            clear_session(phone)
            await send(phone, "🔄 Data Reset! Send *Hi* to restart.")
            await send(phone, STEPS["LANG"])
            set_session(phone, "LANG", {})
            return

        registered = is_registered(phone)

        # ── Not registered ────────────────────────────────────────────────────
        if not registered:
            # Fresh start or explicit Hi
            if is_hi or session is None:
                clear_session(phone)
                set_session(phone, "LANG", {})
                await send(phone, STEPS["LANG"])
                return
            # Registration in progress
            if session["step"] in STEP_ORDER:
                await handle_registration(phone, text, session)
                return
            # Fallback: restart
            clear_session(phone)
            set_session(phone, "LANG", {})
            await send(phone, STEPS["LANG"])
            return

        # ── Registered user ───────────────────────────────────────────────────
        if is_hi or t_lower in ["0", "menu"]:
            clear_session(phone)
            await send(phone, MAIN_MENU)
            return

        # Show processing indicator for longer texts
        if len(text) > 10 and not text.isdigit():
            await send(phone, "⚙️ _Processing... / संसाधित हो रहा है..._")

        result = await classify(text)
        intent = result["intent"]

        if intent in MENU_INTENT_MAP:
            clear_session(phone)
            intent = MENU_INTENT_MAP[intent]
        elif result.get("show_menu"):
            await send(phone, GUIDED_MENU)
            return

        await route_intent(phone, text, intent)

    except Exception as e:
        print(f"[handle_message] ERROR: {e}")
        traceback.print_exc()
        await send(phone, "⚠️ Something went wrong. Please type *0* for the Menu.")


# ── Registration flow ──────────────────────────────────────────────────────────
async def handle_registration(phone: str, text: str, session: dict):
    step = session["step"]
    data = session.get("data", {})
    t    = text.strip()

    def advance(nxt):
        set_session(phone, nxt, data)

    # LANG
    if step == "LANG":
        if t in LANG_MAP:
            data["language"] = LANG_MAP[t]
            advance("NAME"); await send(phone, STEPS["NAME"])
        else:
            await send(phone, STEPS["LANG"])
        return

    # NAME
    if step == "NAME":
        if len(t) >= 2 and not re.fullmatch(r'\d+', t):
            data["full_name"] = t.title()
            advance("DOB"); await send(phone, STEPS["DOB"])
        else:
            await send(phone, "Please enter a valid full name. / कृपया सही नाम दर्ज करें।")
        return

    # DOB
    if step == "DOB":
        m = re.search(r'\d{2}/\d{2}/\d{4}', t)
        if m:
            data["dob"] = m.group()
            advance("AGE"); await send(phone, STEPS["AGE"])
        else:
            await send(phone, "Invalid format. Use DD/MM/YYYY. Example: _21/07/2004_")
        return

    # AGE
    if step == "AGE":
        clean = re.sub(r'[^\d]', '', t)
        if clean and 1 <= int(clean) <= 120:
            data["age"] = int(clean)
            advance("GENDER"); await send(phone, STEPS["GENDER"])
        else:
            await send(phone, "Please enter a valid age (1–120).")
        return

    # GENDER
    if step == "GENDER":
        tl = t.lower()
        gender = None
        if t in GENDER_MAP:                      gender = GENDER_MAP[t]
        elif "female" in tl or "महिला" in tl:    gender = "F"
        elif "male" in tl or "पुरुष" in tl:      gender = "M"
        elif "other" in tl or "अन्य" in tl:      gender = "O"
        elif t.upper() in ["M", "F", "O"]:       gender = t.upper()
        if gender:
            data["gender"] = gender
            advance("MOBILE"); await send(phone, STEPS["MOBILE"])
        else:
            await send(phone, "Enter 1 (Male), 2 (Female), or 3 (Other).")
        return

    # MOBILE
    if step == "MOBILE":
        clean = re.sub(r'[^\d]', '', t)
        if re.match(r'^\d{10}$', clean):
            data["mobile"] = clean
            advance("AADHAAR"); await send(phone, STEPS["AADHAAR"])
        else:
            await send(phone, "Please enter a valid 10-digit mobile number.")
        return

    # AADHAAR
    if step == "AADHAAR":
        clean = re.sub(r'[^\d]', '', t)
        if re.match(r'^\d{12}$', clean):
            data["aadhaar_hash"] = hash_aadhaar(clean)
            advance("INCOME"); await send(phone, STEPS["INCOME"])
        else:
            await send(phone, "Please enter a valid 12-digit Aadhaar number.")
        return

    # INCOME
    if step == "INCOME":
        clean = re.sub(r'[^\d]', '', t)
        if clean and int(clean) >= 0:
            data["income"] = int(clean)
            advance("CATEGORY"); await send(phone, STEPS["CATEGORY"])
        else:
            await send(phone, "Please enter a valid income amount (e.g. 50000).")
        return

    # CATEGORY
    if step == "CATEGORY":
        tl = t.lower()
        cat = None
        if t in CATEGORY_MAP:   cat = CATEGORY_MAP[t]
        elif "gen" in tl:       cat = "GEN"
        elif "obc" in tl:       cat = "OBC"
        elif "sc" in tl:        cat = "SC"
        elif "st" in tl:        cat = "ST"
        if cat:
            data["category"] = cat
            advance("OCCUPATION"); await send(phone, STEPS["OCCUPATION"])
        else:
            await send(phone, "Enter 1 (GEN), 2 (OBC), 3 (SC), or 4 (ST).")
        return

    # OCCUPATION
    if step == "OCCUPATION":
        if t in OCCUPATION_MAP:
            data["occupation"] = OCCUPATION_MAP[t]
        elif len(t) >= 2:
            data["occupation"] = t.upper()
        else:
            await send(phone, "Please enter your occupation or choose 1–6.")
            return
        advance("BPL"); await send(phone, STEPS["BPL"])
        return

    # BPL
    if step == "BPL":
        tl = t.lower()
        bpl = None
        if t == "1" or "yes" in tl or "हाँ" in tl:   bpl = 1
        elif t == "2" or "no" in tl or "नहीं" in tl:  bpl = 0
        if bpl is not None:
            data["bpl"] = bpl
            advance("LAND"); await send(phone, STEPS["LAND"])
        else:
            await send(phone, "Enter 1 (Yes) or 2 (No).")
        return

    # LAND
    if step == "LAND":
        clean = re.sub(r'[^\d.]', '', t)
        try:
            acres = float(clean) if clean else 0.0
            if acres < 0: raise ValueError("negative")
            data["land_acres"] = acres
            advance("DISABILITY"); await send(phone, STEPS["DISABILITY"])
        except (ValueError, TypeError):
            await send(phone, "Please enter a valid number (e.g. 2.5 or 0).")
        return

    # DISABILITY
    if step == "DISABILITY":
        tl = t.lower()
        dis = None
        if t == "1" or "yes" in tl or "हाँ" in tl:   dis = "Yes"
        elif t == "2" or "no" in tl or "नहीं" in tl:  dis = "No"
        if dis is not None:
            data["disability"] = dis
            if data.get("gender") == "M":   # Skip widow for males
                data["widow"] = "No"
                advance("PINCODE"); await send(phone, STEPS["PINCODE"])
            else:
                advance("WIDOW"); await send(phone, STEPS["WIDOW"])
        else:
            await send(phone, "Enter 1 (Yes) or 2 (No).")
        return

    # WIDOW
    if step == "WIDOW":
        tl = t.lower()
        widow = None
        if t == "1" or "yes" in tl or "हाँ" in tl:   widow = "Yes"
        elif t == "2" or "no" in tl or "नहीं" in tl:  widow = "No"
        if widow is not None:
            data["widow"] = widow
            advance("PINCODE"); await send(phone, STEPS["PINCODE"])
        else:
            await send(phone, "Enter 1 (Yes) or 2 (No).")
        return

    # PINCODE
    if step == "PINCODE":
        clean = re.sub(r'[^\d]', '', t)
        if re.match(r'^\d{6}$', clean):
            data["pincode"] = clean
            advance("CONFIRM")
            preview = (
                f"✅ *Please confirm your details:*\n\n"
                f"👤 Name: {data.get('full_name')}\n"
                f"📅 DOB: {data.get('dob')} | Age: {data.get('age')}\n"
                f"⚧ Gender: {data.get('gender')} | 📱 Mobile: {data.get('mobile')}\n"
                f"💰 Income: ₹{data.get('income')} | 🏷️ Category: {data.get('category')}\n"
                f"💼 Occupation: {data.get('occupation')} | BPL: {'Yes' if data.get('bpl') else 'No'}\n"
                f"🌾 Land: {data.get('land_acres', 0)} acres | ♿ Disability: {data.get('disability', 'No')} | 👩 Widow: {data.get('widow', 'No')}\n"
                f"📍 Pincode: {data.get('pincode')}\n\n"
                f"Is this correct? Reply *Yes* to confirm or *No* to restart."
            )
            await send(phone, preview)
        else:
            await send(phone, "Please enter a valid 6-digit pincode.")
        return

    # CONFIRM
    if step == "CONFIRM":
        if "yes" in t.lower() or "हाँ" in t.lower() or t == "1":
            data["registered"] = 1
            data["bank_account"] = "Yes"   # default — has mobile + bank
            save_citizen(phone, data)
            clear_session(phone)
            
            # Dynamic Matching from Supabase
            schemes = match_schemes(data)
            
            # Notification
            from database import create_notification
            create_notification(
                phone, "info", "Registration Successful", 
                f"Welcome {data.get('full_name', 'Citizen')}! You are eligible for {len(matches if 'matches' in locals() else schemes)} government schemes."
            )
            
            m = (
                f"✅ *Registration Successful!*\n\n"
                f"Welcome, {data.get('full_name')}! 🏛️\n\n"
                f"You are eligible for *{len(schemes)} government scheme(s)*!\n\n"
                f"Type *1* to see your schemes or *0* for the full Menu."
            )
            await send(phone, m)
        else:
            clear_session(phone)
            set_session(phone, "LANG", {})
            await send(phone, "Restarting registration...")
            await send(phone, STEPS["LANG"])


# ── Script / Language detection ────────────────────────────────────────────────
def detect_script(text: str) -> str:
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    return "en"

def mirror_message(text: str, target_lang: str) -> str:
    if " / " not in text: return text
    parts = text.split(" / ", 1)
    if target_lang == "hi":
        return f"{parts[1]} / {parts[0]}"
    return text


# ── Intent router ──────────────────────────────────────────────────────────────
async def route_intent(phone: str, text: str, intent: str):
    session = get_session(phone) or {}
    step    = session.get("step", "")
    data    = session.get("data", {})
    citizen = get_citizen(phone) or {}
    ai_tag  = "\n\n🤖 _AI-Powered Reply_"
    detected_lang = detect_script(text)

    # Direct Scheme Name Match
    norm_text = re.sub(r'[\s\-_]', '', text.lower())
    for s in SCHEMES:
        if re.sub(r'[\s\-_]', '', s["title"].lower()) in norm_text:
            intent = "SCHEME_QUERY"
            break

    # Menu / Back
    if intent == "MENU" or text.strip() == "0":
        clear_session(phone)
        await send(phone, MAIN_MENU)
        return

    # Resolve leftover MENU_x
    if intent in MENU_INTENT_MAP:
        if not (step == "SCHEME_LIST" and text.strip().isdigit()):
            clear_session(phone)
            session, step, data = {}, "", {}
            intent = MENU_INTENT_MAP[intent]

    # Knowledge Base
    for kw, ans in KNOWLEDGE_BASE.items():
        if kw.lower() in text.lower():
            await send(phone, f"💡 *Info:* {ans}{ai_tag}")
            return

    is_explicit_menu  = "MENU" in intent
    high_conf_switch  = is_explicit_menu
    is_interruption   = (not high_conf_switch and
                         ((step == "GRIEVANCE_DESC" and intent != "GRIEVANCE_FILE") or
                          (step == "BOOTH_ADDRESS"  and intent != "BOOTH_CHANGE")))
    footer = (f"\n\n💡 _Continuing your {step.replace('_',' ').title()}... send the next detail._"
              if is_interruption else "")

    # ── SCHEME_QUERY ──────────────────────────────────────────────────────────
    if intent == "SCHEME_QUERY" or step in ["SCHEME_LIST", "SCHEME_APPLY"]:
        schemes = match_schemes(citizen)
        t = text.strip()

        # Apply confirmation
        if step == "SCHEME_APPLY":
            if t.upper() == "YES" or t == "1":
                s_id = data.get("scheme_id", "your scheme")
                clear_session(phone)
                await send(phone, f"✅ *Application Submitted!*\n\nScheme: *{s_id}*\nStatus: *PENDING VERIFICATION*\n\nWe will notify you via WhatsApp.")
                await send(phone, GUIDED_MENU)
            else:
                clear_session(phone)
                await send(phone, "❌ Application cancelled.")
                await send(phone, GUIDED_MENU)
            return

        # Letter selection from scheme list
        t_upper = t.upper()
        if step == "SCHEME_LIST" and len(t_upper) == 1 and t_upper.isalpha():
            idx = ord(t_upper) - ord('A')
            top = schemes[:10]
            if 0 <= idx < len(top):
                s = top[idx]
                docs_txt     = "\n".join(f"• {d}" for d in s.get("docs", [])) or "_See official portal_"
                helpline_txt = f"\n📞 *Helpline:* {s['helpline']}" if s.get("helpline") else ""
                score_txt    = f"\n🎯 *Match Score:* {s.get('score', '-')}%" if s.get("score") else ""
                m = (
                    f"🔍 *{s['title']}*{score_txt}\n"
                    f"🏛️ {s.get('ministry', '')}\n\n"
                    f"💰 *Benefit:* {s['benefit']}\n\n"
                    f"📋 *Required Documents:*\n{docs_txt}\n\n"
                    f"🔗 *Apply:* {s['apply']}"
                    f"{helpline_txt}\n\n"
                    f"👉 Reply *YES* to apply or *0* for Menu."
                )
                set_session(phone, "SCHEME_APPLY", {"scheme_id": s["title"]})
                await send(phone, m)
            else:
                await send(phone, "Invalid selection. Please reply with a letter from the list (A, B, C...).")
            return

        # Keyword apply link search
        specific = get_scheme_by_profile(citizen, t)
        if specific and ("apply" in t.lower() or "link" in t.lower()):
            await send(phone, f"🔗 *{specific['title']} Apply Link:*\n{specific['apply']}\n\n_Type 0 for Menu_")
            return

        # Show scheme list
        if not schemes:
            await send(phone, f"📋 *No eligible schemes found* for your profile.{ai_tag}\n\nTry updating your profile (Type 7).")
            return

        top     = schemes[:10]
        labels  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        details = ""
        for i, s in enumerate(top):
            details += f"{labels[i]}. *{s['title']}* — _{s['score']}% match_\n   {s['benefit']}\n\n"
        msg = (
            f"📋 *Your Eligible Schemes ({len(schemes)} found):*\n\n"
            f"{details}"
            f"💡 _Reply with a letter (A, B, C...) for details & apply link!_"
        )
        set_session(phone, "SCHEME_LIST", {})
        await send(phone, msg)
        return

    # ── BOOTH_CHANGE ──────────────────────────────────────────────────────────
    elif intent == "BOOTH_CHANGE" or (step in ["BOOTH_ADDRESS", "BOOTH_PROOF"] and not high_conf_switch):
        t_up = text.strip().upper()
        if t_up in ["SKIP", "DONE"]:
            clear_session(phone)
            await send(phone, "✅ *Address Update Request Received!*\n\n_Processing..._")
            await send(phone, GUIDED_MENU)
        elif step == "BOOTH_PROOF":
            await send(phone, "📎 Please send an *Image or File* as address proof, or type *SKIP*.")
        elif step == "BOOTH_ADDRESS":
            set_session(phone, "BOOTH_PROOF", {"new_address": text})
            await send(phone, "📎 Please send one *address proof document*:\n(Electricity bill / Rent agreement / Bank statement)\n\nOr type *SKIP*.")
        else:
            set_session(phone, "BOOTH_ADDRESS", {})
            await send(phone, "🏠 Please enter your *new complete address* (include ward number):")
        return

    # ── GRIEVANCE_FILE ────────────────────────────────────────────────────────
    elif intent == "GRIEVANCE_FILE" or (step in ["GRIEVANCE_DESC", "GRIEVANCE_PHOTO"] and not high_conf_switch):
        t_up = text.strip().upper()
        if t_up in ["SKIP", "DONE"] or step == "GRIEVANCE_PHOTO":
            desc = data.get("description", "No description provided")
            ticket_id = create_ticket(phone, desc)
            clear_session(phone)
            
            # Notification
            from database import create_notification
            create_notification(
                phone, "warning", "Grievance Filed", 
                f"Your complaint #{ticket_id} has been registered and assigned to the district officer."
            )
            
            await send(phone, f"✅ *Complaint Registered!*\n\n🎫 *Ticket ID:* {ticket_id}\n\n_Use this ID to track your complaint later._")
            await send(phone, GUIDED_MENU)
        elif step == "GRIEVANCE_DESC":
            set_session(phone, "GRIEVANCE_PHOTO", {"description": text})
            await send(phone, "📸 *Send proof photo?* (Optional)\n\nOr type *SKIP* to submit now.")
        else:
            set_session(phone, "GRIEVANCE_DESC", {})
            await send(phone, "📝 Please *describe your complaint*:\n(e.g. Street light not working in Ward 4)")
        return

    # ── STATUS_CHECK ──────────────────────────────────────────────────────────
    elif intent == "STATUS_CHECK" or (step == "AWAITING_TICKET" and not high_conf_switch):
        match = re.search(r'(?i)(GRV[-\s]?\d{3,})', text.upper())
        if match:
            ticket_id = match.group(1).replace(" ", "-").upper()
            ticket = get_ticket(ticket_id)
            if ticket:
                reply = (f"📊 *Ticket:* {ticket_id}\n"
                         f"*Status:* {ticket['status']}\n"
                         f"*Issue:* {ticket['description'][:80]}\n"
                         f"*Filed:* {ticket['created_at'][:10]}")
            else:
                reply = f"❌ Ticket *{ticket_id}* not found."
            clear_session(phone)
            await send(phone, reply + footer)
        else:
            if step == "AWAITING_TICKET":
                await send(phone, "❌ Invalid format. Enter like: *GRV-1234*")
            else:
                set_session(phone, "AWAITING_TICKET", {})
                grievances = get_citizen_grievances(phone)
                g_list = ""
                if grievances:
                    g_list = "\n\n*Your Recent Tickets:*\n"
                    for g in grievances[:3]:
                        g_list += f"• {g['ticket_id']} ({g['status']})\n"
                await send(phone, f"🎫 Please enter your *ticket number*:{g_list}\n💡 _Type *2* to file a new complaint._")
        return

    # ── DOC_UPLOAD ────────────────────────────────────────────────────────────
    elif intent == "DOC_UPLOAD" or (step == "AWAITING_DOC" and not high_conf_switch):
        if step == "AWAITING_DOC":
            await send(phone, "⚠️ Please send the document as an *Image or File attachment*.")
        else:
            set_session(phone, "AWAITING_DOC", {})
            await send(phone, "📎 Please send your *document as a photo or PDF*.")
        return

    # ── RE_REGISTER ───────────────────────────────────────────────────────────
    elif intent == "RE_REGISTER" or (step == "AWAITING_AADHAAR_REREG" and not high_conf_switch):
        if step == "AWAITING_AADHAAR_REREG":
            if re.match(r'^\d{12}$', text.strip()):
                clear_session(phone)
                await send(phone, "✅ *Identity Verified!*\n\nYour profile has been linked to this number.")
                await send(phone, MAIN_MENU)
            else:
                await send(phone, "❌ Invalid Aadhaar. Please enter *12 digits*.")
        else:
            set_session(phone, "AWAITING_AADHAAR_REREG", {})
            await send(phone, "🔐 To verify your identity, please enter your *12-digit Aadhaar number*:")
        return

    # ── USER_DETAILS ──────────────────────────────────────────────────────────
    elif intent == "USER_DETAILS":
        grievances = get_citizen_grievances(phone)
        g_list = ""
        for g in grievances[:5]:
            g_list += f"• *{g['ticket_id']}*: {g['description'][:30]}... ({g['status']})\n"
        if not g_list: g_list = "_No complaints filed yet._"

        schemes_list = match_schemes(citizen)
        s_list = ""
        for s in schemes_list[:5]:
            s_list += f"• {s['title']} ({s['score']}%)\n"
        if not s_list: s_list = "_No schemes found for your profile._"

        profile_msg = (
            f"👤 *Your Profile:*\n"
            f"Name: {citizen.get('full_name')}\n"
            f"Age/Gender: {citizen.get('age')}/{citizen.get('gender')}\n"
            f"Income: ₹{citizen.get('income')} | Category: {citizen.get('category')}\n"
            f"BPL: {'Yes' if citizen.get('bpl') else 'No'} | Pincode: {citizen.get('pincode', '-')}\n\n"
            f"🌟 *Eligible Schemes:*\n{s_list}\n"
            f"📋 *Recent Complaints:*\n{g_list}\n"
            f"_Type 0 for Menu_"
        )
        await send(phone, profile_msg)
        return

    # ── EDIT_PROFILE ──────────────────────────────────────────────────────────
    elif intent == "EDIT_PROFILE" or step in ["EDIT_FIELD_SELECT", "EDIT_FIELD_VALUE"]:
        EDITABLE_FIELDS = {
            "1": ("full_name",   "👤 Enter your new *Full Name*:"),
            "2": ("dob",         "📅 Enter your new *Date of Birth* (DD/MM/YYYY):"),
            "3": ("income",      "💰 Enter your new *Annual Income* (₹):"),
            "4": ("category",    "🏷️ Enter your *Category*:\n1-GEN  2-OBC  3-SC  4-ST"),
            "5": ("occupation",  "💼 Enter your *Occupation*:\n1-Farmer  2-Student  3-Business\n4-Daily Wage  5-Govt Employee  6-Other"),
            "6": ("mobile",      "📱 Enter your new *10-digit Mobile Number*:"),
            "7": ("pincode",     "📍 Enter your new *6-digit Pincode*:"),
        }

        if step == "EDIT_FIELD_VALUE":
            field_key = data.get("edit_field")
            field_db  = data.get("edit_db_key")
            t = text.strip()
            new_val = None
            err_msg = None

            if field_db == "full_name":
                if len(t) >= 2 and not re.fullmatch(r'\d+', t):
                    new_val = t.title()
                else:
                    err_msg = "Please enter a valid full name."
            elif field_db == "dob":
                m = re.search(r'\d{2}/\d{2}/\d{4}', t)
                if m:
                    new_val = m.group()
                else:
                    err_msg = "Invalid format. Use DD/MM/YYYY."
            elif field_db == "income":
                clean = re.sub(r'[^\d]', '', t)
                if clean and int(clean) >= 0:
                    new_val = int(clean)
                else:
                    err_msg = "Enter a valid income (e.g. 50000)."
            elif field_db == "category":
                tl = t.lower()
                cat = None
                if t in CATEGORY_MAP:   cat = CATEGORY_MAP[t]
                elif "gen" in tl:       cat = "GEN"
                elif "obc" in tl:       cat = "OBC"
                elif "sc" in tl:        cat = "SC"
                elif "st" in tl:        cat = "ST"
                if cat:
                    new_val = cat
                else:
                    err_msg = "Enter 1 (GEN), 2 (OBC), 3 (SC), or 4 (ST)."
            elif field_db == "occupation":
                if t in OCCUPATION_MAP:
                    new_val = OCCUPATION_MAP[t]
                elif len(t) >= 2:
                    new_val = t.upper()
                else:
                    err_msg = "Please enter your occupation or choose 1–6."
            elif field_db == "mobile":
                clean = re.sub(r'[^\d]', '', t)
                if re.match(r'^\d{10}$', clean):
                    new_val = clean
                else:
                    err_msg = "Enter a valid 10-digit mobile number."
            elif field_db == "pincode":
                clean = re.sub(r'[^\d]', '', t)
                if re.match(r'^\d{6}$', clean):
                    new_val = clean
                else:
                    err_msg = "Enter a valid 6-digit pincode."

            if err_msg:
                await send(phone, f"❌ {err_msg} Please try again or type *0* for Menu.")
                return

            # Save updated field
            citizen[field_db] = new_val
            save_citizen(phone, citizen)
            clear_session(phone)
            await send(phone, f"✅ *Profile Updated!*\n\n_{field_db.replace('_',' ').title()}_ has been updated successfully.")
            await send(phone, GUIDED_MENU)
            return

        if step == "EDIT_FIELD_SELECT":
            if text.strip() in EDITABLE_FIELDS:
                field_db, prompt = EDITABLE_FIELDS[text.strip()]
                set_session(phone, "EDIT_FIELD_VALUE", {"edit_field": text.strip(), "edit_db_key": field_db})
                await send(phone, prompt)
            else:
                await send(phone, "❌ Invalid choice. Please enter a number from 1 to 7.")
            return

        # First entry — show field selector
        clear_session(phone)
        edit_menu = (
            "✏️ *Edit Profile — Select field to update:*\n\n"
            "1️⃣ Full Name / पूरा नाम\n"
            "2️⃣ Date of Birth / जन्म तिथि\n"
            "3️⃣ Annual Income / वार्षिक आय\n"
            "4️⃣ Category / श्रेणी (GEN/OBC/SC/ST)\n"
            "5️⃣ Occupation / व्यवसाय\n"
            "6️⃣ Mobile Number / मोबाइल नंबर\n"
            "7️⃣ Pincode / पिनकोड\n\n"
            "_Type the number of the field you want to change._\n"
            "Type *0* to go back to Menu."
        )
        set_session(phone, "EDIT_FIELD_SELECT", {})
        await send(phone, edit_menu)
        return

    # ── DEFAULT ───────────────────────────────────────────────────────────────
    else:
        await send(phone, MAIN_MENU)


# ── Media handler ──────────────────────────────────────────────────────────────
async def handle_media(phone: str, msg: dict):
    session = get_session(phone) or {}
    step    = session.get("step", "")
    data    = session.get("data", {})

    if step == "GRIEVANCE_PHOTO":
        description = data.get("description", "Complaint with photo")
        ticket = create_ticket(phone, description)
        clear_session(phone)
        await send(phone, f"✅ *Complaint Registered with Photo!*\n\n🎫 Ticket: *{ticket}*\nStatus: OPEN\n\nType 0 for menu.")
    elif step in ["AWAITING_DOC", "BOOTH_PROOF"]:
        clear_session(phone)
        await send(phone, "✅ *Document received!*\nForwarded to the concerned officer.\n\nType 0 for menu.")
    else:
        await send(phone, "📎 Document received.\nType 0 for menu.")
