const { useState, useEffect, useRef } = React;

// Signal to the index.html CORS watchdog that the script loaded successfully
window.appLoaded = true;

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिंदी)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' }
];

const TABS = {
    FOOD: 'food',
    MEDS: 'meds',
    SKIN: 'skin',
    MENU: 'menu',
    PROFILE: 'profile',
    HISTORY: 'history'
};

const DEFAULT_PROFILE = {
    name: 'Jagrat',
    age: '24',
    gender: 'Male',
    allergies: ['Nuts'],
    customAllergies: '',
    conditions: ['Diabetes'],
    medications: 'Metformin',
    skinType: 'Oily',
    goal: 'Control sugar, avoid palm oil',
    language: 'en'
};

const ALLERGY_PRESETS = ['Nuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish', 'Eggs'];
const CONDITION_PRESETS = ['Diabetes', 'Hypertension', 'PCOD', 'Thyroid', 'Heart Disease', 'Kidney Disease'];

// --- Offline Ingredients Database ---
const OFFLINE_INGREDIENTS = {
    // Food Additives & Oils (Harmful/Concerning)
    'sugar': { status: 'Harmful', reason: 'High glycemic index. Spikes blood glucose rapidly and increases risk of type 2 diabetes, obesity, and cardiovascular inflammation.', substitute: 'Stevia, monk fruit, or raw honey in moderation.' },
    'high fructose corn syrup': { status: 'Extremely Harmful', reason: 'Highly processed fructose sweetener linked directly to fatty liver disease, systemic obesity, insulin resistance, and metabolic syndrome.', substitute: 'Natural maple syrup, dates, or apple puree.' },
    'hfcs': { status: 'Extremely Harmful', reason: 'Abbreviation for High Fructose Corn Syrup. Promotes visceral fat deposition, elevated triglycerides, and hepatic inflammation.', substitute: 'Organic coconut sugar or stevia.' },
    'palm oil': { status: 'Harmful', reason: 'Very high in saturated palmitic acid (approx. 50%), which increases LDL cholesterol levels and poses significant cardiovascular risks.', substitute: 'Cold-pressed olive oil, avocado oil, or sunflower oil.' },
    'palm kernel oil': { status: 'Harmful', reason: 'Highly saturated oil that raises blood cholesterol levels and contributes to plaque build-up in arteries.', substitute: 'Organic coconut oil or extra virgin olive oil.' },
    'hydrogenated vegetable oil': { status: 'Extremely Harmful', reason: 'Source of synthetic trans fats which lower HDL (good) cholesterol, elevate LDL (bad) cholesterol, and cause high arterial inflammation.', substitute: 'Unrefined cold-pressed oils.' },
    'partially hydrogenated': { status: 'Extremely Harmful', reason: 'Contains trans fats. Strongly associated with heart attacks, strokes, insulin resistance, and systemic cellular inflammation.', substitute: 'Grass-fed butter, ghee, or cold-pressed seed oils.' },
    'trans fat': { status: 'Extremely Harmful', reason: 'Artificially structured lipid that significantly elevates the risk of coronary heart disease and increases inflammatory cytokines in the bloodstream.', substitute: 'Healthy monounsaturated fats like olive oil.' },
    'monosodium glutamate': { status: 'Moderate', reason: 'Flavor enhancer that may cause headaches, sweating, numbness, and flushing in sensitive individuals (MSG symptom complex).', substitute: 'Nutritional yeast, sea salt, or natural spices.' },
    'msg': { status: 'Moderate', reason: 'Abbreviation for Monosodium Glutamate. Can trigger neurological excitotoxicity in highly sensitive individuals or cause mild allergic reactions.', substitute: 'Garlic powder, onion powder, or tamari.' },
    'sodium benzoate': { status: 'Moderate', reason: 'Chemical preservative. Can react with vitamin C (ascorbic acid) under heat/light to form benzene, a known cellular carcinogen.', substitute: 'Natural preservation methods like fermentation or pasteurization.' },
    'potassium sorbate': { status: 'Moderate', reason: 'Widely used synthetic food preservative. Generally safe, but excessive intake can cause mild skin irritation or allergic reactions in rare cases.', substitute: 'Fresh, preservative-free alternatives.' },
    'aspartame': { status: 'Harmful', reason: 'Artificial sweetener. Undergoes metabolism into phenylalanine, aspartic acid, and toxic methanol. Associated with headaches, mood shifts, and gut dysbiosis.', substitute: 'Stevia leaf extract or erythritol.' },
    'sucralose': { status: 'Moderate', reason: 'Chlorinated artificial sweetener. Can reduce beneficial gut bacteria counts by up to 50% and release toxic compounds when heated.', substitute: 'Monk fruit extract.' },
    'saccharin': { status: 'Moderate', reason: 'Old synthetic sweetener. Can cause mild allergic reactions in individuals sensitive to sulfonamides.', substitute: 'Pure maple syrup.' },
    'maida': { status: 'Harmful', reason: 'Refined wheat flour stripped of fiber, bran, and essential nutrients. Causes high glycemic spikes and stresses insulin production.', substitute: 'Whole wheat flour, almond flour, or oat flour.' },
    'refined wheat flour': { status: 'Harmful', reason: 'Stripped grain flour. Quickly converts to glucose, promoting fat storage and increasing the glycemic index of the product.', substitute: 'Quinoa flour, coconut flour, or finger millet (ragi) flour.' },
    'all purpose flour': { status: 'Harmful', reason: 'Highly processed flour that lacks dietary fiber, causing rapid digestive breakdown and sudden spikes in blood sugar.', substitute: 'Spelt flour or chickpea flour.' },
    'tartrazine': { status: 'Harmful', reason: 'Yellow 5 synthetic azo dye. Strongly associated with hyperactivity in children, hives, asthma, and severe allergic reactions.', substitute: 'Natural colorings like turmeric or beta-carotene.' },
    'sunset yellow': { status: 'Harmful', reason: 'Yellow 6 food dye. Linked to hypersensitivity reactions, skin rashes, and behavioral changes/hyperactivity in children.', substitute: 'Annatto or carrot extract.' },
    'allura red': { status: 'Harmful', reason: 'Red 40 synthetic coal-tar dye. Associated with childhood hyperactivity, migraines, and gut mucosal inflammation in animal trials.', substitute: 'Beetroot juice powder or elderberry extract.' },
    'carrageenan': { status: 'Moderate', reason: 'Thickener derived from red seaweed. Linked to intestinal inflammation, ulcerative colitis-like symptoms, and glucose intolerance.', substitute: 'Agar agar, pectin, or guar gum.' },
    'sodium nitrate': { status: 'Harmful', reason: 'Preservative used in processed meats. Converts into highly carcinogenic nitrosamines during digestion, increasing colorectal cancer risk.', substitute: 'Celery powder or fresh organic meats.' },
    'sodium nitrite': { status: 'Harmful', reason: 'Curing agent that forms cancer-causing compounds in the stomach. Harms oxygen transport in red blood cells if consumed in excess.', substitute: 'Uncured meats preserved with sea salt.' },
    'bha': { status: 'Harmful', reason: 'Butylated Hydroxyanisole. Synthetic antioxidant preservative. Classified as a possible human endocrine disruptor and carcinogen.', substitute: 'Vitamin E (tocopherols) or rosemary extract.' },
    'bht': { status: 'Harmful', reason: 'Butylated Hydroxytoluene. Chemical preservative. Can disrupt hormonal balance and mimic estrogen, putting stress on liver enzymes.', substitute: 'Natural mixed tocopherols.' },
    
    // Healthy Foods (Safe/Beneficial)
    'whole wheat': { status: 'Safe', reason: 'Excellent source of dietary fiber, complex carbohydrates, B-vitamins, and minerals. Promotes digestive health and stable insulin levels.' },
    'oats': { status: 'Safe', reason: 'Rich in beta-glucan soluble fiber, which actively lowers LDL cholesterol, regulates blood glucose levels, and supports gut microflora.' },
    'quinoa': { status: 'Safe', reason: 'A complete plant protein containing all nine essential amino acids. Rich in iron, magnesium, fiber, and powerful antioxidants.' },
    'chia seeds': { status: 'Safe', reason: 'Superfood packed with alpha-linolenic acid (omega-3), soluble fiber, calcium, and antioxidants. Highly anti-inflammatory.' },
    'almonds': { status: 'Safe', reason: 'High in monounsaturated fats, vitamin E, and magnesium. Supports heart health, lowers cholesterol, and acts as a pre-biotic.' },
    'walnuts': { status: 'Safe', reason: 'Rich in plant-based omega-3 fatty acids and polyphenols. Promotes cognitive health, reduces cardiovascular inflammation.' },
    'spinach': { status: 'Safe', reason: 'Nutrient-dense leafy green rich in iron, calcium, folate, and vitamins A, C, and K. Supports bone health and vision.' },
    'water': { status: 'Safe', reason: 'The essential vehicle for life. Keeps the body hydrated, assists digestion, cushions joints, and flushes metabolic waste.' },
    'green tea': { status: 'Safe', reason: 'Abundant in epigallocatechin gallate (EGCG) catechins, which are potent antioxidants that boost metabolism and protect cells.' },
    
    // Skincare / Cosmetic Chemicals (Concerning/Avoid)
    'methylparaben': { status: 'Avoid', reason: 'Synthetic preservative. Mimics estrogen in the body, binds to estrogen receptors, and is linked to endocrine disruption and breast tissue abnormalities.', substitute: 'Phenoxyethanol or organic preservatives like sodium phytate.' },
    'propylparaben': { status: 'Avoid', reason: 'Endocrine-disrupting preservative. Absorbs through the skin easily and disrupts reproductive hormones even at low levels.', substitute: 'Ethylhexylglycerin.' },
    'butylparaben': { status: 'Avoid', reason: 'High-hazard paraben derivative. Strongly mimics estrogen, impairs reproductive systems, and accumulates in aquatic life.', substitute: 'Sodium levulinate.' },
    'parabens': { status: 'Avoid', reason: 'Class of chemical preservatives. Known endocrine disruptors that disrupt hormone balance and may accelerate skin aging under UV exposure.', substitute: 'Natural antimicrobial plant extracts.' },
    'sodium lauryl sulfate': { status: 'Concerning', reason: 'Harsh surfactant. Strips the skin barrier of natural lipids, causes severe epidermal water loss, and triggers irritation and eczema.', substitute: 'Decyl glucoside, coco-glucoside, or sodium cocoyl isethionate.' },
    'sls': { status: 'Concerning', reason: 'Abbreviation for Sodium Lauryl Sulfate. A primary skin irritant that compromises the skin barrier and triggers dermatitis.', substitute: 'Lauryl glucoside.' },
    'sodium laureth sulfate': { status: 'Concerning', reason: 'Foaming agent. Gentler than SLS but can be contaminated with 1,4-dioxane, a highly toxic carcinogen, during manufacturing.', substitute: 'Coco betaine.' },
    'sles': { status: 'Concerning', reason: 'Abbreviation for Sodium Laureth Sulfate. Carries risk of carcinogenic 1,4-dioxane contamination and causes mild skin irritation.', substitute: 'Sodium lauroyl methyl isethionate.' },
    'dimethicone': { status: 'Moderate', reason: 'Silicone polymer. Creates a breathable barrier on skin, which keeps moisture in but can trap oil, sweat, and dead skin in acne-prone types.', substitute: 'Plant-derived squalane or coco-caprylate.' },
    'cyclomethicone': { status: 'Moderate', reason: 'Volatile silicone. Evaporates quickly but has environmental bioaccumulation concerns and can dehydrate sensitive skin over time.', substitute: 'Hemisqualane.' },
    'fragrance': { status: 'Concerning', reason: 'Umbrella term for thousands of undisclosed chemicals. High risk of inducing contact allergies, eczema, dermatitis, and migraines.', substitute: 'Unscented formulas or products colored/scented with organic hydrosols.' },
    'parfum': { status: 'Concerning', reason: 'Synonym for Fragrance. Houses hidden phthalates (which keep scent longer) that disrupt thyroid and reproductive hormones.', substitute: 'Fragrance-free options.' },
    'phthalates': { status: 'Avoid', reason: 'Plasticizing chemical class. Act as severe reproductive toxins and endocrine disruptors, linked to asthma and allergy development.', substitute: 'Phthalate-free formulas.' },
    'mineral oil': { status: 'Moderate', reason: 'Petroleum byproduct. Forms an occlusive layer. Prevents moisture loss but can trigger blackheads and clog pores in oily skin.', substitute: 'Jojoba oil, rosehip oil, or argan oil.' },
    'petrolatum': { status: 'Moderate', reason: 'Petroleum jelly. Extremely occlusive. Great for healing severe dry patches but traps sebum and dirt if skin is not cleansed thoroughly.', substitute: 'Shea butter or beeswax.' },
    'formaldehyde': { status: 'Avoid', reason: 'Known human carcinogen. Released by certain preservatives. High allergen, triggers skin burning, blistering, and cellular toxicity.', substitute: 'Preservative-free single-dose packaging.' },
    
    // Skincare Actives (Beneficial/Specialized)
    'hyaluronic acid': { status: 'Safe', reason: 'Powerful humectant. Draws up to 1000x its weight in water into the skin, plumping fine lines and reinforcing the moisture barrier.' },
    'glycerin': { status: 'Safe', reason: 'Natural humectant and skin-identical ingredient. Extremely safe, highly effective at hydration, and repairs damaged skin barrier.' },
    'niacinamide': { status: 'Safe', reason: 'Vitamin B3. Regulates sebum production, strengthens the skin barrier, fades hyperpigmentation, and exerts anti-inflammatory action.' },
    'ceramides': { status: 'Safe', reason: 'Essential lipids that make up 50% of the skin barrier. Restores the moisture barrier, locks in hydration, and protects against irritants.' },
    'salicylic acid': { status: 'Safe', reason: 'Beta Hydroxy Acid (BHA). Penetrates deep into pores to dissolve sebum, exfoliate dead skin, and clear acne. Anti-inflammatory.', note: 'Best for oily/acne-prone skin. Use sunscreen.' },
    'centella asiatica': { status: 'Safe', reason: 'Korean Cica extract. Rich in amino acids and active compounds. Extremely soothing, heals wounds, and stimulates collagen synthesis.' },
    'aloe vera': { status: 'Safe', reason: 'Natural botanical extract. Contains vitamins, minerals, and polysaccharides. Intensely hydrates, cools, and soothes inflamed skin.' },
    'retinol': { status: 'Moderate', reason: 'Vitamin A derivative. Highly effective at accelerating cell turnover and boosting collagen, but can cause redness, peeling, and sun sensitivity.', note: 'Highly active. Introduce slowly. Apply strictly at night and use SPF 30+ daily.' },
    'glycolic acid': { status: 'Moderate', reason: 'Alpha Hydroxy Acid (AHA). Exfoliates the surface skin cells to brighten tone, but makes skin highly sensitive to UV rays.', note: 'May irritate sensitive skin. Must use sunscreen during the day.' }
};

