import { MarketPrice, GovScheme, EducationalGuide, SmartAlert, ForumPost } from "../types";

// Supported districts in Karnataka for our specific focus
export const FOCUS_DISTRICTS = [
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Kolar",
  "Chikkaballapur",
  "Tumakuru",
  "Ramanagara",
  "Mandya",
  "Mysuru",
  "Hassan"
];

// District APMC Markets mappings
export const DISTRICT_MARKETS: { [key: string]: string[] } = {
  "Bengaluru Urban": ["Yeshwanthpur APMC", "K.R. Market", "Binny Mill Market"],
  "Bengaluru Rural": ["Doddaballapur APMC", "Devanahalli Veg Market", "Nelamangala APMC"],
  "Kolar": ["Kolar APMC (Veg & Tomato)", "Bangarapet Market", "Mulbagal APMC"],
  "Chikkaballapur": ["Chikkaballapur APMC", "Sidlaghatta Silk Cocoon Market", "Gauribidanur APMC"],
  "Tumakuru": ["Tumakuru APMC", "Tiptur APMC (Coconut)", "Madhugiri Market"],
  "Ramanagara": ["Ramanagara Cocoon Market", "Channapatna Veg Market", "Magadi APMC"],
  "Mandya": ["Mandya APMC (Jaggery & Veg)", "Maddur Vegetable Market", "Srirangapatna Market"],
  "Mysuru": ["Mysuru Bandipalya APMC", "Devaraja Market", "Nanjangud APMC"],
  "Hassan": ["Hassan APMC (Potato & Spices)", "Arsikere APMC (Coconut)", "Sakleshpur Cardamom Market"]
};

// Crops list across categories
export const CROP_LIST = [
  { name: "Tomato", category: "Vegetables" },
  { name: "Onion", category: "Vegetables" },
  { name: "Potato", category: "Vegetables" },
  { name: "Carrot", category: "Vegetables" },
  { name: "Green Chilli", category: "Vegetables" },
  { name: "Cabbage", category: "Vegetables" },
  { name: "Mango (Alphonso)", category: "Fruits" },
  { name: "Banana (Yelakki)", category: "Fruits" },
  { name: "Papaya", category: "Fruits" },
  { name: "Paddy (Rice)", category: "Cereals" },
  { name: "Ragi (Finger Millet)", category: "Cereals" },
  { name: "Maize (Corn)", category: "Cereals" },
  { name: "Tur / Arhar Dal", category: "Pulses" },
  { name: "Bengal Gram (Chana Dal)", category: "Pulses" },
  { name: "Green Gram (Moong)", category: "Pulses" }
];

// Generate synthetic but highly representative current prices
export const generateMarketPrices = (): MarketPrice[] => {
  const prices: MarketPrice[] = [];
  const basePrices: { [crop: string]: number } = {
    "Tomato": 3200, // per quintal modal
    "Onion": 2400,
    "Potato": 1800,
    "Carrot": 3500,
    "Green Chilli": 4500,
    "Cabbage": 1200,
    "Mango (Alphonso)": 9500,
    "Banana (Yelakki)": 4800,
    "Papaya": 2200,
    "Paddy (Rice)": 2800,
    "Ragi (Finger Millet)": 3600,
    "Maize (Corn)": 2100,
    "Tur / Arhar Dal": 7200,
    "Bengal Gram (Chana Dal)": 6000,
    "Green Gram (Moong)": 8100
  };

  const today = new Date().toISOString().split("T")[0];

  Object.entries(DISTRICT_MARKETS).forEach(([district, markets]) => {
    markets.forEach((market) => {
      CROP_LIST.forEach(({ name, category }) => {
        // Deterministic but distinct price multiplier based on string hashes
        const hash = (district.length * 3 + market.length * 7 + name.length * 11) % 15;
        const multiplier = 0.85 + (hash / 50); // range 0.85 to 1.15

        const base = basePrices[name];
        const modal = Math.round(base * multiplier);
        const min = Math.round(modal * 0.9);
        const max = Math.round(modal * 1.12);

        prices.push({
          id: `${district.replace(/\s+/g, "")}-${market.replace(/\s+/g, "")}-${name.replace(/\s+/g, "")}`,
          cropName: name,
          category: category as any,
          market,
          district,
          date: today,
          minPrice: min,
          maxPrice: max,
          modalPrice: modal
        });
      });
    });
  });

  return prices;
};

