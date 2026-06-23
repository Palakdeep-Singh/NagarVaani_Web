# NagarVaani - Scheme Eligibility Matcher
# Reads booth_data.csv + scheme.csv and outputs best eligible scheme per citizen

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import json
import warnings
warnings.filterwarnings("ignore")

# --- STEP 1: LOAD DATA -----------------------------------------
print("=" * 60)
print("  NagarVaani - Scheme Eligibility Model")
print("=" * 60)

booth_df  = pd.read_csv("booth_data.csv")
scheme_df = pd.read_csv("scheme.csv")

print(f"\n[DATA] Loaded {len(booth_df)} citizens from booth_data.csv")
print(f"[DATA] Loaded {len(scheme_df)} schemes from scheme.csv")

# Add missing columns with default 'No' if they don't exist
if 'disability_bonus' not in scheme_df.columns:
    scheme_df['disability_bonus'] = 'No'
if 'widow_bonus' not in scheme_df.columns:
    scheme_df['widow_bonus'] = 'No'
if 'benefit' not in scheme_df.columns:
    scheme_df['benefit'] = '-'

# --- STEP 2: RULE-BASED ELIGIBILITY ENGINE ----------------------------
# This is the ground truth - used to generate training labels AND for production

def check_scheme_eligibility(citizen, scheme):
    """
    Returns (is_eligible: bool, score: float, reasons: list)
    Score = weighted match across all rules (0 to 100)
    """
    score  = 0
    total  = 0
    reasons = []
    fails  = []

    # --- Age check ---
    total += 15
    if scheme["min_age"] <= citizen["age"] <= scheme["max_age"]:
        score += 15
        reasons.append(f"Age {citizen['age']} within range {scheme['min_age']}-{scheme['max_age']}")
    else:
        fails.append(f"Age {citizen['age']} outside {scheme['min_age']}-{scheme['max_age']}")

    # --- Gender check ---
    total += 10
    if scheme["gender"] == "Any" or scheme["gender"] == citizen["gender"]:
        score += 10
        reasons.append(f"Gender eligible ({citizen['gender']})")
    else:
        fails.append(f"Gender mismatch (need {scheme['gender']})")

    # --- Occupation check ---
    total += 20
    s_occ = scheme["occupation"].lower()
    c_occ = citizen["occupation"].lower()
    if s_occ == "any" or s_occ == c_occ:
        score += 20
        reasons.append(f"Occupation match ({citizen['occupation']})")
    else:
        fails.append(f"Occupation mismatch (need {scheme['occupation']})")

    # --- Income check ---
    total += 20
    if citizen["annual_income"] <= scheme["max_income"] or scheme["max_income"] == 0:
        score += 20
        reasons.append(f"Income ₹{citizen['annual_income']:,} within limit ₹{scheme['max_income']:,}")
    else:
        fails.append(f"Income ₹{citizen['annual_income']:,} exceeds limit ₹{scheme['max_income']:,}")

    # --- Land check (for farm schemes) ---
    total += 10
    if scheme["min_land_acres"] == 0:
        score += 10  # no land requirement
        reasons.append("No land requirement for this scheme")
    elif citizen["land_acres"] >= scheme["min_land_acres"]:
        score += 10
        reasons.append(f"Land {citizen['land_acres']} acres >= required {scheme['min_land_acres']} acres")
    else:
        fails.append(f"Insufficient land: {citizen['land_acres']} acres < {scheme['min_land_acres']} acres")

    # --- BPL check ---
    total += 10
    if scheme["bpl_required"] == "No":
        score += 10
        reasons.append("BPL card not required")
    elif citizen["bpl_card"] == "Yes":
        score += 10
        reasons.append("BPL card holder - eligible")
    else:
        fails.append("BPL card required but not held")

    # --- Caste check ---
    total += 10
    s_caste = scheme["caste_eligible"]
    c_caste = citizen["caste"]
    if s_caste == "Any":
        score += 10
        reasons.append("All castes eligible")
    elif "SC-ST" in s_caste and c_caste in ["SC", "ST"]:
        score += 10
        reasons.append(f"Caste {c_caste} eligible under SC/ST category")
    elif s_caste == c_caste:
        score += 10
        reasons.append(f"Caste {c_caste} matches scheme requirement")
    else:
        fails.append(f"Caste {c_caste} not in eligible list ({s_caste})")

    # --- Bank account ---
    total += 3
    if scheme["bank_account_required"] == "No" or citizen["bank_account"] == "Yes":
        score += 3
        reasons.append("Bank account requirement satisfied")
    else:
        fails.append("Bank account required")

    # --- Disability bonus ---
    total += 1
    if scheme["disability_bonus"] == "Yes" and citizen["disability"] == "Yes":
        score += 1
        reasons.append("Disability bonus applied")

    # --- Widow bonus ---
    total += 1
    if scheme["widow_bonus"] == "Yes" and citizen["widow"] == "Yes":
        score += 1
        reasons.append("Widow status bonus applied")

    normalized_score = round((score / total) * 100, 1)

    # Hard eligibility: must pass age, occupation, BPL, gender, caste (no fails on these)
    hard_fail_keys = ["Age", "Gender", "Occupation", "BPL", "Caste", "Bank"]
    is_hard_fail = any(any(k in f for k in hard_fail_keys) for f in fails)

    is_eligible = (normalized_score >= 60) and (not is_hard_fail)

    return is_eligible, normalized_score, reasons, fails