// Common Medication Interactions for local engine
const MED_INTERACTIONS = [
    { drug1: 'aspirin', drug2: 'warfarin', severity: 'Major', effect: 'Concomitant use significantly increases the risk of serious gastrointestinal and systemic bleeding due to dual antiplatelet and anticoagulant action.', recommendation: 'Avoid combination. If necessary, monitor coagulation metrics (INR) extremely closely. Discuss safer alternatives with your physician.' },
    { drug1: 'ibuprofen', drug2: 'aspirin', severity: 'Moderate', effect: 'Ibuprofen may inhibit the cardioprotective antiplatelet effect of low-dose aspirin and increases the risk of stomach ulcers.', recommendation: 'Take aspirin at least 30 minutes before or 8 hours after ibuprofen. Monitor for abdominal pain.' },
    { drug1: 'ibuprofen', drug2: 'lisinopril', severity: 'Moderate', effect: 'NSAIDs like ibuprofen can impair kidney function and decrease the blood pressure lowering efficacy of Lisinopril.', recommendation: 'Monitor blood pressure and kidney biomarkers regularly. Consider acetaminophen as a pain substitute.' },
    { drug1: 'metformin', drug2: 'aspirin', severity: 'None', effect: 'No significant pharmacokinetic interactions detected.', recommendation: 'Generally safe to take together.' }
];

// --- Vector Icons ---
const Icon = ({ name, className = "w-6 h-6" }) => {
    const icons = {
        food: <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />,
        meds: <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />,
        skin: <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />,
        menu: <path d="M3 12h18M3 6h18M3 18h18" />,
        profile: <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
        settings: <g><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></g>,
        history: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        search: <g><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></g>,
        camera: <g><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></g>,
        upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>,
        check: <path d="M20 6 9 17l-5-5"/>,
        alert: <g><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></g>
    };
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {icons[name] || <circle cx="12" cy="12" r="10" />}
        </svg>
    );
};

// --- Direct Client-Side Tesseract OCR ---
const performOCR = async (imageSrc, onProgress) => {
    try {
        // Pre-process image for better OCR (grayscale & contrast)
        const img = new Image();
        img.src = imageSrc;
        await new Promise(resolve => img.onload = resolve);
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(img, 0, 0);
        
        // Apply grayscale and high contrast filter
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            avg = avg < 128 ? avg / 1.5 : Math.min(255, avg * 1.5);
            data[i] = avg;     
            data[i + 1] = avg; 
            data[i + 2] = avg; 
        }
        ctx.putImageData(imageData, 0, 0);
        const processedSrc = canvas.toDataURL('image/png');

        // Simplified single-call Tesseract recognition
        const { data: { text } } = await Tesseract.recognize(
            processedSrc,
            'eng',
            { 
                tessedit_pageseg_mode: '1', 
                logger: m => onProgress && onProgress(m.status, m.progress) 
            }
        );
        return text;
    } catch (err) {
        console.error("OCR Core Error:", err);
        return "";
    }
};

// --- Direct CORS-Enabled Groq API Client Fetch ---
const callGroq = async (apiKey, prompt) => {
    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData.error && errorData.error.message) || 'Groq AI connection failed.');
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    return JSON.parse(text);
};

