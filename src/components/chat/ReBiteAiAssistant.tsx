import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, RefreshCw } from 'lucide-react';
import { useReBite } from '../../context/ReBiteContext';
import { UserRole } from '../../types/rebite';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const EXAMPLE_QUESTIONS = [
  'How much food should we prepare tomorrow?',
  'Which food items are wasted the most?',
  'How can I reduce my food wastage?',
  'Which surplus food is available?',
  'How much food has our campus saved this month?',
];

export const ReBiteAiAssistant: React.FC = () => {
  const { db, currentUser, campusMetrics } = useReBite();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am the ReBite Campus Sustainability Assistant. I have real-time access to our campus meal attendance, surplus food listings, canteen stock, and NGO redistribution logs. Ask me anything or tap a quick question below.',
      timestamp: 'Live',
    },
  ]);

  const sendMessage = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const campusStateSummary = {
        campusMetrics,
        studentProfile: {
          name: db.studentProfile.name,
          foodSavedKg: db.studentProfile.foodSavedKg,
          portionSize: db.studentProfile.portionSize,
          streakDays: db.studentProfile.streakDays,
        },
        todayMenus: db.mealMenus.map((m) => ({
          mealType: m.mealType,
          expectedStudents: m.expectedStudents,
          confirmedCount: m.confirmedCount,
          items: m.items.map((i) => ({
            name: i.name,
            plannedKg: i.plannedKg,
            preparedKg: i.preparedKg,
            consumedKg: i.consumedKg,
          })),
        })),
        availableSurplusListings: db.surplusListings.map((s) => ({
          foodName: s.foodName,
          sourceName: s.sourceName,
          location: s.location,
          remainingPortions: s.remainingPortions,
          priceType: s.priceType,
          priceInr: s.priceInr,
          collectionDeadline: s.collectionDeadline,
          status: s.status,
        })),
        canteenInventory: db.canteenInventory.map((c) => ({
          name: c.name,
          remainingUnits: c.remainingUnits,
          expiryTime: c.expiryTime,
          status: c.status,
        })),
        latestDemandPrediction: db.demandPredictions[0],
        ngoRedistributionCount: db.redistributionRecords.length,
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          currentRole: currentUser?.role || UserRole.STUDENT,
          currentUserName: currentUser?.name || 'Campus User',
          campusStateSummary,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gemini request failed');
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          sender: 'assistant',
          text: `Unable to reach Gemini AI right now (${err.message || 'Check API key in Settings > Secrets'}). Based on live local database records: Campus has saved ${campusMetrics.totalFoodSavedKg} kg (${campusMetrics.totalMealsRedistributed} meals), and there are currently ${db.surplusListings.reduce((a, s) => a + s.remainingPortions, 0)} surplus portions available.`,
          timestamp: 'System',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="w-[350px] sm:w-[400px] bg-white border border-[#17231B]/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[560px]">
          {/* Header */}
          <div className="bg-[#14532D] text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <div>
                <div className="text-xs font-display font-bold">ReBite AI Sustainability Assistant</div>
                <div className="text-[10px] text-white/75">
                  Connected to Live Campus Database · Gemini AI
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
              aria-label="Close AI assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAF7] max-h-[310px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-xl text-xs leading-relaxed max-w-[88%] whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-white border border-[#17231B]/10 text-[#17231B]'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#17231B]/45 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#14532D] bg-white border border-[#17231B]/10 px-3 py-2 rounded-xl w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#16A34A]" />
                <span>Querying campus data with Gemini...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-3 py-2 bg-white border-t border-[#17231B]/10">
            <div className="text-[10px] font-semibold text-[#17231B]/55 mb-1.5">
              Quick Campus Queries:
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {EXAMPLE_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="px-2.5 py-1 text-[11px] font-medium bg-[#F8FAF7] hover:bg-[#16A34A]/10 text-[#14532D] border border-[#17231B]/10 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 bg-white border-t border-[#17231B]/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about surplus, meal demand, or savings..."
              className="flex-1 px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/15 rounded-lg focus:outline-none focus:border-[#16A34A]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-[#16A34A] hover:bg-[#14532D] disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-3 bg-[#14532D] hover:bg-[#16A34A] text-white rounded-full shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
          aria-label="Open ReBite AI Assistant"
        >
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-semibold whitespace-nowrap">ReBite AI Assistant</span>
          <MessageSquare className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