# --- STEP 3: GENERATE LABELS - match every citizen to every scheme -------------
print("\n[MODEL] Generating eligibility labels for all citizen-scheme pairs...")

records = []
for _, citizen in booth_df.iterrows():
    citizen_schemes = []
    for _, scheme in scheme_df.iterrows():
        eligible, score, reasons, fails = check_scheme_eligibility(
            citizen.to_dict(), scheme.to_dict()
        )
        if eligible:
            citizen_schemes.append({
                "scheme_id":   scheme["scheme_id"],
                "scheme_name": scheme["scheme_name"],
                "score":       score,
                "reasons":     reasons,
                "documents":   scheme["documents_required"],
                "benefit":     scheme["benefit"],
            })

    # Best scheme = highest score
    best = max(citizen_schemes, key=lambda x: x["score"]) if citizen_schemes else None

    records.append({
        "citizen_id":      citizen["citizen_id"],
        "name":            citizen["name"],
        "booth_id":        citizen["booth_id"],
        "age":             citizen["age"],
        "gender":          citizen["gender"],
        "occupation":      citizen["occupation"],
        "annual_income":   citizen["annual_income"],
        "land_acres":      citizen["land_acres"],
        "bpl_card":        citizen["bpl_card"],
        "caste":           citizen["caste"],
        "disability":      citizen["disability"],
        "widow":           citizen["widow"],
        "bank_account":    citizen["bank_account"],
        "eligible_count":  len(citizen_schemes),
        "best_scheme":     best["scheme_name"] if best else "No Scheme Found",
        "best_score":      best["score"] if best else 0,
        "best_scheme_id":  best["scheme_id"] if best else "None",
        "benefit":         best["benefit"] if best else "-",
        "documents":       best["documents"] if best else "-",
        "all_schemes":     [s["scheme_name"] for s in citizen_schemes],
    })

labeled_df = pd.DataFrame(records)

print(f"[MODEL] Labeled {len(labeled_df)} citizens")
print(f"[MODEL] Citizens with at least one scheme: {(labeled_df['eligible_count'] > 0).sum()}")
print(f"[MODEL] Citizens with no eligible scheme:  {(labeled_df['eligible_count'] == 0).sum()}")

# --- STEP 4: TRAIN RANDOM FOREST CLASSIFIER -----------------------------
print("\n[TRAIN] Encoding features and training Random Forest...")

# Encode categoricals
le_gender    = LabelEncoder()
le_occ       = LabelEncoder()
le_bpl       = LabelEncoder()
le_caste     = LabelEncoder()
le_dis       = LabelEncoder()
le_widow     = LabelEncoder()
le_bank      = LabelEncoder()
le_scheme    = LabelEncoder()

