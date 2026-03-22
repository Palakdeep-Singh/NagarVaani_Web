/**
 * scheme.matcher.js — Production Matching Engine v3
 * Place: server/src/services/scheme.matcher.js
 * Implements ALL 16 myScheme.gov.in eligibility dimensions
 */

export const OCCUPATION_GROUPS = {
  farmer: ['farmer', 'kisan', 'kisaan', 'agriculture', 'agriculturist', 'krishi',
    'cultivator', 'farming', 'grower', 'crop', 'paddy', 'wheat', 'rice', 'horticulture',
    'orchardist', 'floriculture', 'marginal farmer', 'small farmer', 'sharecropper',
    'tenant farmer', 'agricultural labour', 'farm worker', 'bagaichi', 'bagban',
    'raiyat', 'ryot', 'peasant', 'cultivating', 'land owner'],
  animal_husbandry: ['animal husbandry', 'livestock', 'dairy', 'dairy farmer',
    'goat rearing', 'goat', 'sheep', 'poultry', 'cattle', 'fisherman', 'fisher',
    'fishing', 'aquaculture', 'pisciculture', 'fish farmer', 'fish vendor',
    'beekeeper', 'bee keeper', 'sericulture', 'silk', 'piggery', 'duck rearing',
    'apiculture', 'goatkeeper', 'shepherd', 'pashu palan'],
  labour: ['labour', 'labor', 'labourer', 'laborer', 'daily wage', 'daily wager',
    'mazdoor', 'coolie', 'construction worker', 'building worker', 'unskilled',
    'migrant worker', 'bonded labour', 'brick kiln', 'quarry worker', 'road worker',
    'nrega', 'mgnrega', 'loader', 'unloader', 'dock worker', 'mine worker',
    'plantation worker', 'tea garden', 'casual worker', 'contract worker',
    'wage worker', 'manual worker', 'physical labour'],
  artisan: ['artisan', 'craftsman', 'craftsperson', 'craft', 'carpenter', 'woodwork',
    'blacksmith', 'welder', 'plumber', 'electrician', 'mason', 'painter', 'tailor',
    'weaver', 'potter', 'kumhar', 'lohar', 'luhar', 'sunar', 'goldsmith', 'silversmith',
    'cobbler', 'mochi', 'leather', 'shoemaker', 'barber', 'nai', 'napit', 'washerman',
    'dhobi', 'basket maker', 'bamboo', 'toy maker', 'sculptor', 'stone carver',
    'embroidery', 'zari', 'zardozi', 'handloom', 'powerloom', 'karigar', 'shilpkar',
    'bidi worker', 'bidi', 'agarbatti maker', 'incense', 'candle maker', 'soap maker',
    'pottery', 'terracotta', 'metal craft', 'wood carving', 'brass work', 'copper',
    'tinsmith', 'darzi', 'hajjam', 'khatik', 'nat', 'craftwork', 'handicraft',
    'vishwakarma'],
  business: ['business', 'businessman', 'businesswoman', 'shopkeeper', 'trader',
    'merchant', 'vendor', 'street vendor', 'hawker', 'self employed', 'self-employed',
    'proprietor', 'wholesale', 'retail', 'kirana', 'provision store', 'cloth merchant',
    'grain merchant', 'commission agent', 'broker', 'contractor', 'dealer',
    'distributor', 'petty trader', 'mandi', 'sabzi', 'vegetable seller', 'fruit seller',
    'fish seller', 'meat seller', 'milk seller', 'milkman', 'doodhwala', 'chaiwala',
    'tea stall', 'pan shop', 'small trader', 'market vendor'],
  msme: ['msme', 'small industry', 'small enterprise', 'micro enterprise',
    'home based', 'home industry', 'cottage industry', 'food processing', 'pickle',
    'papad', 'garment', 'readymade', 'printing press', 'manufacturing', 'production',
    'small scale industry', 'ssi', 'workshop', 'factory', 'unit', 'enterprise',
    'manufacturer'],
  student: ['student', 'vidyarthi', 'studying', 'school', 'college', 'university',
    'graduate', 'undergraduate', 'postgraduate', 'phd', 'research scholar',
    'intern', 'apprentice', 'vocational training', 'iti student', 'polytechnic',
    'diploma student', 'class 9', 'class 10', 'class 11', 'class 12', '10th', '12th',
    'primary school', 'secondary school', 'higher secondary', 'engineering student',
    'medical student', 'law student', 'arts student'],
  unemployed: ['unemployed', 'job seeker', 'jobless', 'no job', 'seeking employment',
    'fresher', 'looking for job', 'no occupation', 'none', 'nil', 'not working',
    'without employment', 'dropout', 'between jobs'],
  homemaker: ['housewife', 'homemaker', 'ghar pe', 'grahini', 'household',
    'stay at home', 'housework', 'domestic duties'],
  salaried: ['salaried', 'employee', 'government employee', 'govt employee',
    'teacher', 'professor', 'lecturer', 'doctor', 'engineer', 'nurse', 'bank employee',
    'clerk', 'officer', 'police', 'army', 'defence', 'military', 'central govt',
    'state govt', 'psu', 'public sector', 'private sector', 'corporate',
    'it professional', 'software', 'accountant', 'advocate', 'lawyer', 'ca',
    'chartered accountant', 'manager', 'executive', 'supervisor', 'technician',
    'skilled worker', 'private job', 'govt job'],
  transport: ['driver', 'auto driver', 'taxi driver', 'truck driver', 'bus driver',
    'rickshaw', 'e-rickshaw', 'transport', 'logistics', 'delivery', 'courier',
    'tempo driver', 'tractor driver', 'cab driver', 'ola', 'uber', 'bike taxi',
    'goods transport', 'auto'],
  healthcare_worker: ['asha worker', 'asha', 'anganwadi', 'anganwadi worker',
    'auxiliary nurse', 'anm', 'midwife', 'paramedic', 'health worker', 'social worker',
    'ngo worker', 'community health worker', 'frontline worker', 'chw', 'sahiya',
    'mitanin'],
  domestic: ['domestic worker', 'household worker', 'maid', 'cook', 'helper',
    'nanny', 'caretaker', 'cleaner', 'housekeeping', 'security guard', 'watchman',
    'chowkidar', 'sweeper', 'sanitation worker', 'garbage collector',
    'municipal worker', 'safai karmachari'],
  artist: ['artist', 'singer', 'musician', 'dancer', 'actor', 'performer', 'juggler',
    'entertainer', 'storyteller', 'kathputli', 'nat', 'bahurupiya', 'traditional artist',
    'folk artist', 'street performer', 'magician', 'acrobat', 'circus', 'puppeteer',
    'theatre', 'drama', 'nautanki', 'cultural performer'],
  retired: ['retired', 'pensioner', 'ex-serviceman', 'ex serviceman', 'veteran',
    'ex army', 'ex police', 'senior citizen', 'old age', 'elderly', 'superannuated',
    'former employee'],
  differently_abled: ['disabled', 'differently abled', 'divyang', 'handicapped',
    'physically challenged', 'visually impaired', 'hearing impaired', 'speech impaired',
    'blind', 'deaf', 'dumb', 'loco motor', 'cerebral palsy', 'intellectual disability',
    'mental illness', 'multiple disability', 'acid attack', 'disability', 'pwd',
    'divyangjan'],
  ex_serviceman: ['ex serviceman', 'ex-serviceman', 'veteran', 'veer nari',
    'war widow', 'defence personnel', 'armed forces', 'paramilitary', 'crpf',
    'bsf', 'cisf', 'itbp', 'ssb', 'ex-defence'],
  ews: ['ews', 'economically weaker section', 'general ews', 'upper caste poor',
    'open category poor', 'forward class poor'],
};

