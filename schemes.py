"""
schemes.py — Dynamic government scheme eligibility engine
Fetches schemes from Supabase and matches against citizen profile.
"""

from database import get_all_schemes, save_matched_scheme

def match_schemes(profile: dict) -> list:
    """Match citizen profile against schemes from Supabase."""
    all_schemes = get_all_schemes()
    matched = []
    
    # Extract profile data with defaults
    age        = int(profile.get("age", 0))
    gender     = str(profile.get("gender", "")).lower()
    income     = int(profile.get("income", 9999999))
    occupation = str(profile.get("occupation", "")).lower()
    category   = str(profile.get("category", "")).upper()
    state      = str(profile.get("state", "")).title()
    bpl        = str(profile.get("bpl_card", "no")).lower() == "yes"
    disability = str(profile.get("disability", "no")).lower() == "yes"
    minority   = profile.get("category") in ["SC", "ST", "OBC"] # Simple heuristic if not specified
    
    for scheme in all_schemes:
        rules = scheme.get("rules")
        if isinstance(rules, str):
            import json
            try: rules = json.loads(rules)
            except: rules = {}
        
        if not rules:
            matched.append(scheme)
            continue
            
        ok = True
        
        # Age
        if "min_age" in rules and age < rules["min_age"]: ok = False
        if "max_age" in rules and age > rules["max_age"]: ok = False
        
        # Gender
        if "gender" in rules:
            g_rules = [g.lower() for g in rules["gender"]]
            if gender not in g_rules: ok = False
            
        # Income
        if "max_income" in rules and income > rules["max_income"]: ok = False
        
        # Occupation
        if "occupation" in rules:
            o_rules = [o.lower() for o in rules["occupation"]]
            if occupation not in o_rules: ok = False
            
        # Category
        if "category" in rules:
            c_rules = [c.upper() for c in rules["category"]]
            if category not in c_rules: ok = False
            
        # State
        if "state" in rules:
            s_rules = [s.title() for s in rules["state"]]
            if state not in s_rules: ok = False
            
        # BPL
        if rules.get("bpl_only") and not bpl: ok = False
        
        # Disability
        if rules.get("disability_only") and not disability: ok = False
        
        # Minority
        if rules.get("minority_only") and not minority: ok = False
        
        if ok:
            # Map database fields to what the bot expects as 'title' and 'benefit'
            display_scheme = {
                "id": scheme["id"],
                "title": scheme["name"],
                "benefit": scheme["description"],
                "apply": rules.get("apply_url", "https://india.gov.in")
            }
            matched.append(display_scheme)
            
            # Record the match in user_schemes (if we have a phone)
            phone = profile.get("phone")
            if phone:
                save_matched_scheme(phone, scheme["id"])

    return matched

def get_key_voter_score(profile: dict) -> dict:
    """Calculate Key Voter score for segmentation."""
    age        = int(profile.get("age", 0))
    gender     = str(profile.get("gender", "")).upper()
    occupation = str(profile.get("occupation", "")).upper()
    income     = int(profile.get("income", 999999))
    bpl        = str(profile.get("bpl_card", "no")).lower() == "yes"

    segments   = []
    score      = 0
    breakdown  = []

    if 18 <= age <= 35:
        segments.append("YOUTH")
    if gender == "F" or gender == "FEMALE":
        segments.append("WOMEN")
    if occupation == "FARMER":
        segments.append("FARMER")
    if occupation == "BUSINESS":
        segments.append("BUSINESSMAN")
    if age >= 60:
        segments.append("SENIOR_CITIZEN")
    if occupation == "DAILY_WAGE":
        segments.append("DAILY_WAGE_WORKER")

    if len(segments) >= 3:
        score += 6; breakdown.append(("3+ segments", 6))
    elif len(segments) == 2:
        score += 4; breakdown.append(("2 segments", 4))
    elif len(segments) == 1:
        score += 1; breakdown.append(("1 segment", 1))

    if bpl and income < 50000:
        score += 5; breakdown.append(("BPL + low income", 5))
    elif bpl:
        score += 3; breakdown.append(("BPL card", 3))

    if 18 <= age <= 25:
        score += 3; breakdown.append(("First-time voter age", 3))
    elif 26 <= age <= 35:
        score += 2; breakdown.append(("Youth voter", 2))

    if gender == "F" or gender == "FEMALE":
        score += 2; breakdown.append(("Female voter", 2))
    if occupation == "FARMER":
        score += 2; breakdown.append(("Farmer", 2))
    if occupation == "DAILY_WAGE":
        score += 3; breakdown.append(("Daily wage worker", 3))
    if occupation == "BUSINESS":
        score += 2; breakdown.append(("Businessperson", 2))

    return {
        "segments":    segments,
        "score":       score,
        "label":       "KEY VOTER 🔑" if score >= 7 else "Regular Voter",
        "breakdown":   breakdown
    }
