import React, { useState, useEffect } from "react";
import { Award, FileText, CheckCircle2, ArrowUpRight, Sparkles, RefreshCw } from "lucide-react";
import { GovSchemeRecommendation, User } from "../types";

interface GovSchemesPortalProps {
  userProfile: User | null;
}

export default function GovSchemesPortal({ userProfile }: GovSchemesPortalProps) {
  const [recommendations, setRecommendations] = useState<GovSchemeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [wizardLand, setWizardLand] = useState(userProfile?.landSize || 2.4);
  const [wizardCategory, setWizardCategory] = useState(userProfile?.category || "Small Farmer");
  const [wizardCrops, setWizardCrops] = useState(userProfile?.cropsGrown.join(", ") || "Tomato, Ragi");

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const userId = userProfile?.id || "";
      const res = await fetch(`/api/schemes/recommend?userId=${userId}`);
      const data = await res.json();
      setRecommendations(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecommendations(); }, [userProfile]);

  const runLocalWizardEvaluator = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const res = await fetch("/api/schemes/recommend");
        const allSchemes = await res.json();
        const scored: GovSchemeRecommendation[] = allSchemes.map((scheme: any) => {
          let score = 55;
          const reasons = [];
          if (scheme.farmerCategories?.includes(wizardCategory)) { score += 25; reasons.push(`Direct matching for category ${wizardCategory}`); }
          if (scheme.maxLandRequirement && Number(wizardLand) > scheme.maxLandRequirement) { score -= 30; reasons.push(`Land exceeds threshold`); } else { score += 15; }
          const isOrganicInterest = wizardCrops.toLowerCase().includes("organic") || wizardCrops.toLowerCase().includes("ragi");
          if (scheme.category === "Organic Farming" && isOrganicInterest) { score += 20; reasons.push("Matches organic crop interest"); }
          score = Math.max(15, Math.min(100, score));
          return { ...scheme, relevanceScore: score, relevanceReason: reasons.join(". ") || "Standard regional agriculture subsidy matching." };
        });
        scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
        setRecommendations(scored);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }, 800);
  };

  const getBadgeColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 65) return "bg-blue-50 text-blue-600 border-blue-200";
    return "bg-gray-100 text-gray-500 border-gray-200";
  };

  return (
    <div id="schemes-portal-root" className="space-y-6">

      {/* Hero banner */}
      <div className="relative bg-[#1a5c38] rounded-2xl p-8 overflow-hidden min-h-40 flex items-center">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Award className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-bold text-white">Government Schemes For Farmers</h2>
          <p className="text-green-200 text-sm mt-2 leading-relaxed">Explore central and state government schemes designed to support and empower farmers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Eligibility wizard */}
        <div className="xl:col-span-4 space-y-5">
          <div className="bg-white border border-[#d1e4d5] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-[#1a5c38]" />
              <p className="section-label">Eligibility Checker</p>
            </div>
            <h4 className="text-base font-bold text-[#1a2e1c] mb-5">Farmer Entitlement Wizard</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#4a6550] block mb-1">Land Holding (Acres)</label>
                <input id="wizard-land-size-input" type="number" value={wizardLand}
                  onChange={(e) => setWizardLand(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4a6550] block mb-1">Beneficiary Category</label>
                <select id="wizard-category-select" value={wizardCategory} onChange={(e) => setWizardCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38] bg-white">
                  <option value="Small Farmer">Small Farmer (&lt; 2 Hectares)</option>
                  <option value="Marginal Farmer">Marginal Farmer (&lt; 1 Hectare)</option>
                  <option value="General">General / Landowner</option>
                  <option value="OBC">OBC Category</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4a6550] block mb-1">Crops Grown</label>
                <input id="wizard-crops-input" type="text" value={wizardCrops}
                  onChange={(e) => setWizardCrops(e.target.value)} placeholder="e.g. Tomato, Paddy"
                  className="w-full px-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38]" />
              </div>
              <button id="btn-recalculate-schemes" onClick={runLocalWizardEvaluator}
                className="w-full py-2.5 bg-[#1a5c38] text-white font-bold rounded-xl cursor-pointer hover:bg-[#134429] transition-colors flex items-center justify-center gap-2 text-sm">
                <RefreshCw className="w-3.5 h-3.5" /> Get Suggested Schemes
              </button>
            </div>
          </div>

          {/* Advisory checklist */}
          <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
            <h5 className="text-xs font-bold text-[#1a5c38] uppercase tracking-wider mb-4">Advisory Checklist</h5>
            <div className="space-y-3.5">
              {[
                { t: "Keep FID Number Ready", d: "Your Farmer Registration ID is mandatory for all Karnataka subsidies." },
                { t: "Updated RTC Pahani", d: "Pahani columns must show the crops you are growing today." },
                { t: "Aadhaar Bank Seed Link", d: "All state relief funds use DBT. Confirm active linking." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <div className="p-1 rounded-full bg-[#dcfce7] text-[#1a5c38] mt-0.5">
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
        <div className="xl:col-span-8">
          <div className="bg-white border border-[#d1e4d5] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="section-label flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI-Driven Recommendation</p>
                <h3 className="text-xl font-bold text-[#1a2e1c] mt-1">Recommended Government Schemes</h3>
              </div>
              {loading && <RefreshCw className="w-5 h-5 text-[#1a5c38] animate-spin" />}
            </div>

            {loading ? (
              <div className="text-center py-16 text-[#7a9a80]">Loading scheme recommendations...</div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-16 text-[#7a9a80] text-sm">No schemes found. Reset parameters.</div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((sch) => (
                  <div key={sch.id} className="p-5 rounded-xl border border-[#e8f2e9] hover:border-[#a8cbb0] hover:shadow-sm transition-all bg-[#f4f8f4]">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#e8f2e9] pb-4 mb-4">
                      <div>
                        <span className="text-[10px] text-[#7a9a80] uppercase tracking-wider font-semibold">{sch.category}</span>
                        <h4 className="text-base font-bold text-[#1a2e1c] mt-0.5">{sch.name}</h4>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getBadgeColor(sch.relevanceScore)} flex-shrink-0`}>
                        {sch.relevanceScore}% Match
                      </span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-[#4a6550] leading-relaxed">{sch.benefits}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-lg border border-[#e8f2e9] bg-white">
                          <p className="text-[10px] font-bold text-[#1a5c38] uppercase tracking-wider mb-1.5">Eligibility Criteria</p>
                          <p className="text-xs text-[#4a6550] leading-relaxed">{sch.eligibility}</p>
                        </div>
                        <div className="p-3.5 rounded-lg border border-[#e8f2e9] bg-white">
                          <p className="text-[10px] font-bold text-[#1a5c38] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                            <FileText className="w-3 h-3" /> Documents Required
                          </p>
                          <div className="space-y-1">
                            {sch.requiredDocuments.map((doc, idx) => (
                              <div key={idx} className="flex gap-1.5 items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1a5c38] flex-shrink-0" />
                                <span className="text-xs text-[#4a6550]">{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border border-green-100 bg-green-50 text-xs text-[#4a6550] flex gap-2 items-start">
                        <Sparkles className="w-3.5 h-3.5 text-[#1a5c38] flex-shrink-0 mt-0.5" />
                        <div><span className="font-bold text-[#1a5c38]">AI Match Reason:</span> {sch.relevanceReason}</div>
                      </div>

                      <div className="flex justify-end">
                        <a href={sch.applyLink} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-2 py-2 px-4 bg-[#1a5c38] text-white text-xs font-bold rounded-lg hover:bg-[#134429] transition-colors cursor-pointer">
                          View Details <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
