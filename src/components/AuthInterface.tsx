import React, { useState } from "react";
import { Lock, Mail, User, Phone, Map, Sprout, Layers, Globe, AlertCircle, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { User as FarmerUser, Language } from "../types";

interface AuthInterfaceProps {
  onAuthSuccess: (user: FarmerUser) => void;
}

export default function AuthInterface({ onAuthSuccess }: AuthInterfaceProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
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
    if (!loginEmail) return setLoginError("Gmail / Email address is required.");
    if (!loginPassword) return setLoginError("Password is required.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onAuthSuccess(data.user);
      } else {
        setLoginError(data.error || "Login failed. Ensure correct credentials.");
      }
    } catch (err) {
      setLoginError("Server connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName || !regEmail || !regPassword) return setRegError("Name, email, and password are required fields.");
    setLoading(true);
    try {
      const cropArray = regCrops.split(",").map(c => c.trim()).filter(Boolean);
      const payload = {
        name: regName, email: regEmail, password: regPassword, phone: regPhone,
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
    <div id="auth-panel-wrapper" className="min-h-screen w-full flex bg-[#f4f8f4]">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-center w-1/2 bg-gradient-to-br from-[#14532d] to-[#166534] p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-md mx-auto">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Agri Connect</h1>
          <p className="text-xl text-green-200 whitespace-pre-line mb-12">
            {"Empowering Farmers,\nEnriching Future"}
          </p>
          
          <div className="space-y-6">
            {[
              "Real-time Mandi prices",
              "AI-powered crop forecasts",
              "Government scheme finder"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/70 text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-sm mx-auto">
          
          {/* Logo mark for right side */}
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-8 mx-auto md:mx-0">
            <Sprout className="w-6 h-6 text-green-700" />
          </div>

          {isForgot ? (
            /* FORGOT */
            <div className="space-y-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-[#1a2e1c]">Recover Password</h3>
                <p className="text-[#7a9a80] mt-2">Enter your registered email below.</p>
              </div>
              {forgotSuccess ? (
                <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-sm text-green-700">
                  ✓ A verification link has been sent to your email.
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a9a80]" />
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="farmer@domain.com"
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all" required />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-[#1a5c38] text-white font-bold rounded-full hover:bg-[#134429] transition-colors cursor-pointer text-sm">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              )}
              <div className="text-center md:text-left">
                <button onClick={() => { setIsForgot(false); setForgotSuccess(false); }}
                  className="text-sm text-[#1a5c38] font-semibold hover:underline cursor-pointer bg-transparent border-none">
                  ← Back to Sign In
                </button>
              </div>
            </div>

          ) : !isRegister ? (
            /* LOGIN */
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-[#1a2e1c]">Welcome Back</h3>
                <p className="text-[#7a9a80] mt-2">Sign in to access your farming dashboard</p>
              </div>

              {loginError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {loginError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a9a80]" />
                    <input id="login-email-input" type="email" value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Gmail / Email Address"
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all" required />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a9a80]" />
                    <input id="login-password-input" type={showPassword ? "text" : "password"} value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a9a80] hover:text-[#1a5c38] transition-colors cursor-pointer bg-transparent border-none p-0">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={() => setIsForgot(true)}
                    className="text-xs font-semibold text-[#1a5c38] hover:underline cursor-pointer bg-transparent border-none">
                    Forgot password?
                  </button>
                </div>
              </div>

              <button id="btn-submit-login" type="submit" disabled={loading}
                className="w-full py-3 bg-[#1a5c38] text-white font-bold rounded-full hover:bg-[#134429] transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-900/20">
                {loading ? "Signing in..." : "Login"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <p className="text-sm text-[#7a9a80]">
                  New to platform?{" "}
                  <button type="button" onClick={() => setIsRegister(true)}
                    className="text-[#1a5c38] font-semibold hover:underline cursor-pointer bg-transparent border-none">
                    Register here
                  </button>
                </p>
              </div>
            </form>

          ) : (
            /* REGISTER */
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-[#1a2e1c]">Create Account</h3>
                <p className="text-[#7a9a80] mt-2">Join AgriConnect as a farmer</p>
              </div>

              {regError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {regError}
                </div>
              )}

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { id: "reg-name-input", icon: User, value: regName, setter: setRegName, placeholder: "Full Name", type: "text", required: true },
                  { id: "reg-email-input", icon: Mail, value: regEmail, setter: setRegEmail, placeholder: "Gmail / Email Address", type: "email", required: true },
                ].map(({ id, icon: Icon, value, setter, placeholder, type, required }) => (
                  <div key={id} className="relative">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a9a80]" />
                    <input id={id} type={type} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all"
                      required={required} />
                  </div>
                ))}
                
                {/* Password field with toggle */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a9a80]" />
                  <input id="reg-password-input" type={showPassword ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Password"
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all"
                    required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a9a80] hover:text-[#1a5c38] transition-colors cursor-pointer bg-transparent border-none p-0">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a9a80]" />
                  <input id="reg-phone-input" type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="Phone Number"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80] z-10" />
                    <select id="reg-district-select" value={regDistrict} onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all bg-white appearance-none">
                      {["Bengaluru Urban","Bengaluru Rural","Kolar","Chikkaballapur","Tumakuru","Ramanagara","Mandya","Mysuru","Hassan"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <input id="reg-village-input" type="text" value={regVillage} onChange={(e) => setRegVillage(e.target.value)}
                    placeholder="Village" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80] z-10" />
                    <input id="reg-land-size-input" type="number" step="0.1" value={regLand} onChange={(e) => setRegLand(e.target.value)}
                      placeholder="Land Size (Acres)" className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all" required />
                  </div>
                  <select id="reg-category-select" value={regCategory} onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all bg-white">
                    <option value="Small Farmer">Small Farmer</option>
                    <option value="Marginal Farmer">Marginal Farmer</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                <div className="relative">
                  <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a9a80]" />
                  <input id="reg-crops-input" type="text" value={regCrops} onChange={(e) => setRegCrops(e.target.value)}
                    placeholder="Crops Grown (e.g. Tomato, Ragi)" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all" required />
                </div>

                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80] z-10" />
                  <select id="reg-language-select" value={regLang} onChange={(e) => setRegLang(e.target.value as Language)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all bg-white">
                    <option value={Language.ENGLISH}>English</option>
                    <option value={Language.KANNADA}>ಕನ್ನಡ (Kannada)</option>
                    <option value={Language.HINDI}>हिन्दी (Hindi)</option>
                    <option value={Language.TELUGU}>తెలుగు (Telugu)</option>
                    <option value={Language.TAMIL}>தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>

              <button id="btn-submit-register" type="submit" disabled={loading}
                className="w-full py-3 bg-[#1a5c38] text-white font-bold rounded-full hover:bg-[#134429] transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-900/20">
                {loading ? "Registering..." : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <p className="text-sm text-[#7a9a80]">
                  Already registered?{" "}
                  <button type="button" onClick={() => setIsRegister(false)}
                    className="text-[#1a5c38] font-semibold hover:underline cursor-pointer bg-transparent border-none">
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
