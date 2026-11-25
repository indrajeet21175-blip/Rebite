import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Utensils,
  Award,
  MessageSquare,
  Sparkles,
  Droplets,
  Wind,
  Scale,
  MapPin,
  Search,
  Bell,
  Trophy,
  Star,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useReBite } from '../../context/ReBiteContext';
import { ECO_ASSUMPTIONS, UserRole } from '../../types/rebite';
import { SafeFoodImage } from '../common/SafeFoodImage';

interface StudentDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeTab, setActiveTab }) => {
  const {
    db,
    currentUser,
    toggleMealConfirmation,
    updateStudentPreferences,
    claimSurplusPortions,
    markClaimCollected,
    submitMealFeedback,
  } = useReBite();

  const profile = db.studentProfile;
  const studentId = currentUser?.id || profile.userId;

  // Surplus discovery state
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Mess' | 'Canteen' | 'Free'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimPortionsMap, setClaimPortionsMap] = useState<Record<string, number>>({});
  const [claimFeedback, setClaimFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Feedback form state
  const [selectedMealId, setSelectedMealId] = useState<string>(db.mealMenus[1]?.id || db.mealMenus[0]?.id || '');
  const [rating, setRating] = useState<number>(5);
  const [qualityComment, setQualityComment] = useState('');
  const [excessiveWasteObserved, setExcessiveWasteObserved] = useState(false);
  const [wastedItemReported, setWastedItemReported] = useState('');
  const [feedbackSavedMsg, setFeedbackSavedMsg] = useState('');

  // Gemini AI personalized insight state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiInsights, setAiInsights] = useState<{
    summaryInsight: string;
    recommendations: { title: string; action: string; expectedImpact: string; priority: string }[];
  } | null>(null);

  // Student's personal eco metrics based on documented assumptions
  const personalMealsSaved = Math.round(profile.foodSavedKg * ECO_ASSUMPTIONS.MEALS_PER_KG);
  const personalWaterSavedLiters = Math.round(profile.foodSavedKg * ECO_ASSUMPTIONS.WATER_LITERS_PER_FOOD_KG);
  const personalCo2AvoidedKg = Number((profile.foodSavedKg * ECO_ASSUMPTIONS.CO2_KG_PER_FOOD_KG).toFixed(1));

  const studentWeeklyChartData = [
    { day: 'Mon', attendedMeals: 3, confirmedOnTime: 3, foodSavedGrams: 420 },
    { day: 'Tue', attendedMeals: 2, confirmedOnTime: 3, foodSavedGrams: 650 },
    { day: 'Wed', attendedMeals: 3, confirmedOnTime: 3, foodSavedGrams: 540 },
    { day: 'Thu', attendedMeals: 3, confirmedOnTime: 2, foodSavedGrams: 310 },
    { day: 'Fri', attendedMeals: 2, confirmedOnTime: 3, foodSavedGrams: 720 },
    { day: 'Sat', attendedMeals: 1, confirmedOnTime: 3, foodSavedGrams: 890 },
    { day: 'Sun', attendedMeals: 2, confirmedOnTime: 3, foodSavedGrams: 640 },
  ];