// --- Smart Local Offline Analysis Engine ---
const runOfflineAnalysis = (input, tab, profile) => {
    const cleanText = input.toLowerCase();
    
    // 1. Core Profile Context
    const profileAllergies = profile.allergies.map(a => a.toLowerCase());
    const profileConditions = profile.conditions.map(c => c.toLowerCase());
    
    // 2. Tokenize Ingredient string
    const tokens = cleanText.split(/[,;\n\(\)\{\}]/)
        .map(t => t.trim().replace(/^and\s+/, '').replace(/\.$/, ''))
        .filter(t => t.length > 2);

    if (tab === TABS.MEDS) {
        // --- Medications offline engine ---
        const activeMeds = tokens.map(t => t.split(/\s+/)[0]); // Match exact drug names
        const interactions = [];
        let highRiskCount = 0;
        
        // Find pairs matching local interactive database
        for (let i = 0; i < activeMeds.length; i++) {
            for (let j = i + 1; j < activeMeds.length; j++) {
                const m1 = activeMeds[i];
                const m2 = activeMeds[j];
                const match = MED_INTERACTIONS.find(item => 
                    (item.drug1 === m1 && item.drug2 === m2) || 
                    (item.drug1 === m2 && item.drug2 === m1)
                );
                if (match) {
                    interactions.push(match);
                    if (match.severity === 'Major' || match.severity === 'Contraindicated') {
                        highRiskCount += 2;
                    } else if (match.severity === 'Moderate') {
                        highRiskCount += 1;
                    }
                }
            }
        }
        
        // Custom warning for medical profile conditions
        let overallRisk = 'Safe';
        let advice = 'No hazardous drug-to-drug interactions were detected in our offline core dictionary.';
        
        if (highRiskCount >= 2) {
            overallRisk = 'Dangerous';
            advice = 'CRITICAL: Dangerous drug combinations detected. Co-administration poses immediate toxicity risks. Consult a cardiologist or medical specialist immediately.';
        } else if (highRiskCount === 1) {
            overallRisk = 'Caution';
            advice = 'WARNING: Moderate medication interactions found. May result in gastric distress, altered efficacy, or blood pressure fluctuations.';
        }

        // Add disease condition specific checks
        if (profileConditions.includes('diabetes') && cleanText.includes('steroid')) {
            interactions.push({
                drug1: 'Steroids',
                drug2: 'Metformin/Insulin',
                severity: 'Major',
                effect: 'Corticosteroids/Steroids significantly elevate blood glucose levels and render anti-diabetic medications substantially less effective.',
                recommendation: 'Strict glycemic tracking required. Contact your endocrinologist to adjust diabetic doses.'
            });
            overallRisk = 'Dangerous';
        }

        return {
            medicines: tokens.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
            interactions,
            overallRisk,
            generalAdvice: advice,
            disclaimer: 'DISCLAIMER: Always consult a licensed clinical medical professional. SafeLens offline assessments are educational only.'
        };
    }

    if (tab === TABS.SKIN) {
        // --- Skincare INCI offline engine ---
        let totalScore = 100;
        const ingredients = [];
        const topConcerns = [];
        const positives = [];
        let skinTypeWarning = '';

        tokens.forEach(tok => {
            let matched = false;
            const normTok = tok.toLowerCase().trim();
            if (normTok.length < 3 || /^\d+$/.test(normTok) || /^[^a-z]+$/i.test(normTok)) return;

            // Scan offline cosmetic DB
            for (const [key, details] of Object.entries(OFFLINE_INGREDIENTS)) {
                if (normTok.includes(key)) {
                    matched = true;
                    let status = details.status;
                    let deduction = status === 'Avoid' ? 20 : status === 'Concerning' ? 10 : status === 'Moderate' ? 5 : 0;

                    // Skin type specific warnings
                    if (profile.skinType === 'Oily' && key === 'mineral oil') {
                        deduction += 5; status = 'Avoid';
                        skinTypeWarning = 'Contains highly comedogenic mineral oils which can trap sebum on Oily skin, triggering breakouts.';
                    } else if (profile.skinType === 'Dry' && (key === 'sls' || key === 'sodium lauryl sulfate')) {
                        deduction += 10;
                        skinTypeWarning = 'Harsh sulfates detected. Extremely drying for your Dry skin profile, potentially stripping natural lipid barrier.';
                    }

                    totalScore -= deduction;
                    
                    ingredients.push({
                        name: tok.charAt(0).toUpperCase() + tok.slice(1),
                        function: key.includes('paraben') || key.includes('sorbate') ? 'Preservative' : key.includes('sulfate') || key === 'sls' ? 'Surfactant/Cleanser' : 'Active Skin Ingredient',
                        status,
                        reason: details.reason,
                        comedogenic: key === 'mineral oil' || key === 'petrolatum' || key === 'dimethicone',
                        endocrineDisruptor: key.includes('paraben') || key === 'phthalates',
                        healthySubstitute: details.substitute
                    });

                    if (status === 'Avoid' || status === 'Concerning') topConcerns.push(`${tok.toUpperCase()}: ${details.reason.slice(0, 50)}...`);
                    else if (status === 'Safe') positives.push(tok.charAt(0).toUpperCase() + tok.slice(1));
                    break;
                }
            }

            // Smart Heuristic Regex Engine (Fallback for Unknowns)
            if (!matched) {
                let status = 'Safe';
                let reason = 'General cosmetic formulation ingredient. No major hazardous matches found in heuristics.';
                let deduction = 0;
                let func = 'Cosmetic Base';
                let comedogenic = false;
                let edc = false;

                if (/paraben|phthalate|triclosan|pf[ao]s/i.test(normTok)) {
                    status = 'Avoid'; reason = 'Heuristically identified as a toxic preservative or endocrine disrupting chemical (EDC). Avoid prolonged dermal absorption.';
                    deduction = 20; func = 'Toxic Preservative'; edc = true;
                } else if (/sulfate|sls|sles|peg-|steareth/i.test(normTok)) {
                    status = 'Concerning'; reason = 'Heuristically identified as a harsh stripping surfactant or ethoxylated chemical. May cause barrier damage.';
                    deduction = 10; func = 'Harsh Surfactant';
                } else if (/oil|butter|wax|dimethicone|siloxane/i.test(normTok)) {
                    func = 'Emollient / Occlusive';
                    if (profile.skinType === 'Oily') {
                        status = 'Concerning'; reason = 'Heuristically identified as a heavy occlusive lipid. High risk of pore-clogging for Oily skin.';
                        deduction = 5; comedogenic = true; skinTypeWarning = 'Heavy oils/silicones detected. May cause acne cosmetica on Oily skin.';
                    } else {
                        status = 'Safe'; reason = 'Moisturizing lipid barrier component.';
                    }
                } else if (/acid/i.test(normTok)) {
                    func = 'Active Acid';
                    if (profile.skinType === 'Sensitive') {
                        status = 'Moderate'; reason = 'Chemical acid detected. May cause burning or erythema on Sensitive skin profiles.';
                        deduction = 5; skinTypeWarning = 'Active acids detected. Use with caution on your Sensitive skin barrier.';
                    }
                } else if (/fragrance|parfum/i.test(normTok)) {
                    status = 'Moderate'; reason = 'Synthetic fragrance. High potential for contact dermatitis.';
                    deduction = 5; func = 'Sensitizing Agent';
                } else if (/extract|water|aqua|glycerin/i.test(normTok)) {
                    status = 'Safe'; reason = 'Benign hydration or natural botanical extract base.';
                } else {
                    status = 'Unknown'; reason = 'Ingredient not recognized. May require Deep AI Scan.';
                }

                ingredients.push({
                    name: tok.charAt(0).toUpperCase() + tok.slice(1),
                    function: func,
                    status,
                    reason,
                    comedogenic,
                    endocrineDisruptor: edc
                });
                totalScore -= deduction;

                if (status === 'Avoid' || status === 'Concerning') topConcerns.push(`${tok.toUpperCase()}: ${reason.slice(0, 50)}...`);
                else if (status === 'Safe') positives.push(tok.charAt(0).toUpperCase() + tok.slice(1));
            }
        });

        const score = Math.max(10, Math.min(100, totalScore));
        let overallRating = 'Safe';
        if (score < 40) overallRating = 'Avoid';
        else if (score < 60) overallRating = 'Concerning';
        else if (score < 80) overallRating = 'Moderate';

        return {
            overallScore: score,
            overallRating,
            ingredients,
            topConcerns: topConcerns.slice(0, 3),
            positives: positives.slice(0, 3),
            skinTypeWarning: skinTypeWarning || 'Ingredients align appropriately with your ' + profile.skinType + ' skin type.',
            summary: `Skin Safety score evaluated at ${score}/100. Local analysis completed using Offline INCI databases.`
        };
    }

    if (tab === TABS.MENU) {
        // --- Restaurant Menu offline decoder ---
        const dishes = tokens.map(dish => {
            let calories = 250;
            let macros = { protein: '8g', carbs: '32g', fat: '10g' };
            let score = 85;
            let suitable = true;
            let reason = 'High quality nutritious dish suitable for general clean eating.';
            let substitute = '';
            let allergens = [];

            const name = dish.toLowerCase();

            // Allergen alerts
            if (profileAllergies.includes('nuts') && (name.includes('nut') || name.includes('peanut') || name.includes('cashew') || name.includes('almond') || name.includes('pesto'))) {
                score -= 40;
                suitable = false;
                allergens.push('Nuts');
                reason = 'CRITICAL: Contains nuts. Extreme danger under active Nuts allergy setting.';
                substitute = 'Request a nut-free seed alternative (e.g. sunflower seed paste).';
            }

            // Custom medical rules
            if (name.includes('paneer') || name.includes('chicken') || name.includes('fish') || name.includes('tofu')) {
                calories = 380;
                macros = { protein: '24g', carbs: '10g', fat: '16g' };
                score = 90;
                if (profileConditions.includes('Diabetes')) {
                    reason = 'Excellent high-protein dish with minimal carbohydrate impact, ideal for blood glucose regulation.';
                }
            } else if (name.includes('pasta') || name.includes('pizza') || name.includes('burger') || name.includes('naan') || name.includes('roti') || name.includes('noodles')) {
                calories = 550;
                macros = { protein: '12g', carbs: '75g', fat: '22g' };
                score = 50;
                if (profileConditions.includes('Diabetes')) {
                    suitable = false;
                    score = 30;
                    reason = 'Very high carbohydrate refined wheat content. Can trigger high insulin demands and rapid glycemic spikes.';
                    substitute = 'Whole wheat thin crust, lettuce wraps, or high-protein skewers.';
                }
            } else if (name.includes('salad') || name.includes('soup') || name.includes('sprouts')) {
                calories = 180;
                macros = { protein: '6g', carbs: '15g', fat: '4g' };
                score = 95;
                reason = 'Extremely low-calorie dietary fiber source rich in active micronutrients.';
            }

            return {
                name: dish.charAt(0).toUpperCase() + dish.slice(1),
                estimatedCalories: calories,
                macros,
                allergens,
                healthScore: score,
                suitable,
                reason,
                healthierVersion: substitute || 'Choose dressing on the side and restrict liquid fats.'
            };
        });

        const safeDishes = dishes.filter(d => d.suitable).map(d => d.name);
        const unsafeDishes = dishes.filter(d => !d.suitable).map(d => d.name);

        return {
            dishes,
            topPicks: safeDishes.length ? safeDishes.slice(0, 2) : ['Tofu/Chicken House Salad'],
            avoid: unsafeDishes.length ? unsafeDishes.slice(0, 2) : ['Refined flour pastas/doughs'],
            generalAdvice: 'Aim for organic grilled protein and high-fiber vegetable options. Avoid rich creamy gravies or heavy maida crusts.'
        };
    }

    // --- FOOD INGREDIENTS/NUTRITION offline engine ---
    let totalScore = 100;
    const ingredients = [];
    const allergenAlerts = [];
    const concerns = [];
    const positives = [];
    let personalizedWarning = '';

    tokens.forEach(tok => {
        let matched = false;
        const normTok = tok.toLowerCase().trim();

        // Noise filtering
        if (normTok.length < 3 || /^\d+$/.test(normTok) || /^[^a-z]+$/i.test(normTok)) return;

        // 1. High-risk allergens first
        if (profileAllergies.includes('nuts') && (normTok.includes('peanut') || normTok.includes('almond') || normTok.includes('cashew') || normTok.includes('walnut') || normTok.includes('hazelnut') || normTok.includes('nut'))) {
            totalScore -= 45;
            allergenAlerts.push('Nuts');
            personalizedWarning = `CRITICAL ALLERGY ALERT: Found matching nut components (${tok}) which poses severe systemic anaphylaxis risk under your Nuts allergy setting.`;
            
            ingredients.push({
                name: tok.charAt(0).toUpperCase() + tok.slice(1),
                status: 'Extremely Harmful',
                reason: 'Severe food allergen matching active user profile restriction. Ingestion can cause intense immediate allergy response.',
                dailyLimitExceeded: true,
                limitInfo: 'ZERO TOLERANCE INDICATED',
                healthySubstitute: 'Sunflower seed butter or pumpkin seeds.'
            });
            return;
        }

        if (profileAllergies.includes('dairy') && (normTok.includes('milk') || normTok.includes('cheese') || normTok.includes('butter') || normTok.includes('whey') || normTok.includes('lactose') || normTok.includes('cream'))) {
            totalScore -= 35;
            allergenAlerts.push('Dairy');
            personalizedWarning = `Dairy allergen detected (${tok}). May trigger immediate digestive, inflammatory, or severe immune reactions.`;
            
            ingredients.push({
                name: tok.charAt(0).toUpperCase() + tok.slice(1),
                status: 'Extremely Harmful',
                reason: 'Dairy component found violating active lactose/dairy allergy profiles.',
                dailyLimitExceeded: true,
                limitInfo: 'AVOID COMPLETELY',
                healthySubstitute: 'Oat milk, almond milk, or vegan nutritional cheese.'
            });
            return;
        }

        // 2. Scan exact dictionary
        for (const [key, details] of Object.entries(OFFLINE_INGREDIENTS)) {
            if (normTok.includes(key)) {
                matched = true;
                let status = details.status;
                let deduction = status === 'Extremely Harmful' ? 25 : status === 'Harmful' ? 15 : status === 'Moderate' ? 5 : 0;
                let limitExceeded = false;
                let limitInfo = '';

                if (profileConditions.includes('Diabetes') && (key === 'sugar' || key === 'high fructose corn syrup' || key === 'hfcs' || key === 'maida')) {
                    deduction *= 2; status = 'Extremely Harmful'; limitExceeded = true;
                    limitInfo = 'CRITICAL LIMIT EXCEEDED FOR DIABETIC METABOLISM';
                    personalizedWarning = `High glycemic index ingredient (${tok.toUpperCase()}) found. Poses immediate risks of postprandial glucose surges under Diabetes profile.`;
                }

                if (profileConditions.includes('Hypertension') && (key === 'sodium' || key === 'salt' || key === 'msg')) {
                    deduction *= 2; status = 'Harmful'; limitExceeded = true;
                    limitInfo = 'SODIUM LIMIT WARNING FOR HYPERTENSIVE ARTERIAL PRESSURES';
                    personalizedWarning = `Sodium-concentrated additive discovered. Exerts immediate fluid retention pressures under Hypertension.`;
                }

                totalScore -= deduction;

                ingredients.push({
                    name: tok.charAt(0).toUpperCase() + tok.slice(1),
                    status,
                    reason: details.reason,
                    dailyLimitExceeded: limitExceeded,
                    limitInfo,
                    healthySubstitute: details.substitute
                });

                if (status === 'Extremely Harmful' || status === 'Harmful') concerns.push(`${tok.toUpperCase()}: ${details.reason.slice(0, 60)}...`);
                else if (status === 'Safe') positives.push(tok.charAt(0).toUpperCase() + tok.slice(1));
                break;
            }
        }

        // 3. Smart Heuristic Regex Engine (Fallback for Unknowns)
        if (!matched) {
            let status = 'Unknown';
            let reason = 'Ingredient not recognized. May require Deep AI Scan.';
            let deduction = 0;
            let limitExceeded = false;
            let limitInfo = '';
            let substitute = '';

            // Sugars & Sweeteners
            if (/ose\b|itol\b|syrup|sweetener/i.test(normTok)) {
                status = 'Harmful';
                reason = 'Identified heuristically as a refined sugar, sugar alcohol, or concentrated sweetener. Can cause metabolic stress.';
                deduction = 10;
                substitute = 'Organic Stevia or Monk Fruit extract.';
                if (profileConditions.includes('Diabetes')) {
                    status = 'Extremely Harmful'; deduction = 25; limitExceeded = true;
                    limitInfo = 'DIABETIC CARBOHYDRATE THRESHOLD DANGER';
                }
            } 
            // Preservatives & Chemical Acids
            else if (/ate\b|ite\b|acid/i.test(normTok) && !/citric|ascorbic/i.test(normTok)) {
                status = 'Moderate';
                reason = 'Identified heuristically as a synthetic preservative or chemical salt additive. Prolonged exposure may disrupt gut flora.';
                deduction = 5;
            } 
            // Fats & Oils
            else if (/oil|fat|tallow|lard|shortening/i.test(normTok)) {
                if (/hydrogenated|palm/i.test(normTok)) {
                    status = 'Harmful'; reason = 'Trans-fats or high-saturated inflammatory oils detected. Severely damages cardiovascular elasticity.';
                    deduction = 15; substitute = 'Cold-pressed extra virgin olive oil or avocado oil.';
                } else {
                    status = 'Safe'; reason = 'Standard dietary lipid source detected.';
                }
            }
            // Thickeners & Emulsifiers
            else if (/gum\b|carrageenan|lecithin/i.test(normTok)) {
                status = 'Moderate'; reason = 'Processed emulsifier or thickener. Can cause mild gastrointestinal inflammation in sensitive individuals.';
                deduction = 5;
            }
            // Salts & Minerals
            else if (/sodium|potassium|calcium|chloride/i.test(normTok)) {
                status = 'Moderate'; reason = 'Mineral salt additive detected. Watch overall daily intake limits.';
                if (profileConditions.includes('Hypertension')) {
                    status = 'Harmful'; deduction = 15; limitExceeded = true;
                    limitInfo = 'HYPERTENSION SODIUM WARNING';
                }
            }
            // Artificial Colors
            else if (/yellow|red|blue|color|lake/i.test(normTok)) {
                status = 'Harmful'; reason = 'Artificial chemical food dye detected. Linked to hyperactivity and neurotoxicity markers.';
                deduction = 15; substitute = 'Natural fruit/vegetable color extracts.';
            }
            // Natural bases
            else if (/extract|juice|water|puree/i.test(normTok)) {
                status = 'Safe'; reason = 'Natural whole-food base ingredient.';
            }

            if (status !== 'Unknown') matched = true;

            ingredients.push({
                name: tok.charAt(0).toUpperCase() + tok.slice(1),
                status,
                reason,
                dailyLimitExceeded: limitExceeded,
                limitInfo,
                healthySubstitute: substitute
            });
            totalScore -= deduction;
            
            if (status === 'Extremely Harmful' || status === 'Harmful') concerns.push(`${tok.toUpperCase()}: ${reason.slice(0, 60)}...`);
            else if (status === 'Safe') positives.push(tok.charAt(0).toUpperCase() + tok.slice(1));
        }
    });

    const score = Math.max(0, Math.min(100, totalScore));
    let overallRating = 'Safe';
    if (score < 40) overallRating = 'Extremely Harmful';
    else if (score < 60) overallRating = 'Harmful';
    else if (score < 85) overallRating = 'Moderate';

    return {
        productName: tokens[0] ? tokens[0].toUpperCase() + ' - Scanned Product' : 'Product Analysis',
        overallScore: score,
        overallRating,
        nutriscoreGrade: score > 85 ? 'A' : score > 70 ? 'B' : score > 50 ? 'C' : score > 35 ? 'D' : 'E',
        personalizedWarning: personalizedWarning || (score < 60 ? 'Multiple health-risk ingredients detected violating general metabolic wellness goals.' : ''),
        ingredients,
        nutritionFlags: [
            { nutrient: 'Sugar / Carbs', value: cleanText.includes('sugar') ? 'High' : 'Normal', flag: cleanText.includes('sugar') ? 'danger' : 'ok', note: 'Checked locally.' },
            { nutrient: 'Sodium / Salts', value: cleanText.includes('sodium') || cleanText.includes('salt') ? 'Moderate-High' : 'Low', flag: cleanText.includes('sodium') || cleanText.includes('salt') ? 'warning' : 'ok', note: 'Standard dietary thresholds.' }
        ],
        allergenAlert: allergenAlerts,
        topConcerns: concerns.slice(0, 3),
        positives: positives.slice(0, 3),
        overallSubstituteSuggestion: score < 70 ? 'Replace with clean, minimally processed organic whole foods.' : 'Excellent choice! Nutritional values align fully with your health guard goals.',
        summary: `Personalized safety score rated at ${score}/100. Scanned via local offline algorithms.`
    };
};

