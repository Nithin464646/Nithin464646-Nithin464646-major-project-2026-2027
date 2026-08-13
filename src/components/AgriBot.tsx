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
  currentLanguage?: Language;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  poweredBy?: string;
}

export default function AgriBot({ onClose, userProfile, currentLanguage }: AgriBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<Language>(currentLanguage || userProfile?.preferredLanguage || Language.ENGLISH);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLanguage) {
      setLanguage(currentLanguage);
    }
  }, [currentLanguage]);

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
    <div id="agribot-chat-container" className="bg-white flex flex-col h-full shadow-2xl">
      
      {/* Bot Header */}
      <div className="bg-gradient-to-r from-[#14532d] to-[#166534] px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center border border-white/20 flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">AgriBot</p>
          <p className="text-green-300 text-[11px]">AI Agricultural Assistant</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="relative group/lang">
            <button className="p-1.5 border border-white/20 text-white/80 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1">
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
            className="p-1.5 border border-white/20 text-white/80 hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Reset Chat">
            <Trash2 className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button onClick={onClose} className="p-1.5 border border-white/20 text-white/80 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f4f8f4]">
        {messages.map((m) => (
          m.sender === "user" ? (
            <div key={m.id} className="flex justify-end mb-3">
              <div>
                <div className="chat-bubble-user">{m.text}</div>
                <div className={`text-[10px] text-[#7a9a80] mt-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <span>{m.timestamp}</span>
                </div>
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-start mb-3 gap-2">
              <div className="w-7 h-7 bg-[#166534] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <div className="chat-bubble-bot">{m.text}</div>
                <div className={`text-[10px] text-[#7a9a80] mt-1 flex items-center gap-1.5 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <span>{m.timestamp}</span>
                  {m.poweredBy && (<><span>•</span><span className="text-[#166534] flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> {m.poweredBy}</span></>)}
                </div>
              </div>
            </div>
          )
        ))}

        {loading && (
          <div className="flex justify-start mb-3 gap-2">
            <div className="w-7 h-7 bg-[#166634] rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="chat-bubble-bot flex items-center gap-1 py-3">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto no-scrollbar bg-[#f4f8f4] border-t border-[#d1e4d5] flex-shrink-0">
        {(quickPrompts[language] || quickPrompts[Language.ENGLISH]).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt.query)}
            className="filter-chip text-[11px] py-1 px-3 whitespace-nowrap flex-shrink-0 active:scale-95 transition-transform"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="bg-white border-t border-[#d1e4d5] px-3 py-3 flex-shrink-0 flex gap-2 items-center">
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
          className="flex-1 bg-[#f0f6f1] border border-[#d1e4d5] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#166634] focus:ring-2 focus:ring-[#166634]/10"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || loading}
          className="w-9 h-9 bg-[#166534] hover:bg-[#14532d] rounded-full flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer border-none"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
      
    </div>
  );
}