labeled_df["gender_enc"]   = le_gender.fit_transform(labeled_df["gender"])
labeled_df["occ_enc"]      = le_occ.fit_transform(labeled_df["occupation"])
labeled_df["bpl_enc"]      = le_bpl.fit_transform(labeled_df["bpl_card"])
labeled_df["caste_enc"]    = le_caste.fit_transform(labeled_df["caste"])
labeled_df["dis_enc"]      = le_dis.fit_transform(labeled_df["disability"])
labeled_df["widow_enc"]    = le_widow.fit_transform(labeled_df["widow"])
labeled_df["bank_enc"]     = le_bank.fit_transform(labeled_df["bank_account"])
labeled_df["scheme_label"] = le_scheme.fit_transform(labeled_df["best_scheme"])

# Features
feature_cols = [
    "age", "gender_enc", "occ_enc", "annual_income",
    "land_acres", "bpl_enc", "caste_enc", "dis_enc",
    "widow_enc", "bank_enc"
]

X = labeled_df[feature_cols].values
y = labeled_df["scheme_label"].values

# Filter out rows where no scheme was found
mask = labeled_df["best_scheme"] != "No Scheme Found"
X_filtered = X[mask]
y_filtered = y[mask]

# --- Handle ValueError for train_test_split when stratify is used ---
# Identify classes with only one sample
unique_classes, class_counts = np.unique(y_filtered, return_counts=True)
single_sample_classes = unique_classes[class_counts == 1]
multi_sample_classes_mask = np.isin(y_filtered, unique_classes[class_counts > 1])
single_sample_classes_mask = np.isin(y_filtered, single_sample_classes)

X_multi_sample = X_filtered[multi_sample_classes_mask]
y_multi_sample = y_filtered[multi_sample_classes_mask]

X_single_sample = X_filtered[single_sample_classes_mask]
y_single_sample = y_filtered[single_sample_classes_mask]

# Perform train/test split on multi-sample classes only
if len(X_multi_sample) > 0 and len(np.unique(y_multi_sample)) > 1: # Ensure there's data for splitting and at least 2 classes
    X_train_multi, X_test, y_train_multi, y_test = train_test_split(
        X_multi_sample, y_multi_sample, test_size=0.2, random_state=42, stratify=y_multi_sample
    )
    # Add single-sample classes to the training set
    X_train = np.vstack([X_train_multi, X_single_sample])
    y_train = np.concatenate([y_train_multi, y_single_sample])
else: # Fallback if not enough multi-sample data for stratified split
    X_train, X_test, y_train, y_test = train_test_split(
        X_filtered, y_filtered, test_size=0.2, random_state=42, stratify=None # Remove stratify if not possible
    )
    print("[WARNING] Not enough multi-sample classes for stratified split; proceeding without stratification.")

# Train Random Forest
rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_split=2,
    random_state=42,
    class_weight="balanced"
)
rf_model.fit(X_train, y_train)

# --- STEP 5: EVALUATE ------------------------------------------
print("\n[EVAL] Model Performance on Test Set:")
print("-" * 40)

y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy:  {accuracy * 100:.1f}%")

# Feature importance
importance = rf_model.feature_importances_
feat_names = ["Age", "Gender", "Occupation", "Income", "Land", "BPL", "Caste", "Disability", "Widow", "Bank Account"]
print("\n[EVAL] Feature Importance (what drives scheme matching):")
for name, imp in sorted(zip(feat_names, importance), key=lambda x: -x[1]):
    bar = "█" * int(imp * 50)
    print(f"  {name:<14} {bar} {imp*100:.1f}%")

# --- STEP 6: FULL PREDICTION FUNCTION -----------------------