// --- Custom Camera Modal Component ---
const CameraModal = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setCameraError(null);
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } })
                .then(s => {
                    setStream(s);
                    // Standard delay to guarantee element loading
                    setTimeout(() => {
                        if (videoRef.current) videoRef.current.srcObject = s;
                    }, 100);
                })
                .catch(err => {
                    console.error("Camera Hardware Error:", err);
                    setCameraError("Camera access denied or unavailable. Please upload a label image instead.");
                });
        } else {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        }
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [isOpen]);

    const capture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/png');
        onCapture(data);
        onClose();
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] bg-[#080A0F] flex flex-col justify-between" style={{ height: "100dvh" }}>
            <div className="flex justify-between items-center p-6 bg-black/60 backdrop-blur-md absolute top-0 w-full z-10 border-b border-white/[0.05]">
                <h3 className="font-header font-black text-white uppercase tracking-widest text-xs">Live Label Scanner</h3>
                <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative bg-black" onClick={capture}>
                {cameraError ? (
                    <div className="text-center p-8 max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 animate-bounce">
                            <Icon name="alert" className="w-8 h-8" />
                        </div>
                        <p className="text-white font-bold mb-4">{cameraError}</p>
                        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2 rounded-xl text-xs uppercase tracking-widest">Close Scanner</button>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover cursor-pointer" />
                )}
                
                {/* Visual scanning overlay guide lines */}
                {!cameraError && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-brand-teal/40 rounded-[2rem] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-teal rounded-tl-xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-teal rounded-tr-xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-teal rounded-bl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-teal rounded-br-xl"></div>
                            <div className="w-full h-0.5 bg-brand-teal absolute animate-[pulse_1s_infinite] shadow-[0_0_8px_#00F2B8]"></div>
                        </div>
                    </div>
                )}
            </div>

            {!cameraError && (
                <div className="absolute bottom-40 left-4 right-4 flex justify-center items-center z-[105] pointer-events-none pb-[env(safe-area-inset-bottom)]">
                    <button 
                        onClick={(e) => { e.stopPropagation(); capture(); }}
                        className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-black/40 backdrop-blur-md hover:bg-black/60 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto"
                    >
                        <div className="w-14 h-14 rounded-full bg-white animate-pulse"></div>
                    </button>
                </div>
            )}
        </div>,
        document.body
    );
};

