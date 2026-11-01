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
// Test script to build and verify the expanded OFFLINE_INGREDIENTS dataset

const OFFLINE_INGREDIENTS = {
    // === SUGARS & REFINED SWEETENERS ===
    'sugar': { status: 'Harmful', reason: 'High glycemic index. Spikes blood glucose rapidly and increases risk of type 2 diabetes, obesity, and cardiovascular inflammation.', substitute: 'Stevia, monk fruit, or raw honey in moderation.' },
    'high fructose corn syrup': { status: 'Extremely Harmful', reason: 'Highly processed fructose sweetener linked directly to fatty liver disease, systemic obesity, insulin resistance, and metabolic syndrome.', substitute: 'Natural maple syrup, dates, or apple puree.' },
    'hfcs': { status: 'Extremely Harmful', reason: 'Abbreviation for High Fructose Corn Syrup. Promotes visceral fat deposition, elevated triglycerides, and hepatic inflammation.', substitute: 'Organic coconut sugar or stevia.' },
    'corn syrup': { status: 'Harmful', reason: 'Refined glucose-dense sweetener. Accelerates insulin resistance and increases visceral adiposity.', substitute: 'Pure maple syrup or date paste.' },
    'liquid glucose': { status: 'Harmful', reason: 'Concentrated hydrolyzed starch syrup with a very high glycemic index. Triggers rapid glucose spikes.', substitute: 'Natural fruit purees or unrefined stevia.' },
    'invert sugar': { status: 'Harmful', reason: 'Mixture of glucose and fructose created by splitting sucrose. Contributes to dental caries, fatty liver, and metabolic stress.', substitute: 'Raw honey or blackstrap molasses.' },
    'invert syrup': { status: 'Harmful', reason: 'Chemically cleaved sugar syrup designed to retain moisture and sweetness in ultra-processed snacks. Promotes insulin surges.', substitute: 'Mashed banana or applesauce.' },
    'dextrose': { status: 'Harmful', reason: 'Pure D-glucose. Chemically identical to blood sugar, causing instant glycemic spikes and pancreatic stress.', substitute: 'Whole fresh fruits.' },
    'maltodextrin': { status: 'Harmful', reason: 'Extremely high glycemic index (105-185, higher than table sugar). Spikes blood sugar faster than sugar, alters gut microbiota, and suppresses beneficial Bifidobacteria.', substitute: 'Tapioca starch or almond meal.' },
    'fructose': { status: 'Harmful', reason: 'Excess isolated fructose is metabolized exclusively by the liver into triglycerides, promoting non-alcoholic fatty liver disease (NAFLD).', substitute: 'Whole fruits with intact dietary fiber.' },
    'sucrose': { status: 'Harmful', reason: 'Refined table sugar. Promotes dental cavities, metabolic dysregulation, and chronic systemic inflammation.', substitute: 'Monk fruit extract.' },
    'maltose': { status: 'Harmful', reason: 'Disaccharide composed of two glucose units. Rapidly absorbed, inducing high insulin demand.', substitute: 'Cinnamon or vanilla bean.' },

    // === ARTIFICIAL SWEETENERS & SUGAR ALCOHOLS ===
    'aspartame': { status: 'Harmful', reason: 'Artificial sweetener. Breaks down into phenylalanine, aspartic acid, and toxic methanol. Associated with neurotoxicity markers, headaches, and gut microbiome disruption.', substitute: 'Organic green stevia leaf.' },
    'ins 951': { status: 'Harmful', reason: 'INS Code for Aspartame. Synthetic intense sweetener associated with metabolic dysregulation and gut dysbiosis.', substitute: 'Stevia or monk fruit.' },
    'e951': { status: 'Harmful', reason: 'European code for Aspartame. Artificial sweetener linked to altered glucose tolerance and headaches.', substitute: 'Natural sweeteners.' },
    'sucralose': { status: 'Moderate', reason: 'Chlorinated artificial sweetener. Can reduce beneficial gut bacteria counts by up to 50% and generate toxic chloropropanols when baked.', substitute: 'Monk fruit extract.' },
    'ins 955': { status: 'Moderate', reason: 'INS Code for Sucralose. High-intensity non-caloric organochlorine sweetener linked to altered microbiome profile.', substitute: 'Stevia extract.' },
    'e955': { status: 'Moderate', reason: 'European code for Sucralose. Chlorinated sugar derivative.', substitute: 'Monk fruit.' },
    'acesulfame potassium': { status: 'Harmful', reason: 'Synthetic sweetener containing methylene chloride (a potential carcinogen used in manufacture). Associated with metabolic alterations.', substitute: 'Erythritol or stevia.' },
    'acesulfame k': { status: 'Harmful', reason: 'Abbreviation for Acesulfame Potassium. Artificial intense sweetener linked to thyroid disruptions in animal studies.', substitute: 'Stevia leaf.' },
    'ins 950': { status: 'Harmful', reason: 'INS Code for Acesulfame Potassium (Ace-K). Artificial chemical sweetener.', substitute: 'Monk fruit.' },
    'e950': { status: 'Harmful', reason: 'European code for Acesulfame K.', substitute: 'Stevia.' },
    'saccharin': { status: 'Moderate', reason: 'Old synthetic coal-tar sweetener. Can trigger hypersensitivity reactions in sulfa-allergic individuals and alter gut microbial flora.', substitute: 'Pure maple syrup.' },
    'ins 954': { status: 'Moderate', reason: 'INS Code for Saccharin.', substitute: 'Stevia.' },
    'e954': { status: 'Moderate', reason: 'European code for Saccharin.', substitute: 'Stevia.' },
    'sorbitol': { status: 'Moderate', reason: 'Polyol / Sugar alcohol. Causes osmotic diarrhea, bloating, gas, and abdominal cramps if consumed in excessive quantities.', substitute: 'Small quantities of raw honey.' },
    'ins 420': { status: 'Moderate', reason: 'INS Code for Sorbitol. Sugar alcohol that causes gastrointestinal laxative effects.', substitute: 'Natural fruit.' },
    'xylitol': { status: 'Safe', reason: 'Natural birch/corn polyol. Dental-protective and low-glycemic, though toxic to dogs and can cause mild gas in humans in high doses.' },
    'ins 967': { status: 'Safe', reason: 'INS Code for Xylitol. Sugar substitute beneficial for dental enamel.' },
    'maltitol': { status: 'Moderate', reason: 'Sugar alcohol with significant glycemic index (35-52). High risk of bloating and digestive distress.', substitute: 'Erythritol.' },
    'ins 965': { status: 'Moderate', reason: 'INS Code for Maltitol. Polyol sweetener known for gastrointestinal side effects.', substitute: 'Monk fruit.' },
    'isomalt': { status: 'Moderate', reason: 'Sugar alcohol blend derived from beet sugar. Moderate laxative effect in large portions.', substitute: 'Stevia.' },
    'polydextrose': { status: 'Moderate', reason: 'Synthetic polymer of glucose and sorbitol used as bulking agent. Can trigger flatulence and digestive upset.', substitute: 'Acacia fiber or psyllium husk.' },

    // === UNHEALTHY OILS, TRANS FATS & HYDROGENATED LIPIDS ===
    'palm oil': { status: 'Harmful', reason: 'Very high in saturated palmitic acid (approx. 50%), which increases LDL cholesterol levels and poses significant cardiovascular risks.', substitute: 'Cold-pressed olive oil, avocado oil, or sunflower oil.' },
    'palm olein': { status: 'Harmful', reason: 'Liquid fraction of palm oil high in saturated fatty acids. Promotes arterial endothelial inflammation and atherosclerosis.', substitute: 'Extra virgin olive oil or walnut oil.' },
    'palm kernel oil': { status: 'Harmful', reason: 'Highly saturated oil that raises blood cholesterol levels and contributes to plaque build-up in arteries.', substitute: 'Organic coconut oil or extra virgin olive oil.' },
    'hydrogenated vegetable oil': { status: 'Extremely Harmful', reason: 'Source of synthetic trans fats which lower HDL (good) cholesterol, elevate LDL (bad) cholesterol, and cause high arterial inflammation.', substitute: 'Unrefined cold-pressed oils.' },
    'hydrogenated oil': { status: 'Extremely Harmful', reason: 'Hardened trans-fat rich oil associated with coronary heart disease, strokes, and insulin resistance.', substitute: 'Cold-pressed avocado oil or grass-fed butter.' },
    'partially hydrogenated': { status: 'Extremely Harmful', reason: 'Contains industrial trans fats. Strongly associated with heart attacks, strokes, insulin resistance, and systemic cellular inflammation.', substitute: 'Grass-fed butter, ghee, or cold-pressed seed oils.' },
    'trans fat': { status: 'Extremely Harmful', reason: 'Artificially structured lipid that significantly elevates the risk of coronary heart disease and increases inflammatory cytokines in the bloodstream.', substitute: 'Healthy monounsaturated fats like olive oil.' },
    'vanaspati': { status: 'Extremely Harmful', reason: 'Hydrogenated vegetable fat commonly loaded with trans fatty acids. Major contributor to premature coronary artery disease in South Asia.', substitute: 'Pure cow ghee or cold-pressed mustard oil.' },
    'shortening': { status: 'Extremely Harmful', reason: 'Solid industrial fat formulated with hydrogenated lipids. Accelerates endothelial dysfunction and arterial plaque formation.', substitute: 'Grass-fed butter or coconut oil.' },
    'interesterified fat': { status: 'Harmful', reason: 'Chemically rearranged industrial fat developed to replace trans fats. May adversely affect carbohydrate metabolism and immune signaling.', substitute: 'Natural unrefined cold-pressed oils.' },
    'edible vegetable oil': { status: 'Concerning', reason: 'Generic commercial term usually concealing heavily refined, solvent-extracted, high-omega-6 palm or seed oils. Pro-inflammatory when oxidized.', substitute: 'Single-source cold-pressed olive or avocado oil.' },
    'vegetable fat': { status: 'Harmful', reason: 'Industrial fat fraction, typically palm-derived, rich in saturated fats and refined without micronutrients.', substitute: 'Cold-pressed unrefined nut or fruit oils.' },
    'cottonseed oil': { status: 'Harmful', reason: 'Extremely high in inflammatory omega-6 linoleic acid; frequently derived from heavily pesticide-sprayed crops and may contain gossypol residues.', substitute: 'Olive oil or coconut oil.' },
    'soybean oil': { status: 'Concerning', reason: 'Highly refined seed oil excessive in omega-6 fatty acids. Imbalances the omega-6 to omega-3 ratio, driving systemic inflammation.', substitute: 'Extra virgin olive oil or ghee.' },
    'canola oil': { status: 'Moderate', reason: 'Processed rapeseed oil extracted with chemical solvents (hexane) and high heat. Susceptible to lipid peroxidation.', substitute: 'Cold-pressed extra virgin olive oil.' },
    'rapeseed oil': { status: 'Moderate', reason: 'Refined cooking oil subjected to chemical bleaching and deodorization.', substitute: 'Avocado oil.' },
    'margarine': { status: 'Harmful', reason: 'Ultra-processed butter imitation synthesized from refined vegetable oils, emulsifiers, and artificial flavorings.', substitute: 'Organic cultured butter or ghee.' },

    // === REFINED FLOURS & STARCHES ===
    'maida': { status: 'Harmful', reason: 'Refined wheat flour stripped of fiber, bran, and essential nutrients. Causes high glycemic spikes and stresses insulin production.', substitute: 'Whole wheat flour, almond flour, or oat flour.' },
    'refined wheat flour': { status: 'Harmful', reason: 'Stripped grain flour. Quickly converts to glucose, promoting fat storage and increasing the glycemic index of the product.', substitute: 'Quinoa flour, coconut flour, or finger millet (ragi) flour.' },
    'all purpose flour': { status: 'Harmful', reason: 'Highly processed flour that lacks dietary fiber, causing rapid digestive breakdown and sudden spikes in blood sugar.', substitute: 'Spelt flour or chickpea flour.' },
    'bleached flour': { status: 'Harmful', reason: 'Flour chemically bleached with chlorine dioxide or benzoyl peroxide, producing alloxan residues that harm pancreatic beta cells.', substitute: 'Unbleached whole grain flour.' },
    'enriched flour': { status: 'Moderate', reason: 'Refined white flour where synthetic vitamins are added back after milling stripped the natural nutrients.', substitute: '100% whole grain stone-ground flour.' },
    'modified starch': { status: 'Moderate', reason: 'Chemically or enzymatically altered starch used as a stabilizer. Rapidly digested into simple sugars and can cause digestive sensitivity.', substitute: 'Arrowroot powder or organic cornstarch.' },
    'modified food starch': { status: 'Moderate', reason: 'Heavily processed starch additive with high glycemic load.', substitute: 'Organic potato starch or ground chia.' },
    'corn starch': { status: 'Moderate', reason: 'Pure refined carbohydrate stripped of protein and fiber. Can provoke fast blood sugar spikes.', substitute: 'Almond flour or psyllium husk.' },

    // === PRESERVATIVES, CHEMICAL ANTIOXIDANTS & SALTS ===
    'tbhq': { status: 'Extremely Harmful', reason: 'Tertiary Butylhydroquinone. Synthetic petroleum-derived antioxidant preservative. Linked to immune system impairment, vision disturbances, and cellular DNA damage.', substitute: 'Natural mixed tocopherols (Vitamin E) or rosemary extract.' },
    'ins 319': { status: 'Extremely Harmful', reason: 'INS Code for TBHQ (Tertiary Butylhydroquinone). High-hazard petroleum antioxidant preservative.', substitute: 'Vitamin E or rosemary extract.' },
    'e319': { status: 'Extremely Harmful', reason: 'European code for TBHQ.', substitute: 'Natural antioxidants.' },
    'bha': { status: 'Harmful', reason: 'Butylated Hydroxyanisole. Synthetic antioxidant preservative. Classified by NTP as a reasonably anticipated human carcinogen and endocrine disruptor.', substitute: 'Vitamin E (tocopherols) or rosemary extract.' },
    'ins 320': { status: 'Harmful', reason: 'INS Code for BHA (Butylated Hydroxyanisole). Known hormone-disrupting preservative.', substitute: 'Rosemary extract.' },
    'e320': { status: 'Harmful', reason: 'European code for BHA.', substitute: 'Vitamin E.' },
    'bht': { status: 'Harmful', reason: 'Butylated Hydroxytoluene. Chemical preservative. Can disrupt hormonal balance, mimic estrogen, and place heavy metabolic load on liver enzymes.', substitute: 'Natural mixed tocopherols.' },
    'ins 321': { status: 'Harmful', reason: 'INS Code for BHT (Butylated Hydroxytoluene). Synthetic preservative with endocrine-disrupting concerns.', substitute: 'Ascorbic acid.' },
    'e321': { status: 'Harmful', reason: 'European code for BHT.', substitute: 'Natural tocopherols.' },
    'propyl gallate': { status: 'Harmful', reason: 'Synthetic antioxidant preservative. Suspected endocrine disruptor that can trigger allergic skin and respiratory reactions.', substitute: 'Natural citrus bioflavonoids.' },
    'ins 310': { status: 'Harmful', reason: 'INS Code for Propyl Gallate.', substitute: 'Vitamin E.' },
    'sodium benzoate': { status: 'Moderate', reason: 'Chemical preservative. Can react with vitamin C (ascorbic acid) under heat/light to form benzene, a known cellular carcinogen.', substitute: 'Natural preservation methods like fermentation or pasteurization.' },
    'ins 211': { status: 'Moderate', reason: 'INS Code for Sodium Benzoate. Common chemical antimicrobial preservative.', substitute: 'Citric acid or cold pasteurization.' },
    'e211': { status: 'Moderate', reason: 'European code for Sodium Benzoate.', substitute: 'Natural preservation.' },
    'potassium benzoate': { status: 'Moderate', reason: 'Chemical preservative in soft drinks. Can react with ascorbic acid to form carcinogenic benzene.', substitute: 'Refrigerated cold-pressed juice.' },
    'ins 212': { status: 'Moderate', reason: 'INS Code for Potassium Benzoate.', substitute: 'Natural organic acids.' },
    'potassium sorbate': { status: 'Moderate', reason: 'Widely used synthetic food preservative. Generally safe in tiny amounts, but excessive intake can cause mild skin irritation or allergic reactions in sensitive people.', substitute: 'Fresh, preservative-free alternatives.' },
    'ins 202': { status: 'Moderate', reason: 'INS Code for Potassium Sorbate. Synthetic mold and yeast inhibitor.', substitute: 'Natural vinegar or lactic acid.' },
    'e202': { status: 'Moderate', reason: 'European code for Potassium Sorbate.', substitute: 'Fresh food preservation.' },
    'sodium metabisulphite': { status: 'Harmful', reason: 'Chemical bleaching agent and dough conditioner. Severe trigger for asthmatic bronchospasm, hives, and sulfur sensitivity.', substitute: 'Natural sourdough fermentation or ascorbic acid.' },
    'sodium metabisulfite': { status: 'Harmful', reason: 'Sulfite preservative and flour treatment. Known to trigger acute respiratory distress and severe allergic reactions in asthmatics.', substitute: 'Vitamin C or enzymatic dough conditioners.' },
    'ins 223': { status: 'Harmful', reason: 'INS Code for Sodium Metabisulphite. Sulfite allergen and chemical dough conditioner.', substitute: 'Ascorbic acid.' },
    'e223': { status: 'Harmful', reason: 'European code for Sodium Metabisulfite. Sulfite preservative.', substitute: 'Natural fermentation.' },
    'potassium metabisulphite': { status: 'Harmful', reason: 'Sulfite preservative. Destroys thiamine (Vitamin B1) and induces severe asthmatic reactions.', substitute: 'Sterile filtration.' },
    'ins 224': { status: 'Harmful', reason: 'INS Code for Potassium Metabisulphite.', substitute: 'Ascorbic acid.' },
    'sulfur dioxide': { status: 'Harmful', reason: 'Gas preservative used on dried fruits and wine. Strong respiratory irritant and allergen for sensitive airways.', substitute: 'Sun-dried unsulfured organic fruits.' },
    'ins 220': { status: 'Harmful', reason: 'INS Code for Sulfur Dioxide.', substitute: 'Unsulfured processing.' },
    'sodium nitrite': { status: 'Harmful', reason: 'Curing agent that forms carcinogenic nitrosamines in the stomach. Harms oxygen transport in red blood cells if consumed in excess.', substitute: 'Uncured meats preserved with sea salt.' },
    'ins 250': { status: 'Harmful', reason: 'INS Code for Sodium Nitrite. Preservative used in cured meats; linked to colorectal cancer risk.', substitute: 'Celery powder or fresh organic meats.' },
    'e250': { status: 'Harmful', reason: 'European code for Sodium Nitrite.', substitute: 'Nitrite-free meats.' },
    'sodium nitrate': { status: 'Harmful', reason: 'Preservative used in processed meats. Converts into carcinogenic nitrosamines during digestion, increasing colorectal cancer risk.', substitute: 'Celery powder or fresh organic meats.' },
    'ins 251': { status: 'Harmful', reason: 'INS Code for Sodium Nitrate.', substitute: 'Fresh unpreserved meats.' },
    'calcium propionate': { status: 'Moderate', reason: 'Bread mold inhibitor. Associated with irritability, restlessness, sleep disturbance, and inattention in sensitive children.', substitute: 'Naturally fermented sourdough bread.' },
    'ins 282': { status: 'Moderate', reason: 'INS Code for Calcium Propionate. Anti-fungal bread preservative.', substitute: 'Sourdough starter.' },
    'e282': { status: 'Moderate', reason: 'European code for Calcium Propionate.', substitute: 'Fresh bread baking.' },
    'sodium propionate': { status: 'Moderate', reason: 'Propionate salt preservative used in baked goods. May induce metabolic dysregulation.', substitute: 'Clean refrigeration or sourdough.' },
    'ins 281': { status: 'Moderate', reason: 'INS Code for Sodium Propionate.', substitute: 'Fresh bakery goods.' },
    'potassium bromate': { status: 'Extremely Harmful', reason: 'Flour improver classified as a Category 2B carcinogen. Banned in EU, Canada, India, and China due to renal and thyroid tumor risks.', substitute: 'Ascorbic acid or clean sourdough.' },

    // === ARTIFICIAL COLORS & CHEMICAL DYES ===
    'tartrazine': { status: 'Harmful', reason: 'Yellow 5 synthetic azo dye. Strongly associated with hyperactivity in children, hives, asthma, and severe allergic reactions.', substitute: 'Natural colorings like turmeric or beta-carotene.' },
    'ins 102': { status: 'Harmful', reason: 'INS Code for Tartrazine (Yellow 5). Petroleum-derived azo dye linked to behavioral issues in kids.', substitute: 'Curcumin / Turmeric extract.' },
    'e102': { status: 'Harmful', reason: 'European code for Tartrazine.', substitute: 'Beta-carotene.' },
    'sunset yellow': { status: 'Harmful', reason: 'Yellow 6 food dye. Linked to hypersensitivity reactions, skin rashes, and behavioral changes/hyperactivity in children.', substitute: 'Annatto or carrot extract.' },
    'ins 110': { status: 'Harmful', reason: 'INS Code for Sunset Yellow FCF (Yellow 6). Synthetic food dye requiring warning labels in EU.', substitute: 'Paprika oleoresin.' },
    'e110': { status: 'Harmful', reason: 'European code for Sunset Yellow.', substitute: 'Carrot juice.' },
    'allura red': { status: 'Harmful', reason: 'Red 40 synthetic coal-tar dye. Associated with childhood hyperactivity, migraines, and gut mucosal inflammation in animal trials.', substitute: 'Beetroot juice powder or elderberry extract.' },
    'ins 129': { status: 'Harmful', reason: 'INS Code for Allura Red (Red 40). Azo dye linked to intestinal bowel inflammation markers.', substitute: 'Beetroot red.' },
    'e129': { status: 'Harmful', reason: 'European code for Allura Red.', substitute: 'Anthocyanins.' },
    'brilliant blue': { status: 'Harmful', reason: 'Blue 1 synthetic triarylmethane dye. Linked to allergic hypersensitivity, ADHD symptoms, and cellular mitochondrial inhibition.', substitute: 'Spirulina extract or butterfly pea flower.' },
    'ins 133': { status: 'Harmful', reason: 'INS Code for Brilliant Blue FCF (Blue 1). Synthetic petroleum dye.', substitute: 'Spirulina.' },
    'e133': { status: 'Harmful', reason: 'European code for Brilliant Blue.', substitute: 'Spirulina.' },
    'carmoisine': { status: 'Harmful', reason: 'Red azo dye (Azorubine). Banned in the US and Canada. Linked to severe allergic dermatitis and hyperactivity in children.', substitute: 'Black carrot extract or beet juice.' },
    'ins 122': { status: 'Harmful', reason: 'INS Code for Carmoisine / Azorubine. Synthetic red food color.', substitute: 'Beet extract.' },
    'ponceau 4r': { status: 'Harmful', reason: 'Synthetic strawberry red coal-tar dye. Banned in the US. Linked to histamine release and asthmatic attacks.', substitute: 'Raspberry powder or red radish extract.' },
    'ins 124': { status: 'Harmful', reason: 'INS Code for Ponceau 4R (Cochineal Red A). Synthetic red dye.', substitute: 'Beet juice.' },
    'erythrosine': { status: 'Harmful', reason: 'Red 3 coal-tar dye. Demonstrated to cause thyroid tumors in animal studies; banned in cosmetics and topical drugs by FDA.', substitute: 'Natural vegetable juices.' },
    'ins 127': { status: 'Harmful', reason: 'INS Code for Erythrosine (Red 3). Thyroid-disrupting food dye.', substitute: 'Beetroot extract.' },
    'caramel color': { status: 'Harmful', reason: 'Manufactured with ammonia/sulfites (Class III & IV). Contains 4-methylimidazole (4-MEI), a chemical listed by IARC as a possible human carcinogen.', substitute: 'Natural roasted malt or uncolored foods.' },
    'caramel colour': { status: 'Harmful', reason: 'Class IV caramel dye produced using chemical reagents; carries carcinogenic 4-MEI contaminant risk.', substitute: 'Natural carob or cocoa.' },
    'ins 150d': { status: 'Harmful', reason: 'INS Code for Ammonia Sulfite Caramel (Class IV). Frequently contaminated with 4-MEI, a potential carcinogen.', substitute: 'Natural cocoa or molasses.' },
    'e150d': { status: 'Harmful', reason: 'European code for Caramel IV.', substitute: 'Natural coloring.' },
    'ins 150c': { status: 'Harmful', reason: 'INS Code for Ammonia Caramel (Class III). Contains 2-acetyl-4-tetrahydroxybutylimidazole which can depress immune lymphocytes.', substitute: 'Organic cocoa.' },
    'titanium dioxide': { status: 'Harmful', reason: 'White pigment nanoparticle. Formally banned in food across the European Union (E171) due to genotoxicity and DNA strand accumulation concerns.', substitute: 'Calcium carbonate or natural rice starch.' },
    'ins 171': { status: 'Harmful', reason: 'INS Code for Titanium Dioxide. Genotoxic nanoparticle pigment banned by the EFSA in food products.', substitute: 'Natural chalk or cornstarch.' },
    'e171': { status: 'Harmful', reason: 'European code for Titanium Dioxide. Banned in EU foods.', substitute: 'Uncolored options.' },

    // === FLAVOR ENHANCERS & INDUSTRIAL ADDITIVES ===
    'monosodium glutamate': { status: 'Moderate', reason: 'Flavor enhancer that may cause headaches, sweating, numbness, and flushing in sensitive individuals (MSG symptom complex).', substitute: 'Nutritional yeast, sea salt, or natural spices.' },
    'msg': { status: 'Moderate', reason: 'Abbreviation for Monosodium Glutamate. Can trigger neurological excitotoxicity in highly sensitive individuals or cause mild allergic reactions.', substitute: 'Garlic powder, onion powder, or tamari.' },
    'ins 621': { status: 'Moderate', reason: 'INS Code for Monosodium Glutamate (MSG). Excitotoxic flavor additive.', substitute: 'Mushroom powder or nutritional yeast.' },
    'e621': { status: 'Moderate', reason: 'European code for MSG.', substitute: 'Sea salt and herbs.' },
    'disodium inosinate': { status: 'Moderate', reason: 'Purine-based flavor enhancer. Synergizes with MSG; degrades into uric acid and should be avoided by individuals with gout or kidney stones.', substitute: 'Dried shiitake mushrooms.' },
    'ins 631': { status: 'Moderate', reason: 'INS Code for Disodium Inosinate. Purine flavor enhancer.', substitute: 'Natural herbs.' },
    'e631': { status: 'Moderate', reason: 'European code for Disodium Inosinate.', substitute: 'Natural seasonings.' },
    'disodium guanylate': { status: 'Moderate', reason: 'Nucleotide flavor additive. Converts to purines/uric acid in the body; triggers gout flare-ups and hyperactivity.', substitute: 'Kelp flakes or nutritional yeast.' },
    'ins 627': { status: 'Moderate', reason: 'INS Code for Disodium Guanylate.', substitute: 'Natural spices.' },
    'e627': { status: 'Moderate', reason: 'European code for Disodium Guanylate.', substitute: 'Rock salt.' },
    'ins 635': { status: 'Moderate', reason: 'INS Code for Disodium 5-Ribonucleotides (blend of 627 and 631). Can cause itchy skin rashes and gout flare-ups.', substitute: 'Natural vegetable seasonings.' },
    'e635': { status: 'Moderate', reason: 'European code for Disodium 5-ribonucleotides.', substitute: 'Natural herbs.' },
    'hydrolyzed vegetable protein': { status: 'Moderate', reason: 'Plant protein chemically broken down with hydrochloric acid, naturally containing high levels of free glutamates (hidden MSG).', substitute: 'Organic bone broth or mushroom bouillon.' },
    'hvp': { status: 'Moderate', reason: 'Abbreviation for Hydrolyzed Vegetable Protein. Source of hidden free glutamic acid.', substitute: 'Natural spice blend.' },
    'hydrolyzed soy protein': { status: 'Moderate', reason: 'Hydrolyzed soy isolate loaded with unbound glutamates and processed soy allergens.', substitute: 'Real miso or tamari.' },
    'yeast extract': { status: 'Moderate', reason: 'Concentrated yeast cell extract packed with unbound free glutamate. Used to mimic MSG flavoring.', substitute: 'Fresh aromatic herbs.' },
    'autolyzed yeast': { status: 'Moderate', reason: 'Self-digested yeast cell extract creating artificial savory umami taste.', substitute: 'Garlic and onion.' },
    'artificial flavour': { status: 'Harmful', reason: 'Synthetic proprietary blend of synthetic esters, aldehydes, and solvent carriers designed to chemically hijack taste buds.', substitute: 'Pure organic vanilla extract or real fruit purees.' },
    'artificial flavor': { status: 'Harmful', reason: 'Chemical concoction synthesized in a lab from petroleum and chemical fractions to imitate food aromas.', substitute: 'Real spices, citrus zest, or cocoa.' },
    'artificial flavouring': { status: 'Harmful', reason: 'Synthetic aroma compound containing chemical stabilizers and carrier solvents.', substitute: 'Natural extracts.' },
    'artificial flavoring': { status: 'Harmful', reason: 'Synthetic chemical flavor blend.', substitute: 'Real whole foods.' },
    'nature identical flavour': { status: 'Moderate', reason: 'Synthesized chemically in a lab to possess the same chemical formula as natural food molecules.', substitute: '100% natural organic extracts.' },
    'vanillin': { status: 'Moderate', reason: 'Synthetic vanilla mimic often produced chemically from wood pulp (lignin) or petrochemical guaiacol.', substitute: 'Real Madagascar bourbon vanilla bean.' },

    // === EMULSIFIERS, THICKENERS & TEXTURIZERS ===
    'carrageenan': { status: 'Moderate', reason: 'Thickener derived from red seaweed. Linked to intestinal inflammation, ulcerative colitis-like symptoms, and glucose intolerance.', substitute: 'Agar agar, pectin, or guar gum.' },
    'ins 407': { status: 'Moderate', reason: 'INS Code for Carrageenan. Thickener associated with intestinal barrier disruption and colitis.', substitute: 'Pectin or locust bean gum.' },
    'e407': { status: 'Moderate', reason: 'European code for Carrageenan.', substitute: 'Pectin.' },
    'polysorbate 80': { status: 'Harmful', reason: 'Synthetic emulsifier shown in clinical research to erode the protective intestinal mucus layer, promoting gut permeability and colitis.', substitute: 'Sunflower lecithin or egg yolk.' },
    'ins 433': { status: 'Harmful', reason: 'INS Code for Polysorbate 80. Gut-barrier eroding synthetic emulsifier.', substitute: 'Sunflower lecithin.' },
    'e433': { status: 'Harmful', reason: 'European code for Polysorbate 80.', substitute: 'Natural lecithin.' },
    'polysorbate 60': { status: 'Harmful', reason: 'Industrial food emulsifier that degrades gut microbiome integrity.', substitute: 'Organic egg lecithin.' },
    'ins 435': { status: 'Harmful', reason: 'INS Code for Polysorbate 60.', substitute: 'Clean culinary fats.' },
    'carboxymethyl cellulose': { status: 'Moderate', reason: 'Synthetic cellulose gum (CMC). Promotes systemic low-grade gut inflammation and alters intestinal microbiota.', substitute: 'Natural guar gum or ground flaxseed.' },
    'cmc': { status: 'Moderate', reason: 'Abbreviation for Carboxymethyl Cellulose. Synthetic thickener linked to intestinal inflammation.', substitute: 'Psyllium husk.' },
    'ins 466': { status: 'Moderate', reason: 'INS Code for Sodium Carboxymethyl Cellulose.', substitute: 'Pectin.' },
    'e466': { status: 'Moderate', reason: 'European code for CMC.', substitute: 'Guar gum.' },
    'datem': { status: 'Moderate', reason: 'Diacetyl Tartaric Acid Esters of Mono- and Diglycerides. Industrial dough emulsifier used to increase bread volume artificially.', substitute: 'Traditional artisan sourdough fermentation.' },
    'ins 472e': { status: 'Moderate', reason: 'INS Code for DATEM dough emulsifier.', substitute: 'Butter or olive oil.' },
    'e472e': { status: 'Moderate', reason: 'European code for DATEM.', substitute: 'Organic olive oil.' },
    'mono- and diglycerides': { status: 'Moderate', reason: 'Processed fat emulsifier that frequently harbors hidden trans-fat impurities not legally mandated on nutrition tables.', substitute: 'Pure egg yolk or cold-pressed oils.' },
    'ins 471': { status: 'Moderate', reason: 'INS Code for Mono- and Diglycerides of fatty acids. Common bakery emulsifier.', substitute: 'Sunflower lecithin.' },
    'e471': { status: 'Moderate', reason: 'European code for E471 emulsifier.', substitute: 'Organic butter.' },
    'ins 476': { status: 'Moderate', reason: 'INS Code for PGPR (Polyglycerol Polyricinoleate). Cheap industrial castor-oil emulsifier substituted for real cocoa butter in chocolate.', substitute: 'Pure cocoa butter.' },
    'e476': { status: 'Moderate', reason: 'European code for PGPR in commercial confectionery.', substitute: 'Real cocoa butter.' },
    'soy lecithin': { status: 'Safe', reason: 'Natural phospholipid emulsifier extracted from soybeans. Generally safe, rich in choline, though may trigger sensitivity in severe soy allergies.' },
    'ins 322': { status: 'Safe', reason: 'INS Code for Lecithin (Soy/Sunflower). Natural phospholipid that supports cellular membrane function.' },
    'e322': { status: 'Safe', reason: 'European code for Lecithin.', substitute: 'Natural egg yolk.' },
    'guar gum': { status: 'Safe', reason: 'Soluble prebiotic dietary fiber extracted from guar beans. Helps normalize blood sugar and feed beneficial gut flora in moderate amounts.' },
    'ins 412': { status: 'Safe', reason: 'INS Code for Guar Gum. Natural prebiotic legume-derived thickener.' },
    'e412': { status: 'Safe', reason: 'European code for Guar Gum.' },
    'xanthan gum': { status: 'Safe', reason: 'Natural polysaccharide produced by bacterial fermentation. Safe gluten-free binder; may cause mild gas only in very large quantities.' },
    'ins 415': { status: 'Safe', reason: 'INS Code for Xanthan Gum.' },
    'e415': { status: 'Safe', reason: 'European code for Xanthan Gum.' },
    'pectin': { status: 'Safe', reason: 'Natural soluble fruit fiber that supports bowel regularity, binds cholesterol, and acts as a beneficial prebiotic.' },
    'ins 440': { status: 'Safe', reason: 'INS Code for Pectin. Healthy natural plant fiber.' },
    'raising agent': { status: 'Safe', reason: 'Culinary leavening compound (such as baking soda or baking powder) used to aerate dough.' },
    'ins 500': { status: 'Safe', reason: 'INS Code for Sodium Carbonates / Baking Soda. Safe culinary leavening and alkalizing agent.' },
    'ins 500(ii)': { status: 'Safe', reason: 'INS Code for Sodium Bicarbonate (Baking Soda). Clean, non-toxic leavening agent.' },
    'e500': { status: 'Safe', reason: 'European code for Baking Soda.' },
    'ins 503': { status: 'Safe', reason: 'INS Code for Ammonium Carbonates (Baker\'s Ammonia). Traditional leavening agent that completely evaporates during baking.' },
    'ins 503(ii)': { status: 'Safe', reason: 'INS Code for Ammonium Bicarbonate. Clean traditional leavening salt.' },
    'e503': { status: 'Safe', reason: 'European code for Ammonium Carbonates.' },
    'citric acid': { status: 'Safe', reason: 'Natural organic fruit acid used for tartness and microbial stabilization. Safe, though heavily manufactured forms derived from Aspergillus niger can occasionally trigger sensitivities.' },
    'ins 330': { status: 'Safe', reason: 'INS Code for Citric Acid. Common benign acidity regulator.' },
    'e330': { status: 'Safe', reason: 'European code for Citric Acid.' },
    'salt': { status: 'Safe', reason: 'Essential electrolyte (sodium chloride) required for nerve signaling, fluid balance, and muscle contraction. Moderate daily intake according to your health profile.' },
    'iodised salt': { status: 'Safe', reason: 'Table salt fortified with essential potassium iodate to support thyroid hormone production and prevent goiters.' },
    'iodized salt': { status: 'Safe', reason: 'Dietary sodium chloride fortified with micronutrient iodine.' },
    'sea salt': { status: 'Safe', reason: 'Minimally processed natural mineral salt containing trace minerals like magnesium and potassium.' },
    'rock salt': { status: 'Safe', reason: 'Himalayan or sendha namak rock crystal containing trace minerals.' },

    // === BENEFICIAL WHOLE FOODS & INGREDIENTS ===
    'whole wheat': { status: 'Safe', reason: 'Excellent source of dietary fiber, complex carbohydrates, B-vitamins, and minerals. Promotes digestive health and stable insulin levels.' },
    'oats': { status: 'Safe', reason: 'Rich in beta-glucan soluble fiber, which actively lowers LDL cholesterol, regulates blood glucose levels, and supports gut microflora.' },
    'rolled oats': { status: 'Safe', reason: 'Clean whole-grain fiber source that supports cardiovascular wellness and steady energy.' },
    'quinoa': { status: 'Safe', reason: 'A complete plant protein containing all nine essential amino acids. Rich in iron, magnesium, fiber, and powerful antioxidants.' },
    'chia seeds': { status: 'Safe', reason: 'Superfood packed with alpha-linolenic acid (omega-3), soluble fiber, calcium, and antioxidants. Highly anti-inflammatory.' },
    'flax seeds': { status: 'Safe', reason: 'Rich in lignans, omega-3 ALA, and mucilage fiber. Promotes hormonal balance and heart health.' },
    'almonds': { status: 'Safe', reason: 'High in monounsaturated fats, vitamin E, and magnesium. Supports heart health, lowers cholesterol, and acts as a pre-biotic.' },
    'walnuts': { status: 'Safe', reason: 'Rich in plant-based omega-3 fatty acids and polyphenols. Promotes cognitive health, reduces cardiovascular inflammation.' },
    'cashews': { status: 'Safe', reason: 'Nutrient-dense nut rich in heart-healthy monounsaturated fats, copper, and magnesium.' },
    'peanuts': { status: 'Safe', reason: 'Rich in protein, biotin, niacin, and resveratrol. High allergen risk for sensitive profiles.' },
    'spinach': { status: 'Safe', reason: 'Nutrient-dense leafy green rich in iron, calcium, folate, and vitamins A, C, and K. Supports bone health and vision.' },
    'water': { status: 'Safe', reason: 'The essential vehicle for life. Keeps the body hydrated, assists digestion, cushions joints, and flushes metabolic waste.' },
    'carbonated water': { status: 'Safe', reason: 'Pure water infused with carbon dioxide gas. Zero calories and safe hydration.' },
    'green tea': { status: 'Safe', reason: 'Abundant in epigallocatechin gallate (EGCG) catechins, which are potent antioxidants that boost metabolism and protect cells.' },
    'cacao': { status: 'Safe', reason: 'Raw chocolate rich in flavanols, magnesium, and mood-boosting theobromine. Strongly cardio-protective.' },
    'cocoa': { status: 'Safe', reason: 'Antioxidant-dense plant powder supporting cardiovascular nitric oxide synthesis.' },
    'cocoa butter': { status: 'Safe', reason: 'Healthy unrefined plant lipid rich in stearic acid, which exhibits a neutral effect on blood cholesterol.' },
    'cocoa solids': { status: 'Safe', reason: 'Natural flavanol-rich solids from cocoa beans supporting vascular elasticity.' },
    'milk solids': { status: 'Safe', reason: 'Concentrated dairy proteins, calcium, and lactose from milk. High allergen trigger for dairy-sensitive profiles.' },
    'whey protein': { status: 'Safe', reason: 'Complete, rapidly absorbed dairy protein rich in branched-chain amino acids (BCAAs) that stimulates muscle protein synthesis.' },
    'whey': { status: 'Safe', reason: 'Liquid byproduct of milk curdling rich in immunoglobulins and minerals. Contains lactose.' },
    'cheddar cheese': { status: 'Safe', reason: 'Cultured dairy protein and fat rich in calcium, vitamin K2, and bioavailable protein.' },
    'onion powder': { status: 'Safe', reason: 'Dehydrated ground allium rich in quercetin antioxidants and prebiotic fructooligosaccharides.' },
    'garlic powder': { status: 'Safe', reason: 'Ground allium rich in allicin, supporting healthy blood pressure and antimicrobial defenses.' },
    'ginger': { status: 'Safe', reason: 'Potent anti-inflammatory rhizome containing gingerols that aid digestion and calm nausea.' },
    'turmeric': { status: 'Safe', reason: 'Superfood spice packed with curcumin, an extraordinary natural anti-inflammatory polyphenol.' },
    'cinnamon': { status: 'Safe', reason: 'Aromatic bark rich in cinnamaldehyde that enhances insulin receptor sensitivity.' },
    'vanilla': { status: 'Safe', reason: 'Natural botanical orchid pod rich in antioxidant vanillic compounds.' },
    'vanilla extract': { status: 'Safe', reason: 'Natural aqueous extract of cured vanilla beans.' },
    'potatoes': { status: 'Safe', reason: 'Nutrient-rich tuber delivering potassium, vitamin C, and resistant starch when cooled.' },
    'caffeine': { status: 'Safe', reason: 'Natural central nervous system stimulant. Boosts alertness and metabolic rate in moderation (up to 400mg/day).' },
    'phosphoric acid': { status: 'Moderate', reason: 'Acidulant in dark sodas. Excess consumption is linked to lower bone mineral density and kidney stone formation due to altered calcium/phosphorus ratio.', substitute: 'Sparkling mineral water with fresh lemon.' },

    // === SKINCARE & COSMETIC CHEMICALS (CONCERNING/AVOID) ===
    'methylparaben': { status: 'Avoid', reason: 'Synthetic preservative. Mimics estrogen in the body, binds to estrogen receptors, and is linked to endocrine disruption and breast tissue abnormalities.', substitute: 'Phenoxyethanol or organic preservatives like sodium phytate.' },
    'propylparaben': { status: 'Avoid', reason: 'Endocrine-disrupting preservative. Absorbs through the skin easily and disrupts reproductive hormones even at low levels.', substitute: 'Ethylhexylglycerin.' },
    'butylparaben': { status: 'Avoid', reason: 'High-hazard paraben derivative. Strongly mimics estrogen, impairs reproductive systems, and accumulates in aquatic life.', substitute: 'Sodium levulinate.' },
    'ethylparaben': { status: 'Avoid', reason: 'Paraben preservative with demonstrated estrogenic activity and cellular accumulation.', substitute: 'Preservative-free sterile packaging.' },
    'parabens': { status: 'Avoid', reason: 'Class of chemical preservatives. Known endocrine disruptors that disrupt hormone balance and may accelerate skin aging under UV exposure.', substitute: 'Natural antimicrobial plant extracts.' },
    'dmdm hydantoin': { status: 'Avoid', reason: 'Formaldehyde-releasing preservative. Slowly decomposes into carcinogenic formaldehyde on the skin, causing severe contact allergies and dermatitis.', substitute: 'Sodium benzoate or potassium sorbate in cosmetics.' },
    'diazolidinyl urea': { status: 'Avoid', reason: 'High-risk formaldehyde donor preservative. Known trigger of chronic allergic contact dermatitis.', substitute: 'Glyceryl caprylate.' },
    'imidazolidinyl urea': { status: 'Avoid', reason: 'Formaldehyde-releasing chemical preservative. Frequent cause of eczema and skin rashes.', substitute: 'Organic preservative systems.' },
    'quaternium-15': { status: 'Avoid', reason: 'Severe formaldehyde releaser. One of the primary cosmetic contact allergens identified by dermatological patch tests.', substitute: 'Natural ferments.' },
    'formaldehyde': { status: 'Avoid', reason: 'Known human carcinogen. Released by certain preservatives. High allergen, triggers skin burning, blistering, and cellular toxicity.', substitute: 'Preservative-free single-dose packaging.' },
    'sodium lauryl sulfate': { status: 'Concerning', reason: 'Harsh surfactant. Strips the skin barrier of natural lipids, causes severe epidermal water loss, and triggers irritation and eczema.', substitute: 'Decyl glucoside, coco-glucoside, or sodium cocoyl isethionate.' },
    'sls': { status: 'Concerning', reason: 'Abbreviation for Sodium Lauryl Sulfate. A primary skin irritant that compromises the skin barrier and triggers dermatitis.', substitute: 'Lauryl glucoside.' },
    'sodium laureth sulfate': { status: 'Concerning', reason: 'Foaming agent. Gentler than SLS but can be contaminated with 1,4-dioxane, a highly toxic carcinogen, during manufacturing.', substitute: 'Coco betaine.' },
    'sles': { status: 'Concerning', reason: 'Abbreviation for Sodium Laureth Sulfate. Carries risk of carcinogenic 1,4-dioxane contamination and causes mild skin irritation.', substitute: 'Sodium lauroyl methyl isethionate.' },
    'oxybenzone': { status: 'Avoid', reason: 'Chemical sunscreen filter (Benzophenone-3). Proven severe endocrine disruptor that absorbs into the bloodstream, detected in breast milk and urine. Bleaches coral reefs.', substitute: 'Non-nano Zinc Oxide or Titanium Dioxide mineral blockers.' },
    'octinoxate': { status: 'Avoid', reason: 'UV filter (Octyl methoxycinnamate). Mimics estrogen, disrupts thyroid hormone synthesis, and generates free radicals when exposed to sunlight.', substitute: 'Zinc oxide sunscreen.' },
    'homosalate': { status: 'Concerning', reason: 'Chemical sunscreen filter shown to disrupt estrogen, androgen, and progesterone balance. Bioaccumulates in the body.', substitute: 'Mineral sunscreen.' },
    'avobenzone': { status: 'Moderate', reason: 'Unstable UVA chemical filter that breaks down quickly under sunlight, generating reactive oxygen species and requiring synthetic stabilizers.', substitute: 'Mineral zinc oxide.' },
    'octocrylene': { status: 'Moderate', reason: 'Synthetic UV absorber that degrades into benzophenone (a mutagenic carcinogen) over time in sunscreen bottles.', substitute: 'Non-nano zinc oxide.' },
    'triethanolamine': { status: 'Concerning', reason: 'Emulsifier and pH adjuster (TEA). Can react with other ingredients to form carcinogenic nitrosamines; triggers severe skin contact allergies.', substitute: 'Arginine or sodium hydroxide.' },
    'tea': { status: 'Concerning', reason: 'Triethanolamine. Strong skin irritant and precursor to carcinogenic nitrosamines.', substitute: 'Citric acid.' },
    'diethanolamine': { status: 'Avoid', reason: 'Emulsifying amine (DEA). Carcinogenic risk factor associated with liver tumors and kidney toxicity.', substitute: 'Coco glucoside.' },
    'dea': { status: 'Avoid', reason: 'Diethanolamine.', substitute: 'Natural surfactant.' },
    'monoethanolamine': { status: 'Concerning', reason: 'Amine surfactant (MEA) known to induce occupational asthma and skin sensitization.', substitute: 'Gentle amino acid surfactants.' },
    'alcohol denat': { status: 'Concerning', reason: 'Denatured alcohol. Severely strips natural epidermal lipids, dehydrates the skin barrier, and causes premature keratinocyte death.', substitute: 'Fatty alcohols (cetyl, stearyl) or alcohol-free formulas.' },
    'denatured alcohol': { status: 'Concerning', reason: 'Astringent alcohol that dissolves the protective lipid barrier of the epidermis.', substitute: 'Centella or green tea hydrosol.' },
    'isopropyl alcohol': { status: 'Concerning', reason: 'Rubbing alcohol. Extremely drying and sensitizing on facial skin; triggers rebound oil production.', substitute: 'Thermal spring water.' },
    'dimethicone': { status: 'Moderate', reason: 'Silicone polymer. Creates a breathable barrier on skin, which keeps moisture in but can trap oil, sweat, and dead skin in acne-prone types.', substitute: 'Plant-derived squalane or coco-caprylate.' },
    'cyclomethicone': { status: 'Moderate', reason: 'Volatile silicone. Evaporates quickly but has environmental bioaccumulation concerns and can dehydrate sensitive skin over time.', substitute: 'Hemisqualane.' },
    'cyclopentasiloxane': { status: 'Concerning', reason: 'D5 silicone. Bioaccumulative in aquatic wildlife and flagged as an endocrine disruptor under EU chemical regulations.', substitute: 'Plant squalane.' },
    'mineral oil': { status: 'Moderate', reason: 'Petroleum byproduct. Forms an occlusive layer. Prevents moisture loss but can trigger blackheads and clog pores in oily skin.', substitute: 'Jojoba oil, rosehip oil, or argan oil.' },
    'petrolatum': { status: 'Moderate', reason: 'Petroleum jelly. Extremely occlusive. Great for healing severe dry patches but traps sebum and dirt if skin is not cleansed thoroughly.', substitute: 'Shea butter or beeswax.' },
    'fragrance': { status: 'Concerning', reason: 'Umbrella term for thousands of undisclosed chemicals. High risk of inducing contact allergies, eczema, dermatitis, and migraines.', substitute: 'Unscented formulas or products colored/scented with organic hydrosols.' },
    'parfum': { status: 'Concerning', reason: 'Synonym for Fragrance. Houses hidden phthalates (which keep scent longer) that disrupt thyroid and reproductive hormones.', substitute: 'Fragrance-free options.' },
    'phthalates': { status: 'Avoid', reason: 'Plasticizing chemical class. Act as severe reproductive toxins and endocrine disruptors, linked to asthma and allergy development.', substitute: 'Phthalate-free formulas.' },
    'phenoxyethanol': { status: 'Moderate', reason: 'Common cosmetic preservative. Generally safe up to 1%, but can cause contact hives, eczema, and infant neurotoxicity if ingested.', substitute: 'Sodium levulinate or ethylhexylglycerin.' },
    'disodium edta': { status: 'Moderate', reason: 'Chelating agent that binds heavy metals. Enhances the dermal penetration of other toxic chemicals through the skin barrier.', substitute: 'Sodium phytate.' },
    'bht in cosmetics': { status: 'Harmful', reason: 'Butylated Hydroxytoluene. Used as cosmetic antioxidant; proven hormone disruptor.', substitute: 'Tocopherol (Vitamin E).' },
    'triclosan': { status: 'Avoid', reason: 'Antimicrobial agent. Banned in consumer washes by FDA. Disrupts thyroid hormones, induces bacterial antibiotic resistance, and harms aquatic ecosystems.', substitute: 'Tea tree oil or colloidal silver.' },
    'talc': { status: 'Concerning', reason: 'Mined mineral powder carrying high risk of natural asbestos contamination; linked to ovarian cancer and respiratory inflammation when inhaled.', substitute: 'Cornstarch or arrowroot powder.' },
    'carbomer': { status: 'Moderate', reason: 'Synthetic polyacrylic acid polymer (microplastic). Safe on skin but non-biodegradable and causes environmental microplastic pollution.', substitute: 'Xanthan gum or sclerotium gum.' },
    'peg-100 stearate': { status: 'Moderate', reason: 'Polyethylene glycol derivative. Penetration enhancer that carries risk of contamination with toxic 1,4-dioxane and ethylene oxide.', substitute: 'Cetearyl glucoside.' },
    'stearic acid': { status: 'Safe', reason: 'Naturally occurring fatty acid found in plant fats. Nourishing emollient and stabilizer that softens the skin barrier.' },
    'cetyl alcohol': { status: 'Safe', reason: 'Beneficial fatty alcohol derived from coconut oil. Non-drying, deeply conditioning, and stabilizes formulations.' },
    'glycol stearate': { status: 'Safe', reason: 'Fatty acid ester used for pearlescent opacity and skin conditioning. Non-toxic.' },
    'isopropyl palmitate': { status: 'Moderate', reason: 'Ester of isopropyl alcohol and palmitic acid. Highly comedogenic (pore-clogging rating 4/5) for acne-prone skin.', substitute: 'Squalane.' },
    'hyaluronic acid': { status: 'Safe', reason: 'Powerful humectant. Draws up to 1000x its weight in water into the skin, plumping fine lines and reinforcing the moisture barrier.' },
    'glycerin': { status: 'Safe', reason: 'Natural humectant and skin-identical ingredient. Extremely safe, highly effective at hydration, and repairs damaged skin barrier.' },
    'niacinamide': { status: 'Safe', reason: 'Vitamin B3. Regulates sebum production, strengthens the skin barrier, fades hyperpigmentation, and exerts anti-inflammatory action.' },
    'ceramides': { status: 'Safe', reason: 'Essential lipids that make up 50% of the skin barrier. Restores the moisture barrier, locks in hydration, and protects against irritants.' },
    'salicylic acid': { status: 'Safe', reason: 'Beta Hydroxy Acid (BHA). Penetrates deep into pores to dissolve sebum, exfoliate dead skin, and clear acne. Anti-inflammatory.' },
    'centella asiatica': { status: 'Safe', reason: 'Korean Cica extract. Rich in amino acids and active compounds. Extremely soothing, heals wounds, and stimulates collagen synthesis.' },
    'aloe vera': { status: 'Safe', reason: 'Natural botanical extract. Contains vitamins, minerals, and polysaccharides. Intensely hydrates, cools, and soothes inflamed skin.' },
    'retinol': { status: 'Moderate', reason: 'Vitamin A derivative. Highly effective at accelerating cell turnover and boosting collagen, but can cause redness, peeling, and sun sensitivity.' },
    'glycolic acid': { status: 'Moderate', reason: 'Alpha Hydroxy Acid (AHA). Exfoliates the surface skin cells to brighten tone, but makes skin highly sensitive to UV rays.' },
    'squalane': { status: 'Safe', reason: 'Bio-compatible plant oil derived from olives or sugarcane. Mimics skin sebum, non-comedogenic, and deeply replenishes the moisture barrier.' },
    'panthenol': { status: 'Safe', reason: 'Pro-vitamin B5. Powerful soothing humectant that relieves redness, accelerates wound healing, and restores damaged barrier integrity.' },
    'tocopherol': { status: 'Safe', reason: 'Pure Vitamin E. Potent lipid-soluble antioxidant that neutralizes free radicals and protects skin against UV photodamage.' },
    'allantoin': { status: 'Safe', reason: 'Non-toxic botanical soothing agent that calms irritation, stimulates cellular regeneration, and protects sensitive skin.' },
    'zinc oxide': { status: 'Safe', reason: 'Clean mineral physical sunscreen filter. Broad-spectrum UVA/UVB protection, anti-inflammatory, and reef-safe.' },

    'extra virgin olive oil': { status: 'Safe', reason: 'Unrefined cold-pressed fruit oil loaded with oleic acid and polyphenols. Strongly cardioprotective and anti-inflammatory.' },
    'olive oil': { status: 'Safe', reason: 'Heart-healthy monounsaturated fat that supports HDL cholesterol.' },
    'avocado oil': { status: 'Safe', reason: 'High-heat stable monounsaturated fat rich in lutein and vitamin E.' },
    'coconut oil': { status: 'Safe', reason: 'Plant-derived source of medium-chain triglycerides (MCTs) like lauric acid.' },
    'sesame oil': { status: 'Safe', reason: 'Cold-pressed traditional oil rich in sesamol and sesamolin antioxidants.' },
    'mustard oil': { status: 'Safe', reason: 'Traditional pungently flavored cold-pressed oil with balanced omega fatty acids.' },
    'ghee': { status: 'Safe', reason: 'Clarified cultured butter rich in butyric acid, fat-soluble vitamins A, D, E, K, and free of lactose/casein solids.' },
    'butter': { status: 'Safe', reason: 'Natural dairy fat providing conjugated linoleic acid (CLA) and butyrate.' },
    'ascorbic acid': { status: 'Safe', reason: 'Pure Vitamin C. Powerful essential water-soluble antioxidant and immunity cofactor.' },
    'ins 300': { status: 'Safe', reason: 'INS Code for Ascorbic Acid (Vitamin C). Healthy antioxidant.' },
    'e300': { status: 'Safe', reason: 'European code for Vitamin C (Ascorbic Acid).' },
    'vitamin c': { status: 'Safe', reason: 'Essential micronutrient that neutralizes free radicals and supports collagen synthesis.' },
    'lemon juice': { status: 'Safe', reason: 'Fresh citrus juice high in natural citric acid, vitamin C, and flavonoids.' },
    'lime juice': { status: 'Safe', reason: 'Natural citrus antioxidant source.' },
    'black pepper': { status: 'Safe', reason: 'Aromatic spice rich in piperine, which boosts nutrient and curcumin bioavailability by up to 2000%.' },
    'rice': { status: 'Safe', reason: 'Digestible complex carbohydrate grain.' },
    'brown rice': { status: 'Safe', reason: 'Whole grain retaining bran and germ, rich in manganese, magnesium, and dietary fiber.' },
    'lentils': { status: 'Safe', reason: 'Plant protein and soluble fiber powerhouse supporting gut health and glycemic control.' },
    'dal': { status: 'Safe', reason: 'Traditional legume source rich in folate, iron, and plant protein.' },
    'chickpeas': { status: 'Safe', reason: 'Garbanzo beans packed with prebiotic fiber and sustained plant-based energy.' },
    'beans': { status: 'Safe', reason: 'High-fiber legume supporting metabolic and colon health.' },
    'tofu': { status: 'Safe', reason: 'Minimally processed soybean curd rich in complete protein, calcium, and isoflavones.' },
    'paneer': { status: 'Safe', reason: 'Fresh non-melting cottage cheese high in bioavailable milk protein and calcium.' },
    'eggs': { status: 'Safe', reason: 'Gold standard biological value protein packed with choline, lutein, and essential fatty acids.' },
    'fish': { status: 'Safe', reason: 'Excellent lean protein source rich in anti-inflammatory omega-3 EPA and DHA.' },
    'salmon': { status: 'Safe', reason: 'Fatty fish delivering premier omega-3 fatty acids and astaxanthin.' },
    'chicken': { status: 'Safe', reason: 'Lean poultry protein supporting muscle repair and metabolic satiety.' },
    'broccoli': { status: 'Safe', reason: 'Cruciferous vegetable rich in sulforaphane, indole-3-carbinol, and vitamins C and K.' },
    'carrots': { status: 'Safe', reason: 'Beta-carotene rich root vegetable supporting ocular vision and immune defenses.' },
    'garlic': { status: 'Safe', reason: 'Allium rich in allicin, supporting cardiovascular elasticity and antimicrobial resistance.' },
    'honey': { status: 'Safe', reason: 'Raw unheated bee nectar containing enzymes, pollen, and natural antibacterial compounds (use mindfully for diabetes).' },
    'raw honey': { status: 'Safe', reason: 'Unfiltered enzymatic natural sweetener.' },
    'dates': { status: 'Safe', reason: 'Whole fruit natural sweetener containing dietary fiber, potassium, and antioxidants.' },
    'maple syrup': { status: 'Safe', reason: '100% pure tree sap containing 24+ antioxidants and minerals like zinc and manganese.' },
    'stevia': { status: 'Safe', reason: 'Zero-calorie natural leaf extract with no glycemic impact.' },
    'monk fruit': { status: 'Safe', reason: 'Natural fruit mogroside extract with zero glycemic index.' }
};


