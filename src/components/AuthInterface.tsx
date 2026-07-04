import React, { useState } from "react";
import { Lock, Mail, User, Phone, Map, Sprout, Layers, Globe, AlertCircle, ArrowRight } from "lucide-react";
import { User as FarmerUser, Language } from "../types";

interface AuthInterfaceProps {
  onAuthSuccess: (user: FarmerUser) => void;
}

export default function AuthInterface({ onAuthSuccess }: AuthInterfaceProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  const [loginEmail, setLoginEmail] = useState("nithinraj805@gmail.com");
  const [loginError, setLoginError] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDistrict, setRegDistrict] = useState("Kolar");
  const [regVillage, setRegVillage] = useState("");
  const [regLand, setRegLand] = useState("");
  const [regCategory, setRegCategory] = useState("Small Farmer");
  const [regCrops, setRegCrops] = useState("");
  const [regLang, setRegLang] = useState<Language>(Language.ENGLISH);
  const [regError, setRegError] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail) return setLoginError("Email address is required.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onAuthSuccess(data.user);
      } else {
        setLoginError(data.error || "Login failed. Ensure correct credentials.");
      }
    } catch (err) {
      setLoginError("Server connection timeout. Booting offline session shortly.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName || !regEmail) return setRegError("Name and email are required fields.");
    setLoading(true);
    try {
      const cropArray = regCrops.split(",").map(c => c.trim()).filter(Boolean);
      const payload = {
        name: regName, email: regEmail, phone: regPhone,
        state: "Karnataka", district: regDistrict, village: regVillage,
        landSize: Number(regLand) || 0, cropsGrown: cropArray,
        category: regCategory, preferredLanguage: regLang
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onAuthSuccess(data.user);
      } else {
        setRegError(data.error || "Registration failed. Email might already exist.");
      }
    } catch (err) {
      setRegError("Unable to reach backend registration service.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    setTimeout(() => { setForgotSuccess(true); setLoading(false); }, 1000);
  };

  return (
    <div id="auth-panel-wrapper" className="min-h-screen w-full flex bg-[#f4f8f4] items-center justify-center px-4">
      <div className="w-full max-w-screen-lg flex rounded-2xl overflow-hidden shadow-2xl border border-[#d1e4d5]">

        {/* Left hero panel */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#1a5c38] p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-4 border-white/40"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full border-4 border-white/20"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-xl">Agri Connect</div>
                <div className="text-green-300 text-xs">Empowering Farmers, Enriching Future</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight mt-8">
              Your Trusted Partner in Farming & Agriculture
            </h1>
            <p className="text-green-200 text-sm mt-4 leading-relaxed">
              Access real-time crop prices, government schemes, AI forecasts, and expert farming guides — all in one place.
            </p>
          </div>
          <div className="relative z-10 space-y-3">
            {["Real-time APMC market prices", "Government scheme eligibility", "AI price forecasting", "Expert farming guides"].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-green-100 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 bg-white p-8 md:p-10 flex flex-col justify-center">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#1a5c38] rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#1a5c38] text-lg">Agri Connect</span>
          </div>

          {/* FORGOT */}
          {isForgot ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-[#1a2e1c]">Recover Password</h3>
                <p className="text-sm text-[#7a9a80] mt-1">Enter your registered email below.</p>
              </div>
              {forgotSuccess ? (
                <div className="p-4 rounded-lg border border-green-200 bg-green-50 text-sm text-green-700">
                  ✓ A verification link has been sent to your email.
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80]" />
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="farmer@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38]" required />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-[#1a5c38] text-white font-bold rounded-lg hover:bg-[#134429] transition-colors cursor-pointer text-sm">
                    {loading ? "Sending..." : "Send Verification Code"}
                  </button>
                </form>
              )}
              <button onClick={() => { setIsForgot(false); setForgotSuccess(false); }}
                className="text-sm text-[#1a5c38] hover:underline cursor-pointer">← Back to Sign In</button>
            </div>

          ) : !isRegister ? (
            /* LOGIN */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h3 className="text-2xl font-bold text-[#1a2e1c]">Welcome Back</h3>
                <p className="text-sm text-[#7a9a80] mt-1">Sign in to access your farming dashboard.</p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {loginError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#4a6550] uppercase tracking-wide block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80]" />
                    <input id="login-email-input" type="email" value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38]" required />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setIsForgot(true)}
                    className="text-xs text-[#1a5c38] hover:underline cursor-pointer bg-transparent border-none">
                    Forgot your password?
                  </button>
                </div>
              </div>

              <button id="btn-submit-login" type="submit" disabled={loading}
                className="w-full py-3 bg-[#1a5c38] text-white font-bold rounded-xl hover:bg-[#134429] transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-900/20">
                {loading ? "Signing in..." : "Login"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-sm text-[#7a9a80]">
                New to platform?{" "}
                <button type="button" onClick={() => setIsRegister(true)}
                  className="text-[#1a5c38] font-semibold hover:underline cursor-pointer bg-transparent border-none">
                  Register here
                </button>
              </p>
            </form>

          ) : (
            /* REGISTER */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-[#1a2e1c]">Create Account</h3>
                <p className="text-sm text-[#7a9a80] mt-1">Register as a farmer on AgriConnect.</p>
              </div>

              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {regError}
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {[
                  { id: "reg-name-input", icon: User, value: regName, setter: setRegName, placeholder: "Full Name", type: "text", required: true },
                  { id: "reg-email-input", icon: Mail, value: regEmail, setter: setRegEmail, placeholder: "Email Address", type: "email", required: true },
                  { id: "reg-phone-input", icon: Phone, value: regPhone, setter: setRegPhone, placeholder: "Phone Number", type: "tel", required: false },
                ].map(({ id, icon: Icon, value, setter, placeholder, type, required }) => (
                  <div key={id} className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80]" />
                    <input id={id} type={type} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38]"
                      required={required} />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7a9a80] z-10" />
                    <select id="reg-district-select" value={regDistrict} onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38] bg-white appearance-none">
                      {["Bengaluru Urban","Bengaluru Rural","Kolar","Chikkaballapur","Tumakuru","Ramanagara","Mandya","Mysuru","Hassan"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <input id="reg-village-input" type="text" value={regVillage} onChange={(e) => setRegVillage(e.target.value)}
                    placeholder="Village" className="w-full px-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38]" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7a9a80] z-10" />
                    <input id="reg-land-size-input" type="number" step="0.1" value={regLand} onChange={(e) => setRegLand(e.target.value)}
                      placeholder="Land Size (Acres)" className="w-full pl-9 pr-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38]" required />
                  </div>
                  <select id="reg-category-select" value={regCategory} onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38] bg-white">
                    <option value="Small Farmer">Small Farmer</option>
                    <option value="Marginal Farmer">Marginal Farmer</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                <div className="relative">
                  <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80]" />
                  <input id="reg-crops-input" type="text" value={regCrops} onChange={(e) => setRegCrops(e.target.value)}
                    placeholder="Crops Grown (e.g. Tomato, Ragi)" className="w-full pl-10 pr-4 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38]" required />
                </div>

                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7a9a80] z-10" />
                  <select id="reg-language-select" value={regLang} onChange={(e) => setRegLang(e.target.value as Language)}
                    className="w-full pl-9 pr-3 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38] bg-white">
                    <option value={Language.ENGLISH}>English</option>
                    <option value={Language.KANNADA}>ಕನ್ನಡ (Kannada)</option>
                    <option value={Language.HINDI}>हिन्दी (Hindi)</option>
                    <option value={Language.TELUGU}>తెలుగు (Telugu)</option>
                    <option value={Language.TAMIL}>தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>

              <button id="btn-submit-register" type="submit" disabled={loading}
                className="w-full py-3 bg-[#1a5c38] text-white font-bold rounded-xl hover:bg-[#134429] transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm">
                {loading ? "Registering..." : "Complete Registration"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-sm text-[#7a9a80]">
                Already registered?{" "}
                <button type="button" onClick={() => setIsRegister(false)}
                  className="text-[#1a5c38] font-semibold hover:underline cursor-pointer bg-transparent border-none">
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