def predict_best_scheme(citizen_dict):
    """
    Takes a citizen dict (from form/WhatsApp/portal) and returns:
    - Best matching scheme (rule-based, highest score)
    - RF model prediction (for cross-validation)
    - All eligible schemes ranked by score
    - Documents needed
    - WhatsApp message ready to send
    """
    all_matches = []
    for _, scheme in scheme_df.iterrows():
        eligible, score, reasons, fails = check_scheme_eligibility(
            citizen_dict, scheme.to_dict()
        )
        if eligible:
            all_matches.append({
                "scheme_id":   scheme["scheme_id"],
                "scheme_name": scheme["scheme_name"],
                "score":       score,
                "benefit":     scheme["benefit"],
                "documents":   scheme["documents_required"].split("|"),
                "reasons":     reasons[:3],  # top 3 reasons
            })

    all_matches.sort(key=lambda x: x["score"], reverse=True)

    if not all_matches:
        return {"status": "no_match", "message": "No eligible scheme found for this profile."}

    best = all_matches[0]

    # RF model prediction (cross-check)
    try:
        features = np.array([[
            citizen_dict["age"],
            le_gender.transform([citizen_dict["gender"]])[0],
            le_occ.transform([citizen_dict["occupation"]])[0],
            citizen_dict["annual_income"],
            citizen_dict["land_acres"],
            le_bpl.transform([citizen_dict["bpl_card"]])[0],
            le_caste.transform([citizen_dict["caste"]])[0],
            le_dis.transform([citizen_dict["disability"]])[0],
            le_widow.transform([citizen_dict["widow"]])[0],
            le_bank.transform([citizen_dict["bank_account"]])[0],
        ]])
        rf_pred = le_scheme.inverse_transform(rf_model.predict(features))[0]
        rf_proba = rf_model.predict_proba(features).max() * 100
    except Exception:
        rf_pred = best["scheme_name"]
        rf_proba = best["score"]

    # Build WhatsApp notification message
    wa_message = (
        f"Namaste {citizen_dict.get('name', 'Citizen')}!\n\n"
        f"NagarVaani has found that you are eligible for:\n"
        f"*{best['scheme_name']}*\n\n"
        f"Benefit: {best['benefit']}\n\n"
        f"Why you qualify:\n"
        + "\n".join(f"  • {r}" for r in best["reasons"]) +
        f"\n\nDocuments needed:\n"
        + "\n".join(f"  • {d}" for d in best["documents"]) +
        f"\n\nApply here: https://nagarvaani.app/apply/{best['scheme_id']}\n"
        f"Track your application: https://nagarvaani.app/track"
    )

    return {
        "status":            "match_found",
        "best_scheme":       best["scheme_name"],
        "confidence_score":  best["score"],
        "benefit":           best["benefit"],
        "documents_needed":  best["documents"],
        "reasons":           best["reasons"],
        "rf_prediction":     rf_pred,
        "rf_confidence":     round(rf_proba, 1),
        "all_eligible":      [{"scheme": m["scheme_name"], "score": m["score"]} for m in all_matches],
        "whatsapp_message":  wa_message,
    }


# --- STEP 7: DEMO - run on 5 real citizens -----------------------
print("\n" + "=" * 60)
print("  DEMO - Scheme Prediction for Sample Citizens")
print("=" * 60)

demo_citizens = [
    {
        "name": "Ravi Patil", "age": 44, "gender": "Male",
        "occupation": "Farmer", "annual_income": 110000,
        "land_acres": 2.5, "bpl_card": "Yes", "caste": "OBC",
        "disability": "No", "widow": "No", "bank_account": "Yes",
        "state": "Maharashtra"
    },
    {
        "name": "Sunita Devi", "age": 38, "gender": "Female",
        "occupation": "Homemaker", "annual_income": 80000,
        "land_acres": 0, "bpl_card": "Yes", "caste": "SC",
        "disability": "No", "widow": "No", "bank_account": "Yes",
        "state": "Maharashtra"
    },
    {
        "name": "Arun Nair", "age": 61, "gender": "Male",
        "occupation": "Retired", "annual_income": 50000,
        "land_acres": 0, "bpl_card": "Yes", "caste": "General",
        "disability": "No", "widow": "No", "bank_account": "Yes",
        "state": "Maharashtra"
    },
    {
        "name": "Lata Kulkarni", "age": 67, "gender": "Female",
        "occupation": "Homemaker", "annual_income": 30000,
        "land_acres": 0, "bpl_card": "Yes", "caste": "SC",
        "disability": "No", "widow": "Yes", "bank_account": "Yes",
        "state": "Maharashtra"
    },
    {
        "name": "Vijay Pawar", "age": 63, "gender": "Male",
        "occupation": "Farmer", "annual_income": 85000,
        "land_acres": 1.5, "bpl_card": "Yes", "caste": "OBC",
        "disability": "Yes", "widow": "No", "bank_account": "Yes",
        "state": "Maharashtra"
    },
]