// Common Medication Interactions for local engine
const MED_INTERACTIONS = [
    { drug1: 'aspirin', drug2: 'warfarin', severity: 'Major', effect: 'Concomitant use significantly increases the risk of serious gastrointestinal and systemic bleeding due to dual antiplatelet and anticoagulant action.', recommendation: 'Avoid combination. If necessary, monitor coagulation metrics (INR) extremely closely. Discuss safer alternatives with your physician.' },
    { drug1: 'ibuprofen', drug2: 'aspirin', severity: 'Moderate', effect: 'Ibuprofen may inhibit the cardioprotective antiplatelet effect of low-dose aspirin and increases the risk of stomach ulcers.', recommendation: 'Take aspirin at least 30 minutes before or 8 hours after ibuprofen. Monitor for abdominal pain.' },
    { drug1: 'ibuprofen', drug2: 'lisinopril', severity: 'Moderate', effect: 'NSAIDs like ibuprofen can impair kidney function and decrease the blood pressure lowering efficacy of Lisinopril.', recommendation: 'Monitor blood pressure and kidney biomarkers regularly. Consider acetaminophen as a pain substitute.' },
    { drug1: 'metformin', drug2: 'aspirin', severity: 'None', effect: 'No significant pharmacokinetic interactions detected.', recommendation: 'Generally safe to take together.' },
    { drug1: 'omeprazole', drug2: 'clopidogrel', severity: 'Major', effect: 'Omeprazole strongly inhibits CYP2C19, preventing metabolic activation of Clopidogrel. Significantly increases risk of recurrent myocardial infarction and ischemic stroke.', recommendation: 'Avoid combination. Consider switching to Pantoprazole or a histamine-2 receptor antagonist (Famotidine) which does not inhibit CYP2C19.' },
    { drug1: 'pantoprazole', drug2: 'clopidogrel', severity: 'Minor', effect: 'Pantoprazole exhibits weak CYP2C19 inhibition compared to Omeprazole, but monitor antiplatelet response.', recommendation: 'Safer proton pump inhibitor option when on Clopidogrel therapy.' },
    { drug1: 'sildenafil', drug2: 'nitroglycerin', severity: 'Contraindicated', effect: 'Co-administration produces massive, life-threatening systemic vasodilation and catastrophic hypotension.', recommendation: 'STRICTLY CONTRAINDICATED. Never take PDE5 inhibitors within 24-48 hours of nitrate medications.' },
    { drug1: 'tadalafil', drug2: 'nitroglycerin', severity: 'Contraindicated', effect: 'Severe, potentially fatal refractory hypotension due to synergistic nitric oxide cGMP pathway amplification.', recommendation: 'STRICTLY CONTRAINDICATED. Allow at least 48 hours between Tadalafil and nitrates.' },
    { drug1: 'simvastatin', drug2: 'clarithromycin', severity: 'Major', effect: 'Clarithromycin potently inhibits CYP3A4, dramatically elevating statin blood plasma concentration. High risk of severe rhabdomyolysis and fatal acute kidney failure.', recommendation: 'Temporarily discontinue statin while taking macrolide antibiotics, or use Azithromycin.' },
    { drug1: 'atorvastatin', drug2: 'clarithromycin', severity: 'Major', effect: 'CYP3A4 inhibition increases Atorvastatin exposure 4-fold. Severe risk of myopathy, muscle breakdown, and hepatic strain.', recommendation: 'Limit Atorvastatin dose to 20mg daily or suspend during antibiotic course.' },
    { drug1: 'tramadol', drug2: 'fluoxetine', severity: 'Major', effect: 'Combined serotonergic activity dramatically increases risk of life-threatening Serotonin Syndrome and lowers the seizure threshold.', recommendation: 'Avoid concomitant use. Monitor for tremors, hyperreflexia, agitation, and hyperthermia.' },
    { drug1: 'tramadol', drug2: 'sertraline', severity: 'Major', effect: 'Dual serotonin reuptake inhibition increases central serotonin toxicity and seizure potential.', recommendation: 'Use non-serotonergic analgesics (e.g. Paracetamol) for acute pain.' },
    { drug1: 'paracetamol', drug2: 'alcohol', severity: 'Major', effect: 'Chronic alcohol consumption induces CYP2E1 enzymes, converting Paracetamol into toxic NAPQI and causing acute liver necrosis.', recommendation: 'Strictly avoid combining alcohol with Paracetamol. Do not exceed 2g daily if drinking.' },
    { drug1: 'acetaminophen', drug2: 'alcohol', severity: 'Major', effect: 'Synergistic hepatotoxicity. High risk of fulminant acute liver failure.', recommendation: 'Avoid alcohol while taking acetaminophen.' },
    { drug1: 'warfarin', drug2: 'ibuprofen', severity: 'Major', effect: 'NSAIDs displace warfarin from albumin, inhibit platelet aggregation, and induce gastric erosions, triggering life-threatening gastrointestinal hemorrhage.', recommendation: 'Avoid NSAIDs completely while on Warfarin. Use Paracetamol for analgesia.' },
    { drug1: 'lisinopril', drug2: 'spironolactone', severity: 'Major', effect: 'Dual potassium-sparing action produces severe hyperkalemia, which can cause fatal cardiac conduction blocks and arrhythmias.', recommendation: 'Strictly monitor serum potassium and renal function within 1-2 weeks of initiation.' },
    { drug1: 'ciprofloxacin', drug2: 'calcium', severity: 'Moderate', effect: 'Cation chelation in the digestive tract prevents up to 90% of fluoroquinolone antibiotic absorption.', recommendation: 'Take Ciprofloxacin at least 2 hours before or 6 hours after dairy or calcium supplements.' },
    { drug1: 'methotrexate', drug2: 'ibuprofen', severity: 'Major', effect: 'NSAIDs reduce renal methotrexate clearance, precipitating bone marrow suppression, leukopenia, and fatal toxicity.', recommendation: 'Avoid NSAIDs during Methotrexate therapy without strict rheumatology supervision.' },
    { drug1: 'lithium', drug2: 'ibuprofen', severity: 'Major', effect: 'NSAIDs decrease renal prostaglandin synthesis, reducing lithium excretion and causing toxic serum accumulation (tremors, ataxia, renal failure).', recommendation: 'Avoid NSAIDs; monitor lithium serum levels closely if co-prescribed.' },
    { drug1: 'digoxin', drug2: 'amiodarone', severity: 'Major', effect: 'Amiodarone inhibits P-glycoprotein, doubling serum Digoxin concentrations and inducing fatal cardiac arrhythmias.', recommendation: 'Reduce Digoxin dosage by 50% when initiating Amiodarone and check serum levels.' },
    { drug1: 'metformin', drug2: 'contrast', severity: 'Major', effect: 'Iodinated radiocontrast agents can cause acute renal failure, precipitating fatal Metformin-associated lactic acidosis (MALA).', recommendation: 'Withhold Metformin at time of radiocontrast procedure and resume 48 hours later after verifying kidney function.' },
    { drug1: 'levothyroxine', drug2: 'calcium', severity: 'Moderate', effect: 'Calcium carbonate binds thyroxine in the gastrointestinal tract, causing clinical hypothyroidism.', recommendation: 'Separate administration of Levothyroxine and calcium supplements by at least 4 hours.' }
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
    const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
    let lastError = null;

    for (const model of models) {
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + apiKey
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error((errorData.error && errorData.error.message) || ("Groq API error (" + response.status + ")"));
            }

            const data = await response.json();
            const text = data.choices[0].message.content;
            return JSON.parse(text);
        } catch (err) {
            lastError = err;
            console.warn("Groq model " + model + " attempt failed:", err.message);
        }
    }
    throw lastError || new Error('Groq AI connection failed.');
};