export const normaliseOccupation = (input) => {
  if (!input || !String(input).trim()) return ['unemployed'];
  const lower = String(input).toLowerCase().trim();
  const matched = [];
  for (const [group, kws] of Object.entries(OCCUPATION_GROUPS)) {
    if (kws.some(kw => lower.includes(kw))) matched.push(group);
  }
  if (matched.includes('homemaker') && !matched.includes('unemployed')) {
    matched.push('unemployed');
  }
  return matched.length ? matched : ['other'];
};

const MINORITY_RELIGIONS = ['muslim', 'islam', 'christian', 'christianity', 'sikh',
  'sikhism', 'buddhist', 'buddhism', 'jain', 'jainism', 'parsi', 'zoroastrian'];

export const isMinority = (religion = '') =>
  MINORITY_RELIGIONS.some(m => String(religion).toLowerCase().includes(m));

export const getAge = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 ? age : null;
};

const safeNum = (v) => {
  if (v == null || v === '') return null;
  const n = parseFloat(String(v).replace(/[,₹\s]/g, ''));
  return isNaN(n) ? null : n;
};

export const scoreToGrade = (score) => {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  if (score >= 35) return 'low';
  return 'none';
};

export const matchSchemeToUser = (user, scheme) => {
  const rules = scheme.rules || {};
  const reasons = [];
  const gaps = [];
  let score = Number(scheme.match_score_base) || 50;
  let hardFail = false;
  let failReason = null;

  const age = getAge(user.date_of_birth);
  const income = safeNum(user.annual_income);
  const land = safeNum(user.land_acres);
  const occGroups = normaliseOccupation(user.occupation);
  const category = (user.category || '').toUpperCase().trim();
  const gender = (user.gender || '').toLowerCase().trim();
  const state = (user.state || '').trim();
  const hasAadhaar = !!user.aadhaar_number;
  const hasVoter = !!user.voter_id;
  const isBPL = String(user.bpl_card || '').toLowerCase().includes('yes') ||
    (income !== null && income < 100000);
  const isDisabled = occGroups.includes('differently_abled') ||
    String(user.disability || '').toLowerCase().includes('yes');
  const isMinorityUser = isMinority(user.religion || '');
  const isStudent = occGroups.includes('student');
  const isUnemployed = occGroups.includes('unemployed') || occGroups.includes('homemaker');
  const isRural = (user.area_type || 'rural').toLowerCase() !== 'urban';
  const marital = (user.marital_status || '').toLowerCase().trim();
  const isExSvc = occGroups.includes('ex_serviceman');

  const fail = (r) => { hardFail = true; failReason = r; };
  const ret = (m, s) => {
    const g = m ? scoreToGrade(Math.min(100, Math.max(0, Math.round(s)))) : 'none';
    return {
      matched: m, score: m ? Math.min(100, Math.max(0, Math.round(s))) : 0,
      grade: g, reasons, mismatches: gaps, hard_fail_reason: failReason
    };
  };

  // 1. Gender
  if (rules.gender?.length) {
    const a = rules.gender.map(g => g.toLowerCase());
    if (a.some(x => ['all', 'any'].includes(x))) { score += 2; }
    else if (!gender) { score -= 8; gaps.push('Add gender to your profile'); }
    else if (a.includes(gender)) { score += 10; reasons.push(`Gender (${gender}) qualifies`); }
    else { fail(`Scheme for ${rules.gender.join('/')} only`); }
  }
  if (hardFail) return ret(false, 0);

  // 2. Age
  if (rules.min_age || rules.max_age) {
    if (age === null) { score -= 8; gaps.push('Add date of birth to profile'); }
    else if (rules.min_age && age < rules.min_age) { fail(`Min age ${rules.min_age} (you: ${age})`); }
    else if (rules.max_age && age > rules.max_age) { fail(`Max age ${rules.max_age} (you: ${age})`); }
    else { score += 7; reasons.push(`Age ${age} within ${rules.min_age || 0}–${rules.max_age || 'any'} yrs`); }
  }
  if (hardFail) return ret(false, 0);

  // 3. Category/Caste
  if (rules.category?.length) {
    const a = rules.category.map(c => c.toUpperCase());
    if (a.includes('ALL')) { score += 2; }
    else if (!category) { score -= 12; gaps.push('Add caste category (SC/ST/OBC/General/EWS)'); }
    else if (a.includes(category)) { score += 15; reasons.push(`Category ${category} qualifies`); }
    else { fail(`Reserved for ${rules.category.join('/')} — you: ${category}`); }
  }
  if (hardFail) return ret(false, 0);

  // 4. Income ceiling
  if (rules.max_income) {
    if (income === null) { score -= 10; gaps.push('Add annual income to profile'); }
    else if (income > rules.max_income) { fail(`Income ₹${income.toLocaleString('en-IN')} exceeds ₹${Number(rules.max_income).toLocaleString('en-IN')} ceiling`); }
    else { score += Math.min(18, Math.round((1 - income / rules.max_income) * 20)); reasons.push(`Income ₹${income.toLocaleString('en-IN')} within limit`); }
  }
  if (rules.min_income && income !== null && income < rules.min_income) { fail(`Min income ₹${Number(rules.min_income).toLocaleString('en-IN')} required`); }
  if (hardFail) return ret(false, 0);

  // 5. BPL
  if (rules.bpl_only === true) {
    if (isBPL) { score += 12; reasons.push('BPL status qualifies'); }
    else if (income !== null && income >= 100000) { fail('BPL households only (income < ₹1,00,000 or BPL card)'); }
    else { score -= 5; gaps.push('Confirm BPL card status in profile'); }
  }
  if (hardFail) return ret(false, 0);

  // 6. Occupation
  if (rules.occupation?.length) {
    const ro = rules.occupation.map(o => o.toLowerCase());
    const open = ro.some(o => ['all', 'any', 'everyone'].includes(o));
    if (open) { score += 3; reasons.push('Open to all occupations'); }
    else {
      const hit = ro.some(o => occGroups.includes(o));
      if (hit) { score += 18; reasons.push(`Occupation matches: ${ro.filter(o => occGroups.includes(o)).join(', ')}`); }
      else { fail(`For ${rules.occupation.join('/')} — your occupation "${user.occupation || 'not set'}" doesn't qualify`); }
    }
  }
  if (hardFail) return ret(false, 0);

  // 7. Employment status
  if (rules.employment_status?.length) {
    const a = rules.employment_status.map(e => e.toLowerCase());
    const us = isStudent ? 'student' : isUnemployed ? 'unemployed' : 'employed';
    if (a.includes('all') || a.includes(us)) { score += 5; reasons.push(`Employment (${us}) qualifies`); }
    else { fail(`For ${rules.employment_status.join('/')} — you are ${us}`); }
  }
  if (hardFail) return ret(false, 0);

  // 8. Land
  if (rules.max_land != null) {
    if (land === null) { gaps.push('Add land holding (acres) to profile'); }
    else if (land > rules.max_land) { fail(`Land ${land} acres > limit ${rules.max_land} acres`); }
    else { score += 6; reasons.push(`Land ${land} acres within limit`); }
  }
  if (rules.min_land && land !== null && land < rules.min_land) { fail(`Min ${rules.min_land} acres required`); }
  if (hardFail) return ret(false, 0);

  // 9. State
  if (rules.state?.length && !rules.state.includes('ALL')) {
    if (!state) { score -= 5; gaps.push('Add state to profile'); }
    else if (rules.state.some(s => s.toLowerCase() === state.toLowerCase())) { score += 10; reasons.push(`State (${state}) covered`); }
    else { fail(`State scheme only for: ${rules.state.join(', ')}`); }
  }
  if (hardFail) return ret(false, 0);

  // 10. Rural/Urban
  if (rules.area_type) {
    const a = rules.area_type.toLowerCase();
    if (a === 'rural' && !isRural) { fail('Rural residents only'); }
    else if (a === 'urban' && isRural) { fail('Urban residents only'); }
    else if (a !== 'both' && a !== 'all') { score += 5; reasons.push(`${isRural ? 'Rural' : 'Urban'} area qualifies`); }
  }
  if (hardFail) return ret(false, 0);

  // 11. Disability
  if (rules.disability_only === true) {
    if (isDisabled) { score += 18; reasons.push('Divyang status qualifies'); }
    else { fail('For Persons with Disabilities (Divyangjan) only'); }
  }
  if (hardFail) return ret(false, 0);

  // 12. Minority
  if (rules.minority_only === true) {
    if (isMinorityUser) { score += 15; reasons.push('Minority community qualifies'); }
    else { fail('For minority communities only'); }
  }
  if (hardFail) return ret(false, 0);

  // 13. Student only
  if (rules.student_only === true) {
    if (isStudent) { score += 12; reasons.push('Student status qualifies'); }
    else { fail('For enrolled students only'); }
  }
  if (hardFail) return ret(false, 0);

  // 14. Marital status
  if (rules.marital_status?.length) {
    const a = rules.marital_status.map(m => m.toLowerCase());
    if (!marital) { score -= 3; gaps.push('Add marital status to profile'); }
    else if (a.includes(marital)) { score += 5; reasons.push(`Marital status (${marital}) qualifies`); }
    else { fail(`For ${rules.marital_status.join('/')} — you: ${marital}`); }
  }
  if (hardFail) return ret(false, 0);

  // 15. Ex-serviceman
  if (rules.ex_serviceman_only === true) {
    if (isExSvc) { score += 15; reasons.push('Ex-serviceman qualifies'); }
    else { fail('For ex-servicemen / defence personnel only'); }
  }
  if (hardFail) return ret(false, 0);

  // 16. Documents
  if (rules.requires_docs?.length) {
    const have = { aadhaar: hasAadhaar, voter_id: hasVoter };
    const miss = rules.requires_docs.filter(d => !have[d]);
    if (!miss.length) { score += 6; reasons.push('All required documents available'); }
    else { score -= miss.length * 4; gaps.push(`Upload to Document Locker: ${miss.join(', ')}`); }
  }

  // Weight boost
  if (rules.weight_boost) score += Number(rules.weight_boost);

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));
  const matched = finalScore >= 35;
  if (matched && reasons.length === 0) reasons.push('General eligibility criteria met');

  return {
    matched, score: finalScore, grade: scoreToGrade(finalScore),
    reasons, mismatches: gaps, hard_fail_reason: null
  };
};

export const matchAllSchemes = (user, schemes, includeAll = false) => {
  const results = schemes.map(s => ({ scheme: s, ...matchSchemeToUser(user, s) }));
  if (includeAll) return results.sort((a, b) => b.score - a.score);
  return results.filter(r => r.matched).sort((a, b) => b.score - a.score);
};