import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Languages, Sparkles, X, Trash2, HelpCircle } from "lucide-react";
import { Language } from "../types";

interface AgriBotProps {
  onClose?: () => void;
  userProfile?: {
    name: string;
    cropsGrown: string[];
    district: string;
    preferredLanguage: Language;
  } | null;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  poweredBy?: string;
}

export default function AgriBot({ onClose, userProfile }: AgriBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<Language>(userProfile?.preferredLanguage || Language.ENGLISH);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Default quick recommendations based on crops and schedules
  const quickPrompts: { [key in Language]: { label: string; query: string }[] } = {
    [Language.ENGLISH]: [
      { label: "Mandi prices in Kolar", query: "What are the current tomato and onion APMC prices in Kolar?" },
      { label: "Pest advisor for Tomato", query: "My tomatoes are showing spots and yellowing. What fertilizer or pest management do you advise?" },
      { label: "Krishi Bhagya eligibility", query: "Am I eligible for the Karnataka Krishi Bhagya rainwater harvesting subsidy?" },
      { label: "Fertilizer tips", query: "Give me eco-friendly fertilizer tips for growing organic ragi." }
    ],
    [Language.KANNADA]: [
      { label: "ಕೋಲಾರ ತರಕಾರಿ ದರ", query: "ಕೋಲಾರ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಟೊಮ್ಯಾಟೊ ಮತ್ತು ಈರುಳ್ಳಿ ಪ್ರಸ್ತುತ ದರ ಎಷ್ಟಿದೆ?" },
      { label: "ಟೊಮ್ಯಾಟೊ ರೋಗ ಹತೋಟಿ", query: "ನನ್ನ ಟೊಮ್ಯಾಟೊ ಬೆಳೆಗೆ ಎಲೆ ಚುಕ್ಕೆ ಮತ್ತು ಹಳದಿ ರೋಗ ಬಂದಿದೆ. ಉತ್ತಮ ಕ್ರಿಮಿನಾಶಕ ಮ್ಯಾನುಯಲ್ ತಿಳಿಸಿ." },
      { label: "ಕೃಷಿ ಭಾಗ್ಯ ಸಹಾಯಧನ", query: "ಕರ್ನಾಟಕದ ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ ಅಡಿಯಲ್ಲಿ ಕೃಷಿ ಹೊಂಡಕ್ಕೆ ಎಷ್ಟು ಸಬ್ಸಿಡಿ ಸಿಗುತ್ತದೆ?" },
      { label: "ರಾಗಿ ಗೆ ಗೊಬ್ಬರ", query: "ಸಾವಯವ ರಾಗಿ ಬೆಳೆಗೆ ಹಾಕಲು ಅತ್ಯುತ್ತಮ ಗೊಬ್ಬರ ತಯಾರಿಸುವ ವಿಧಾನ ತಿಳಿಸಿ." }
    ],
    [Language.HINDI]: [
      { label: "कोलार मंडी लहसुन भाव", query: "कोलार मंडी में आज टमाटर एवं लहसुन का रेट क्या चल रहा है?" },
      { label: "कीट प्रबंधन सलाह", query: "टमाटर के पत्तों पर धब्बे हो रहे हैं, जैव कीटनाशक का उपचार बताएं।" },
      { label: "एग्रीकल्चर योजनाएं", query: "मुझे सिंचाई उपकरणों पर मिलने वाली सरकारी सब्सिडी योजनाओं की जानकारी दें।" },
      { label: "जैविक खाद टिप्स", query: "धान की पैदावार बढ़ाने के लिए जैविक जैविक खाद के प्रयोग विधि समझाएं।" }
    ],
    [Language.TELUGU]: [
      { label: "మండీ టమాటా ధరలు", query: "కోలార్ మరియు బెంగళూరు మార్కెట్లో టమాటా రేట్లు ఎంత ఉన్నాయి?" },
      { label: "తెగుళ్ళ నివారణ", query: "టమోటా ఆకు మచ్చల నివారణకు ఏ మందులు స్ప్రే చేయాలి?" },
      { label: "వ్యవసాయ సబ్సిడీలు", query: "డ్రిప్ ఇరిగేషన్ పంపుసెట్లకు ఉపయోగపడే ప్రభుత్వ పథకాలు ఏమిటి?" }
    ],
    [Language.TAMIL]: [
      { label: "மண்டி தக்காளி விலை", query: "கோலார் மற்றும் பெங்களூரு ஏபிஎம்சி தக்காளி மற்றும் வெங்காய விலை என்ன?" },
      { label: "பூச்சி மேலாண்மை", query: "தக்காளி செடிகளுக்கு இலைப்புள்ளி நோய் மேலாண்மைக்கு இயற்கை உரம் என்ன?" },
      { label: "வேளாண் மானியங்கள்", query: "இலவச விவசாய மின்சாரம் மற்றும் சோலார் பம்ப் மானியம் விபரம் என்ன?" }
    ]
  };

  const getGreeting = (lang: Language) => {
    const name = userProfile?.name || "Farmer";
    switch (lang) {
      case Language.KANNADA:
        return `ನಮಸ್ಕಾರ ${name}! ನಾನು ಅಗ್ರಿಕನೆಕ್ಟ್ ಎಐ ಸಹಾಯಕ. ಬೆಳೆ ಬೆಲೆಗಳು, ರೋಗ ಹತೋಟಿ ಅಥವಾ ಕೃಷಿ ಇಲಾಖೆ ಸಹಾಯಧನಗಳ ಬಗ್ಗೆ ಏನು ಸಹಾಯ ಮಾಡಲಿ?`;
      case Language.HINDI:
        return `नमस्ते ${name}! मैं एग्रीकनेक्ट एआई हूँ। मैंगो या टमाटर के मंडी भाव, रोग रोकथाम एवं सिंचाई योजनाओं के बारे में मुझसे पूछें।`;
      case Language.TELUGU:
        return `నమస్కారం ${name}! నేను అగ్రి-కనెక్ట్ స్మార్ట్ అసిస్టెంట్. డిస్ట్రిక్ట్ ఏపీఎంసీ ధరలు మరి తెగుళ్ళ నివారణకు ఎలాంటి సహకారం కావాలి?`;
      case Language.TAMIL:
        return `வணக்கம் ${name}! நான் அக்ரி-கனெக்ட் செயற்கை நுண்ணறிவு உதவியாளர். உரம் மற்றும் அரசு விவசாய திட்டங்கள் பற்றி கேளுங்கள்.`;
      default:
        return `Hello ${name}! I am AgriBot, your personal farm advisor. Ask me anything about Mandi prices, 7-day predicted trends, fertilizer compositions, or pest control methods.`;
    }
  };

  // Seed initial greeting message
  useEffect(() => {
    setMessages([
      {
        id: "greet",
        sender: "bot",
        text: getGreeting(language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        poweredBy: "AgriConnect Assistant"
      }
    ]);
  }, [language, userProfile]);

  // Scroll to bottom on updates
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Gather translation payload with chat history for contextual reference
      const historyPayload = messages.slice(-6).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          language,
          chatHistory: historyPayload
        })
      });

      const data = await res.json();

      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "Sorry, I encountered a connection issue. Please retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        poweredBy: data.poweredBy || "Gemini 3.5 AI Engine"
      }]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: "bot",
        text: "Apologies! The server failed to respond. I am utilizing cached crop guidelines in the mean time. Tomato blights are typically combatted with copper carbonate sprays.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        poweredBy: "Local Advisory Fallback"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="agribot-chat-container" className="flex flex-col h-full bg-white border border-[#d1e4d5] shadow-2xl relative overflow-hidden">
      
      {/* Bot Header */}
      <div className="p-4 bg-[#1a5c38] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-white">AgriBot Assistant</h4>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-300"></span>
              </span>
            </div>
            <p className="text-[10px] text-green-200 uppercase tracking-wider">AI Farm Advisor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="relative group/lang">
            <button className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors cursor-pointer flex items-center gap-1">
              <Languages className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase">{language}</span>
            </button>
            <div className="hidden group-hover/lang:block hover:block absolute right-0 mt-1 bg-white border border-[#d1e4d5] rounded-lg shadow-xl z-50 py-1 min-w-36">
              {[
                { code: Language.ENGLISH, name: "English" },
                { code: Language.KANNADA, name: "ಕನ್ನಡ (Kannada)" },
                { code: Language.HINDI, name: "हिन्दी (Hindi)" },
                { code: Language.TELUGU, name: "తెలుగు (Telugu)" },
                { code: Language.TAMIL, name: "தமிழ் (Tamil)" }
              ].map((lang) => (
                <button key={lang.code} onClick={() => setLanguage(lang.code)}
                  className={`w-full text-left text-xs px-3 py-1.5 hover:bg-[#edf4ee] transition-colors ${language === lang.code ? "text-[#1a5c38] font-bold" : "text-[#4a6550]"}`}>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => { setMessages([{ id: "greet-reset", sender: "bot", text: getGreeting(language), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), poweredBy: "AgriConnect Assistant" }]); }}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors cursor-pointer" title="Reset Chat">
            <Trash2 className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button onClick={onClose} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f4f8f4]">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "ml-auto items-end max-w-[85%]" : "mr-auto items-start max-w-[85%]"}`}>
            <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
              m.sender === "user"
                ? "bg-[#1a5c38] text-white rounded-br-none"
                : "bg-white text-[#1a2e1c] border border-[#d1e4d5] rounded-bl-none shadow-sm"
            }`}>{m.text}</div>
            <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-[#7a9a80]">
              <span>{m.timestamp}</span>
              {m.poweredBy && (<><span>•</span><span className="text-[#1a5c38] flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> {m.poweredBy}</span></>)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 mr-auto bg-white border border-[#d1e4d5] p-3 rounded-2xl rounded-bl-none max-w-[80%] shadow-sm">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#1a5c38] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-[#1a5c38] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-[#1a5c38] rounded-full animate-bounce"></span>
            </div>
            <span className="text-[10px] text-[#7a9a80] animate-pulse">AgriBot thinking...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-[#d1e4d5] bg-white overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        {(quickPrompts[language] || quickPrompts[Language.ENGLISH]).map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.query)}
            disabled={loading}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border border-[#d1e4d5] text-[#4a6550] hover:text-[#1a5c38] hover:border-[#1a5c38] bg-[#f4f8f4] hover:bg-[#edf4ee] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#1a5c38]" />
            {p.label}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="p-3 bg-white border-t border-[#d1e4d5] flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend(input);
          }}
          placeholder={
            language === Language.KANNADA ? "ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ..." :
            language === Language.HINDI ? "यहाँ सवाल पूछें..." : "Type farming query..."
          }
          disabled={loading}
          className="flex-1 bg-[#f4f8f4] border border-[#d1e4d5] rounded-xl px-3 py-2.5 text-sm text-[#1a2e1c] focus:outline-none focus:border-[#1a5c38] placeholder-[#7a9a80] disabled:opacity-50"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || loading}
          className="p-2.5 bg-[#1a5c38] text-white rounded-xl hover:bg-[#134429] cursor-pointer disabled:opacity-40 transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      
    </div>
  );
}
