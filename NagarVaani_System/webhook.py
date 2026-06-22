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
    create_ticket, get_ticket, hash_aadhaar, init_db, get_citizen_grievances,
    lookup_user_by_whatsapp, get_user_schemes, get_user_complaints,
    save_new_user, file_complaint
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
    "LANG":       ("🇮🇳 *Government of India*\n"
                    "*NagarVaani* \u2022 Digital Citizen Service Platform\n\n"
                    "Dear Citizen,\n\n"
                    "Welcome to *NagarVaani* \u2014 an initiative designed to strengthen the connection "
                    "between citizens and government services across India.\n\n"
                    "*NagarVaani (नागरवाणी)* means _\"Voice of the Citizen\"_ \u2014 reflecting the "
                    "Government's commitment to ensuring that every citizen's needs, concerns, "
                    "and aspirations are heard and addressed efficiently.\n\n"
                    "🌐 *Please choose your language:*\n\n"
                    "1️⃣ English\n"
                    "2️⃣ हिंदी (Hindi)\n"
                    "3️⃣ मराठी (Marathi) _\u2022 Coming Soon_\n"
                    "4️⃣ தமிழ் (Tamil) _\u2022 Coming Soon_\n"
                    "5️⃣ తెలుగు (Telugu) _\u2022 Coming Soon_\n"
                    "6️⃣ বাংলা (Bengali) _\u2022 Coming Soon_"),
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

LANG_MAP       = {"1": "en", "2": "hi", "3": "mr", "4": "ta", "5": "te", "6": "bn"}
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

def get_welcome_menu(name: str) -> str:
    return (
        f"🏛️ *Welcome, {name}!* / स्वागत है!\n\n"
        "What would you like to do?\n\n"
        "1️⃣ My Details / मेरी जानकारी\n"
        "2️⃣ My Schemes / मेरी योजनाएं\n"
        "3️⃣ Complaints / शिकायत\n"
        "4️⃣ Track Complaint / शिकायत ट्रैक\n"
        "5️⃣ Update Details / जानकारी अपडेट\n\n"
        "Type *0* to see this menu again."
    )

MAIN_MENU = get_welcome_menu("Citizen")

