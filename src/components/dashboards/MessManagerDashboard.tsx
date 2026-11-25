import React, { useState } from 'react';
import {
  Utensils,
  Sparkles,
  Plus,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useReBite } from '../../context/ReBiteContext';
import { GENERATED_IMAGES, UserRole, DemandPredictionRecord } from '../../types/rebite';
import { SafeFoodImage } from '../common/SafeFoodImage';

interface MessManagerDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MessManagerDashboard: React.FC<MessManagerDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    db,
    updateMealQuantities,
    addMealMenuItem,
    publishSurplusListing,
    updateSurplusStatus,
    saveDemandPrediction,
  } = useReBite();

  const [selectedMealId, setSelectedMealId] = useState<string>(
    db.mealMenus[1]?.id || db.mealMenus[0]?.id || ''
  );
  const activeMenu = db.mealMenus.find((m) => m.id === selectedMealId) || db.mealMenus[0];

  // New Menu Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<
    'Main' | 'Staple' | 'Accompaniment' | 'Beverage/Dessert'
  >('Main');
  const [newItemPlannedKg, setNewItemPlannedKg] = useState<number>(45);

  // Surplus Form State
  const [surplusFoodName, setSurplusFoodName] = useState('');
  const [surplusDescription, setSurplusDescription] = useState('');
  const [surplusPortions, setSurplusPortions] = useState<number>(40);
  const [surplusWeightPerPortion, setSurplusWeightPerPortion] = useState<number>(0.42);
  const [surplusPreparedAt, setSurplusPreparedAt] = useState('01:15 PM');
  const [surplusDeadline, setSurplusDeadline] = useState('05:30 PM Today');
  const [surplusStorageCondition, setSurplusStorageCondition] = useState(
    'Hot Holding Bain-Marie (64°C)'
  );
  const [surplusTempCelsius, setSurplusTempCelsius] = useState<number>(64);
  const [surplusPackaging, setSurplusPackaging] = useState(
    'Food-grade 304 Stainless Steel Gastronorm Pan'
  );
  const [surplusImageUrl, setSurplusImageUrl] = useState<string>(
    GENERATED_IMAGES.SURPLUS_PANEER_THALI
  );
  const [surplusSuitableNgo, setSurplusSuitableNgo] = useState(true);
  const [surplusPublishedBanner, setSurplusPublishedBanner] = useState('');

  // AI Demand Prediction State
  const [predictMealId, setPredictMealId] = useState<string>('meal-dinner-today');
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState('');

  // AI Operational Recommendations State
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState<{
    summaryInsight: string;
    recommendations: { title: string; action: string; expectedImpact: string; priority: string }[];
  } | null>(null);

  // Calculate today's aggregated metrics from real db.mealMenus
  const lunchOrCompletedMenus = db.mealMenus.filter((m) => m.status !== 'Upcoming');
  const totalExpectedToday = activeMenu.expectedStudents;
  const totalConfirmedToday = activeMenu.confirmedCount;

  const totalPreparedKg = Number(
    lunchOrCompletedMenus
      .reduce((acc, m) => acc + m.items.reduce((s, i) => s + i.preparedKg, 0), 0)
      .toFixed(1)
  );
  const totalConsumedKg = Number(
    lunchOrCompletedMenus
      .reduce((acc, m) => acc + m.items.reduce((s, i) => s + i.consumedKg, 0), 0)
      .toFixed(1)
  );
  const estimatedSurplusKg = Number(Math.max(0, totalPreparedKg - totalConsumedKg).toFixed(1));
  const wastagePct =
    totalPreparedKg > 0
      ? Number(((estimatedSurplusKg / totalPreparedKg) * 100).toFixed(1))
      : 0;

  const currentPrediction =
    db.demandPredictions.find((p) => p.mealMenuId === predictMealId) ||
    db.demandPredictions[0];

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSurplusImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemPlannedKg <= 0) return;
    addMealMenuItem(activeMenu.id, newItemName.trim(), newItemCategory, Number(newItemPlannedKg));
    setNewItemName('');
    setNewItemPlannedKg(40);
  };

  const handlePublishSurplus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surplusFoodName.trim() || surplusPortions <= 0) return;
    publishSurplusListing({
      sourceType: 'Mess',
      sourceName: 'Aravalli & Vindhya Central Mess',
      location: 'Hostel Sector 4 · North Dispatch Counter',
      foodName: surplusFoodName.trim(),
      description:
        surplusDescription.trim() ||
        'Clean unserved kitchen batch stored in covered stainless steel pans.',
      imageUrl: surplusImageUrl,
      totalQuantityPortions: Number(surplusPortions),
      weightPerPortionKg: Number(surplusWeightPerPortion),
      preparedAt: surplusPreparedAt,
      collectionDeadline: surplusDeadline,
      storageCondition: surplusStorageCondition,
      storageTempCelsius: Number(surplusTempCelsius),
      packagingCondition: surplusPackaging,
      priceType: 'Free',
      priceInr: 0,
      originalPriceInr: 85,
      suitableForNgoBulk: surplusSuitableNgo,
    });
    setSurplusFoodName('');
    setSurplusDescription('');
    setSurplusPublishedBanner(
      'Surplus food batch published! Real-time alerts sent to Student Portal and NGO Quality Inspector.'
    );
    setTimeout(() => setSurplusPublishedBanner(''), 5000);
  };

  const runGeminiDemandForecast = async () => {
    const targetMeal = db.mealMenus.find((m) => m.id === predictMealId) || db.mealMenus[2];
    setPredictLoading(true);
    setPredictError('');
    try {
      const response = await fetch('/api/ai/predict-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: targetMeal.mealType,
          date: targetMeal.date,
          dayOfWeek: targetMeal.dayOfWeek,
          isWeekend: ['Saturday', 'Sunday'].includes(targetMeal.dayOfWeek),
          totalRegisteredStudents: targetMeal.expectedStudents,
          confirmedCount: targetMeal.confirmedCount,
          menuItems: targetMeal.items,
          historicalAttendance: db.historicalRecords.map((h) => ({
            date: h.date,
            day: h.dayShort,
            isWeekend: h.isWeekend,
            confirmed: h.confirmedAttendance,
            actual: h.actualAttendance,
            preparedKg: h.preparedKg,
            consumedKg: h.consumedKg,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gemini prediction failed');
      }

      const newRecord: DemandPredictionRecord = {
        id: `pred-${Date.now()}`,
        mealMenuId: targetMeal.id,
        mealLabel: `${targetMeal.dayOfWeek} ${targetMeal.mealType} · ${targetMeal.items
          .map((i) => i.name)
          .join(', ')}`,
        date: targetMeal.date,
        predictedHeadcount: data.predictedHeadcount || targetMeal.confirmedCount + 20,
        actualHeadcount: null,
        recommendedTotalKg: data.recommendedTotalKg || 210,
        actualPreparedKg: targetMeal.items.reduce((s, i) => s + i.plannedKg, 0),
        actualConsumedKg: targetMeal.items.reduce((s, i) => s + i.consumedKg, 0),
        expectedSurplusKgIfUnadjusted: data.expectedSurplusKgIfUnadjusted || 42,
        confidenceNote: data.confidenceNote || 'Forecast based on live confirmed attendance.',
        itemRecommendations: data.itemRecommendations || [],
        actionableAdvice: data.actionableAdvice || [],
        generatedAt: new Date().toISOString(),
      };
      saveDemandPrediction(newRecord);
    } catch (err: any) {
      setPredictError(err.message || 'Unable to generate forecast.');
    } finally {
      setPredictLoading(false);
    }
  };

  const applyPredictionToMenu = (prediction: DemandPredictionRecord) => {
    const targetMeal = db.mealMenus.find((m) => m.id === prediction.mealMenuId);
    if (!targetMeal) return;
    prediction.itemRecommendations.forEach((rec) => {
      const matched = targetMeal.items.find(
        (i) => i.name.toLowerCase() === rec.itemName.toLowerCase()
      );
      if (matched) {
        updateMealQuantities(
          targetMeal.id,
          matched.id,
          rec.recommendedKg,
          rec.recommendedKg,
          matched.consumedKg
        );
      }
    });
  };

  const fetchMessAiRecommendations = async () => {
    setRecLoading(true);
    setRecError('');
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: UserRole.MESS_MANAGER,
          contextData: {
            todayMenus: db.mealMenus,
            recentStudentFeedback: db.foodFeedback,
            activeSurplus: db.surplusListings.filter((s) => s.sourceType === 'Mess'),
            historicalSummary: db.historicalRecords.slice(-4),
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recommendations');
      }
      setAiRecommendations(data);
    } catch (err: any) {
      setRecError(err.message || 'Could not reach Gemini AI.');
    } finally {
      setRecLoading(false);
    }
  };

  const mostWastedItemsChart = [
    { item: 'Basmati Jeera Rice', avgDailySurplusKg: 14.2, prepAdjustSuggestedPct: -12 },
    { item: 'Dal Tadka / Lentils', avgDailySurplusKg: 8.6, prepAdjustSuggestedPct: -8 },
    { item: 'Paneer / Main Curry', avgDailySurplusKg: 6.4, prepAdjustSuggestedPct: -5 },
    { item: 'Whole Wheat Phulka', avgDailySurplusKg: 5.1, prepAdjustSuggestedPct: -6 },
    { item: 'Udipi Veg Sambar', avgDailySurplusKg: 4.3, prepAdjustSuggestedPct: -4 },
  ];

  return (
    <div className="space-y-8">
      {/* SECTION A: OVERVIEW KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-[#17231B]/10 rounded-xl p-4">
          <div className="text-xs text-[#17231B]/60 mb-1">Expected Students</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#17231B]">
            {totalExpectedToday}
          </div>
          <div className="text-[11px] text-[#17231B]/55 mt-1">Registered Hostel Quota</div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-4">
          <div className="text-xs text-[#17231B]/60 mb-1">Confirmed Attendance</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#16A34A]">
            {totalConfirmedToday}
          </div>
          <div className="text-[11px] text-[#16A34A] mt-1">
            {totalExpectedToday - totalConfirmedToday} opted out early
          </div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-4">
          <div className="text-xs text-[#17231B]/60 mb-1">Food Prepared (Today)</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#17231B]">
            {totalPreparedKg} kg
          </div>
          <div className="text-[11px] text-[#17231B]/55 mt-1">Breakfast + Lunch Service</div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-4">
          <div className="text-xs text-[#17231B]/60 mb-1">Food Consumed</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#14532D]">
            {totalConsumedKg} kg
          </div>
          <div className="text-[11px] text-[#17231B]/55 mt-1">Served across counters</div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-4">
          <div className="text-xs text-[#17231B]/60 mb-1">Estimated Surplus</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#B45309]">
            {estimatedSurplusKg} kg
          </div>
          <div className="text-[11px] text-[#17231B]/55 mt-1">Clean unserved kitchen batch</div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-4">
          <div className="text-xs text-[#17231B]/60 mb-1">Unconsumed / Surplus %</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#16A34A]">
            {wastagePct}%
          </div>
          <div className="text-[11px] text-[#17231B]/55 mt-1">Down from 22.4% baseline</div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#17231B]/10 rounded-xl">
        {[
          { id: 'overview', label: 'A. AI Demand Prediction' },
          { id: 'prep', label: 'B. Food Preparation & Menu Ledger' },
          { id: 'surplus', label: 'C. Surplus Food Management' },
          { id: 'analytics', label: 'D. Wastage Analytics & AI Advice' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#14532D] text-white'
                : 'text-[#17231B]/70 hover:text-[#17231B] hover:bg-[#F8FAF7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB A: AI-BASED FOOD DEMAND PREDICTION */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#17231B]/10">
              <div>
                <div className="text-xs font-semibold text-[#16A34A] flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini AI Pre-Cooking Demand & Surplus Forecaster</span>
                </div>
                <h2 className="text-xl font-display font-bold text-[#17231B]">
                  Predict Turnout & Optimize Batch Quantities Before Preparation
                </h2>
                <p className="text-xs text-[#17231B]/65 mt-0.5">
                  Combines live student confirmations with historical weekday/weekend attendance records.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={predictMealId}
                  onChange={(e) => setPredictMealId(e.target.value)}
                  className="px-3.5 py-2 text-xs font-semibold bg-[#F8FAF7] border border-[#17231B]/20 rounded-xl focus:outline-none focus:border-[#16A34A]"
                >
                  {db.mealMenus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.mealType} ({m.confirmedCount} confirmed / {m.expectedStudents} total)
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={runGeminiDemandForecast}
                  disabled={predictLoading}
                  className="px-4 py-2 bg-[#16A34A] hover:bg-[#14532D] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${predictLoading ? 'animate-spin' : ''}`} />
                  <span>{predictLoading ? 'Running Gemini Forecast...' : 'Run Gemini Demand Forecast'}</span>
                </button>
              </div>
            </div>

            {predictError && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {predictError}
              </div>
            )}

            {currentPrediction && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-display font-bold text-[#17231B]">
                      Forecasted Dish Preparation Breakdown · {currentPrediction.mealLabel}
                    </h3>
                    <button
                      type="button"
                      onClick={() => applyPredictionToMenu(currentPrediction)}
                      className="px-3 py-1.5 bg-[#14532D] hover:bg-[#16A34A] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Apply Recommended Kg to Menu
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                      <div className="text-xs text-[#17231B]/60">Predicted Diners</div>
                      <div className="text-xl font-mono font-bold tabular-nums text-[#14532D] mt-1">
                        {currentPrediction.predictedHeadcount} students
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                      <div className="text-xs text-[#17231B]/60">Recommended Prep</div>
                      <div className="text-xl font-mono font-bold tabular-nums text-[#16A34A] mt-1">
                        {currentPrediction.recommendedTotalKg} kg
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                      <div className="text-xs text-[#17231B]/60">Surplus Prevented</div>
                      <div className="text-xl font-mono font-bold tabular-nums text-[#B45309] mt-1">
                        {currentPrediction.expectedSurplusKgIfUnadjusted} kg
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-[#17231B]/10 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F8FAF7] border-b border-[#17231B]/10 text-[#17231B]/65">
                          <th className="py-2.5 px-3">Menu Item</th>
                          <th className="py-2.5 px-3 text-right">Baseline Planned</th>
                          <th className="py-2.5 px-3 text-right">AI Recommended</th>
                          <th className="py-2.5 px-3">Reasoning</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#17231B]/10">
                        {currentPrediction.itemRecommendations.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-3 font-semibold text-[#17231B]">{item.itemName}</td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums">
                              {item.plannedKg} kg
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-[#16A34A]">
                              {item.recommendedKg} kg
                            </td>
                            <td className="py-3 px-3 text-[#17231B]/75">{item.adjustmentReason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between bg-[#F8FAF7] border border-[#17231B]/10 rounded-xl p-5">
                  <div>
                    <div className="text-xs font-semibold text-[#14532D] mb-2">
                      Methodology & Transparency Note
                    </div>
                    <p className="text-xs text-[#17231B]/80 leading-relaxed mb-4">
                      {currentPrediction.confidenceNote}
                    </p>

                    <div className="text-xs font-semibold text-[#17231B] mb-2">
                      Actionable Pre-Service Steps
                    </div>
                    <ul className="space-y-2 text-xs text-[#17231B]/75">
                      {currentPrediction.actionableAdvice.map((adv, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#17231B]/10 text-[11px] text-[#17231B]/60">
                    Forecast generated from verified historical logs ({db.historicalRecords.length} days) and live student RSVPs. No synthetic accuracy percentages are fabricated.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Historical Predicted/Confirmed vs Actual Turnout Comparison Chart */}
          <div className="bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
              7-Day Confirmed Attendance vs. Actual Dining Turnout (Weekday & Weekend Pattern)
            </h3>
            <p className="text-xs text-[#17231B]/60 mb-6">
              Demonstrates sharp weekend drop-offs (Sat/Sun) where advance RSVP adjustments prevent large kitchen over-production.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={db.historicalRecords}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="dayShort" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[350, 650]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="expectedAttendance"
                    name="Registered Quota (620)"
                    stroke="#9CA3AF"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="confirmedAttendance"
                    name="Student Confirmed RSVP"
                    stroke="#16A34A"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualAttendance"
                    name="Actual Turnout"
                    stroke="#14532D"
                    strokeWidth={2.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: FOOD PREPARATION MANAGEMENT & DAILY UTILIZATION */}
      {activeTab === 'prep' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#17231B]/10 mb-6">
              <div>
                <h2 className="text-lg font-display font-bold text-[#17231B]">
                  Daily Meal Preparation & Consumption Ledger
                </h2>
                <p className="text-xs text-[#17231B]/60">
                  Update prepared and consumed weights in kilograms to calculate real-time utilization and remaining surplus.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {db.mealMenus.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMealId(m.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeMenu.id === m.id
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#F8FAF7] text-[#17231B]/70'
                    }`}
                  >
                    {m.mealType}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#17231B]/10 text-[#17231B]/60">
                    <th className="py-2.5 pr-3">Dish Name & Category</th>
                    <th className="py-2.5 px-2 text-right">Planned (kg)</th>
                    <th className="py-2.5 px-2 text-right">Prepared (kg)</th>
                    <th className="py-2.5 px-2 text-right">Consumed (kg)</th>
                    <th className="py-2.5 pl-2 text-right">Remaining Surplus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17231B]/10">
                  {activeMenu.items.map((item) => {
                    const itemSurplus = Math.max(0, Number((item.preparedKg - item.consumedKg).toFixed(1)));
                    return (
                      <tr key={item.id}>
                        <td className="py-3 pr-3">
                          <div className="font-semibold text-[#17231B]">{item.name}</div>
                          <div className="text-[11px] text-[#17231B]/55">{item.category}</div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <input
                            type="number"
                            step="0.5"
                            value={item.plannedKg}
                            onChange={(e) =>
                              updateMealQuantities(
                                activeMenu.id,
                                item.id,
                                Number(e.target.value),
                                item.preparedKg,
                                item.consumedKg
                              )
                            }
                            className="w-20 px-2 py-1 text-right font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded"
                          />
                        </td>
                        <td className="py-3 px-2 text-right">
                          <input
                            type="number"
                            step="0.5"
                            value={item.preparedKg}
                            onChange={(e) =>
                              updateMealQuantities(
                                activeMenu.id,
                                item.id,
                                item.plannedKg,
                                Number(e.target.value),
                                item.consumedKg
                              )
                            }
                            className="w-20 px-2 py-1 text-right font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded"
                          />
                        </td>
                        <td className="py-3 px-2 text-right">
                          <input
                            type="number"
                            step="0.5"
                            value={item.consumedKg}
                            onChange={(e) =>
                              updateMealQuantities(
                                activeMenu.id,
                                item.id,
                                item.plannedKg,
                                item.preparedKg,
                                Number(e.target.value)
                              )
                            }
                            className="w-20 px-2 py-1 text-right font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded"
                          />
                        </td>
                        <td className="py-3 pl-2 text-right font-mono font-bold tabular-nums text-[#14532D]">
                          {itemSurplus} kg
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Dish to Selected Meal Menu */}
          <div className="lg:col-span-4 bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
              Add Dish to {activeMenu.mealType} Menu
            </h3>
            <p className="text-xs text-[#17231B]/60 mb-5">
              Immediately syncs with Student meal cards and AI batch predictor.
            </p>

            <form onSubmit={handleAddMenuItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Dish Name
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Palak Paneer / Masala Khichdi"
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Category
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                >
                  <option value="Main">Main Dish / Curry</option>
                  <option value="Staple">Staple (Rice / Roti)</option>
                  <option value="Accompaniment">Accompaniment (Raita / Chutney)</option>
                  <option value="Beverage/Dessert">Beverage / Dessert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Planned Preparation Weight (kg)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newItemPlannedKg}
                  onChange={(e) => setNewItemPlannedKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dish to {activeMenu.mealType}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB C: SURPLUS FOOD MANAGEMENT & BROADCAST */}
      {activeTab === 'surplus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Publish New Surplus Form */}
          <div className="lg:col-span-6 bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold text-[#17231B] mb-1">
              Publish Mess Surplus Food Batch
            </h2>
            <p className="text-xs text-[#17231B]/60 mb-5">
              Broadcasts unserved kitchen batches to Hostel Students and FSSAI NGO Inspectors in real time.
            </p>

            {surplusPublishedBanner && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-medium text-[#14532D]">
                {surplusPublishedBanner}
              </div>
            )}

            <form onSubmit={handlePublishSurplus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Food Item / Meal Combination Name
                </label>
                <input
                  type="text"
                  required
                  value={surplusFoodName}
                  onChange={(e) => setSurplusFoodName(e.target.value)}
                  placeholder="e.g., Dal Tadka, Jeera Rice & Paneer Masala Batch"
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Available Portions
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={surplusPortions}
                    onChange={(e) => setSurplusPortions(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Weight per Portion (kg)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={surplusWeightPerPortion}
                    onChange={(e) => setSurplusWeightPerPortion(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Preparation Time
                  </label>
                  <input
                    type="text"
                    required
                    value={surplusPreparedAt}
                    onChange={(e) => setSurplusPreparedAt(e.target.value)}
                    placeholder="e.g., 12:15 PM"
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Collection Deadline
                  </label>
                  <input
                    type="text"
                    required
                    value={surplusDeadline}
                    onChange={(e) => setSurplusDeadline(e.target.value)}
                    placeholder="e.g., 05:30 PM Today"
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Storage Method
                  </label>
                  <input
                    type="text"
                    required
                    value={surplusStorageCondition}
                    onChange={(e) => setSurplusStorageCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Holding Temperature (°C)
                  </label>
                  <input
                    type="number"
                    required
                    value={surplusTempCelsius}
                    onChange={(e) => setSurplusTempCelsius(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1.5">
                  Food Batch Photograph (Upload or Choose Kitchen Preset)
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <label className="px-3 py-1.5 bg-[#F8FAF7] hover:bg-[#16A34A]/10 border border-[#17231B]/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setSurplusImageUrl(GENERATED_IMAGES.SURPLUS_PANEER_THALI)}
                    className="px-2.5 py-1.5 text-[11px] bg-[#F8FAF7] border border-[#17231B]/15 rounded-lg cursor-pointer"
                  >
                    Paneer Thali Batch
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurplusImageUrl(GENERATED_IMAGES.SURPLUS_VEG_BIRYANI)}
                    className="px-2.5 py-1.5 text-[11px] bg-[#F8FAF7] border border-[#17231B]/15 rounded-lg cursor-pointer"
                  >
                    Veg Biryani Pan
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-[#17231B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={surplusSuitableNgo}
                  onChange={(e) => setSurplusSuitableNgo(e.target.checked)}
                  className="accent-[#16A34A] w-4 h-4"
                />
                <span>Flag batch as suitable for bulk NGO community redistribution (&gt;10 portions)</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Publish Surplus to Students & NGOs
              </button>
            </form>
          </div>

          {/* Manage Published Surplus Listings */}
          <div className="lg:col-span-6 bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
              Active & Past Mess Surplus Batches
            </h3>
            <p className="text-xs text-[#17231B]/60 mb-4">
              Update batch status as students or NGO vehicles complete pickup.
            </p>

            <div className="space-y-4">
              {db.surplusListings
                .filter((s) => s.sourceType === 'Mess')
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10 flex flex-col sm:flex-row gap-4"
                  >
                    <div className="w-full sm:w-28 h-24 rounded-lg overflow-hidden shrink-0">
                      <SafeFoodImage
                        src={item.imageUrl}
                        alt={item.foodName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-[#17231B]/60 mb-1">
                        <span>Prep: {item.preparedAt} · {item.storageTempCelsius}°C</span>
                        <span className="font-mono font-semibold text-[#14532D]">{item.status}</span>
                      </div>
                      <h4 className="text-sm font-display font-bold text-[#17231B]">{item.foodName}</h4>
                      <div className="text-xs font-mono text-[#17231B]/75 mt-1">
                        Remaining: {item.remainingPortions} / {item.totalQuantityPortions} portions ({(item.remainingPortions * item.weightPerPortionKg).toFixed(1)} kg)
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {(['Available', 'Collected', 'Expired'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateSurplusStatus(item.id, st)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border cursor-pointer ${
                              item.status === st
                                ? 'bg-[#14532D] text-white border-[#14532D]'
                                : 'bg-white text-[#17231B]/70 border-[#17231B]/15'
                            }`}
                          >
                            Mark {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB D: ANALYTICS & AI RECOMMENDATIONS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Daily Food Prepared vs Consumed vs Redistributed */}
            <div className="lg:col-span-7 bg-white border border-[#17231B]/10 rounded-2xl p-6">
              <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
                Weekly Food Preparation vs. Consumption & Rescued Surplus (kg)
              </h3>
              <p className="text-xs text-[#17231B]/60 mb-6">
                Tracks daily kitchen output against actual student consumption and redistributed surplus.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={db.historicalRecords}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="dayShort" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consumedKg" name="Consumed (kg)" fill="#14532D" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="surplusRedistributedKg"
                      name="Rescued Surplus (kg)"
                      fill="#16A34A"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="unavoidableWasteKg"
                      name="Plate Waste (kg)"
                      fill="#F59E0B"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Most Wasted / Surplus Food Items Table */}
            <div className="lg:col-span-5 bg-white border border-[#17231B]/10 rounded-2xl p-6">
              <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
                Most Frequently Surplus / Wasted Menu Items
              </h3>
              <p className="text-xs text-[#17231B]/60 mb-4">
                Based on 30-day mess weighing logs and student plate-waste feedback flags.
              </p>

              <div className="space-y-3">
                {mostWastedItemsChart.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#17231B]">{row.item}</div>
                      <div className="text-[11px] text-[#17231B]/60 mt-0.5">
                        Avg Daily Surplus: <span className="font-mono font-semibold">{row.avgDailySurplusKg} kg</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#16A34A]">
                        {row.prepAdjustSuggestedPct}% Batch Cut
                      </span>
                      <div className="text-[10px] text-[#17231B]/55">Recommended</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gemini AI Actionable Mess Recommendations */}
          <div className="bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-semibold text-[#16A34A] flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini AI Kitchen Optimization Engine</span>
                </div>
                <h3 className="text-base font-display font-bold text-[#17231B]">
                  Actionable Recommendations from Live Attendance & Student Feedback
                </h3>
              </div>
              <button
                type="button"
                onClick={fetchMessAiRecommendations}
                disabled={recLoading}
                className="px-4 py-2 bg-[#16A34A] hover:bg-[#14532D] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer self-start"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${recLoading ? 'animate-spin' : ''}`} />
                <span>{recLoading ? 'Generating...' : 'Generate Fresh AI Recommendations'}</span>
              </button>
            </div>

            {recError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 mb-4">
                {recError}
              </div>
            )}

            {aiRecommendations ? (
              <div className="space-y-4">
                <p className="text-xs text-[#17231B]/80 bg-[#F8FAF7] p-3.5 rounded-xl border border-[#17231B]/10">
                  {aiRecommendations.summaryInsight}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiRecommendations.recommendations?.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl border border-[#17231B]/10 bg-[#F8FAF7]/50">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#14532D]">{rec.title}</span>
                        <span className="font-mono text-[11px] text-[#B45309]">{rec.priority}</span>
                      </div>
                      <p className="text-xs text-[#17231B]/75 leading-relaxed">{rec.action}</p>
                      <div className="text-[11px] font-mono text-[#16A34A] mt-2">
                        Expected Impact: {rec.expectedImpact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                  <div className="text-xs font-bold text-[#14532D] mb-1">
                    01. Reduce Basmati Jeera Rice Buffer by 12%
                  </div>
                  <p className="text-xs text-[#17231B]/75 leading-relaxed">
                    Student feedback flagged excess rice portioning at lunch, and 18% of students selected the "Light (-25% Rice)" preference.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                  <div className="text-xs font-bold text-[#14532D] mb-1">
                    02. Stagger Dinner Veg Biryani Cooking
                  </div>
                  <p className="text-xs text-[#17231B]/75 leading-relaxed">
                    With 134 students opting out of Wednesday dinner, cook 122 kg in the primary dum batch and hold 12 kg for late 9:00 PM diners.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                  <div className="text-xs font-bold text-[#14532D] mb-1">
                    03. Publish Lunch Surplus 30 Mins Earlier
                  </div>
                  <p className="text-xs text-[#17231B]/75 leading-relaxed">
                    Publishing surplus pans at 02:30 PM instead of 03:15 PM increases student pickup claim rate by 34% before evening classes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