// --- Smart Local Offline Analysis Engine ---
const runOfflineAnalysis = (input, tab, profile) => {
    // 1. Core Profile Context
    const profileAllergies = (profile.allergies || []).map(a => a.toLowerCase());
    const profileConditions = (profile.conditions || []).map(c => c.toLowerCase());
    
    // Sort dictionary keys by length descending for accurate longest-phrase matching
    const sortedKeys = Object.keys(OFFLINE_INGREDIENTS).sort((a, b) => b.length - a.length);

    // 2. Clean input and tokenize
    let cleanText = input.toLowerCase()
        .replace(/^(ingredients|composition|nutrition\s+facts|contains|ingredients\s*\/|\s*:)+/i, '')
        .replace(/\([ivx\s]+\)/gi, '') // normalize roman numerals e.g. (ii) in INS 503(ii)
        .replace(/\[/g, '(')
        .replace(/\]/g, ')')
        .replace(/[•|\/]/g, ',');

    const tokens = cleanText.split(/[,;\n\(\)\{\}]/)
        .map(t => t.trim()
            .replace(/^and\s+/i, '')
            .replace(/^with\s+/i, '')
            .replace(/^contains\s+/i, '')
            .replace(/^edible\s+/i, '')
            .replace(/\s*\d+(\.\d+)?%\s*/g, '')
            .replace(/\.$/, '')
            .trim()
        )
        .filter(t => t.length > 1 && !/^\d+$/.test(t) && !/^(i|ii|iii|iv|v|vi)$/i.test(t));

    if (tab === TABS.MEDS) {
        // --- Medications offline engine ---
        const activeMeds = tokens.map(t => t.split(/[\s\/\-]+/)[0].toLowerCase());
        const interactions = [];
        let highRiskCount = 0;
        
        for (let i = 0; i < activeMeds.length; i++) {
            for (let j = i + 1; j < activeMeds.length; j++) {
                const m1 = activeMeds[i];
                const m2 = activeMeds[j];
                const match = MED_INTERACTIONS.find(item => 
                    (item.drug1.includes(m1) || m1.includes(item.drug1)) && 
                    (item.drug2.includes(m2) || m2.includes(item.drug2))
                ) || MED_INTERACTIONS.find(item => 
                    (item.drug1.includes(m2) || m2.includes(item.drug1)) && 
                    (item.drug2.includes(m1) || m1.includes(item.drug2))
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
        
        let overallRisk = 'Safe';
        let advice = 'No hazardous drug-to-drug interactions were detected in our offline core clinical dictionary.';
        
        if (highRiskCount >= 2) {
            overallRisk = 'Dangerous';
            advice = 'CRITICAL: Dangerous medication interactions detected. Co-administration poses severe toxicity or adverse clinical risks. Consult your prescribing physician immediately.';
        } else if (highRiskCount === 1) {
            overallRisk = 'Caution';
            advice = 'WARNING: Moderate medication interactions found. May result in reduced therapeutic efficacy, altered blood pressure, or organ stress.';
        }

        if (profileConditions.includes('diabetes') && cleanText.includes('steroid')) {
            interactions.push({
                drug1: 'Steroids',
                drug2: 'Metformin/Insulin',
                severity: 'Major',
                effect: 'Corticosteroids significantly elevate blood glucose levels and counteract anti-diabetic medications.',
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
        let unknownCount = 0;

        tokens.forEach(tok => {
            let matched = false;
            const normTok = tok.toLowerCase().trim();
            if (normTok.length < 2 || /^\d+$/.test(normTok) || /^[^a-z0-9]+$/i.test(normTok)) return;

            // 1. Scan expanded cosmetic DB with sorted keys
            for (const key of sortedKeys) {
                if (normTok.includes(key)) {
                    matched = true;
                    const details = OFFLINE_INGREDIENTS[key];
                    let status = details.status;
                    let deduction = status === 'Avoid' ? 25 : status === 'Concerning' ? 15 : status === 'Harmful' ? 20 : status === 'Moderate' ? 8 : 0;

                    // Skin type specific modifiers
                    if (profile.skinType === 'Oily' && (key.includes('mineral oil') || key.includes('petrolatum') || key.includes('palmitate') || key.includes('dimethicone'))) {
                        deduction += 10; status = 'Avoid';
                        skinTypeWarning = 'Contains heavy comedogenic lipids or silicones which can trap sebum on Oily skin, triggering acne cosmetica.';
                    } else if (profile.skinType === 'Dry' && (key.includes('sls') || key.includes('sulfate') || key.includes('alcohol denat') || key.includes('isopropyl alcohol'))) {
                        deduction += 15; status = 'Avoid';
                        skinTypeWarning = 'Harsh surfactants or drying alcohols detected. Extremely damaging for your Dry skin profile, stripping the natural lipid barrier.';
                    } else if (profile.skinType === 'Sensitive' && (key.includes('fragrance') || key.includes('parfum') || key.includes('acid') || key.includes('paraben'))) {
                        deduction += 10;
                        skinTypeWarning = 'Sensitizing fragrances, harsh acids, or synthetic preservatives detected. High risk of redness and erythema on Sensitive skin.';
                    }

                    totalScore -= deduction;
                    
                    ingredients.push({
                        name: tok.charAt(0).toUpperCase() + tok.slice(1),
                        function: key.includes('paraben') || key.includes('sorbate') || key.includes('hydantoin') ? 'Preservative' : key.includes('sulfate') || key.includes('sls') ? 'Surfactant / Cleanser' : key.includes('acid') ? 'Active Exfoliant / Acid' : key.includes('oil') || key.includes('butter') ? 'Emollient / Lipid' : 'Cosmetic Active',
                        status,
                        reason: details.reason,
                        comedogenic: key.includes('mineral oil') || key.includes('petrolatum') || key.includes('palmitate') || key.includes('dimethicone'),
                        endocrineDisruptor: key.includes('paraben') || key.includes('phthalate') || key.includes('oxybenzone') || key.includes('octinoxate'),
                        healthySubstitute: details.substitute
                    });

                    if (status === 'Avoid' || status === 'Concerning' || status === 'Harmful') topConcerns.push(tok.toUpperCase() + ": " + details.reason.slice(0, 60) + "...");
                    else if (status === 'Safe') positives.push(tok.charAt(0).toUpperCase() + tok.slice(1));
                    break;
                }
            }

            // 2. Smart Heuristic Regex Engine for Skincare
            if (!matched) {
                let status = 'Unknown';
                let reason = 'Ingredient not recognized in local INCI database. May require Deep AI Scan.';
                let deduction = 0;
                let func = 'Formulation Base';
                let comedogenic = false;
                let edc = false;

                if (/paraben|phthalate|triclosan|pf[ao]s|formaldehyd|hydantoin|urea\b/i.test(normTok)) {
                    status = 'Avoid'; reason = 'Heuristically identified as a toxic preservative, formaldehyde donor, or endocrine disruptor. Avoid prolonged dermal absorption.';
                    deduction = 25; func = 'Toxic Preservative / EDC'; edc = true;
                } else if (/sulfate|sls|sles|peg-|steareth|ceteareth|polysorbate/i.test(normTok)) {
                    status = 'Concerning'; reason = 'Heuristically identified as an ethoxylated surfactant or harsh cleanser. Risk of 1,4-dioxane traces and epidermal barrier stripping.';
                    deduction = 15; func = 'Surfactant / Emulsifier';
                } else if (/oxybenzone|octinoxate|homosalate|avobenzone|octocrylene/i.test(normTok)) {
                    status = 'Avoid'; reason = 'Chemical UV filter flagged for systemic endocrine disruption and photo-degradation.';
                    deduction = 20; func = 'Chemical UV Filter'; edc = true;
                } else if (/oil|butter|wax|dimethicone|siloxane|petrolat/i.test(normTok)) {
                    func = 'Emollient / Occlusive';
                    if (profile.skinType === 'Oily') {
                        status = 'Concerning'; reason = 'Heuristically identified as a heavy lipid or silicone. High risk of clogging pores on Oily skin.';
                        deduction = 10; comedogenic = true; skinTypeWarning = 'Heavy oils/silicones detected. May cause acne cosmetica on Oily skin.';
                    } else {
                        status = 'Safe'; reason = 'Moisturizing lipid barrier component.';
                    }
                } else if (/acid\b/i.test(normTok)) {
                    func = 'Active Chemical Acid';
                    if (profile.skinType === 'Sensitive') {
                        status = 'Moderate'; reason = 'Chemical acid detected. May provoke barrier stinging or erythema on Sensitive skin profiles.';
                        deduction = 8; skinTypeWarning = 'Active chemical acids detected. Use with caution on Sensitive skin.';
                    } else {
                        status = 'Moderate'; reason = 'Active chemical exfoliant. Requires sun protection during daytime.';
                        deduction = 4;
                    }
                } else if (/fragrance|parfum|perfume|aroma/i.test(normTok)) {
                    status = 'Concerning'; reason = 'Synthetic fragrance mixture. High potential for contact allergies and hidden phthalates.';
                    deduction = 15; func = 'Sensitizing Fragrance';
                } else if (/alcohol\b|ethanol\b|isoprop/i.test(normTok) && !/cetyl|stearyl|cetearyl/i.test(normTok)) {
                    status = 'Concerning'; reason = 'Astringent drying alcohol. Strips epidermal lipids and disrupts barrier function.';
                    deduction = 15; func = 'Drying Alcohol';
                } else if (/extract|water|aqua|glycerin|juice|distillate|hydrosol|cica|ceramide|squalane|panthenol|allantoin/i.test(normTok)) {
                    status = 'Safe'; reason = 'Clean botanical hydration or skin-identical restorative active.';
                } else {
                    unknownCount++;
                    deduction = 3;
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

                if (status === 'Avoid' || status === 'Concerning' || status === 'Harmful') topConcerns.push(tok.toUpperCase() + ": " + reason.slice(0, 60) + "...");
                else if (status === 'Safe') positives.push(tok.charAt(0).toUpperCase() + tok.slice(1));
            }
        });

        if (unknownCount >= 3 && totalScore > 75) {
            totalScore = 75;
        }

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
            skinTypeWarning: skinTypeWarning || ('Ingredients align appropriately with your ' + (profile.skinType || 'skin') + ' type.'),
            summary: "Skin Safety score evaluated at " + score + "/100. Local analysis completed using expanded INCI databases."
        };
    }

    if (tab === TABS.MENU) {
        // --- Restaurant Menu offline decoder ---
        const dishes = tokens.map(dish => {
            let calories = 350;
            let macros = { protein: '15g', carbs: '35g', fat: '14g' };
            let score = 70;
            let suitable = true;
            let reason = 'Standard restaurant preparation. Enjoy in moderation with mindful portions.';
            let substitute = '';
            let allergens = [];

            const name = dish.toLowerCase();

            // Allergen alerts
            if (profileAllergies.includes('nuts') && (name.includes('nut') || name.includes('peanut') || name.includes('cashew') || name.includes('almond') || name.includes('pesto') || name.includes('walnut'))) {
                score -= 50; suitable = false; allergens.push('Nuts');
                reason = 'CRITICAL ALLERGY ALERT: Contains nuts. Severe anaphylaxis risk under active Nuts allergy setting.';
                substitute = 'Request a completely nut-free seed alternative.';
            }
            if (profileAllergies.includes('dairy') && (name.includes('cheese') || name.includes('paneer') || name.includes('butter') || name.includes('cream') || name.includes('alfredo') || name.includes('fondue') || name.includes('milkshake'))) {
                score -= 50; suitable = false; allergens.push('Dairy');
                reason = 'CRITICAL ALLERGY ALERT: Dairy components detected under active Dairy allergy setting.';
                substitute = 'Request dairy-free / vegan preparation without butter or cheese.';
            }

            // Food category grading
            if (/fries|fried|crispy|tempura|nuggets|wings|fritters|pakora|samosa|puri|bhatura|chole bhature|chips|spring roll/i.test(name)) {
                calories = 580; macros = { protein: '8g', carbs: '65g', fat: '32g' };
                score = 30; suitable = false;
                reason = 'Deep fried item loaded with high oxidized saturated/trans fats and inflammatory thermal lipids.';
                substitute = 'Choose roasted, air-fried, or grilled alternatives with salsa or hummus.';
            } else if (/cake|brownie|lava|sundae|ice cream|gelato|donut|doughnut|churros|cheesecake|muffin|gulab jamun|jalebi|halwa|pastry|waffle|pancake|pudding/i.test(name)) {
                calories = 520; macros = { protein: '5g', carbs: '78g', fat: '24g' };
                score = 25; suitable = false;
                reason = 'High sugar density confectionery. Provokes steep insulin spikes, visceral adiposity, and metabolic stress.';
                substitute = 'Fresh seasonal fruit bowl, berries, or sugar-free Greek yogurt.';
            } else if (/bacon|sausage|pepperoni|salami|hot dog|chorizo|ham/i.test(name)) {
                calories = 460; macros = { protein: '18g', carbs: '4g', fat: '42g' };
                score = 35; suitable = false;
                reason = 'Processed cured meat containing nitrates, high sodium, and pro-inflammatory saturated fats.';
                substitute = 'Fresh grilled chicken breast, roasted turkey, or wild-caught fish.';
            } else if (/cocktail|beer|wine|whiskey|vodka|soda|cola|shake|frappe|sweet tea/i.test(name)) {
                calories = 300; macros = { protein: '1g', carbs: '48g', fat: '6g' };
                score = 25; suitable = false;
                reason = 'Concentrated liquid sugar and/or alcohol. High empty calories that elevate hepatic triglycerides.';
                substitute = 'Sparkling mineral water with fresh lime or unsweetened green tea.';
            } else if (/pasta|pizza|burger|naan|roti|noodles|lasagna|quesadilla|tacos|mac and cheese/i.test(name)) {
                calories = 620; macros = { protein: '18g', carbs: '80g', fat: '26g' };
                score = 45;
                if (profileConditions.includes('diabetes')) {
                    suitable = false; score = 25;
                    reason = 'Extremely high refined carbohydrate load. Triggers dangerous postprandial glycemic excursions.';
                    substitute = 'Zucchini noodles, lettuce-wrapped burger, or cauliflower crust.';
                } else {
                    reason = 'High refined starch and caloric density. Limit portion size and balance with fiber.';
                    substitute = 'Whole wheat or high-protein alternative.';
                }
            } else if (/salad|soup|sprouts|grilled|steamed|roasted|quinoa|bowl|tofu|paneer|chicken breast|fish|salmon|lentil|dal|greens|broccoli/i.test(name)) {
                calories = 320; macros = { protein: '26g', carbs: '18g', fat: '12g' };
                score = 92; suitable = true;
                reason = 'Nutrient-rich, fiber-dense clean whole food supporting steady glycemic and metabolic balance.';
                substitute = 'Ask for dressing or sauces on the side to restrict excess sodium and seed oils.';
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
            topPicks: safeDishes.length ? safeDishes.slice(0, 3) : ['Fresh Garden Salad with Grilled Protein'],
            avoid: unsafeDishes.length ? unsafeDishes.slice(0, 3) : ['Refined flour pastas or deep-fried sides'],
            generalAdvice: 'Prioritize clean grilled or steamed proteins and fiber-rich greens. Steer clear of deep-fried preparations and sugary dessert finishers.'
        };
    }

    // --- FOOD INGREDIENTS/NUTRITION offline engine ---
    let totalScore = 100;
    const ingredients = [];
    const allergenAlerts = [];
    const concerns = [];
    const positives = [];
    let personalizedWarning = '';
    let unknownCount = 0;

    tokens.forEach(tok => {
        let matched = false;
        const normTok = tok.toLowerCase().trim();

        // Noise filtering
        if (normTok.length < 2 || /^\d+$/.test(normTok) || /^[^a-z0-9]+$/i.test(normTok)) return;

        // 1. High-risk allergens first
        if (profileAllergies.includes('nuts') && (normTok.includes('peanut') || normTok.includes('almond') || normTok.includes('cashew') || normTok.includes('walnut') || normTok.includes('hazelnut') || normTok.includes('pistachio') || normTok.includes('nut'))) {
            totalScore -= 45;
            allergenAlerts.push('Nuts');
            personalizedWarning = "CRITICAL ALLERGY ALERT: Found matching nut components (" + tok + ") which poses severe systemic anaphylaxis risk under your Nuts allergy setting.";
            
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

        if (profileAllergies.includes('dairy') && (normTok.includes('milk') || normTok.includes('cheese') || normTok.includes('butter') || normTok.includes('whey') || normTok.includes('lactose') || normTok.includes('cream') || normTok.includes('casein') || normTok.includes('curd') || normTok.includes('ghee'))) {
            totalScore -= 35;
            allergenAlerts.push('Dairy');
            personalizedWarning = "Dairy allergen detected (" + tok + "). May trigger immediate digestive, inflammatory, or severe immune reactions under active Dairy allergy.";
            
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

        if (profileAllergies.includes('gluten') && (normTok.includes('wheat') || normTok.includes('maida') || normTok.includes('barley') || normTok.includes('rye') || normTok.includes('malt') || normTok.includes('gluten') || normTok.includes('semolina') || normTok.includes('atta'))) {
            totalScore -= 40;
            allergenAlerts.push('Gluten');
            personalizedWarning = "Gluten-containing grain detected (" + tok + "). Can trigger severe celiac intestinal damage or systemic non-celiac gluten sensitivity.";
            
            ingredients.push({
                name: tok.charAt(0).toUpperCase() + tok.slice(1),
                status: 'Extremely Harmful',
                reason: 'Gluten-containing grain conflicting with active Gluten intolerance/Celiac profile.',
                dailyLimitExceeded: true,
                limitInfo: 'GLUTEN INTOLERANCE WARNING',
                healthySubstitute: 'Almond flour, coconut flour, or buckwheat.'
            });
            return;
        }

        // 2. Scan exact expanded dictionary with sorted keys
        for (const key of sortedKeys) {
            if (normTok.includes(key)) {
                matched = true;
                const details = OFFLINE_INGREDIENTS[key];
                let status = details.status;
                let deduction = status === 'Extremely Harmful' ? 25 : status === 'Harmful' ? 15 : status === 'Concerning' ? 12 : status === 'Moderate' ? 6 : 0;
                let limitExceeded = false;
                let limitInfo = '';

                if (profileConditions.includes('diabetes') && (key.includes('sugar') || key.includes('syrup') || key.includes('glucose') || key.includes('dextrose') || key.includes('maltodextrin') || key.includes('fructose') || key.includes('maida') || key.includes('flour'))) {
                    deduction *= 2; status = 'Extremely Harmful'; limitExceeded = true;
                    limitInfo = 'CRITICAL LIMIT EXCEEDED FOR DIABETIC METABOLISM';
                    personalizedWarning = "High glycemic ingredient (" + tok.toUpperCase() + ") found. Poses immediate risks of severe postprandial glucose surges under Diabetes profile.";
                }

                if (profileConditions.includes('hypertension') && (key.includes('sodium') || key.includes('salt') || key.includes('msg') || key.includes('nitrite') || key.includes('nitrate'))) {
                    deduction *= 2; status = 'Harmful'; limitExceeded = true;
                    limitInfo = 'SODIUM LIMIT WARNING FOR HYPERTENSIVE ARTERIAL PRESSURES';
                    personalizedWarning = "Sodium-concentrated additive discovered. Exerts immediate fluid retention pressures under Hypertension.";
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

                if (status === 'Extremely Harmful' || status === 'Harmful' || status === 'Concerning') concerns.push(tok.toUpperCase() + ": " + details.reason.slice(0, 60) + "...");
                else if (status === 'Safe') positives.push(tok.charAt(0).toUpperCase() + tok.slice(1));
                break;
            }
        }

        // 3. Smart Heuristic Regex Engine (Fallback for Unknowns)
        if (!matched) {
            let status = 'Unknown';
            let reason = 'Ingredient not recognized in local offline dictionary. May require Deep AI Scan.';
            let deduction = 0;
            let limitExceeded = false;
            let limitInfo = '';
            let substitute = '';

            // Sugars & Sweeteners
            if (/ose\b|itol\b|syrup|sweetener|honey|nectar|jaggery/i.test(normTok)) {
                status = 'Harmful';
                reason = 'Identified heuristically as a refined sugar, sugar alcohol, or concentrated sweetener. Triggers insulin and metabolic demand.';
                deduction = 12;
                substitute = 'Organic Stevia or Monk Fruit extract.';
                if (profileConditions.includes('diabetes')) {
                    status = 'Extremely Harmful'; deduction = 25; limitExceeded = true;
                    limitInfo = 'DIABETIC CARBOHYDRATE THRESHOLD DANGER';
                }
            } 
            // Uncataloged INS / E numbers
            else if (/(ins|e)\s*[-]?\s*\d+/i.test(normTok)) {
                status = 'Harmful';
                reason = 'Identified as an industrial chemical additive or preservative code (INS/E number). Processed additive with potential digestive sensitivity.';
                deduction = 12;
                substitute = 'Fresh whole foods without synthetic food numbers.';
            }
            // Preservatives & Chemical Acids
            else if (/(benzoat|sorbat|nitrit|nitrat|sulfit|sulfat|propionat|preservative|antioxidant)/i.test(normTok)) {
                status = 'Harmful';
                reason = 'Identified heuristically as a synthetic chemical preservative or antioxidant. Can disrupt intestinal microbiome balance.';
                deduction = 12;
                substitute = 'Clean, minimally processed organic alternatives.';
            }
            // Artificial Flavors & Enhancers
            else if (/(flavour|flavor|aroma|enhancer|glutamate|ribonucleotide)/i.test(normTok)) {
                status = 'Harmful';
                reason = 'Identified heuristically as a synthetic flavor compound or excitotoxic taste enhancer designed to hyper-palatalize processed food.';
                deduction = 10;
                substitute = 'Natural culinary spices and fresh herbs.';
            }
            // Artificial Colors & Dyes
            else if (/(color|colour|dye|lake\b|pigment|yellow|red|blue)/i.test(normTok) && !/beet|carrot|berry|turmeric|paprika/i.test(normTok)) {
                status = 'Harmful';
                reason = 'Identified heuristically as an artificial synthetic dye or lake color. Associated with behavioral changes and cellular inflammation.';
                deduction = 15;
                substitute = 'Natural fruit or vegetable colorings.';
            }
            // Emulsifiers & Thickeners
            else if (/(emulsifi|thickener|stabiliz|gum\b|carrageenan|lecithin|polysorbate|cellulose)/i.test(normTok)) {
                status = 'Moderate';
                reason = 'Identified heuristically as an industrial food emulsifier or thickener. May alter mucosal lining and gut microbiota.';
                deduction = 6;
                substitute = 'Natural dietary pectin or chia seeds.';
            }
            // Salts & Sodium
            else if (/(sodium|potassium|chloride|salt\b|salts\b)/i.test(normTok)) {
                status = 'Safe';
                reason = 'Dietary mineral salt compound detected.';
                if (profileConditions.includes('hypertension')) {
                    status = 'Harmful'; deduction = 15; limitExceeded = true;
                    limitInfo = 'HYPERTENSION SODIUM WARNING';
                }
            }
            // Healthy Whole Food Bases
            else if (/(extract|juice|water|puree|flour|meal|seed|nut|bean|lentil|leaf|vegetable|fruit|herb|spice)/i.test(normTok) && !/bleached|refined|modified/i.test(normTok)) {
                status = 'Safe';
                reason = 'Natural agricultural plant or whole-food base ingredient.';
            }
            else {
                unknownCount++;
                deduction = 4;
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
            
            if (status === 'Extremely Harmful' || status === 'Harmful' || status === 'Concerning') concerns.push(tok.toUpperCase() + ": " + reason.slice(0, 60) + "...");
            else if (status === 'Safe') positives.push(tok.charAt(0).toUpperCase() + tok.slice(1));
        }
    });

    if (unknownCount >= 3 && totalScore > 75) {
        totalScore = 75;
    }

    const score = Math.max(0, Math.min(100, totalScore));
    let overallRating = 'Safe';
    if (score < 40) overallRating = 'Extremely Harmful';
    else if (score < 60) overallRating = 'Harmful';
    else if (score < 80) overallRating = 'Moderate';

    return {
        productName: tokens[0] ? tokens[0].toUpperCase() + ' - Scanned Product' : 'Product Analysis',
        overallScore: score,
        overallRating,
        nutriscoreGrade: score > 85 ? 'A' : score > 70 ? 'B' : score > 50 ? 'C' : score > 35 ? 'D' : 'E',
        personalizedWarning: personalizedWarning || (score < 60 ? 'Multiple health-risk ingredients detected violating metabolic wellness standards.' : ''),
        ingredients,
        nutritionFlags: [
            { nutrient: 'Sugar / Carbs', value: cleanText.includes('sugar') || cleanText.includes('syrup') || cleanText.includes('glucose') ? 'High' : 'Normal', flag: cleanText.includes('sugar') || cleanText.includes('syrup') || cleanText.includes('glucose') ? 'danger' : 'ok', note: 'Checked locally.' },
            { nutrient: 'Sodium / Salts', value: cleanText.includes('sodium') || cleanText.includes('salt') ? 'Moderate-High' : 'Low', flag: cleanText.includes('sodium') || cleanText.includes('salt') ? 'warning' : 'ok', note: 'Standard dietary thresholds.' }
        ],
        allergenAlert: allergenAlerts,
        topConcerns: concerns.slice(0, 3),
        positives: positives.slice(0, 3),
        overallSubstituteSuggestion: score < 70 ? 'Replace with clean, minimally processed organic whole foods.' : 'Excellent choice! Nutritional values align fully with your health guard goals.',
        summary: "Personalized safety score rated at " + score + "/100. Scanned via enhanced offline databases."
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
        'Concerning': 'bg-brand-amber/10 text-brand-amber border-brand-amber/20 hover:bg-brand-amber/15',
        'Unknown': 'bg-slate-800/40 text-slate-300 border-slate-700/50 hover:bg-slate-800/60'
    };

    const isAlert = item.status === 'Harmful' || item.status === 'Extremely Harmful' || item.status === 'Avoid' || item.status === 'Concerning';
    const isUnknown = item.status === 'Unknown';

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
                    ) : isUnknown ? (
                        <div className="w-5 h-5 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <Icon name="search" className="w-3.5 h-3.5" />
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
            // Run instant offline analysis across all tabs
            const localResult = runOfflineAnalysis(inputData, activeTab, profile);
            
            // Check if AI Deep Scan is helpful
            let hasUnknowns = false;
            if (localResult.ingredients && localResult.ingredients.some(i => i.status === 'Unknown')) {
                hasUnknowns = true;
            }
            localResult.needsAI = hasUnknowns;

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
                        <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center shadow-inner overflow-hidden border border-brand-teal/20">
                            <img src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${profile.name || 'User'}&backgroundColor=0f172a,1e293b&radius=50`} alt="Profile" className="w-full h-full object-cover p-1" />
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