// Seed initial government schemes
export const INITIAL_SCHEMES: GovScheme[] = [
  {
    id: "scheme-1",
    name: "Krishi Bhagya Scheme (Karnataka)",
    benefits: "Provides up to 80% to 90% subsidy on rainwater harvesting farm ponds (Krishi Honda), polythene lining, diesel pumpsets, and drip irrigation units.",
    eligibility: "Farmers in rain-fed agricultural regions of Karnataka.",
    requiredDocuments: ["Pahani (RTC) Land Record", "Aadhaar Card", "Bank Passbook", "Caste Certificate (for OBC/SC/ST extra benefit)"],
    applyLink: "https://krishibhagya.karnataka.gov.in",
    category: "Irrigation & Rainwater",
    subsidyPercentage: 90,
    maxLandRequirement: 5,
    farmerCategories: ["SC", "ST", "Small Farmer", "Marginal Farmer"]
  },
  {
    id: "scheme-2",
    name: "Karnataka Raitha Vidya Nidhi",
    benefits: "Scholarship of ₹2,000 to ₹11,000 per year directly to the bank accounts of children of farmers pursuing higher education.",
    eligibility: "Children of registered farmers in Karnataka enrolled in recognized colleges.",
    requiredDocuments: ["Farmer ID (FID) Certificate", "Aadhaar of student and parent", "College Fee Receipt & ID Card", "Previous Marksheet"],
    applyLink: "https://ssp.postmatric.karnataka.gov.in",
    category: "Financial Support & Welfare",
    subsidyPercentage: 100,
    farmerCategories: ["General", "OBC", "SC", "ST", "Small Farmer", "Marginal Farmer"]
  },
  {
    id: "scheme-3",
    name: "PM-KISAN Samman Nidhi",
    benefits: "Guaranteed income support of ₹6,000 per year, paid in three equal installments of ₹2,000 directly into the bank account.",
    eligibility: "Small and marginal farmer families with combined landholding of up to 2 hectares.",
    requiredDocuments: ["Land RTC / Pahani", "Aadhaar Card", "Bank Account Details", "Mobile Number linked with Aadhaar"],
    applyLink: "https://pmkisan.gov.in",
    category: "Income Support",
    subsidyPercentage: 100,
    maxLandRequirement: 4.94, // 2 hectares in acres
    farmerCategories: ["Small Farmer", "Marginal Farmer"]
  },
  {
    id: "scheme-4",
    name: "Subaji Solar Pump Scheme (Surya Raitha)",
    benefits: "Provides 90% subsidy for installation of solar water pumpsets up to 10 HP to reduce dependence on grid power.",
    eligibility: "All farmers with clear land ownership and borewell setup.",
    requiredDocuments: ["Borewell feasibility report", "Land RTC", "NOC from BESCOM / Local ESCOM", "Farmer Passport Photo"],
    applyLink: "https://bescom.karnataka.gov.in",
    category: "Irrigation & Green Power",
    subsidyPercentage: 90,
    minLandRequirement: 0.5,
    farmerCategories: ["General", "OBC", "SC", "ST", "Small Farmer", "Marginal Farmer"]
  },
  {
    id: "scheme-5",
    name: "Organic Farming Support / Savayava Bhagya",
    benefits: "Capital package of ₹20,000 per hectare for transitioning to certified organic crop farming, including bio-fertilizers supply.",
    eligibility: "Farmers willing to register in regional organic clusters.",
    requiredDocuments: ["RTC Pahani Copy", "Organic Cluster Membership ID", "Soil Health Card"],
    applyLink: "https://raitamitra.karnataka.gov.in",
    category: "Organic Farming",
    subsidyPercentage: 75,
    farmerCategories: ["General", "OBC", "SC", "ST", "Small Farmer", "Marginal Farmer"]
  }
];

