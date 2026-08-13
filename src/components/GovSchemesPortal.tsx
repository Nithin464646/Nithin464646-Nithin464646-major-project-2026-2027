import React, { useState, useEffect } from "react";
import { Award, FileText, CheckCircle2, ArrowUpRight, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { GovSchemeRecommendation, User, Language } from "../types";
import { getTranslation } from "../utils/translations";

interface GovSchemesPortalProps {
  userProfile: User | null;
  currentLanguage?: Language;
}

export default function GovSchemesPortal({ userProfile, currentLanguage = Language.ENGLISH }: GovSchemesPortalProps) {
  const t = (key: string) => getTranslation(currentLanguage, key);

  const [recommendations, setRecommendations] = useState<GovSchemeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Schemes");
  
  // Wizard input state with unit support
  const [wizardLand, setWizardLand] = useState(userProfile?.landSize || 2.4);
  const [wizardUnit, setWizardUnit] = useState<"acres" | "hectares">("acres");
  const [wizardCategory, setWizardCategory] = useState(userProfile?.category || "Small Farmer");
  const [wizardCrops, setWizardCrops] = useState(userProfile?.cropsGrown?.join(", ") || "Tomato, Ragi");

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const userId = userProfile?.id || "";
      const res = await fetch(`/api/schemes/recommend?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecommendations(data);
      } else {
        console.error("Schemes response is not an array:", data);
        setRecommendations([]);
      }
    } catch (e) {
      console.error(e);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecommendations(); }, [userProfile]);

  const runLocalWizardEvaluator = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const res = await fetch("/api/schemes/recommend");
        const allSchemes = await res.json();
        if (Array.isArray(allSchemes)) {
          // Normalize land size to acres
          const landAcres = wizardUnit === "hectares" ? Number(wizardLand) * 2.471 : Number(wizardLand);
          const isScSt = ["SC", "ST"].includes(wizardCategory);

          const scored: GovSchemeRecommendation[] = allSchemes.map((scheme: any) => {
            let score = 50;
            const reasons: string[] = [];
            let applicableSubsidy = scheme.subsidyPercentage || 80;
            let eligible = true;

            const maxLimit = scheme.maxLandRequirementAcres || scheme.maxLandRequirement || 5.0;
            const minLimit = scheme.minLandRequirement || 0;

            // 1. Hard cutoff for land eligibility
            if (maxLimit && landAcres > maxLimit) {
              eligible = false;
              score = 0;
              reasons.push(`Ineligible: Land size (${landAcres.toFixed(1)} acres) exceeds maximum limit of ${maxLimit} acres (2.0 hectares)`);
            } else if (minLimit && landAcres < minLimit) {
              eligible = false;
              score = 0;
              reasons.push(`Ineligible: Minimum land required is ${minLimit} acres`);
            } else {
              score += 15;
              reasons.push(`Land size (${landAcres.toFixed(1)} acres) is within eligible threshold`);
            }

            // 2. Category tier weighting & dynamic subsidy resolution
            if (eligible) {
              if (scheme.subsidyTiers) {
                if (isScSt) {
                  applicableSubsidy = scheme.subsidyTiers.scSt; // 90%
                  score += 25;
                  reasons.push(`SC/ST category — qualifies for ${applicableSubsidy}% subsidy tier`);
                } else {
                  applicableSubsidy = scheme.subsidyTiers.generalObcSmallMarginal; // 80%
                  score += 20;
                  reasons.push(`${wizardCategory} — qualifies for ${applicableSubsidy}% subsidy tier`);
                }
              } else if (scheme.farmerCategories?.includes(wizardCategory)) {
                score += 20;
                reasons.push(`Category ${wizardCategory} matches scheme guidelines`);
              }

              // 3. Crop interest matching
              const cropsLower = wizardCrops.toLowerCase();
              const isOrganicInterest = cropsLower.includes("organic") || cropsLower.includes("ragi") || cropsLower.includes("millet");
              const isVegetableInterest = cropsLower.includes("tomato") || cropsLower.includes("onion") || cropsLower.includes("potato") || cropsLower.includes("maize");

              if (scheme.category === "Organic Farming" && isOrganicInterest) {
                score += 20;
                reasons.push("Matches organic/millet crop focus");
              } else if (scheme.category.includes("Irrigation") && (isVegetableInterest || isOrganicInterest)) {
                score += 15;
                reasons.push("Crop selection matches drip/water optimization guidelines");
              }
            }

            if (eligible) {
              score = Math.max(15, Math.min(100, score));
            }

            return {
              ...scheme,
              applicableSubsidy,
              eligible,
              relevanceScore: score,
              relevanceReason: reasons.join(". ") || "Standard regional agriculture subsidy matching."
            };
          });

          scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
          setRecommendations(scored);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }, 500);
  };

  const getBadgeColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 65) return "bg-blue-50 text-blue-600 border-blue-200";
    if (score === 0) return "bg-red-50 text-red-600 border-red-200";
    return "bg-gray-100 text-gray-500 border-gray-200";
  };

  const schemeArray = Array.isArray(recommendations) ? recommendations : [];

  const displayedRecommendations = schemeArray.filter((sch) => {
    if (selectedCategory === "All Schemes") return true;
    const catLower = (sch.category || "").toLowerCase();
    const nameLower = (sch.name || "").toLowerCase();
    
    if (selectedCategory === "Direct Benefit") return catLower.includes("financial") || catLower.includes("income") || catLower.includes("welfare") || sch.subsidyPercentage === 100;
    if (selectedCategory === "Insurance") return catLower.includes("insurance") || nameLower.includes("bima") || nameLower.includes("insurance");
    if (selectedCategory === "Loans") return catLower.includes("loan") || catLower.includes("credit") || nameLower.includes("kcc") || nameLower.includes("credit");
    if (selectedCategory === "Subsidy") return (sch.subsidyPercentage && sch.subsidyPercentage > 0) || catLower.includes("irrigation") || catLower.includes("organic");
    if (selectedCategory === "Training") return catLower.includes("training") || catLower.includes("education") || catLower.includes("extension");
    return catLower.includes(selectedCategory.toLowerCase());
  });

  const topMatch = schemeArray.length > 0 && schemeArray[0].relevanceScore > 0 ? schemeArray[0] : null;

  return (
    <div id="schemes-portal-root" className="space-y-6">

      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-[#14532d] to-[#166534] hero-grid-pattern rounded-2xl p-8 overflow-hidden min-h-40 flex items-center">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Award className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-bold text-white leading-tight">{t("govSchemesTitle")}</h2>
          <p className="text-green-200 text-sm mt-2 leading-relaxed">{t("govSchemesSub")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Eligibility wizard */}
        <div className="xl:col-span-4 space-y-5">
          <div className="bg-white border-2 border-[#d1e4d5] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-[#166534]" />
              <p className="section-label">{t("eligibilityChecker")}</p>
            </div>
            <h4 className="text-base font-bold text-[#1a2e1c] mb-5">{t("entitlementWizard")}</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#4a6550] block mb-1">{t("landHolding")}</label>
                <div className="flex gap-2">
                  <input id="wizard-land-size-input" type="number" step="0.1" value={wizardLand}
                    onChange={(e) => setWizardLand(Number(e.target.value))}
                    className="flex-1 px-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#166534]" />
                  <select
                    value={wizardUnit}
                    onChange={(e) => setWizardUnit(e.target.value as "acres" | "hectares")}
                    className="px-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm bg-[#f0f6f1] focus:outline-none focus:border-[#166534] font-semibold text-[#166534]"
                  >
                    <option value="acres">{t("acres")}</option>
                    <option value="hectares">{t("hectares")}</option>
                  </select>
                </div>
                <p className="text-[10px] text-[#7a9a80] mt-1">1 Hectare ≈ 2.471 Acres</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4a6550] block mb-1">{t("category")}</label>
                <select id="wizard-category-select" value={wizardCategory} onChange={(e) => setWizardCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#166534] bg-white">
                  <option value="Small Farmer">Small Farmer (&lt; 2 Hectares / 4.94 Acres)</option>
                  <option value="Marginal Farmer">Marginal Farmer (&lt; 1 Hectare / 2.47 Acres)</option>
                  <option value="General">General Category</option>
                  <option value="OBC">OBC Category</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4a6550] block mb-1">{t("cropsGrown")}</label>
                <input id="wizard-crops-input" type="text" value={wizardCrops}
                  onChange={(e) => setWizardCrops(e.target.value)} placeholder="e.g. Tomato, Ragi, Maize"
                  className="w-full px-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#166534]" />
              </div>

              <button id="btn-recalculate-schemes" onClick={runLocalWizardEvaluator}
                className="btn-primary w-full justify-center flex items-center gap-2 text-sm">
                <RefreshCw className="w-3.5 h-3.5" /> {t("getSuggestedSchemes")}
              </button>
            </div>
          </div>

          {/* Advisory checklist */}
          <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
            <h5 className="text-xs font-bold text-[#166534] uppercase tracking-wider mb-4">Advisory Checklist</h5>
            <div className="space-y-3.5">
              {[
                { t: "Keep FID Number Ready", d: "Your Farmer Registration ID is mandatory for all Karnataka subsidies." },
                { t: "Updated RTC Pahani", d: "Pahani columns must show the crops you are growing today." },
                { t: "Aadhaar Bank Seed Link", d: "All state relief funds use DBT. Confirm active linking." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <div className="p-1 rounded-full bg-[#dcfce7] text-[#166534] mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h6 className="text-xs font-semibold text-[#1a2e1c]">{item.t}</h6>
                    <p className="text-xs text-[#7a9a80] leading-relaxed mt-0.5">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schemes list */}
        <div className="xl:col-span-8 space-y-5">
          {topMatch && (
            <div className="p-5 rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10"><Award className="w-full h-full text-yellow-500" /></div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest">AI Recommended</span>
                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-black rounded-full">Excellent Match</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a2e1c]">{topMatch.name}</h3>
                  <p className="text-sm text-[#4a6550] mt-1 leading-relaxed line-clamp-2">{topMatch.benefits}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-black text-yellow-600">{topMatch.relevanceScore}</div>
                  <div className="text-[10px] text-yellow-700 font-semibold">/100 Match</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-yellow-200 flex items-center justify-between">
                <span className="text-xs text-[#4a6550] italic">{topMatch.relevanceReason}</span>
                <a href={topMatch.applyLink} target="_blank" rel="noreferrer" className="btn-sm flex items-center gap-1">Apply Now <ArrowUpRight className="w-3.5 h-3.5" /></a>
              </div>
            </div>
          )}

          <div className="bg-white border border-[#d1e4d5] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="section-label flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI-Driven Recommendation</p>
                <h3 className="text-xl font-bold text-[#1a2e1c] mt-1">Recommended Government Schemes</h3>
              </div>
              {loading && <RefreshCw className="w-5 h-5 text-[#166534] animate-spin" />}
            </div>

            {/* Interactive Category Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              {['All Schemes', 'Direct Benefit', 'Insurance', 'Loans', 'Subsidy', 'Training'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`filter-chip cursor-pointer transition-all ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-16 text-[#7a9a80]">
                <RefreshCw className="w-8 h-8 text-[#166534] animate-spin mx-auto mb-2" />
                Loading scheme recommendations...
              </div>
            ) : displayedRecommendations.length === 0 ? (
              <div className="text-center py-16 text-[#7a9a80] text-sm">No schemes found matching "{selectedCategory}". Click "All Schemes" or reset parameters.</div>
            ) : (
              <div className="space-y-4">
                {displayedRecommendations.map((sch) => {
                  const activeSubsidy = sch.applicableSubsidy || sch.subsidyPercentage;
                  const isScStCategory = ["SC", "ST"].includes(wizardCategory);

                  return (
                    <div key={sch.id} className={`p-5 rounded-2xl border transition-all bg-white ${sch.relevanceScore === 0 ? 'border-red-200 opacity-75' : 'border-[#d1e4d5] hover:border-[#166534]/40 hover:shadow-md'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#e8f2e9] pb-4 mb-4">
                        <div>
                          <span className="text-[10px] text-[#7a9a80] uppercase tracking-wider font-semibold">{sch.category}</span>
                          <h4 className="text-base font-bold text-[#1a2e1c] mt-0.5 flex items-center gap-2 flex-wrap">
                            {sch.name} 
                            {activeSubsidy > 0 && (
                              <span className="badge-green">{activeSubsidy}% Subsidy Tier</span>
                            )}
                          </h4>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getBadgeColor(sch.relevanceScore)} flex-shrink-0`}>
                          {sch.relevanceScore > 0 ? `${sch.relevanceScore}% Match` : "Ineligible"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm text-[#4a6550] leading-relaxed">{sch.benefits}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-lg border border-[#e8f2e9] bg-[#f0f6f1]">
                            <p className="text-[10px] font-bold text-[#166534] uppercase tracking-wider mb-1.5">Eligibility Criteria</p>
                            <p className="text-xs text-[#4a6550] leading-relaxed">{sch.eligibility}</p>
                          </div>
                          <div className="p-3.5 rounded-lg border border-[#e8f2e9] bg-[#f0f6f1]">
                            <p className="text-[10px] font-bold text-[#166534] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                              <FileText className="w-3 h-3" /> Documents Required
                            </p>
                            <div className="space-y-1">
                              {sch.requiredDocuments.map((doc, idx) => (
                                <div key={idx} className="flex gap-1.5 items-center">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#166534] flex-shrink-0" />
                                  <span className="text-xs text-[#4a6550]">{doc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className={`p-3 rounded-lg border text-xs flex gap-2 items-start ${sch.relevanceScore === 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-100 bg-green-50 text-[#4a6550]'}`}>
                          {sch.relevanceScore === 0 ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-[#166534] flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold">{sch.relevanceScore === 0 ? "Eligibility Note:" : "AI Match Reason:"}</span> {sch.relevanceReason}
                            {!isScStCategory && sch.subsidyTiers && sch.relevanceScore > 0 && (
                              <p className="text-[11px] text-[#166534] italic mt-1 font-semibold">
                                Note: SC/ST farmers presenting a caste certificate qualify for the higher {sch.subsidyTiers.scSt}% subsidy tier.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <a href={sch.applyLink} target="_blank" rel="noreferrer"
                            className="btn-sm inline-flex items-center gap-2">
                            View Details <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