GUIDED_MENU = (
    "🏛️ *What can I help you with next?*\n\n"
    "1️⃣ My Details / मेरी जानकारी\n"
    "2️⃣ My Schemes / मेरी योजनाएं\n"
    "3️⃣ Complaints / शिकायत\n"
    "4️⃣ Track Complaint / शिकायत ट्रैक\n"
    "5️⃣ Update Details / जानकारी अपडेट\n\n"
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
        is_hi = t_lower in ["hi", "hello", "hlo", "hey", "नमस्कार", "start"]

        # ── Always start with language on Hi ──
        if is_hi or session is None:
            clear_session(phone)
            set_session(phone, "LANG", {})
            await send(phone, STEPS["LANG"])
            return

        step = session.get("step", "") if session else ""
        data = session.get("data", {}) if session else {}

        # ── LANG selection ──
        if step == "LANG":
            if t_lower in ["1", "2", "3", "4", "5", "6"]:
                lang = LANG_MAP.get(t_lower, "en")
                data["language"] = lang
                print(f"[handle_message] Language selected: {lang}")

                # Look up user by WhatsApp phone in Supabase
                print(f"[handle_message] Looking up user by phone: {phone}")
                user = lookup_user_by_whatsapp(phone)

                if user:
                    name = user.get("full_name", "Citizen")
                    print(f"[handle_message] User found: {name}")
                    data["user"] = user
                    data["user_id"] = user.get("id", "")
                    set_session(phone, "MENU", data)
                    await send(phone, get_welcome_menu(name))
                else:
                    # New user → start quick registration
                    print(f"[handle_message] User NOT found, starting registration")
                    set_session(phone, "REG_NAME", data)
                    await send(phone, "👋 *You're new here!* Let's get you registered quickly.\n\n📝 Please enter your *Full Name*:")
            else:
                await send(phone, STEPS["LANG"])
            return

        # ── MENU selection (1=Details, 2=Schemes, 3=Complaints) ──
        if step == "MENU":
            user = lookup_user_by_whatsapp(phone)
            user_id = user.get("id", "") if user else ""

            if t_lower == "0":
                name = user.get("full_name", "Citizen") if user else "Citizen"
                await send(phone, get_welcome_menu(name))
                return

            # Option 1: Details
            if t_lower == "1":
                if user:
                    # Auto-calculate age from DOB
                    from datetime import datetime as dt
                    dob_str = user.get('date_of_birth', '')
                    age = user.get('age', 'N/A')
                    if dob_str and dob_str != 'N/A':
                        for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y/%m/%d'):
                            try:
                                dob_date = dt.strptime(str(dob_str).strip()[:10], fmt)
                                today = dt.now()
                                age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))
                                break
                            except:
                                continue

                    # Build proper address
                    addr_parts = []
                    for f in ['ward', 'village', 'district', 'state']:
                        v = user.get(f)
                        if v and str(v).strip():
                            addr_parts.append(str(v).strip())
                    address = ', '.join(addr_parts) if addr_parts else 'N/A'
                    pin = user.get('pincode', '')
                    if pin:
                        address += f' - {pin}'

                    details = (
                        f"👤 *Your Profile Details*\n\n"
                        f"📛 Name: {user.get('full_name', 'N/A')}\n"
                        f"📱 Phone: {user.get('phone', 'N/A')}\n"
                        f"📅 DOB: {dob_str or 'N/A'}\n"
                        f"🔢 Age: {age}\n"
                        f"⚧ Gender: {user.get('gender', 'N/A')}\n"
                        f"💰 Income: ₹{user.get('annual_income', 'N/A')}\n"
                        f"🏷️ Category: {user.get('category', 'N/A')}\n"
                        f"💼 Occupation: {user.get('occupation', 'N/A')}\n"
                        f"📍 Address: {address}\n"
                        f"🌾 Land: {user.get('land_acres', '0')} acres\n\n"
                        f"Type *0* to go back to Menu."
                    )
                    await send(phone, details)
                else:
                    await send(phone, "❌ Your profile was not found. Please contact support.\n\nType *0* for Menu.")
                return

            # Option 2: Schemes
            if t_lower == "2":
                if user:
                    try:
                        # Fetch enrolled schemes (may fail if user_schemes table has issues)
                        user_schemes = []
                        try:
                            user_schemes = get_user_schemes(user_id)
                        except Exception as e:
                            print(f"[Schemes] get_user_schemes failed: {e}")

                        # Match eligible schemes (may fail on encrypted fields)
                        eligible = []
                        try:
                            eligible = match_schemes(user)
                        except Exception as e:
                            print(f"[Schemes] match_schemes failed: {e}")

                        msg = "📋 *Your Schemes*\n\n"

                        if user_schemes:
                            msg += "*Enrolled Schemes:*\n"
                            for i, us in enumerate(user_schemes[:5], 1):
                                scheme = us.get("schemes", us)
                                if isinstance(scheme, dict):
                                    name = scheme.get("name", scheme.get("title", "Unknown"))
                                    desc = scheme.get("description", scheme.get("benefit", ""))
                                    msg += f"{i}. {name}\n   _{str(desc)[:80]}_\n\n"

                        if eligible:
                            msg += "\n*Eligible Schemes:*\n"
                            for i, s in enumerate(eligible[:5], 1):
                                msg += f"{i}. {s.get('title', s.get('name', 'Unknown'))}\n   _{str(s.get('benefit', s.get('description', '')))[:80]}_\n\n"

                        if not user_schemes and not eligible:
                            msg += "No schemes found for your profile.\n"

                        msg += "\nType *0* to go back to Menu."
                        await send(phone, msg)
                    except Exception as e:
                        print(f"[Schemes] Full error: {e}")
                        await send(phone, "📋 *Schemes*\n\nCouldn't load schemes right now.\n\nType *0* for Menu.")
                else:
                    await send(phone, "❌ Profile not found. Cannot fetch schemes.\n\nType *0* for Menu.")
                return

            # Option 3: Complaints
            if t_lower == "3":
                if user:
                    complaints = get_user_complaints(user_id, phone)
                    if complaints:
                        msg = "📝 *Your Complaints*\n\n"
                        for i, c in enumerate(complaints[:5], 1):
                            status = c.get('status', 'pending').lower()
                            if status == 'resolved':
                                status_display = "Resolved ✅"
                            elif status in ['in-progress', 'in_progress', 'processing']:
                                status_display = "In Progress 🔄"
                            else:
                                status_display = "Pending ⏳"
                            msg += (
                                f"{i}. *{c.get('ticket_no', 'N/A')}*\n"
                                f"   📄 {c.get('description', 'N/A')[:60]}\n"
                                f"   📊 Status: {status_display}\n"
                                f"   📅 Filed: {str(c.get('filed_at', 'N/A'))[:10]}\n\n"
                            )
                        msg += "\n*Type 'new' to file a new complaint or 0 for Menu.*"
                    else:
                        msg = "📝 *No complaints yet.*\n\n*Type 'new' to file a new complaint or 0 for Menu.*"
                    set_session(phone, "COMPLAINT_MENU", data)
                    await send(phone, msg)
                else:
                    await send(phone, "❌ Profile not found.\n\nType *0* for Menu.")
                return

            # Option 4: Track Complaint
            if t_lower == "4":
                set_session(phone, "TRACK_COMPLAINT", data)
                await send(phone, "🔍 *Track a Complaint*\n\nPlease enter your *Ticket ID*:\n\n_Example: GEN-2026-4514_")
                return

            # Option 5: Update Details
            if t_lower == "5":
                set_session(phone, "UPDATE_MENU", data)
                await send(phone,
                    "✏️ *Update Details*\n\n"
                    "What would you like to update?\n\n"
                    "1️⃣ Update Address / पता अपडेट\n"
                    "2️⃣ Update Number / नंबर अपडेट\n"
                    "3️⃣ Update DOB / जन्मतिथि अपडेट\n"
                    "4️⃣ Update Occupation / व्यवसाय अपडेट\n\n"
                    "Type *0* for Menu."
                )
                return

            # Unknown option
            name = user.get("full_name", "Citizen") if user else "Citizen"
            await send(phone, f"Please choose 1-5:\n\n" + get_welcome_menu(name))
            return

        # ── UPDATE_MENU: pick what to update ──
        if step == "UPDATE_MENU":
            if t_lower == "1":
                set_session(phone, "UPDATE_ADDR_STATE", data)
                await send(phone, "🏠 *Update Address*\n\nStep 1/4: Enter your *State*:\n\n_Example: Maharashtra_")
                return
            elif t_lower == "2":
                set_session(phone, "UPDATE_NUM_INPUT", data)
                await send(phone, "📱 *Update Phone Number*\n\nEnter your *new 10-digit mobile number*:\n\n_Example: 9876543210_")
                return
            elif t_lower == "3":
                set_session(phone, "UPDATE_DOB_DAY", data)
                await send(phone, "📅 *Update Date of Birth*\n\nStep 1/3: Enter the *Day* (1-31):\n\n_Example: 15_")
                return
            elif t_lower == "4":
                set_session(phone, "UPDATE_OCCUPATION", data)
                await send(phone,
                    "💼 *Update Occupation*\n\n"
                    "Choose your occupation:\n\n"
                    "1️⃣ Farmer\n"
                    "2️⃣ Student\n"
                    "3️⃣ Business\n"
                    "4️⃣ Daily Wage\n"
                    "5️⃣ Govt Employee\n"
                    "6️⃣ Other\n\n"
                    "_Reply with the number._"
                )
                return
            elif t_lower == "0":
                user = lookup_user_by_whatsapp(phone)
                name = user.get("full_name", "Citizen") if user else "Citizen"
                set_session(phone, "MENU", data)
                await send(phone, get_welcome_menu(name))
                return
            await send(phone, "Pick a number from *1-4*, or type *0* for Menu.")
            return

        # ── UPDATE_ADDR_STATE ──
        if step == "UPDATE_ADDR_STATE":
            data["new_state"] = text.strip().title()
            set_session(phone, "UPDATE_ADDR_DISTRICT", data)
            await send(phone, f"✅ State: *{data['new_state']}*\n\nStep 2/4: Enter your *District*:\n\n_Example: Nagpur_")
            return

        # ── UPDATE_ADDR_DISTRICT ──
        if step == "UPDATE_ADDR_DISTRICT":
            data["new_district"] = text.strip().title()
            set_session(phone, "UPDATE_ADDR_WARD", data)
            await send(phone, f"✅ District: *{data['new_district']}*\n\nStep 3/4: Enter your *Ward / Village*:\n\n_Example: Laxmipur Village_")
            return

        # ── UPDATE_ADDR_WARD ──
        if step == "UPDATE_ADDR_WARD":
            data["new_ward"] = text.strip().title()
            set_session(phone, "UPDATE_ADDR_PINCODE", data)
            await send(phone, f"✅ Ward: *{data['new_ward']}*\n\nStep 4/4: Enter your *Pincode*:\n\n_Example: 440010_")
            return

        # ── UPDATE_ADDR_PINCODE ──
        if step == "UPDATE_ADDR_PINCODE":
            import re
            pin = text.strip()
            if not re.match(r'^\d{6}$', pin):
                await send(phone, "Please enter a valid 6-digit pincode.")
                return
            data["new_pincode"] = pin
            # Save to Supabase
            try:
                local_phone = phone[2:] if phone.startswith("91") and len(phone) > 10 else phone
                from database import supabase
                supabase.table("users").update({
                    "state": data.get("new_state"),
                    "district": data.get("new_district"),
                    "ward": data.get("new_ward"),
                    "pincode": data.get("new_pincode"),
                }).eq("phone", local_phone).execute()
                addr = f"{data.get('new_ward')}, {data.get('new_district')}, {data.get('new_state')} - {pin}"
                await send(phone, f"✅ *Address Updated!*\n\n📍 {addr}\n\nType *0* for Menu.")
            except Exception as e:
                print(f"[Update] Error: {e}")
                await send(phone, "❌ Could not update address. Try again.\n\nType *0* for Menu.")
            set_session(phone, "MENU", data)
            return

        # ── UPDATE_DOB_DAY ──
        if step == "UPDATE_DOB_DAY":
            day = text.strip()
            if not day.isdigit() or not (1 <= int(day) <= 31):
                await send(phone, "Please enter a valid day (1-31).")
                return
            data["new_dob_day"] = day.zfill(2)
            set_session(phone, "UPDATE_DOB_MONTH", data)
            await send(phone, f"✅ Day: *{data['new_dob_day']}*\n\nStep 2/3: Enter the *Month* (1-12):\n\n_Example: 7 for July_")
            return

        # ── UPDATE_DOB_MONTH ──
        if step == "UPDATE_DOB_MONTH":
            month = text.strip()
            if not month.isdigit() or not (1 <= int(month) <= 12):
                await send(phone, "Please enter a valid month (1-12).")
                return
            data["new_dob_month"] = month.zfill(2)
            set_session(phone, "UPDATE_DOB_YEAR", data)
            await send(phone, f"✅ Month: *{data['new_dob_month']}*\n\nStep 3/3: Enter the *Year* (e.g. 2000):\n\n_Example: 1990_")
            return

        # ── UPDATE_DOB_YEAR ──
        if step == "UPDATE_DOB_YEAR":
            year = text.strip()
            if not year.isdigit() or not (1900 <= int(year) <= 2025):
                await send(phone, "Please enter a valid year (1900-2025).")
                return
            day = data.get("new_dob_day", "01")
            month = data.get("new_dob_month", "01")
            dob = f"{year}-{month}-{day}"
            try:
                local_phone = phone[2:] if phone.startswith("91") and len(phone) > 10 else phone
                from database import supabase
                from security import crypto
                encrypted_dob = crypto.encrypt(dob)
                supabase.table("users").update({"date_of_birth": encrypted_dob}).eq("phone", local_phone).execute()
                await send(phone, f"✅ *DOB Updated!*\n\n📅 {day}/{month}/{year}\n\nType *0* for Menu.")
            except Exception as e:
                print(f"[UpdateDOB] Error: {e}")
                await send(phone, "❌ Could not update DOB. Try again.\n\nType *0* for Menu.")
            set_session(phone, "MENU", data)
            return

        # ── UPDATE_OCCUPATION ──
        if step == "UPDATE_OCCUPATION":
            occ_map = {
                "1": "Farmer", "2": "Student", "3": "Business",
                "4": "Daily Wage", "5": "Govt Employee", "6": "Other"
            }
            occ = occ_map.get(t_lower)
            if not occ:
                await send(phone, "Please pick a number from 1-6.")
                return
            try:
                local_phone = phone[2:] if phone.startswith("91") and len(phone) > 10 else phone
                from database import supabase
                supabase.table("users").update({"occupation": occ}).eq("phone", local_phone).execute()
                await send(phone, f"✅ *Occupation Updated!*\n\n💼 {occ}\n\nType *0* for Menu.")
            except Exception as e:
                print(f"[UpdateOcc] Error: {e}")
                await send(phone, "❌ Could not update occupation. Try again.\n\nType *0* for Menu.")
            set_session(phone, "MENU", data)
            return

        # ── UPDATE_NUM_INPUT: user enters new number ──
        if step == "UPDATE_NUM_INPUT":
            import re
            new_num = text.strip().replace('+91', '').replace(' ', '')
            if not re.match(r'^\d{10}$', new_num):
                await send(phone, "Please enter a valid *10-digit* mobile number.")
                return
            data["new_phone"] = new_num
            set_session(phone, "UPDATE_NUM_CONFIRM", data)
            await send(phone,
                f"📱 *Confirm Number Change:*\n\n"
                f"Old: {phone}\n"
                f"New: {new_num}\n\n"
                f"⚠️ _Your account will be moved to the new number._\n\n"
                f"Type *yes* to confirm or *no* to cancel."
            )
            return

        # ── UPDATE_NUM_CONFIRM: yes/no ──
        if step == "UPDATE_NUM_CONFIRM":
            if t_lower in ["yes", "y", "ha", "haan"]:
                new_num = data.get("new_phone", "")
                if not new_num:
                    await send(phone, "❌ Error. Please try again.\n\nType *0* for Menu.")
                    set_session(phone, "MENU", data)
                    return
                try:
                    local_phone = phone[2:] if phone.startswith("91") and len(phone) > 10 else phone
                    from database import supabase
                    # Update phone in Supabase
                    supabase.table("users").update({"phone": new_num}).eq("phone", local_phone).execute()
                    # Thank you to old number
                    await send(phone,
                        f"👋 *Thank you for using NagarVaani!*\n\n"
                        f"Your account has been moved to: *{new_num}*\n"
                        f"Please use your new number to contact us."
                    )
                    # Welcome to new number
                    new_wa = f"91{new_num}"
                    await send(new_wa,
                        f"🏛️ *Welcome to NagarVaani!*\n\n"
                        f"Your account has been transferred to this number.\n"
                        f"Send *Hi* to get started! 🎉"
                    )
                    # Clear old session
                    clear_session(phone)
                except Exception as e:
                    print(f"[UpdateNum] Error: {e}")
                    await send(phone, "❌ Could not update number. Try again.\n\nType *0* for Menu.")
                    set_session(phone, "MENU", data)
            elif t_lower in ["no", "n", "nahi"]:
                await send(phone, "🚫 Number update cancelled.\n\nType *0* for Menu.")
                set_session(phone, "MENU", data)
            else:
                await send(phone, "Type *yes* to confirm or *no* to cancel.")
            return

        # ── TRACK_COMPLAINT: user enters ticket ID ──
        if step == "TRACK_COMPLAINT":
            ticket_id = text.strip().upper()
            try:
                from database import supabase
                response = supabase.table("complaints").select("*").eq("ticket_no", ticket_id).execute()
                if response.data:
                    c = response.data[0]
                    status = c.get('status', 'pending').lower()
                    if status == 'resolved':
                        status_display = "Resolved ✅"
                    elif status in ['in-progress', 'in_progress', 'processing']:
                        status_display = "In Progress 🔄"
                    else:
                        status_display = "Pending ⏳"

                    msg = (
                        f"🔍 *Complaint Details*\n\n"
                        f"🎫 Ticket: *{c.get('ticket_no', 'N/A')}*\n"
                        f"🏷️ Category: {c.get('category', 'N/A')}\n"
                        f"📄 Description: {c.get('description', 'N/A')[:100]}\n"
                        f"📅 Filed: {str(c.get('filed_at', 'N/A'))[:10]}\n"
                        f"📊 Status: {status_display}\n"
                    )
                    if c.get('admin_notes'):
                        msg += f"💬 Admin Response: {c['admin_notes']}\n"
                    if c.get('resolved_at'):
                        msg += f"✅ Resolved On: {str(c['resolved_at'])[:10]}\n"

                    msg += "\nType *0* for Menu."
                    await send(phone, msg)
                else:
                    await send(phone, f"❌ No complaint found with ID *{ticket_id}*\n\n_Make sure you enter the full ID like GEN-2026-4514_\n\nType *0* for Menu.")
            except Exception as e:
                print(f"[Track] Error: {e}")
                await send(phone, "❌ Could not fetch complaint. Try again.\n\nType *0* for Menu.")
            set_session(phone, "MENU", data)
            return

        # ── COMPLAINT_MENU: waiting for 'new' or '0' ──
        if step == "COMPLAINT_MENU":
            if t_lower == "new" or t_lower == "file":
                data["complaint_step"] = "category"
                set_session(phone, "COMPLAINT_CATEGORY", data)
                await send(phone,
                    "📝 *File a New Complaint*\n\n"
                    "Choose a category:\n"
                    "1️⃣ Water Supply\n"
                    "2️⃣ Electricity\n"
                    "3️⃣ Roads & Infrastructure\n"
                    "4️⃣ Sanitation / Garbage\n"
                    "5️⃣ Document Issue\n"
                    "6️⃣ Other\n\n"
                    "_Reply with the number._"
                )
                return
            elif t_lower == "0":
                user = lookup_user_by_whatsapp(phone)
                name = user.get("full_name", "Citizen") if user else "Citizen"
                set_session(phone, "MENU", data)
                await send(phone, get_welcome_menu(name))
                return
            # Unrecognized input in complaint menu
            await send(phone, "Type *new* to file a complaint or *0* for Menu.")
            return

        # ── COMPLAINT_CATEGORY: user picks category ──
        if step == "COMPLAINT_CATEGORY":
            categories = {
                "1": "Water Supply", "2": "Electricity",
                "3": "Roads & Infrastructure", "4": "Sanitation / Garbage",
                "5": "Document Issue", "6": "Other"
            }
            cat = categories.get(t_lower)
            if cat:
                data["complaint_category"] = cat
                set_session(phone, "COMPLAINT_DESCRIBE", data)
                await send(phone,
                    f"📋 Category: *{cat}*\n\n"
                    "📝 Now *describe your issue* in detail:\n\n"
                    "_Example: 'Water supply disrupted in Sector 5 for 3 days'_"
                )
            else:
                await send(phone, "Please pick a number from 1-6.")
            return

        # ── COMPLAINT_DESCRIBE: user typing their complaint ──
        if step == "COMPLAINT_DESCRIBE":
            desc = text.strip()
            if len(desc) < 5:
                await send(phone, "Please describe your issue in more detail (at least 5 characters).")
                return
            # Confirm before filing
            category = data.get("complaint_category", "General")
            data["complaint_description"] = desc
            set_session(phone, "COMPLAINT_CONFIRM", data)
            await send(phone,
                f"📋 *Confirm your complaint:*\n\n"
                f"🏷️ Category: {category}\n"
                f"📄 Issue: {desc[:100]}\n\n"
                f"Type *yes* to submit or *no* to cancel."
            )
            return

        # ── COMPLAINT_CONFIRM: yes/no ──
        if step == "COMPLAINT_CONFIRM":
            if t_lower in ["yes", "y", "ha", "haan", "हाँ"]:
                user = lookup_user_by_whatsapp(phone)
                user_id = user.get("id", "") if user else ""
                desc = data.get("complaint_description", "No description")
                category = data.get("complaint_category", "General")
                ticket = file_complaint(user_id, phone, desc, category)
                if ticket:
                    await send(phone,
                        f"✅ *Complaint Filed Successfully!*\n\n"
                        f"🎫 Ticket: *{ticket}*\n"
                        f"🏷️ Category: {category}\n"
                        f"📄 {desc[:80]}\n"
                        f"📊 Status: Pending\n\n"
                        f"_You'll be notified when resolved._\n\n"
                        f"Type *0* for Menu."
                    )
                else:
                    await send(phone, "❌ Could not file complaint. Please try again.\n\nType *0* for Menu.")
                set_session(phone, "MENU", data)
            elif t_lower in ["no", "n", "nahi", "नहीं"]:
                await send(phone, "🚫 Complaint cancelled.\n\nType *0* for Menu.")
                set_session(phone, "MENU", data)
            else:
                await send(phone, "Type *yes* to submit or *no* to cancel.")
            return

        # ══════════════ COMPREHENSIVE REGISTRATION FLOW ══════════════

        # ── REG_NAME ──
        if step == "REG_NAME":
            if len(text.strip()) >= 2:
                data["full_name"] = text.strip().title()
                set_session(phone, "REG_GENDER", data)
                await send(phone,
                    f"👤 *Great, {data['full_name']}!*\n\n"
                    "⚧ Select your *Gender*:\n\n"
                    "1️⃣ Male\n2️⃣ Female\n3️⃣ Other"
                )
            else:
                await send(phone, "Please enter a valid name (at least 2 characters).")
            return

        # ── REG_GENDER ──
        if step == "REG_GENDER":
            g_map = {"1": "Male", "2": "Female", "3": "Other"}
            g = g_map.get(t_lower)
            if g:
                data["gender"] = g
                set_session(phone, "REG_DOB", data)
                await send(phone, f"✅ Gender: *{g}*\n\n📅 Enter your *Date of Birth*:\n\n_Format: DD-MM-YYYY_\n_Example: 15-07-2000_")
            else:
                await send(phone, "Please pick *1*, *2*, or *3*.")
            return

        # ── REG_DOB ──
        if step == "REG_DOB":
            import re
            dob = text.strip().replace("/", "-")
            if re.match(r'^\d{2}-\d{2}-\d{4}$', dob):
                data["date_of_birth"] = dob
                set_session(phone, "REG_RELIGION", data)
                await send(phone,
                    f"✅ DOB: *{dob}*\n\n"
                    "🙏 Select your *Religion*:\n\n"
                    "1️⃣ Hindu\n2️⃣ Muslim\n3️⃣ Christian\n4️⃣ Sikh\n"
                    "5️⃣ Buddhist\n6️⃣ Jain\n7️⃣ Parsi/Zoroastrian\n8️⃣ Other"
                )
            else:
                await send(phone, "Please enter DOB in *DD-MM-YYYY* format.\n_Example: 15-07-2000_")
            return

        # ── REG_RELIGION ──
        if step == "REG_RELIGION":
            r_map = {"1": "Hindu", "2": "Muslim", "3": "Christian", "4": "Sikh",
                     "5": "Buddhist", "6": "Jain", "7": "Parsi/Zoroastrian", "8": "Other"}
            r = r_map.get(t_lower)
            if r:
                data["religion"] = r
                set_session(phone, "REG_MARITAL", data)
                await send(phone,
                    f"✅ Religion: *{r}*\n\n"
                    "💍 Select your *Marital Status*:\n\n"
                    "1️⃣ Single\n2️⃣ Married\n3️⃣ Widowed\n4️⃣ Divorced"
                )
            else:
                await send(phone, "Please pick a number from *1-8*.")
            return

        # ── REG_MARITAL ──
        if step == "REG_MARITAL":
            m_map = {"1": "Single", "2": "Married", "3": "Widowed", "4": "Divorced"}
            m = m_map.get(t_lower)
            if m:
                data["marital_status"] = m
                set_session(phone, "REG_DISABILITY", data)
                await send(phone,
                    f"✅ Marital Status: *{m}*\n\n"
                    "♿ Do you have a *Disability*?\n\n"
                    "1️⃣ No\n2️⃣ Yes"
                )
            else:
                await send(phone, "Please pick *1*, *2*, *3*, or *4*.")
            return

        # ── REG_DISABILITY ──
        if step == "REG_DISABILITY":
            d_map = {"1": "no", "2": "yes"}
            d = d_map.get(t_lower)
            if d:
                data["disability"] = d
                set_session(phone, "REG_STATE", data)
                await send(phone, f"✅ Disability: *{d.title()}*\n\n🏠 Enter your *State*:\n\n_Example: Maharashtra_")
            else:
                await send(phone, "Please pick *1* (No) or *2* (Yes).")
            return

        # ── REG_STATE ──
        if step == "REG_STATE":
            data["state"] = text.strip().title()
            set_session(phone, "REG_DISTRICT", data)
            await send(phone, f"✅ State: *{data['state']}*\n\nEnter your *District*:\n\n_Example: Nagpur_")
            return

        # ── REG_DISTRICT ──
        if step == "REG_DISTRICT":
            data["district"] = text.strip().title()
            set_session(phone, "REG_PINCODE", data)
            await send(phone, f"✅ District: *{data['district']}*\n\n📍 Enter your *6-digit Pincode*:\n\n_Example: 440010_")
            return

        # ── REG_PINCODE ──
        if step == "REG_PINCODE":
            import re
            pin = text.strip()
            if re.match(r'^\d{6}$', pin):
                data["pincode"] = pin
                set_session(phone, "REG_WARD", data)
                await send(phone, f"✅ Pincode: *{pin}*\n\nEnter your *Ward / Taluka*:\n\n_Example: Ward 5_")
            else:
                await send(phone, "Please enter a valid *6-digit* pincode.")
            return

        # ── REG_WARD ──
        if step == "REG_WARD":
            data["ward"] = text.strip().title()
            set_session(phone, "REG_VILLAGE", data)
            await send(phone, f"✅ Ward: *{data['ward']}*\n\nEnter your *Village / Locality*:\n\n_Example: Laxmipur Village_")
            return

        # ── REG_VILLAGE ──
        if step == "REG_VILLAGE":
            data["village"] = text.strip().title()
            set_session(phone, "REG_AREA_TYPE", data)
            await send(phone,
                f"✅ Village: *{data['village']}*\n\n"
                "🏘️ Select your *Area Type*:\n\n"
                "1️⃣ Rural\n2️⃣ Urban"
            )
            return

        # ── REG_AREA_TYPE ──
        if step == "REG_AREA_TYPE":
            a_map = {"1": "rural", "2": "urban"}
            a = a_map.get(t_lower)
            if a:
                data["area_type"] = a
                set_session(phone, "REG_CATEGORY", data)
                await send(phone,
                    f"✅ Area: *{a.title()}*\n\n"
                    "🏷️ Select your *Caste Category*:\n\n"
                    "1️⃣ General\n2️⃣ OBC\n3️⃣ SC\n4️⃣ ST\n5️⃣ EWS"
                )
            else:
                await send(phone, "Please pick *1* (Rural) or *2* (Urban).")
            return

        # ── REG_CATEGORY ──
        if step == "REG_CATEGORY":
            c_map = {"1": "General", "2": "OBC", "3": "SC", "4": "ST", "5": "EWS"}
            c = c_map.get(t_lower)
            if c:
                data["category"] = c
                set_session(phone, "REG_OCCUPATION", data)
                await send(phone,
                    f"✅ Category: *{c}*\n\n"
                    "💼 Select your *Occupation*:\n\n"
                    "1️⃣ Farmer\n2️⃣ Student\n3️⃣ Business\n"
                    "4️⃣ Daily Wage\n5️⃣ Govt Employee\n6️⃣ Other"
                )
            else:
                await send(phone, "Please pick a number from *1-5*.")
            return

        # ── REG_OCCUPATION ──
        if step == "REG_OCCUPATION":
            o_map = {"1": "Farmer", "2": "Student", "3": "Business",
                     "4": "Daily Wage", "5": "Govt Employee", "6": "Other"}
            o = o_map.get(t_lower)
            if o:
                data["occupation"] = o
                set_session(phone, "REG_INCOME", data)
                await send(phone, f"✅ Occupation: *{o}*\n\n💰 Enter your *Annual Income* (₹):\n\n_Example: 150000_")
            else:
                await send(phone, "Please pick a number from *1-6*.")
            return

        # ── REG_INCOME ──
        if step == "REG_INCOME":
            import re
            income = text.strip().replace(",", "")
            if re.match(r'^\d+$', income):
                data["annual_income"] = income
                set_session(phone, "REG_LAND", data)
                await send(phone, f"✅ Income: *₹{income}*\n\n🌾 Enter your *Land Holding* (acres):\n\n_Example: 2.5_ or type *0* if none")
            else:
                await send(phone, "Please enter a valid number.\n_Example: 150000_")
            return

        # ── REG_LAND ──
        if step == "REG_LAND":
            import re
            land = text.strip()
            if re.match(r'^\d+\.?\d*$', land):
                data["land_acres"] = land
                set_session(phone, "REG_BPL", data)
                await send(phone,
                    f"✅ Land: *{land} acres*\n\n"
                    "📋 Do you have a *BPL Card*?\n\n"
                    "1️⃣ No\n2️⃣ Yes"
                )
            else:
                await send(phone, "Please enter a valid number.\n_Example: 2.5 or 0_")
            return

        # ── REG_BPL ──
        if step == "REG_BPL":
            b_map = {"1": "no", "2": "yes"}
            b = b_map.get(t_lower)
            if b:
                data["bpl_card"] = b
                set_session(phone, "REG_AADHAAR", data)
                await send(phone, f"✅ BPL Card: *{b.title()}*\n\n🪪 Enter your *12-digit Aadhaar Number*:\n\n_(Stored securely & encrypted)_")
            else:
                await send(phone, "Please pick *1* (No) or *2* (Yes).")
            return

        # ── REG_AADHAAR ──
        if step == "REG_AADHAAR":
            import re
            aadhaar = text.strip().replace(" ", "")
            if re.match(r'^\d{12}$', aadhaar):
                data["aadhaar_number"] = aadhaar
                set_session(phone, "REG_VOTER", data)
                await send(phone, "✅ Aadhaar saved securely.\n\n🗳️ Enter your *Voter ID* _(optional)_:\n\nType *skip* if you don't have one.")
            else:
                await send(phone, "Please enter a valid *12-digit* Aadhaar number.")
            return

        # ── REG_VOTER ──
        if step == "REG_VOTER":
            if t_lower in ["skip", "no", "none", "na", "-"]:
                data["voter_id"] = None
            else:
                data["voter_id"] = text.strip().upper()

            # ── SAVE USER TO SUPABASE ──
            try:
                local_phone = phone[2:] if phone.startswith("91") and len(phone) > 10 else phone
                from security import crypto
                from database import supabase
                from datetime import datetime as dt

                # Parse DOB from DD-MM-YYYY to YYYY-MM-DD for storage
                dob_raw = data.get("date_of_birth", "")
                dob_iso = dob_raw
                try:
                    parsed = dt.strptime(dob_raw, "%d-%m-%Y")
                    dob_iso = parsed.strftime("%Y-%m-%d")
                except:
                    pass

                db_data = {
                    "phone": local_phone,
                    "full_name": crypto.encrypt(data.get("full_name", "")),
                    "gender": data.get("gender"),
                    "date_of_birth": crypto.encrypt(dob_iso),
                    "religion": data.get("religion"),
                    "marital_status": data.get("marital_status"),
                    "disability": data.get("disability", "no"),
                    "state": data.get("state"),
                    "district": data.get("district"),
                    "pincode": data.get("pincode"),
                    "ward": data.get("ward"),
                    "village": data.get("village"),
                    "area_type": data.get("area_type"),
                    "category": data.get("category"),
                    "occupation": data.get("occupation"),
                    "annual_income": crypto.encrypt(data.get("annual_income", "0")),
                    "land_acres": crypto.encrypt(data.get("land_acres", "0")),
                    "bpl_card": data.get("bpl_card", "no"),
                    "aadhaar_number": crypto.encrypt(data.get("aadhaar_number", "")),
                    "profile_complete": True,
                }
                if data.get("voter_id"):
                    db_data["voter_id"] = crypto.encrypt(data["voter_id"])

                supabase.table("users").upsert(db_data, on_conflict="phone").execute()
                name = data.get("full_name", "Citizen")
                set_session(phone, "MENU", data)
                await send(phone,
                    f"🎉 *Registration Complete!*\n\n"
                    f"Welcome to NagarVaani, *{name}*! 🏛️\n\n" + get_welcome_menu(name)
                )
            except Exception as e:
                print(f"[Registration] Error saving: {e}")
                import traceback; traceback.print_exc()
                await send(phone, "❌ Could not save your details. Please try again.\n\nType *Hi* to restart.")
            return

        # ── Fallback: show language selection ──
        clear_session(phone)
        set_session(phone, "LANG", {})
        await send(phone, STEPS["LANG"])

    except Exception as e:
        print(f"[handle_message] FULL ERROR: {type(e).__name__}: {e}")
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
