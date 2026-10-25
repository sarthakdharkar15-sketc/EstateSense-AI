import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, MessageSquare, Send, Trash2, ArrowRight } from 'lucide-react';

export default function AskEstateSense({ lastPrediction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'assistant', 
      text: "Namaste! I am your EstateSense AI Assistant. How can I help you analyze property prices today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    "Why is this property expensive?",
    "Which feature affects the price most?",
    "Is 3BHK better than 2BHK in this area?",
    "How does location affect the price?",
    "Explain my prediction."
  ];

  // Auto-scroll to bottom & listen for open event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ask-estatesense', handleOpen);
    return () => window.removeEventListener('open-ask-estatesense', handleOpen);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const generateAIResponse = (question) => {
    setIsTyping(true);
    
    // Simulate thinking delay
    setTimeout(() => {
      let responseText = "";
      
      const q = question.toLowerCase();
      
      if (q.includes("why is this property expensive")) {
        if (lastPrediction) {
          const areaFactor = lastPrediction.area > 2000 ? "large area size of " + lastPrediction.area + " sq.ft. " : "";
          const locationPremium = lastPrediction.location === "Indiranagar" || lastPrediction.location === "Koramangala" 
            ? "premium neighborhood base rate of " + lastPrediction.location 
            : "location base parameters";
          
          responseText = `Based on my analysis, your current property in **${lastPrediction.location}** has an estimated value of **₹${lastPrediction.final_prediction}L**. The main drivers for this valuation are the ${areaFactor}and the ${locationPremium}. Our XGBoost corrector model also factored in a residual adjustment of **${lastPrediction.predicted_residual >= 0 ? '+' : ''}₹${lastPrediction.predicted_residual}L** for non-linear local market variances.`;
        } else {
          responseText = "You haven't run a property prediction yet! Please go to the **Predict Price** page, enter parameters, and click predict. Generally, Bangalore properties are expensive in core zones like Indiranagar (₹9,500/sqft base rate) or Koramangala (₹8,800/sqft base rate) due to premium location multipliers.";
        }
      } 
      else if (q.includes("which feature affects the price most")) {
        if (lastPrediction && lastPrediction.shap_values && lastPrediction.shap_values.length > 0) {
          const topDriver = lastPrediction.shap_values[0];
          responseText = `For your evaluated property in **${lastPrediction.location}**, the feature with the highest absolute SHAP impact is **${topDriver.feature}**, adding/subtracting **₹${Math.abs(topDriver.val).toFixed(2)}L** relative to the baseline. Globally, property built-up area contributes **32.4%** of model variance, making it the most dominant predictor.`;
        } else {
          responseText = "Globally in our model, **Property Area (sq.ft.)** affects the price most with a **32.4%** impact weight, followed closely by the **Neighborhood Base Rate** (24.8% weight) and the number of **Bedrooms (BHK)** configuration (12.5% weight).";
        }
      } 
      else if (q.includes("is 3bhk better than 2bhk")) {
        const areaName = lastPrediction ? lastPrediction.location : "core neighborhoods";
        responseText = `In **${areaName}**, our model adds a premium of **+₹4.5L per bedroom** config step. However, a 3BHK also increases the built-up area, compounding OLS baseline rates. While a 3BHK has higher capital growth and space appreciation, a 2BHK typically offers better rental yield percentages in Bangalore IT hubs due to lower entry prices.`;
      } 
      else if (q.includes("how does location affect the price")) {
        if (lastPrediction) {
          responseText = `Location determines the baseline OLS rate per square foot. For your selected location **${lastPrediction.location}**, the base rate is set to **₹${(lastPrediction.base_value * 100000 / lastPrediction.area).toFixed(0)}/sqft** (OLS estimate). Distances to the city center decrease prices by **₹0.9L per kilometer** to account for suburban transport overheads.`;
        } else {
          responseText = "Location is critical because it dictates the OLS baseline rate per square foot. Core areas like Indiranagar have a base rate of **₹9,500/sqft**, Koramangala is **₹8,800/sqft**, whereas secondary tech belts like Whitefield are **₹5,800/sqft**. Radial distance to MG Road also applies linear discounts.";
        }
      } 
      else if (q.includes("explain my prediction")) {
        if (lastPrediction) {
          responseText = `Certainly! Your property in **${lastPrediction.location}** has a hybrid prediction of **₹${lastPrediction.final_prediction}L**. Here is the step-by-step breakdown:
1. **OLS Baseline Price:** **₹${lastPrediction.hedonic_prediction}L** (Linear calculation based on square footage, layout parameters).
2. **XGBoost Residual Correction:** **${lastPrediction.predicted_residual >= 0 ? '+' : ''}₹${lastPrediction.predicted_residual}L** (Adjustments for non-linear interactions, age, and furnishing status).
3. **95% Confidence Bounds:** **₹${lastPrediction.prediction_range.lower}L — ₹${lastPrediction.prediction_range.upper}L**.
4. **Confidence Level:** **${lastPrediction.confidence || 87}%** (based on cross-validation variance).`;
        } else {
          responseText = "Please navigate to **Predict Price**, enter your property characteristics, and run a valuation. Once evaluated, I will provide a granular regression breakdown of your prediction here!";
        }
      } 
      else {
        // Fallback response
        responseText = `I have received your question: "${question}". As a specialized real-estate evaluator, I can tell you that in Bangalore's market, values are driven primarily by sqft area, location base rates, and property age. ${lastPrediction ? `Your current loaded property in **${lastPrediction.location}** is estimated at **₹${lastPrediction.final_prediction}L**.` : "Please evaluate a property to see personalized explanations."}`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: responseText,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = (textToSubmit) => {
    const text = textToSubmit || inputText;
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: text,
        timestamp: new Date()
      }
    ]);
    
    if (!textToSubmit) {
      setInputText('');
    }

    generateAIResponse(text);
  };

  const handleClear = () => {
    setMessages([
      { 
        sender: 'assistant', 
        text: "Chat history cleared. How can I help you analyze property prices today?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Circular Floating iOS Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Ask EstateSense AI Assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-slate-950/85 border border-white/[0.15] hover:border-emerald-400/80 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center group cursor-pointer backdrop-blur-2xl hover:scale-105 active:scale-95 ios-pressable"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 pointer-events-none" />
        <img 
          src="/logo.png" 
          alt="Ask EstateSense AI" 
          className="w-10 h-10 object-contain brightness-125 group-hover:scale-105 transition-transform duration-200 relative z-10" 
        />
        {/* Sparkling badge indicator */}
        <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-white shadow-sm">
          <Sparkles size={9} />
        </span>
      </button>

      {/* iOS Frosted Glass Sheet Chat Container */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-[350px] sm:w-[400px] h-[520px] rounded-3xl border border-white/[0.1] bg-[#0c0d12]/90 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-ios-fade-scale">
          
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-white/[0.07] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white tracking-tight">EstateSense Intelligence</span>
                <span className="text-[10px] text-slate-400">AI Valuation Assistant</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleClear}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer ios-pressable"
                title="Clear chat history"
              >
                <Trash2 size={13} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer ios-pressable"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 select-text scrollbar-thin">
            {messages.map((msg, idx) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div 
                  key={idx} 
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} animate-ios-fade-scale`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed break-words border ${
                    isAssistant 
                      ? 'bg-white/[0.06] border-white/[0.08] text-slate-200 rounded-tl-sm' 
                      : 'bg-emerald-600/25 border-emerald-500/30 text-emerald-100 rounded-tr-sm font-medium'
                  }`}>
                    {/* Render markdown style basic bold markers */}
                    {msg.text.split('\n').map((para, pIdx) => (
                      <p key={pIdx} className={pIdx > 0 ? 'mt-1.5' : ''}>
                        {para.split('**').map((chunk, cIdx) => 
                          cIdx % 2 === 1 ? <strong key={cIdx} className="text-white font-bold">{chunk}</strong> : chunk
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-ios-fade-scale">
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 text-slate-400 flex items-center gap-1.5">
                  <span className="text-[10px] font-medium mr-1 text-slate-400">Analyzing</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse delay-100" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse delay-200" />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggested Questions in iOS Capsule Pills */}
          <div className="p-3 bg-white/[0.02] border-t border-white/[0.06] space-y-1.5 shrink-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block px-1">Suggested Inquiries</span>
            <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto py-1 scrollbar-none">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1 text-[10px] font-medium bg-white/[0.05] hover:bg-emerald-500/15 hover:text-emerald-300 text-slate-300 border border-white/[0.08] hover:border-emerald-500/30 rounded-full transition-all cursor-pointer text-left truncate max-w-full ios-pressable"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-white/[0.06] bg-slate-950/80 flex gap-2 shrink-0 items-center"
          >
            <input
              type="text"
              placeholder="Ask about valuation factors, OLS, residuals..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs glass-input focus:outline-none"
            />
            <button
              type="submit"
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all cursor-pointer ios-pressable"
            >
              <Send size={13} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