// Seed initial educational guides
export const INITIAL_GUIDES: EducationalGuide[] = [
  {
    id: "guide-1",
    title: "Precision Irrigation & Water-saving Techniques",
    description: "Learn how to optimize water use utilizing soil-moisture responsive drip nets, automating valves, and creating micro-basins appropriate for dry land of Kolar and Chikkaballapur.",
    category: "Irrigation",
    type: "video3d",
    url: "https://example.com/3d/irrigation",
    duration: "10 mins",
    author: "Dr. K. Swaminathan (UHS Bagalkot)",
    fileSize: "Interactive 3D Simulation"
  },
  {
    id: "guide-2",
    title: "Zero Budget Natural Farming (ZBNF) Manual",
    description: "Complete PDF blueprint for preparing Jeevamrutha, Beejamrutha, and implementing natural pest repellent systems for healthy organic paddy and maize, maximizing soil microbes.",
    category: "Organic Farming",
    type: "document",
    url: "https://raitamitra.karnataka.gov.in/info-2/Savayava+Krishi/en",
    author: "Padma Shri Subhash Palekar",
    fileSize: "4.2 MB PDF"
  },
  {
    id: "guide-3",
    title: "Eco-Friendly Pest Management for Vegetables",
    description: "Interactive guide to identifying early leaf blight in Tomato and tuber moth in Potato. Features preventative bio-insecticides, pheromone traps, and inter-cropping guidelines.",
    category: "Pest Control",
    type: "video2d",
    url: "https://www.youtube.com/embed/jB5CMy_bMGA",
    duration: "12 mins",
    author: "GKVK Entomological Department, Bengaluru",
    fileSize: "Online Video"
  },
  {
    id: "guide-4",
    title: "Smart Greenhouse & Micro-climate Farming",
    description: "3D virtual reality walkthrough of automatic climate-controlled polyhouses. See how sensor clusters adjust shadow screens and fans to grow high-value bell peppers and orchids.",
    category: "Smart Farming",
    type: "video3d",
    url: "https://example.com/3d/greenhouse",
    duration: "Interactive",
    author: "AgriConnect Tech Lab, Bengaluru Rural",
    fileSize: "Interactive 3D Model"
  }
];

// Seed initial smart alerts
export const INITIAL_ALERTS: SmartAlert[] = [
  {
    id: "alert-1",
    title: "Tomato Price Surge Alert in Kolar APMC",
    description: "Tomato modal price increased by 22% in Kolar APMC due to supply constraints. Current modal price ₹4,100 per quintal. High sell recommendation.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    level: "success",
    category: "price"
  },
  {
    id: "alert-2",
    title: "Heavy Rainfall Warning: Bengaluru & Ramanagara",
    description: "Indian Meteorological Department (IMD) predicts thunderous rainfall (70-110mm) over Channapatna and Kanakapura. Avoid dynamic pesticide sprays in the next 48 hours.",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    read: false,
    level: "danger",
    category: "weather"
  },
  {
    id: "alert-3",
    title: "New Government Scheme Application Open",
    description: "Krishi Bhagya scheme subsidies for rainwater harvesting tanks are open for registration on state portal. Check your eligibility in your dashboard.",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    read: true,
    level: "info",
    category: "scheme"
  }
];

// Seed initial community posts
export const INITIAL_FORUMS: ForumPost[] = [
  {
    id: "forum-1",
    author: "Shanthappa Gowda",
    district: "Mandya",
    role: "Farmer",
    crop: "Paddy (Rice)",
    content: "Our organic Basmati yields have improved significantly by using Jeevamrutha feed every 15 days instead of heavy urea. Has anyone around Mysuru/Mandya started selling directly to urban organic aggregators in Bengaluru? What are the current rates?",
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    likes: 12,
    replies: [
      {
        id: "rep-1",
        author: "Prasanna Kumar",
        role: "Agronomist",
        content: "Yes, Shanthappa. Urban aggregators such as Organic Mandya are sourcing good quality pesticide-free basmati at ₹4,200 - ₹4,500 per quintal directly. Make sure you have your cluster certification ready.",
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        id: "rep-2",
        author: "Nithin Kumar",
        role: "Farmer",
        content: "I am from Maddur, we also tried Basmati this year and got excellent results. Let's merge our volume to negotiate better freight charges with transport agents for Yeshwanthpur deliveries.",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ]
  },
  {
    id: "forum-2",
    author: "Manjula Reddy",
    district: "Chikkaballapur",
    role: "Farmer",
    crop: "Tomato",
    content: "Blossom end rot is popping up on my winter tomato crop. I suspect a calcium deficiency or improper watering. Sidlaghatta borewell water has high TDS. Any recommendations on soluble calcium nitrate feeds?",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    likes: 8,
    replies: [
      {
        id: "rep-3",
        author: "Dr. Anand Gowda",
        role: "Agronomist",
        content: "Manjula, blossom end rot is indeed caused by poor calcium translocation. Spray soluble Calcium Nitrate (Aero-Cal) @ 5g per liter during early morning. Maintain steady soil moisture; drying out makes it worse, even if TDS is high.",
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString()
      }
    ]
  }
];