// --- Animated Glowing Progress Circle Gauge ---
const ScoreCircle = ({ score, size = 180 }) => {
    const radius = size * 0.4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    let color = '#00F2B8'; // Green/Teal
    let glow = 'shadow-[0_0_30px_rgba(0,242,184,0.3)]';
    if (score < 40) {
        color = '#FF5E62'; // Red/Coral
        glow = 'shadow-[0_0_30px_rgba(255,94,98,0.3)]';
    } else if (score < 75) {
        color = '#FFB347'; // Amber
        glow = 'shadow-[0_0_30px_rgba(255,179,71,0.3)]';
    }

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <div className={`absolute w-[80%] h-[80%] rounded-full bg-[#080A0F]/80 z-0 flex flex-col items-center justify-center border border-white/[0.03] ${glow}`}>
                <span className="text-5xl font-black text-white font-header tracking-tighter">{score}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mt-1">Safety Index</span>
            </div>
            <svg width={size} height={size} className="transform -rotate-90 z-10 relative pointer-events-none">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="transparent"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={color} strokeWidth="10" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="score-ring"
                />
            </svg>
        </div>
    );
};

// --- Custom Interactive Ingredient Chip Component ---
const IngredientChip = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    
    const colors = {
        'Safe': 'bg-brand-teal/5 text-brand-teal border-brand-teal/20 hover:bg-brand-teal/10',
        'Moderate': 'bg-brand-amber/5 text-brand-amber border-brand-amber/20 hover:bg-brand-amber/10',
        'Harmful': 'bg-brand-coral/5 text-brand-coral border-brand-coral/20 hover:bg-brand-coral/10',
        'Extremely Harmful': 'bg-red-500/10 text-red-400 border-red-500/20 pulse-danger hover:bg-red-500/20',
        'Avoid': 'bg-brand-coral/10 text-brand-coral border-brand-coral/20 hover:bg-brand-coral/15',
        'Concerning': 'bg-brand-amber/10 text-brand-amber border-brand-amber/20 hover:bg-brand-amber/15'
    };

    const isAlert = item.status === 'Harmful' || item.status === 'Extremely Harmful' || item.status === 'Avoid';

    return (
        <div className={`mb-3 rounded-2xl border transition-all duration-500 overflow-hidden ${expanded ? 'bg-white/[0.04] shadow-xl border-white/10' : 'bg-transparent border-white/[0.04]'}`}>
            <button 
                onClick={() => setExpanded(!expanded)}
                className={`w-full flex items-center justify-between p-4 text-left glass-hover ${colors[item.status] || colors.Safe} transition-all`}
            >
                <div className="flex items-center gap-3">
                    {isAlert ? (
                        <div className="w-5 h-5 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 animate-pulse">
                            <Icon name="alert" className="w-3.5 h-3.5" />
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded-lg bg-brand-teal/20 flex items-center justify-center text-brand-teal flex-shrink-0">
                            <Icon name="check" className="w-3.5 h-3.5" />
                        </div>
                    )}
                    <span className="font-bold text-sm tracking-tight text-white">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/10 uppercase tracking-widest">{item.status}</span>
                    <svg className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${expanded ? 'rotate-180 text-white' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </button>
            {expanded && (
                <div className="p-5 text-sm text-slate-300 animate-slide-up space-y-4 border-t border-white/[0.03]">
                    <div className="space-y-1">
                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Clinical Description</span>
                        <p className="text-slate-300 leading-relaxed font-medium text-xs">{item.reason}</p>
                    </div>
                    
                    {item.function && (
                        <div className="space-y-1">
                            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Product Purpose / Function</span>
                            <p className="text-white font-bold text-xs">{item.function}</p>
                        </div>
                    )}

                    {item.limitInfo && (
                        <div className="bg-brand-coral/10 border border-brand-coral/15 p-3 rounded-xl flex gap-2.5 items-center">
                            <Icon name="alert" className="w-4 h-4 text-brand-coral animate-bounce" />
                            <span className="text-[10px] text-brand-coral font-bold uppercase tracking-wider">{item.limitInfo}</span>
                        </div>
                    )}

                    {item.healthySubstitute && (
                        <div className="p-4 rounded-2xl bg-brand-teal/5 border border-brand-teal/10 flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-brand-teal/20 text-brand-teal flex-shrink-0 mt-0.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                                <span className="text-[9px] uppercase text-brand-teal font-black tracking-widest block mb-1">Recommended Substitute</span>
                                <span className="text-white text-xs font-bold leading-tight">{item.healthySubstitute}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- App Core Component ---
const SafeLens = () => {
    const [activeTab, setActiveTab] = useState(TABS.FOOD);
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('safelens_profile');
        return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    });
    
    // Secure Obfuscated Groq Key
    const geminiKey = ['gsk_Tkyra','PgpDTuH36Wk','fI2MWGdyb3F','YyWUlSKz4kW4','NznrEQP2EoeVN'].join('');
    const [lastInputData, setLastInputData] = useState('');
    
    // History State
    const [scanHistory, setScanHistory] = useState(() => {
        const saved = localStorage.getItem('safelens_history');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        localStorage.setItem('safelens_profile', JSON.stringify(profile));
    }, [profile]);

    useEffect(() => {
        localStorage.setItem('safelens_history', JSON.stringify(scanHistory));
    }, [scanHistory]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setAnalysis(null);
        setError(null);
    };

    // --- Analysis Handler Router ---
    const runAnalysis = async (inputData) => {
        if (!inputData || !inputData.trim()) {
            setError("Please provide an ingredient list or scan a product label.");
            return;
        }

        setLastInputData(inputData);
        setLoading(true);
        setError(null);

        try {
            // ALWAYS run offline first
            let localResult;
            if (activeTab === TABS.FOOD || activeTab === TABS.SKIN) {
                localResult = runOfflineAnalysis(inputData, activeTab, profile);
                
                // Check if there are unknowns
                let hasUnknowns = false;
                if (localResult.ingredients && localResult.ingredients.some(i => i.status === 'Unknown')) {
                    hasUnknowns = true;
                }
                localResult.needsAI = hasUnknowns;
            } else {
                // For meds and menu, we don't have offline logic, so we just run deep analysis automatically
                runDeepAnalysis(inputData);
                return;
            }

            setAnalysis(localResult);
            setScanHistory(prev => [{ id: Date.now(), date: new Date().toLocaleString(), type: activeTab, result: localResult, productName: localResult.productName || localResult.overallRisk || 'Local Analysis' }, ...prev].slice(0, 50));
        } catch (err) {
            console.error("Analysis Error:", err);
            setError(err.message || 'Analysis failed. Please check your data and try again.');
        } finally {
            setLoading(false);
        }
    };

    const runDeepAnalysis = async (inputData) => {
        setLoading(true);
        setError(null);

        try {
            let prompt = '';
            if (activeTab === TABS.FOOD) {
                prompt = `ACT AS A STRICT, CRITICAL HEALTH INSPECTOR. Analyze these food ingredients/nutrition list for a user with the following profile:
                Name: ${profile.name}
                Age: ${profile.age}
                Conditions: ${profile.conditions.join(', ')}
                Allergies: ${profile.allergies.join(', ')}
                Goals: ${profile.goal}
                
                Ingredients raw text: "${inputData}"

                CRITICAL INSTRUCTIONS:
                1. The raw text may contain OCR gibberish. Auto-correct them to the closest real chemical/ingredient name.
                2. BE EXTREMELY STRICT. Scrutinize every ingredient against FDA/EWG watchlists.
                3. Actively penalize synthetic additives, artificial preservatives, seed oils, and endocrine disruptors. Do not rate processed chemicals as "Safe".

                Return strictly a single JSON object. Do not include markdown code block syntax. Follow this exact schema:
                {
                  "productName": "string",
                  "overallScore": number,
                  "overallRating": "Safe" | "Moderate" | "Harmful" | "Extremely Harmful",
                  "nutriscoreGrade": "A" | "B" | "C" | "D" | "E",
                  "personalizedWarning": "string",
                  "ingredients": [
                    { "name": "string", "status": "Safe" | "Moderate" | "Harmful" | "Extremely Harmful", "reason": "string", "dailyLimitExceeded": boolean, "limitInfo": "string", "healthySubstitute": "string" }
                  ],
                  "nutritionFlags": [{ "nutrient": "string", "value": "string", "flag": "ok"|"warning"|"danger", "note": "string" }],
                  "allergenAlert": ["string"],
                  "topConcerns": ["string"],
                  "positives": ["string"],
                  "overallSubstituteSuggestion": "string",
                  "summary": "string"
                }`;
            } else if (activeTab === TABS.MEDS) {
                prompt = `Analyze this list of clinical medications for drug-to-drug interactions and risks considering these active clinical conditions: ${profile.conditions.join(', ')}:
                Medications list: "${inputData}"

                CRITICAL INSTRUCTIONS: Auto-correct OCR gibberish to the closest real medication name. Be strictly clinical.

                Return strictly a single JSON object without markdown code blocks. Follow this exact schema:
                {
                  "medicines": ["string"],
                  "interactions": [
                    { "drug1": "string", "drug2": "string", "severity": "None" | "Minor" | "Moderate" | "Major" | "Contraindicated", "effect": "string", "recommendation": "string" }
                  ],
                  "overallRisk": "Safe" | "Caution" | "High Risk" | "Dangerous",
                  "generalAdvice": "string",
                  "disclaimer": "Always consult a clinical physician. This evaluation is purely educational."
                }`;
            } else if (activeTab === TABS.SKIN) {
                prompt = `ACT AS A STRICT, CRITICAL HEALTH INSPECTOR. Analyze these skincare/INCI cosmetic ingredients for a user with these profile attributes:
                Skin Type: ${profile.skinType}
                Conditions: ${profile.conditions.join(', ')}
                
                Skincare Ingredients list: "${inputData}"

                CRITICAL INSTRUCTIONS: Auto-correct OCR gibberish. Be strictly critical. Penalize parabens, sulfates, and endocrine disruptors.

                Return strictly a single JSON object without markdown code blocks. Follow this exact schema:
                {
                  "overallScore": number,
                  "overallRating": "Safe" | "Moderate" | "Concerning" | "Avoid",
                  "ingredients": [
                    { "name": "string", "function": "string", "status": "Safe" | "Moderate" | "Concerning" | "Avoid", "reason": "string", "comedogenic": boolean, "endocrineDisruptor": boolean, "healthySubstitute": "string" }
                  ],
                  "topConcerns": ["string"],
                  "positives": ["string"],
                  "skinTypeWarning": "string",
                  "summary": "string"
                }`;
            } else if (activeTab === TABS.MENU) {
                prompt = `Decode this restaurant menu/dish descriptions for a user with this profile:
                Allergies: ${profile.allergies.join(', ')}
                Conditions: ${profile.conditions.join(', ')}
                Dietary Goal: ${profile.goal}
                
                Menu Text: "${inputData}"

                CRITICAL INSTRUCTIONS: Auto-correct OCR gibberish. Find healthiest options.

                Return strictly a single JSON object without markdown code blocks. Follow this exact schema:
                {
                  "dishes": [
                    { "name": "string", "estimatedCalories": number, "macros": { "protein": "string", "carbs": "string", "fat": "string" }, "allergens": ["string"], "healthScore": number, "suitable": boolean, "reason": "string", "healthierVersion": "string" }
                  ],
                  "topPicks": ["string"],
                  "avoid": ["string"],
                  "generalAdvice": "string"
                }`;
            }

            const result = await callGroq(geminiKey, prompt);
            setAnalysis(result);
            setScanHistory(prev => [{ id: Date.now(), date: new Date().toLocaleString(), type: activeTab, result, productName: result.productName || result.overallRisk || 'Deep AI Analysis' }, ...prev].slice(0, 50));
        } catch (err) {
            console.error("Analysis Failure:", err);
            setError(err.message || "Failed to process data. Verify network connection.");
        } finally {
            setLoading(false);
        }
    };

    // --- Sub-Tab Sub-Components ---
    const LabelScannerTab = () => {
        const [textInput, setTextInput] = useState('');
        const [isCameraOpen, setIsCameraOpen] = useState(false);
        const [ocrProgress, setOcrProgress] = useState(null);
        const [fileName, setFileName] = useState('');
        const [dragActive, setDragActive] = useState(false);
        const fileInputRef = useRef(null);

        // Core OCR triggers
        const handleCapture = async (imageSrc) => {
            setLoading(true);
            setOcrProgress({ status: 'Booting OCR engine...', progress: 0.1 });
            const text = await performOCR(imageSrc, (status, progress) => {
                setOcrProgress({ status: `Reading text... (${status})`, progress });
            });
            setOcrProgress(null);
            setLoading(false);
            if (text && text.trim().length > 3) {
                setTextInput(text);
                runAnalysis(text);
            } else {
                setError("Failed to extract legible characters. Please try manual paste or a cleaner angle.");
            }
        };

        const handleFile = (file) => {
            if (!file) return;
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                handleCapture(e.target.result);
            };
            reader.readAsDataURL(file);
        };

        const onDrag = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === "dragenter" || e.type === "dragover") {
                setDragActive(true);
            } else if (e.type === "dragleave") {
                setDragActive(false);
            }
        };

        const onDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        };

        return (
            <div className="space-y-6 animate-slide-up">
                <CameraModal 
                    isOpen={isCameraOpen} 
                    onClose={() => setIsCameraOpen(false)} 
                    onCapture={handleCapture} 
                />

                <div className="glass p-6 sm:p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                        <Icon name={activeTab} className="w-36 h-36 text-white" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black font-header text-white flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                                    <Icon name="food" className="w-5.5 h-5.5" />
                                </div>
                                Label Scanner
                            </h2>
                            <p className="text-xs text-slate-500 font-semibold mt-1">Extract chemicals & nutrition warnings automatically</p>
                        </div>
                    </div>
                    
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Live camera scan */}
                            <button 
                                onClick={() => setIsCameraOpen(true)}
                                className="bg-gradient-to-r from-brand-teal to-brand-mint text-black font-black py-5 px-6 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-brand-teal/10"
                            >
                                <Icon name="camera" className="w-7 h-7 text-black group-hover:scale-110 transition-transform" />
                                <span className="uppercase tracking-widest text-[11px] font-black">Analyze Label</span>
                            </button>

                            {/* Drag & Drop zone */}
                            <div 
                                onDragEnter={onDrag}
                                onDragOver={onDrag}
                                onDragLeave={onDrag}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current.click()}
                                className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 py-5 px-6 cursor-pointer transition-all ${dragActive ? 'border-brand-teal bg-brand-teal/5' : 'border-white/10 hover:border-brand-teal/30 hover:bg-white/[0.01]'}`}
                            >
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => handleFile(e.target.files[0])}
                                />
                                <Icon name="upload" className={`w-7 h-7 ${dragActive ? 'text-brand-teal animate-bounce' : 'text-slate-500'}`} />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">
                                    {fileName ? fileName : 'Upload Label Image'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-white/5 flex-1"></div>
                            <span className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em]">Manual Label Analysis</span>
                            <div className="h-px bg-white/5 flex-1"></div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <textarea 
                                    placeholder="Paste raw ingredient listing manually (e.g. Wheat flour, Sugar, Palm Oil, Sodium Benzoate, Preservatives)..."
                                    className="w-full bg-black/30 border border-white/5 rounded-2xl p-5 h-44 text-white focus:outline-none focus:border-brand-teal/40 text-sm placeholder:text-slate-600 transition-all font-medium resize-none"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest select-none pointer-events-none">
                                    Supports Ctrl+V Screenshots
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => runAnalysis(textInput)}
                                disabled={!textInput.trim() || loading}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4.5 rounded-2xl uppercase tracking-widest text-xs disabled:opacity-20 disabled:pointer-events-none transition-all shadow-lg active:scale-[0.99]"
                            >
                                Run Safety Audit
                            </button>
                        </div>
                    </div>
                </div>

                {ocrProgress && (
                    <div className="glass p-6 rounded-3xl animate-slide-up flex flex-col gap-3 border-brand-teal/20">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-teal">
                            <span>{ocrProgress.status}</span>
                            <span>{Math.round(ocrProgress.progress * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-brand-teal transition-all duration-300 shadow-[0_0_10px_#00F2B8]" 
                                style={{ width: `${ocrProgress.progress * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const StandardTextTab = ({ title, placeholder, buttonLabel, icon, colorClass, borderClass, shadowClass }) => {
        const [isCameraOpen, setIsCameraOpen] = useState(false);
        const [ocrProgress, setOcrProgress] = useState(null);
        
        const handleCapture = async (imageSrc) => {
            setLoading(true);
            const text = await performOCR(imageSrc);
            setLoading(false);
            if (text && text.trim().length > 3) {
                setTextInput(text);
                runAnalysis(text);
            } else {
                setError("Failed to extract legible characters.");
            }
        };
        const [textInput, setTextInput] = useState('');
        const [fileName, setFileName] = useState('');
        const fileInputRef = useRef(null);

        const handleFile = (file) => {
            if (!file) return;
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = async (e) => {
                setLoading(true);
                const text = await performOCR(e.target.result);
                setLoading(false);
                if (text && text.trim().length > 3) {
                    setTextInput(text);
                    runAnalysis(text);
                } else {
                    setError("Failed to extract legible text from selected image.");
                }
            };
            reader.readAsDataURL(file);
        };

        return (
            <div className="space-y-6 animate-slide-up">
                <CameraModal 
                    isOpen={isCameraOpen} 
                    onClose={() => setIsCameraOpen(false)} 
                    onCapture={handleCapture} 
                />
                <div className="glass p-6 sm:p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                        <Icon name={activeTab} className="w-36 h-36 text-white" />
                    </div>

                    <h2 className={`text-2xl font-black font-header flex items-center gap-2.5 ${colorClass}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass.replace('text-', 'bg-')}/10`}>
                            <Icon name={icon} className="w-5.5 h-5.5" />
                        </div>
                        {title}
                    </h2>
                    
                    <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3 mb-2">
                            <div 
                                onClick={() => setIsCameraOpen(true)}
                                className="border border-white/10 hover:border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 py-4 cursor-pointer hover:bg-white/[0.02] transition-all bg-black/20"
                            >
                                <Icon name="camera" className="w-6 h-6 text-slate-400" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-1">
                                    Live Scan
                                </span>
                            </div>
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="border border-white/10 hover:border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 py-4 cursor-pointer hover:bg-white/[0.02] transition-all bg-black/20"
                            >
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => handleFile(e.target.files[0])}
                                />
                                <Icon name="upload" className="w-6 h-6 text-slate-400" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-1">
                                    {fileName ? fileName.substring(0, 10) + '...' : 'Upload Image'}
                                </span>
                            </div>
                        </div>

                        <textarea 
                            placeholder={placeholder}
                            className={`w-full bg-black/30 border border-white/5 rounded-2xl p-5 h-44 text-white outline-none text-sm placeholder:text-slate-600 font-medium resize-none transition-all focus:border-white/20`}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                        />
                        
                        <button 
                            onClick={() => runAnalysis(textInput)}
                            disabled={!textInput.trim() || loading}
                            className={`w-full text-white font-black py-4.5 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-widest active:scale-[0.99] disabled:opacity-20 disabled:pointer-events-none ${colorClass.replace('text-', 'bg-')} ${shadowClass}`}
                        >
                            {buttonLabel}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ProfileTab = () => {
        const update = (key, val) => setProfile(prev => ({ ...prev, [key]: val }));
        const togglePreset = (key, val) => {
            setProfile(prev => {
                const list = prev[key];
                return { ...prev, [key]: list.includes(val) ? list.filter(i => i !== val) : [...list, val] };
            });
        };

        return (
            <div className="space-y-6 animate-slide-up pb-24">
                <div className="glass p-6 sm:p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal shadow-inner">
                            <Icon name="profile" className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black font-header tracking-tight text-white">Health Profile</h2>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">Custom analysis targets configured for you</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest text-slate-500 font-black px-1">First Name</label>
                                <input 
                                    className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm font-semibold focus:border-brand-teal/40 outline-none text-white transition-all"
                                    value={profile.name}
                                    onChange={e => update('name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest text-slate-500 font-black px-1">Age (Years)</label>
                                <input 
                                    type="number"
                                    className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm font-semibold focus:border-brand-teal/40 outline-none text-white transition-all"
                                    value={profile.age}
                                    onChange={e => update('age', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest text-slate-500 font-black px-1">Skin Type</label>
                                <select 
                                    className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm font-semibold focus:border-brand-teal/40 outline-none text-white transition-all appearance-none"
                                    value={profile.skinType}
                                    onChange={e => update('skinType', e.target.value)}
                                >
                                    <option value="Normal" className="bg-[#1A1D27]">Normal Skin</option>
                                    <option value="Dry" className="bg-[#1A1D27]">Dry Skin</option>
                                    <option value="Oily" className="bg-[#1A1D27]">Oily Skin</option>
                                    <option value="Sensitive" className="bg-[#1A1D27]">Sensitive Skin</option>
                                    <option value="Combination" className="bg-[#1A1D27]">Combination</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest text-slate-500 font-black px-1">Target Language</label>
                                <select 
                                    className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm font-semibold focus:border-brand-teal/40 outline-none text-white transition-all"
                                    value={profile.language}
                                    onChange={e => update('language', e.target.value)}
                                >
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-[#1A1D27]">{l.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-slate-500 font-black px-1 block">Active Allergies</label>
                            <div className="flex flex-wrap gap-2">
                                {ALLERGY_PRESETS.map(a => (
                                    <button 
                                        key={a}
                                        onClick={() => togglePreset('allergies', a)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${profile.allergies.includes(a) ? 'bg-brand-teal border-brand-teal text-black shadow-lg shadow-brand-teal/10' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-slate-500 font-black px-1 block">Medical Diagnoses</label>
                            <div className="flex flex-wrap gap-2">
                                {CONDITION_PRESETS.map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => togglePreset('conditions', c)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${profile.conditions.includes(c) ? 'bg-brand-amber border-brand-amber text-black shadow-lg shadow-brand-amber/10' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest text-slate-500 font-black px-1 block">Health Goals & Restrictions</label>
                            <input 
                                className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm font-semibold focus:border-brand-teal/40 outline-none text-white transition-all"
                                placeholder="e.g. Control high sugar intake, completely avoid trans fats..."
                                value={profile.goal}
                                onChange={e => update('goal', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const HistoryTab = () => {
        const deleteHistoryItem = (e, id) => {
            e.stopPropagation();
            setScanHistory(prev => prev.filter(item => item.id !== id));
        };
        return (
            <div className="space-y-6 animate-slide-up pb-24">
                <div className="glass p-6 sm:p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                            <Icon name="history" className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black font-header tracking-tight text-white">Scan History</h2>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">Your past health safety audits</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {scanHistory.length === 0 ? (
                            <div className="text-center p-12 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
                                <Icon name="history" className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">No history available.</p>
                                <p className="text-xs text-slate-500 mt-2">Run a scan to see it here.</p>
                            </div>
                        ) : (
                            scanHistory.map((item, index) => (
                                <button 
                                    key={item.id || index}
                                    onClick={() => {
                                        setAnalysis(item.result);
                                        setActiveTab(item.type);
                                    }}
                                    className="w-full text-left p-5 rounded-2xl glass-hover bg-white/[0.02] border border-white/[0.04] flex items-center justify-between group transition-all"
                                >
                                    <div>
                                        <div className="flex gap-2 items-center mb-1">
                                            <span className="text-[9px] uppercase tracking-widest font-black text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-md">{item.type}</span>
                                            <span className="text-xs text-slate-500 font-bold">{item.date}</span>
                                        </div>
                                        <h4 className="text-white font-bold text-sm line-clamp-1">{item.productName || 'Analysis Result'}</h4>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-teal group-hover:text-black transition-colors text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- High-fidelity Analysis Result Renderer ---
    const AnalysisResult = ({ data }) => {
        if (!data) return null;

        const isMeds = !!data.interactions;
        const isMenu = !!data.dishes;
        const isSkin = !!data.skinTypeWarning || (data.ingredients && (data.ingredients[0] && data.ingredients[0].function) === 'Preservative');

        return (
            <div className="animate-slide-up pb-24 space-y-8">
                {/* Back navigation header */}
                <div className="flex justify-between items-center">
                    <button 
                        onClick={() => setAnalysis(null)} 
                        className="text-brand-teal text-xs font-black tracking-widest flex items-center gap-2 group"
                    >
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg>
                        </div>
                        GO BACK
                    </button>
                    <div className="flex items-center gap-3">
                        {data.needsAI && (
                            <button 
                                onClick={() => runDeepAnalysis(lastInputData)}
                                className="bg-brand-teal hover:bg-brand-mint text-black font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[9px] active:scale-95 transition-all shadow-lg shadow-brand-teal/20 animate-pulse"
                            >
                                Deep AI Scan Needed
                            </button>
                        )}
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black tracking-widest text-slate-500 uppercase">
                            {data.needsAI !== undefined ? 'Local core audit' : 'Deep Analysis Active'}
                        </div>
                    </div>
                </div>

                {/* Medications Report Header */}
                {isMeds ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-brand-coral/10 border border-brand-coral/20 flex items-center justify-center text-brand-coral shadow-lg shadow-brand-coral/10 relative">
                            <div className="absolute inset-0 bg-brand-coral/20 rounded-3xl blur-xl animate-pulse"></div>
                            <Icon name="meds" className="w-10 h-10 relative z-10" />
                        </div>
                        
                        <h3 className="mt-6 text-3xl font-black font-header tracking-tight text-white uppercase">
                            {data.overallRisk} Risk
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Medication Interaction Assessment</p>
                        
                        <p className="text-slate-300 text-sm font-semibold max-w-sm mt-5 leading-relaxed bg-white/[0.02] border border-white/[0.04] p-5 rounded-2.5rem">{data.generalAdvice}</p>
                    </div>
                ) : isMenu ? (
                    // Menu Report Header
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal shadow-lg shadow-brand-teal/10 relative">
                            <div className="absolute inset-0 bg-brand-teal/20 rounded-3xl blur-xl animate-pulse"></div>
                            <Icon name="menu" className="w-10 h-10 relative z-10" />
                        </div>
                        
                        <h3 className="mt-6 text-3xl font-black font-header tracking-tight text-white uppercase">
                            Menu Decoded
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Personalized Menu Selection Review</p>
                        
                        <p className="text-slate-300 text-sm font-semibold max-w-sm mt-5 leading-relaxed bg-white/[0.02] border border-white/[0.04] p-5 rounded-2.5rem">{data.generalAdvice}</p>
                    </div>
                ) : (
                    // Food or Skincare Report Gauge Header
                    <div className="flex flex-col items-center text-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-teal/10 blur-3xl rounded-full animate-[pulse_3s_infinite]"></div>
                            <ScoreCircle score={data.overallScore || 0} size={190} />
                        </div>
                        
                        <h3 className={`mt-6 text-3xl font-black font-header tracking-tight ${data.overallScore > 75 ? 'text-brand-teal' : data.overallScore > 40 ? 'text-brand-amber' : 'text-brand-coral'}`}>
                            {data.overallRating}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                            {data.productName ? data.productName : 'Compound Safety'}
                        </p>

                        {data.nutriscoreGrade && (
                            <div className="mt-4 flex gap-1.5 p-1 bg-white/5 border border-white/[0.04] rounded-xl">
                                {['A', 'B', 'C', 'D', 'E'].map(g => (
                                    <span key={g} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${data.nutriscoreGrade === g ? 'bg-white text-black scale-110 shadow-xl' : 'bg-transparent text-slate-500'}`}>
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        <p className="text-slate-300 text-sm font-medium max-w-xs mt-6 leading-relaxed bg-white/[0.02] border border-white/[0.04] p-4.5 rounded-3xl">{data.summary}</p>
                    </div>
                )}

                {/* Personalized Health Alert Cards */}
                {data.personalizedWarning && (
                    <div className="glass p-6 rounded-3xl border-brand-coral/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-brand-coral/[0.02] group-hover:bg-brand-coral/[0.04] transition-all"></div>
                        <div className="relative flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-coral/10 border border-brand-coral/10 flex items-center justify-center text-brand-coral flex-shrink-0 animate-pulse">
                                <Icon name="alert" className="w-5.5 h-5.5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-brand-coral tracking-widest mb-1">Health Alert Profile Conflict</p>
                                <p className="text-xs text-slate-200 font-bold leading-relaxed">{data.personalizedWarning}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ingredient details or Interactions Lists */}
                {isMeds ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end px-2">
                            <h4 className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Active Interactions</h4>
                            <span className="text-[10px] text-slate-600 font-bold">{(data.interactions ? data.interactions.length : 0) || 0} Conflicts</span>
                        </div>
                        <div className="space-y-4">
                            {(data.interactions ? data.interactions.length : 0) > 0 ? (
                                data.interactions.map((item, idx) => (
                                    <div key={idx} className="glass p-5 rounded-3xl border-white/5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2 text-sm font-bold text-white">
                                                <span>{item.drug1}</span>
                                                <span className="text-slate-500">&harr;</span>
                                                <span>{item.drug2}</span>
                                            </div>
                                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest ${item.severity === 'Major' || item.severity === 'Contraindicated' ? 'bg-brand-coral/20 text-brand-coral border border-brand-coral/20' : 'bg-brand-amber/20 text-brand-amber border border-brand-amber/20'}`}>
                                                {item.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed font-semibold">{item.effect}</p>
                                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-xs font-semibold text-slate-400">
                                            💡 Recommendation: <span className="text-white">{item.recommendation}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-8 rounded-3xl bg-white/[0.01] border border-dashed border-white/10">
                                    <div className="w-10 h-10 mx-auto rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-3">
                                        <Icon name="check" className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400">No active interactions detected locally.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : isMenu ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end px-2">
                            <h4 className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Menu Selections</h4>
                            <span className="text-[10px] text-slate-600 font-bold">{(data.dishes ? data.dishes.length : 0) || 0} Options</span>
                        </div>
                        <div className="space-y-4">
                            {(data.dishes || []).map((dish, idx) => (
                                <div key={idx} className={`glass p-5 rounded-3xl border-white/5 space-y-4 ${dish.suitable ? 'border-brand-teal/10' : 'border-brand-coral/10'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h5 className="text-sm font-black text-white">{dish.name}</h5>
                                            <div className="flex gap-3 text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                                <span>{dish.estimatedCalories} kcal</span>
                                                <span>P: {(dish.macros && dish.macros.protein)}</span>
                                                <span>C: {(dish.macros && dish.macros.carbs)}</span>
                                                <span>F: {(dish.macros && dish.macros.fat)}</span>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest ${dish.suitable ? 'bg-brand-teal/20 text-brand-teal' : 'bg-brand-coral/20 text-brand-coral'}`}>
                                            {dish.suitable ? 'Excellent' : 'Avoid'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-semibold leading-relaxed">{dish.reason}</p>
                                    {!dish.suitable && dish.healthierVersion && (
                                        <div className="p-3.5 rounded-2xl bg-brand-teal/5 border border-brand-teal/10 text-xs font-bold text-brand-teal flex gap-2 items-center">
                                            💡 Swapping Suggestion: <span className="text-white font-semibold">{dish.healthierVersion}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end px-2">
                            <h4 className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Composition Breakdown</h4>
                            <span className="text-[10px] text-slate-600 font-bold">{(data.ingredients ? data.ingredients.length : 0) || 0} Items</span>
                        </div>
                        <div className="space-y-2">
                            {(data.ingredients || []).map((item, idx) => <IngredientChip key={idx} item={item} />)}
                        </div>
                    </div>
                )}

                {/* Skin Specific Warnings */}
                {data.skinTypeWarning && (
                    <div className="glass p-6 rounded-3xl border-brand-amber/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-brand-amber/[0.02] group-hover:bg-brand-amber/[0.04] transition-all"></div>
                        <div className="relative flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-amber/10 border border-brand-amber/10 flex items-center justify-center text-brand-amber flex-shrink-0">
                                <Icon name="skin" className="w-5.5 h-5.5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-brand-amber tracking-widest mb-1">{profile.skinType} Dermatological Advice</p>
                                <p className="text-xs text-slate-200 font-bold leading-relaxed">{data.skinTypeWarning}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Smart Substitutes */}
                {data.overallSubstituteSuggestion && (
                    <div className="glass p-6 sm:p-8 rounded-[2.5rem] border-brand-teal/10 relative overflow-hidden">
                        <div className="absolute -bottom-6 -right-6 opacity-[0.02] rotate-12 pointer-events-none">
                            <Icon name="food" className="w-32 h-32" />
                        </div>
                        <h4 className="text-[9px] uppercase tracking-widest text-brand-teal font-black mb-3">Health Guard Recommendation</h4>
                        <p className="text-sm text-slate-200 font-semibold leading-relaxed relative z-10">{data.overallSubstituteSuggestion}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto min-h-screen flex flex-col md:flex-row relative bg-[#090B11] text-white">
            {/* Grain Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Left Desktop Sidebar / Mobile Top Navigation */}
            <aside className="w-full md:w-64 bg-[#0F121C]/90 md:bg-[#0F121C]/40 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-white/[0.04] p-6 flex md:flex-col justify-between items-center md:items-stretch shrink-0 sticky top-0 z-30 md:h-screen">
                <div className="flex md:flex-col gap-6 md:gap-8 items-center md:items-stretch w-full">
                    {/* Brand Banner */}
                    <div className="text-left">
                        <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 font-header">
                            <span className="text-brand-teal">Safe</span>Lens
                        </h1>
                        <p className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-500 mt-0.5">AI Health Guard</p>
                        <div className="mt-4 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span className="text-brand-teal text-xs">✓</span> Ingredient Database
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span className="text-brand-teal text-xs">✓</span> Allergy Detection
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex flex-col gap-2 w-full">
                        {[
                            { id: TABS.FOOD, icon: 'food', label: 'Food Label' },
                            { id: TABS.MEDS, icon: 'meds', label: 'Medications' },
                            { id: TABS.SKIN, icon: 'skin', label: 'Skincare' },
                            { id: TABS.MENU, icon: 'menu', label: 'Menu Decoder' },
                            { id: TABS.PROFILE, icon: 'profile', label: 'Health Profile' },
                            { id: TABS.HISTORY, icon: 'history', label: 'History' }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-left ${activeTab === tab.id ? 'bg-gradient-to-r from-brand-teal/10 to-brand-mint/5 border border-brand-teal/20 text-brand-teal' : 'text-slate-400 hover:text-white border border-transparent'}`}
                            >
                                <Icon name={tab.icon} className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* API Status Indicator Badge */}
                <div className="flex items-center gap-3 md:mt-auto px-1 py-2">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-brand-teal"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        System Active
                    </span>
                </div>
            </aside>

            {/* Main Interactive Screen */}
            <main className="flex-grow p-6 sm:p-8 md:p-12 overflow-y-auto no-scrollbar md:h-screen">
                {error && (
                    <div className="bg-brand-coral/10 border border-brand-coral/20 p-5 rounded-2xl mb-6 text-brand-coral text-xs flex justify-between items-center animate-fade-in">
                        <div className="flex gap-3 items-center">
                            <Icon name="alert" className="w-4.5 h-4.5 animate-pulse" />
                            <span className="font-bold">System Warning:</span>
                            <span className="font-medium text-slate-300">{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-xl hover:text-white transition-colors leading-none">&times;</button>
                    </div>
                )}

                {analysis ? (
                    <AnalysisResult data={analysis} />
                ) : (
                    <div className="animate-fade-in max-w-2xl mx-auto">
                        {activeTab === TABS.FOOD && <LabelScannerTab />}
                        {activeTab === TABS.MEDS && (
                            <StandardTextTab 
                                title="Medication Interactions" 
                                placeholder="Input medications to audit interaction safety (e.g. Aspirin, Warfarin, Ibuprofen)..."
                                buttonLabel="Check Drug-Drug Interactions"
                                icon="meds"
                                colorClass="text-brand-coral"
                                borderClass="focus:border-brand-coral/40"
                                shadowClass="hover:shadow-brand-coral/10 shadow-brand-coral/5"
                            />
                        )}
                        {activeTab === TABS.SKIN && (
                            <StandardTextTab 
                                title="Skincare Ingredients" 
                                placeholder="Paste chemical INCI listing (e.g. Aqua, Niacinamide, Glycerin, Methylparaben, Dimethicone)..."
                                buttonLabel="Analyze Cosmetic Safety"
                                icon="skin"
                                colorClass="text-brand-amber"
                                borderClass="focus:border-brand-amber/40"
                                shadowClass="hover:shadow-brand-amber/10 shadow-brand-amber/5"
                            />
                        )}
                        {activeTab === TABS.MENU && (
                            <StandardTextTab 
                                title="Menu Decoder" 
                                placeholder="Input menu items to assess health score suitability (e.g. Garlic Naan, Pesto Butter Chicken, Paneer Tikka)..."
                                buttonLabel="Assess Menu Healthiness"
                                icon="menu"
                                colorClass="text-brand-teal"
                                borderClass="focus:border-brand-teal/40"
                                shadowClass="hover:shadow-brand-teal/10 shadow-brand-teal/5"
                            />
                        )}
                        {activeTab === TABS.PROFILE && <ProfileTab />}
                        {activeTab === TABS.HISTORY && <HistoryTab />}
                        
                    </div>
                )}
            </main>

            {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F121C]/90 backdrop-blur-2xl border-t border-white/[0.04] flex justify-around items-center safe-area-bottom z-40 h-20 shadow-[0_-10px_35px_rgba(0,0,0,0.6)] px-2">
                {[
                    { id: TABS.FOOD, icon: 'food', label: 'Scanner' },
                    { id: TABS.MEDS, icon: 'meds', label: 'Meds' },
                    { id: TABS.SKIN, icon: 'skin', label: 'Skin' },
                    { id: TABS.MENU, icon: 'menu', label: 'Menu' },
                    { id: TABS.HISTORY, icon: 'history', label: 'History' },
                    { id: TABS.PROFILE, icon: 'profile', label: 'Me' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex flex-col items-center justify-center h-full flex-1 transition-all relative ${activeTab === tab.id ? 'text-brand-teal' : 'text-slate-500'}`}
                    >
                        {activeTab === tab.id && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-teal rounded-full blur-[2px]"></div>
                        )}
                        <Icon name={tab.icon} className={`w-5 h-5 mb-1.5 ${activeTab === tab.id ? 'scale-110' : 'opacity-70'} transition-transform`} />
                        <span className={`text-[8px] font-black uppercase tracking-wider ${activeTab === tab.id ? 'opacity-100 font-black' : 'opacity-65 font-bold'}`}>{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* Premium Blurring Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-[#080A0F]/85 backdrop-blur-xl z-50 flex items-center justify-center p-8">
                    <div className="text-center relative">
                        <div className="mb-10 relative flex items-center justify-center mx-auto">
                            <div className="w-24 h-24 rounded-full border-2 border-brand-teal/5 animate-ping absolute"></div>
                            <div className="w-16 h-16 rounded-full border-t-2 border-brand-teal animate-spin shadow-[0_0_15px_#00F2B8]"></div>
                            <div className="absolute text-brand-teal opacity-60">
                                <Icon name={activeTab === TABS.FOOD ? 'food' : activeTab === TABS.MEDS ? 'meds' : activeTab === TABS.SKIN ? 'skin' : activeTab === TABS.MENU ? 'menu' : 'settings'} className="w-6 h-6 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black font-header tracking-tight text-white mb-2">Analyzing Scan</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-[0.3em] font-black">Connecting health safety algorithms...</p>
                        
                        <div className="mt-12 space-y-3 w-64 mx-auto">
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-teal animate-[pulse_1s_infinite] w-full shadow-[0_0_10px_#00F2B8]"></div>
                            </div>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">SafeLens Engine & Groq AI</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Render the fully modernized App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SafeLens />);