  const filteredSurplus = db.surplusListings.filter((item) => {
    if (sourceFilter === 'Mess' && item.sourceType !== 'Mess') return false;
    if (sourceFilter === 'Canteen' && item.sourceType !== 'Canteen') return false;
    if (sourceFilter === 'Free' && item.priceType !== 'Free') return false;
    if (
      searchQuery.trim() &&
      !item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.sourceName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleClaim = (surplusId: string, maxAvailable: number) => {
    const qty = claimPortionsMap[surplusId] || 1;
    if (qty > maxAvailable) {
      setClaimFeedback({
        type: 'error',
        text: `Only ${maxAvailable} portions are available for this batch.`,
      });
      return;
    }
    const res = claimSurplusPortions(surplusId, qty);
    setClaimFeedback({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualityComment.trim()) return;
    submitMealFeedback(
      selectedMealId,
      rating,
      qualityComment.trim(),
      excessiveWasteObserved,
      excessiveWasteObserved ? wastedItemReported || 'Rice / Staple Buffer' : 'None'
    );
    setQualityComment('');
    setExcessiveWasteObserved(false);
    setWastedItemReported('');
    setFeedbackSavedMsg('Feedback submitted! +20 sustainability points credited to your hostel profile.');
    setTimeout(() => setFeedbackSavedMsg(''), 4000);
  };

  const fetchPersonalizedAiInsights = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: UserRole.STUDENT,
          contextData: {
            studentName: profile.name,
            hostel: profile.hostel,
            dietaryPreference: profile.dietaryPreference,
            portionSize: profile.portionSize,
            mealsConfirmedCount: profile.mealsConfirmedCount,
            mealsClaimedCount: profile.mealsClaimedCount,
            foodSavedKg: profile.foodSavedKg,
            streakDays: profile.streakDays,
            upcomingMenus: db.mealMenus.map((m) => ({
              mealType: m.mealType,
              items: m.items.map((i) => i.name),
            })),
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate personalized insights');
      }
      setAiInsights(data);
    } catch (err: any) {
      setAiError(err.message || 'Unable to reach Gemini AI right now.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Personal Food Rescued</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#14532D]">
            {profile.foodSavedKg.toFixed(2)} kg
          </div>
          <div className="text-xs text-[#16A34A] mt-1.5">
            ~{personalMealsSaved} meal equivalents saved
          </div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Meal Confirmation Streak</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#17231B]">
            {profile.streakDays} Days
          </div>
          <div className="text-xs text-[#17231B]/60 mt-1.5">
            {profile.mealsConfirmedCount} total on-time RSVPs
          </div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Surplus Portions Claimed</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#17231B]">
            {profile.mealsClaimedCount} Portions
          </div>
          <div className="text-xs text-[#17231B]/60 mt-1.5">
            {db.foodClaims.filter((c) => c.status === 'Reserved').length} active pickup code(s)
          </div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Sustainability Score & Points</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#16A34A]">
            {profile.sustainabilityScore}/100 · {profile.points} pts
          </div>
          <div className="text-xs text-[#17231B]/60 mt-1.5">
            Hostel Leaderboard Rank #{db.leaderboard.findIndex((l) => l.name === profile.name) + 1 || 2}
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#17231B]/10 rounded-xl">
        {[
          { id: 'overview', label: 'A. Smart Meal Confirmation' },
          { id: 'surplus', label: 'B. Surplus Food Discovery' },
          { id: 'insights', label: 'C. Meal Insights & Eco-Impact' },
          { id: 'rewards', label: 'D. Leaderboard & Challenges' },
          { id: 'feedback', label: 'E. Meal Quality Feedback' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#16A34A] text-white'
                : 'text-[#17231B]/70 hover:text-[#17231B] hover:bg-[#F8FAF7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION A: SMART MEAL CONFIRMATION & PREFERENCES */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Today's 3 Meal Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-display font-bold text-[#17231B]">
                  Today’s Campus Mess Schedule · Wednesday, 25 Nov 2026
                </h2>
                <p className="text-xs text-[#17231B]/65">
                  Confirming or skipping before the cutoff directly updates the Mess Manager’s cooking batch calculator.
                </p>
              </div>
            </div>

            {db.mealMenus.map((meal) => {
              const studentConf = db.mealConfirmations.find(
                (mc) => mc.mealMenuId === meal.id && mc.studentId === studentId
              );
              const currentStatus = studentConf?.status || 'Confirmed';

              return (
                <div
                  key={meal.id}
                  className="bg-white border border-[#17231B]/10 rounded-xl p-6 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#17231B]/10">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#17231B]/60 mb-1">
                        <span className="font-semibold text-[#14532D]">{meal.mealType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{meal.servingWindow}</span>
                        <span aria-hidden="true">·</span>
                        <span>Cutoff: {meal.cutoffTime}</span>
                      </div>
                      <h3 className="text-base font-display font-bold text-[#17231B]">
                        {meal.items.map((i) => i.name).join(' + ')}
                      </h3>
                      <div className="text-xs text-[#17231B]/60 mt-1">
                        {meal.messName} · Live Confirmed Turnout:{' '}
                        <span className="font-mono font-semibold text-[#17231B]">
                          {meal.confirmedCount}/{meal.expectedStudents} students
                        </span>
                      </div>
                    </div>

                    {/* Interactive Attendance Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleMealConfirmation(meal.id, 'Confirmed')}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          currentStatus === 'Confirmed'
                            ? 'bg-[#16A34A] text-white'
                            : 'bg-[#F8FAF7] text-[#17231B]/70 border border-[#17231B]/15 hover:border-[#16A34A]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Attending</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleMealConfirmation(meal.id, 'Skipped')}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          currentStatus === 'Skipped'
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#F8FAF7] text-[#17231B]/70 border border-[#17231B]/15 hover:border-amber-600'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Skipping Meal</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#17231B]/70">
                    <div>
                      Your RSVP Status:{' '}
                      <strong className={currentStatus === 'Confirmed' ? 'text-[#16A34A]' : 'text-amber-700'}>
                        {currentStatus === 'Confirmed'
                          ? `Confirmed (${profile.portionSize} Portion)`
                          : 'Opted Out (Prevents ~400g kitchen over-prep)'}
                      </strong>
                    </div>
                    <div className="font-mono text-[11px] text-[#17231B]/55">
                      Session Status: {meal.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dietary & Portion Preferences + Reminders */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#17231B]/10 rounded-xl p-6">
              <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
                Meal Portion & Dietary Preferences
              </h3>
              <p className="text-xs text-[#17231B]/65 mb-5">
                Helps mess servers ladle the right portion size and reduces plate leftovers.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1.5">
                    Dietary Preference
                  </label>
                  <select
                    value={profile.dietaryPreference}
                    onChange={(e) =>
                      updateStudentPreferences({
                        dietaryPreference: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-medium bg-[#F8FAF7] border border-[#17231B]/15 rounded-lg focus:outline-none focus:border-[#16A34A]"
                  >
                    <option value="Vegetarian">Standard Vegetarian</option>
                    <option value="Jain">Jain (No Root Vegetables)</option>
                    <option value="High-Protein Veg">High-Protein Vegetarian (+Dal/Paneer)</option>
                    <option value="Vegan">Vegan (Dairy-Free)</option>
                    <option value="Non-Vegetarian">Non-Vegetarian (Egg/Chicken Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1.5">
                    Default Staple / Rice Portion Size
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['Light (-25% Rice)', 'Standard', 'Athlete (+25% Protein)'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updateStudentPreferences({ portionSize: size })}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                          profile.portionSize === size
                            ? 'border-[#16A34A] bg-[#16A34A]/10 text-[#14532D] font-semibold'
                            : 'border-[#17231B]/15 bg-white text-[#17231B]/80'
                        }`}
                      >
                        <span>{size}</span>
                        {profile.portionSize === size && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#17231B]/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#17231B] flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Pre-Cutoff Meal Reminders</span>
                    </div>
                    <p className="text-[11px] text-[#17231B]/60 mt-0.5">
                      Alert 60 mins before 06:30 AM, 10:30 AM & 05:30 PM cutoffs
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateStudentPreferences({ remindersEnabled: !profile.remindersEnabled })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      profile.remindersEnabled
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#17231B]/10 text-[#17231B]/70'
                    }`}
                  >
                    {profile.remindersEnabled ? 'Active' : 'Muted'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: SURPLUS FOOD DISCOVERY & MY CLAIMS */}
      {activeTab === 'surplus' && (
        <div className="space-y-6">
          {/* Active Pickup Tickets */}
          {db.foodClaims.length > 0 && (
            <div className="bg-[#14532D] text-white rounded-xl p-6">
              <h3 className="text-base font-display font-bold mb-1">
                Your Reserved Surplus Pickup Passes ({db.foodClaims.length})
              </h3>
              <p className="text-xs text-white/75 mb-4">
                Present the pickup verification code at the mess or canteen dispatch counter before the deadline.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {db.foodClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-white/10 border border-white/15 rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs text-[#F59E0B] font-mono font-semibold">
                        Pickup Code: {claim.pickupCode} · {claim.portionsClaimed} Portion(s) ({claim.weightKg} kg)
                      </div>
                      <div className="text-sm font-semibold mt-0.5">{claim.foodName}</div>
                      <div className="text-xs text-white/75 mt-1">
                        {claim.sourceName} · {claim.location} · Due: {claim.pickupDeadline}
                      </div>
                    </div>
                    <div>
                      {claim.status === 'Reserved' ? (
                        <button
                          onClick={() => markClaimCollected(claim.id)}
                          className="px-3 py-2 bg-[#16A34A] hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Confirm Collected
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-[#4ADE80] font-semibold">
                          Collected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#17231B]/10 rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', 'Mess', 'Canteen', 'Free'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSourceFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    sourceFilter === filter
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-[#F8FAF7] text-[#17231B]/70 hover:text-[#17231B]'
                  }`}
                >
                  {filter === 'All' ? 'All Campus Surplus' : filter === 'Free' ? 'Free Portions Only' : `${filter} Surplus`}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#17231B]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish or mess hall..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/15 rounded-lg focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          {claimFeedback && (
            <div
              className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
                claimFeedback.type === 'success'
                  ? 'bg-[#16A34A]/10 border-[#16A34A]/30 text-[#14532D]'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <span>{claimFeedback.text}</span>
              <button
                onClick={() => setClaimFeedback(null)}
                className="text-xs underline ml-4 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Surplus Food Cards Grid */}
          {filteredSurplus.length === 0 ? (
            <div className="bg-white border border-[#17231B]/10 rounded-xl p-12 text-center">
              <Utensils className="w-8 h-8 text-[#16A34A] mx-auto mb-3 opacity-80" />
              <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
                No Surplus Listings Match Your Filter
              </h3>
              <p className="text-xs text-[#17231B]/60 mb-4">
                Try switching the filter tab to "All Campus Surplus" or check back after the next meal service window.
              </p>
              <button
                onClick={() => {
                  setSourceFilter('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#16A34A] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSurplus.map((item) => {
                const selectedQty = claimPortionsMap[item.id] || 1;
                const isDepleted = item.remainingPortions <= 0 || item.status === 'Collected' || item.status === 'Expired';

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-[#17231B]/10 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden bg-[#14532D]">
                        <SafeFoodImage
                          src={item.imageUrl}
                          alt={item.foodName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                          <div className="text-xs font-medium">
                            {item.sourceType} · Prepared {item.preparedAt}
                          </div>
                          <div className="text-sm font-mono font-bold">
                            {item.priceType === 'Free' ? (
                              <span className="text-[#4ADE80]">FREE</span>
                            ) : (
                              <span>
                                ₹{item.priceInr}{' '}
                                <span className="line-through text-xs text-white/60">
                                  ₹{item.originalPriceInr}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        {/* Unboxed clean metadata line */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#17231B]/60 mb-2">
                          <span className="font-semibold text-[#14532D]">{item.sourceName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.storageCondition}</span>
                        </div>

                        <h3 className="text-base font-display font-bold text-[#17231B] mb-2 leading-snug">
                          {item.foodName}
                        </h3>
                        <p className="text-xs text-[#17231B]/70 leading-relaxed mb-4">
                          {item.description}
                        </p>

                        <div className="space-y-1.5 pt-3 border-t border-[#17231B]/10 text-xs text-[#17231B]/75">
                          <div className="flex items-center justify-between">
                            <span className="text-[#17231B]/60">Remaining Availability</span>
                            <span className="font-mono font-bold tabular-nums text-[#14532D]">
                              {item.remainingPortions} / {item.totalQuantityPortions} portions ({(item.remainingPortions * item.weightPerPortionKg).toFixed(1)} kg)
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#17231B]/60">Pickup Location</span>
                            <span className="font-medium text-right truncate max-w-[190px]">{item.location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#17231B]/60">Pickup Deadline</span>
                            <span className="font-mono font-semibold text-amber-700">{item.collectionDeadline}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      {isDepleted ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 bg-[#17231B]/10 text-[#17231B]/50 text-xs font-semibold rounded-xl cursor-not-allowed"
                        >
                          All Portions Claimed / Collected
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedQty}
                            onChange={(e) =>
                              setClaimPortionsMap((prev) => ({
                                ...prev,
                                [item.id]: Number(e.target.value),
                              }))
                            }
                            aria-label="Portions to claim"
                            className="px-3 py-2.5 text-xs font-mono font-semibold bg-[#F8FAF7] border border-[#17231B]/20 rounded-xl focus:outline-none focus:border-[#16A34A]"
                          >
                            {Array.from({ length: Math.min(5, item.remainingPortions) }, (_, i) => i + 1).map(
                              (num) => (
                                <option key={num} value={num}>
                                  {num} {num === 1 ? 'Portion' : 'Portions'}
                                </option>
                              )
                            )}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleClaim(item.id, item.remainingPortions)}
                            className="flex-1 py-2.5 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Claim Portion(s)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION C: PERSONALIZED MEAL INSIGHTS & ECO-IMPACT TRACKER */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Eco-Impact Tracker with Documented Assumptions */}
          <div className="bg-[#14532D] text-white rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-xs font-semibold text-[#F59E0B] mb-1">
                  Personal Eco-Impact Tracker
                </div>
                <h2 className="text-xl lg:text-2xl font-display font-bold">
                  Your Verified Campus Sustainability Footprint
                </h2>
              </div>
              <div className="text-xs font-mono bg-white/10 border border-white/15 px-3.5 py-2 rounded-lg">
                Sustainability Score: <strong>{profile.sustainabilityScore}/100</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 border border-white/15 rounded-xl p-4">
                <Utensils className="w-5 h-5 text-[#F59E0B] mb-2" />
                <div className="text-xs text-white/75">Est. Meals Saved</div>
                <div className="text-2xl font-mono font-bold tabular-nums mt-1">
                  {personalMealsSaved} meals
                </div>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-xl p-4">
                <Scale className="w-5 h-5 text-[#4ADE80] mb-2" />
                <div className="text-xs text-white/75">Food Weight Saved</div>
                <div className="text-2xl font-mono font-bold tabular-nums mt-1">
                  {profile.foodSavedKg.toFixed(2)} kg
                </div>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-xl p-4">
                <Droplets className="w-5 h-5 text-[#38BDF8] mb-2" />
                <div className="text-xs text-white/75">Est. Water Saved</div>
                <div className="text-2xl font-mono font-bold tabular-nums mt-1">
                  {personalWaterSavedLiters.toLocaleString()} L
                </div>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-xl p-4">
                <Wind className="w-5 h-5 text-[#A7F3D0] mb-2" />
                <div className="text-xs text-white/75">Est. CO2e Avoided</div>
                <div className="text-2xl font-mono font-bold tabular-nums mt-1">
                  {personalCo2AvoidedKg} kg
                </div>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              *Calculation Assumptions (Estimates): Figures are derived from your verified on-time meal opt-outs/confirmations (0.25 kg kitchen buffer saved per RSVP) plus claimed surplus food weight. Conversion factors: 1 kg food = 2.5 meals (400g/meal), 2.5 kg CO2e avoided (FAO life-cycle reference), and 850 L embedded agricultural water conserved.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Weekly Attendance & Food Saved Chart */}
            <div className="lg:col-span-7 bg-white border border-[#17231B]/10 rounded-xl p-6">
              <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
                Weekly Meal Attendance & Food Rescue Pattern (Grams Saved)
              </h3>
              <p className="text-xs text-[#17231B]/60 mb-6">
                Tracks daily food waste prevented through advance skipping on weekend/lab days and surplus pickups.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentWeeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="foodSavedGrams" name="Food Saved (g)" fill="#16A34A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gemini AI Personalized Sustainability Coach */}
            <div className="lg:col-span-5 bg-white border border-[#17231B]/10 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-semibold text-[#16A34A] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini AI Personalized Insights</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchPersonalizedAiInsights}
                    disabled={aiLoading}
                    className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#14532D] disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                    <span>{aiLoading ? 'Analyzing...' : 'Analyze My Pattern'}</span>
                  </button>
                </div>

                <h3 className="text-base font-display font-bold text-[#17231B] mb-2">
                  Individual Consumption & Waste Reduction Suggestions
                </h3>

                {aiError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 mb-3">
                    {aiError}
                  </div>
                )}

                {aiInsights ? (
                  <div className="space-y-3 mt-3">
                    <p className="text-xs text-[#17231B]/80 bg-[#F8FAF7] p-3 rounded-lg border border-[#17231B]/10">
                      {aiInsights.summaryInsight}
                    </p>
                    {aiInsights.recommendations?.map((rec, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-[#17231B]/10">
                        <div className="text-xs font-semibold text-[#14532D]">{rec.title}</div>
                        <p className="text-xs text-[#17231B]/75 mt-0.5">{rec.action}</p>
                        <div className="text-[11px] font-mono text-[#16A34A] mt-1">
                          Impact: {rec.expectedImpact}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    <div className="p-3.5 rounded-lg bg-[#F8FAF7] border border-[#17231B]/10">
                      <div className="text-xs font-semibold text-[#14532D]">
                        01. Weekend Dinner Opt-Out Opportunity
                      </div>
                      <p className="text-xs text-[#17231B]/75 mt-1">
                        You skipped 2 of the last 3 Saturday dinners. Marking Saturday opt-outs before 5:30 PM helps Central Mess cut raw rice buffer by 0.42 kg per student.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#F8FAF7] border border-[#17231B]/10">
                      <div className="text-xs font-semibold text-[#14532D]">
                        02. Portion Calibration Active ({profile.portionSize})
                      </div>
                      <p className="text-xs text-[#17231B]/75 mt-1">
                        Your current preference is synced with your hostel QR pass. Click "Analyze My Pattern" above for fresh Gemini AI guidance based on today’s menu.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: GAMIFICATION, LEADERBOARD & CHALLENGES */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Student Leaderboard */}
          <div className="lg:col-span-7 bg-white border border-[#17231B]/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-display font-bold text-[#17231B]">
                  Campus Sustainability Leaderboard
                </h3>
                <p className="text-xs text-[#17231B]/60">
                  Points are earned strictly through verified actions: on-time meal RSVPs (+15 pts), surplus claims (+25 pts), and meal quality audits (+20 pts).
                </p>
              </div>
              <Trophy className="w-5 h-5 text-[#F59E0B] shrink-0" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#17231B]/10 text-[11px] font-semibold text-[#17231B]/60">
                    <th className="py-2.5 pr-3">Rank</th>
                    <th className="py-2.5 pr-3">Student & Hostel</th>
                    <th className="py-2.5 pr-3 text-right">Confirmed RSVPs</th>
                    <th className="py-2.5 pr-3 text-right">Food Saved</th>
                    <th className="py-2.5 text-right">Verified Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17231B]/10 text-xs">
                  {db.leaderboard.map((row, index) => {
                    const isCurrentUser = row.name === profile.name;
                    return (
                      <tr
                        key={row.id}
                        className={isCurrentUser ? 'bg-[#16A34A]/10 font-semibold' : 'hover:bg-[#F8FAF7]'}
                      >
                        <td className="py-3 pr-3 font-mono tabular-nums text-[#14532D]">
                          #{index + 1}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="text-[#17231B]">
                            {row.name} {isCurrentUser && '(You)'}
                          </div>
                          <div className="text-[11px] text-[#17231B]/60 font-normal">{row.hostel}</div>
                        </td>
                        <td className="py-3 pr-3 text-right font-mono tabular-nums">
                          {row.mealsConfirmed}
                        </td>
                        <td className="py-3 pr-3 text-right font-mono tabular-nums text-[#16A34A]">
                          {row.foodSavedKg.toFixed(1)} kg
                        </td>
                        <td className="py-3 text-right font-mono font-bold tabular-nums text-[#14532D]">
                          {row.points} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Achievement Badges & Weekly Challenges */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#17231B]/10 rounded-xl p-6">
              <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
                Verified Achievement Badges
              </h3>
              <p className="text-xs text-[#17231B]/60 mb-4">
                Unlocked automatically when your database records cross sustainability thresholds.
              </p>

              <div className="space-y-3">
                {db.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                      ach.unlocked
                        ? 'bg-[#F8FAF7] border-[#16A34A]/40'
                        : 'bg-white border-[#17231B]/10 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Award
                          className={`w-4 h-4 shrink-0 ${
                            ach.unlocked ? 'text-[#16A34A]' : 'text-[#17231B]/40'
                          }`}
                        />
                        <span className="text-xs font-bold text-[#17231B]">{ach.title}</span>
                      </div>
                      <p className="text-xs text-[#17231B]/70 mt-1">{ach.description}</p>
                      <div className="text-[11px] font-mono text-[#17231B]/55 mt-1">
                        Requirement: {ach.requiredAction}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-[#14532D]">
                        +{ach.pointsAwarded} pts
                      </div>
                      <div className="text-[11px] text-[#16A34A] mt-0.5">
                        {ach.unlocked ? 'Unlocked' : 'In Progress'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION E: MEAL QUALITY & WASTE FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white border border-[#17231B]/10 rounded-xl p-6">
            <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
              Submit Meal Quality & Plate Waste Audit
            </h3>
            <p className="text-xs text-[#17231B]/60 mb-5">
              Your feedback flows directly to the Mess Manager console to adjust spice levels, portion ladles, and daily preparation quantities.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Select Campus Meal Session
                </label>
                <select
                  value={selectedMealId}
                  onChange={(e) => setSelectedMealId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg focus:outline-none focus:border-[#16A34A]"
                >
                  {db.mealMenus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.mealType} ({m.date}) · {m.items.map((i) => i.name).join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1.5">
                  Meal Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        rating >= star
                          ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#B45309]'
                          : 'bg-[#F8FAF7] border-[#17231B]/15 text-[#17231B]/40'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-semibold ml-2">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Food Quality & Portion Observations
                </label>
                <textarea
                  rows={3}
                  required
                  value={qualityComment}
                  onChange={(e) => setQualityComment(e.target.value)}
                  placeholder="Share constructive feedback on taste, portion serving size, or how to prevent leftovers..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10 space-y-3">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-[#17231B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excessiveWasteObserved}
                    onChange={(e) => setExcessiveWasteObserved(e.target.checked)}
                    className="accent-[#16A34A] w-4 h-4"
                  />
                  <span>I observed excessive plate waste or over-preparation during this meal</span>
                </label>

                {excessiveWasteObserved && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#17231B]/75 mb-1">
                      Which specific item was wasted the most?
                    </label>
                    <input
                      type="text"
                      value={wastedItemReported}
                      onChange={(e) => setWastedItemReported(e.target.value)}
                      placeholder="e.g., Basmati Jeera Rice / Dal Tadka"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#17231B]/20 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {feedbackSavedMsg && (
                <div className="p-3 rounded-lg bg-[#16A34A]/10 text-[#14532D] text-xs font-medium">
                  {feedbackSavedMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Submit Verified Meal Feedback (+20 Points)
              </button>
            </form>
          </div>

          {/* Feedback History */}
          <div className="lg:col-span-6 bg-white border border-[#17231B]/10 rounded-xl p-6">
            <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
              Campus Meal Feedback Log ({db.foodFeedback.length})
            </h3>
            <p className="text-xs text-[#17231B]/60 mb-4">
              Recent student reports shared with the Mess Management team.
            </p>

            <div className="space-y-3">
              {db.foodFeedback.map((fb) => (
                <div key={fb.id} className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                  <div className="flex items-center justify-between text-xs text-[#17231B]/60 mb-1">
                    <span className="font-semibold text-[#17231B]">{fb.studentName}</span>
                    <span className="font-mono font-semibold text-[#B45309]">Rating: {fb.rating}/5</span>
                  </div>
                  <div className="text-xs font-medium text-[#14532D] mb-1.5">{fb.mealLabel}</div>
                  <p className="text-xs text-[#17231B]/80 leading-relaxed">{fb.qualityComment}</p>
                  {fb.excessiveWasteObserved && (
                    <div className="mt-2 pt-2 border-t border-[#17231B]/10 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Flagged high plate waste on: {fb.wastedItemReported}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