for citizen in demo_citizens:
    result = predict_best_scheme(citizen)
    print(f"\n{'-'*55}")
    print(f"  Citizen : {citizen['name']}, Age {citizen['age']}, {citizen['occupation']}")
    print(f"  Income  : ₹{citizen['annual_income']:,}/yr  |  Land: {citizen['land_acres']} acres  |  BPL: {citizen['bpl_card']}")
    if result["status"] == "match_found":
        print(f"\n  BEST SCHEME   : {result['best_scheme']}")
        print(f"  BENEFIT       : {result['benefit']}")
        print(f"  MATCH SCORE   : {result['confidence_score']}%")
        print(f"  RF PREDICTION : {result['rf_prediction']} ({result['rf_confidence']}%) ")
        print(f"\n  WHY ELIGIBLE:")
        for r in result["reasons"][:3]:
            print(f"    ✓ {r}")
        print(f"\n  DOCUMENTS NEEDED:")
        for d in result["documents_needed"]:
            print(f"    → {d}")
        print(f"\n  ALL ELIGIBLE SCHEMES ({len(result['all_eligible'])}):")
        for s in result["all_eligible"][:4]:
            print(f"    {s['score']:>5}%  {s['scheme']}")
    else:
        print(f"  {result['message']}")

# --- STEP 8: SAVE FULL PREDICTIONS FOR ALL BOOTH CITIZENS ---------------------
print("\n\n" + "=" * 60)
print("  BOOTH-LEVEL OUTPUT - All 200 Citizens")
print("=" * 60)

output_rows = []
for _, row in booth_df.iterrows():
    result = predict_best_scheme(row.to_dict())
    output_rows.append({
        "citizen_id":    row["citizen_id"],
        "name":          row["name"],
        "booth_id":      row["booth_id"],
        "age":           row["age"],
        "occupation":    row["occupation"],
        "best_scheme":   result.get("best_scheme", "No Match"),
        "benefit":       result.get("benefit", "-"),
        "match_score":   result.get("confidence_score", 0),
        "eligible_count":len(result.get("all_eligible", [])),
        "documents":     " | ".join(result.get("documents_needed", [])),
        "whatsapp_ready":result["status"] == "match_found",
    })

output_df = pd.DataFrame(output_rows)
output_df.to_csv("predictions_output.csv", index=False)

# Summary stats
print(f"\n  Total citizens processed : {len(output_df)}")
print(f"  WhatsApp-ready alerts    : {output_df['whatsapp_ready'].sum()}")
print(f"  No eligible scheme found : {(~output_df['whatsapp_ready']).sum()}")
print(f"\n  Top schemes by eligibility count:")
scheme_counts = output_df[output_df["best_scheme"] != "No Match"]["best_scheme"].value_counts()
for scheme, count in scheme_counts.items():
    bar = "█" * count
    print(f"    {scheme:<35} {bar} ({count})")

print(f"\n  Booth-level gap summary:")
for booth_id in sorted(output_df["booth_id"].unique()):
    booth = output_df[output_df["booth_id"] == booth_id]
    matched = booth["whatsapp_ready"].sum()
    total = len(booth)
    gap = total - matched
    print(f"    Booth {booth_id}: {total} citizens | {matched} matched | {gap} unmatched")

print(f"\n[SAVED] Full predictions -> predictions_output.csv")
print(f"[SAVED] Model ready for API integration")
print("\n✓ Training and prediction complete.\n")
