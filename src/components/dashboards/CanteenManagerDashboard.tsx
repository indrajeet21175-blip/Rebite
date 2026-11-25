import React, { useState } from 'react';
import {
  Store,
  Plus,
  Sparkles,
  RefreshCw,
  Upload,
  CheckCircle2,
  Clock,
  IndianRupee,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useReBite } from '../../context/ReBiteContext';
import { GENERATED_IMAGES, UserRole } from '../../types/rebite';
import { SafeFoodImage } from '../common/SafeFoodImage';

interface CanteenManagerDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CanteenManagerDashboard: React.FC<CanteenManagerDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    db,
    addCanteenInventoryItem,
    updateCanteenStock,
    convertInventoryToSurplus,
    publishSurplusListing,
    markClaimCollected,
  } = useReBite();

  // Add Inventory Form State
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<
    'Fresh Bakery' | 'Hot Snacks' | 'Packaged Meals' | 'Beverages'
  >('Hot Snacks');
  const [batchCode, setBatchCode] = useState('CNT-NEW-26A');
  const [preparedAt, setPreparedAt] = useState('02:30 PM');
  const [expiryTime, setExpiryTime] = useState('08:00 PM');
  const [totalUnits, setTotalUnits] = useState<number>(60);
  const [unitWeightKg, setUnitWeightKg] = useState<number>(0.22);
  const [unitPriceInr, setUnitPriceInr] = useState<number>(40);

  // Convert to Surplus Modal / Quick Action State
  const [convertingItemId, setConvertingItemId] = useState<string | null>(null);
  const [convertPortions, setConvertPortions] = useState<number>(15);
  const [convertDiscountPrice, setConvertDiscountPrice] = useState<number>(15);
  const [convertDeadline, setConvertDeadline] = useState('07:30 PM Today');
  const [convertSuccessMsg, setConvertSuccessMsg] = useState('');

  // Standalone Canteen Surplus Listing Form State
  const [customFoodName, setCustomFoodName] = useState('');
  const [customPortions, setCustomPortions] = useState<number>(20);
  const [customPriceInr, setCustomPriceInr] = useState<number>(15);
  const [customOriginalPriceInr, setCustomOriginalPriceInr] = useState<number>(45);
  const [customDeadline, setCustomDeadline] = useState('07:45 PM Today');
  const [customImageUrl, setCustomImageUrl] = useState<string>(
    GENERATED_IMAGES.SURPLUS_CANTEEN_SNACKS
  );

  // AI Business Insights State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiInsights, setAiInsights] = useState<{
    summaryInsight: string;
    recommendations: { title: string; action: string; expectedImpact: string; priority: string }[];
  } | null>(null);

  const totalStockPrepared = db.canteenInventory.reduce(
    (acc, item) => acc + item.totalPreparedUnits,
    0
  );
  const totalStockRemaining = db.canteenInventory.reduce(
    (acc, item) => acc + item.remainingUnits,
    0
  );
  const approachingExpiryCount = db.canteenInventory.filter(
    (item) => item.status === 'Approaching Expiry'
  ).length;
  const weeklyCostSavedInr = db.historicalRecords.reduce(
    (acc, r) => acc + Math.round(r.costSavedInr * 0.28),
    0
  );

  const canteenClaims = db.foodClaims.filter(
    (c) =>
      c.sourceName.toLowerCase().includes('canteen') ||
      db.surplusListings.find((s) => s.id === c.surplusId)?.sourceType === 'Canteen'
  );

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || totalUnits <= 0) return;
    addCanteenInventoryItem({
      name: prodName.trim(),
      category: prodCategory,
      batchCode: batchCode.trim(),
      preparedAt,
      expiryTime,
      totalPreparedUnits: Number(totalUnits),
      remainingUnits: Number(totalUnits),
      unitWeightKg: Number(unitWeightKg),
      unitPriceInr: Number(unitPriceInr),
      discountedPriceInr: Math.round(Number(unitPriceInr) * 0.4),
    });
    setProdName('');
    setBatchCode(`CNT-B${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleConfirmConversion = (itemId: string) => {
    convertInventoryToSurplus(
      itemId,
      convertPortions,
      convertDiscountPrice,
      convertDeadline,
      GENERATED_IMAGES.SURPLUS_CANTEEN_SNACKS
    );
    setConvertingItemId(null);
    setConvertSuccessMsg(
      'Batch converted to surplus! Published immediately to Student Surplus Discovery.'
    );
    setTimeout(() => setConvertSuccessMsg(''), 4500);
  };

  const handleCustomSurplusPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName.trim() || customPortions <= 0) return;
    publishSurplusListing({
      sourceType: 'Canteen',
      sourceName: 'Gulmohar Academic Core Canteen',
      location: 'Academic Block C · Ground Floor Counter 2',
      foodName: customFoodName.trim(),
      description: 'Fresh canteen batch offered at flash sustainability pricing before closing.',
      imageUrl: customImageUrl,
      totalQuantityPortions: Number(customPortions),
      weightPerPortionKg: 0.25,
      preparedAt: '02:00 PM',
      collectionDeadline: customDeadline,
      storageCondition: 'Display Cabinet (58°C)',
      storageTempCelsius: 58,
      packagingCondition: 'Biodegradable Kraft Tray',
      priceType: Number(customPriceInr) === 0 ? 'Free' : 'Discounted',
      priceInr: Number(customPriceInr),
      originalPriceInr: Number(customOriginalPriceInr),
      suitableForNgoBulk: Number(customPortions) >= 15,
    });
    setCustomFoodName('');
    setConvertSuccessMsg('Custom canteen surplus listing published to students!');
    setTimeout(() => setConvertSuccessMsg(''), 4500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCustomImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchCanteenAiInsights = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: UserRole.CANTEEN_MANAGER,
          contextData: {
            canteenInventory: db.canteenInventory,
            activeCanteenSurplus: db.surplusListings.filter((s) => s.sourceType === 'Canteen'),
            studentReservations: canteenClaims,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI business insights');
      }
      setAiInsights(data);
    } catch (err: any) {
      setAiError(err.message || 'Unable to reach Gemini AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const canteenWasteChartData = [
    { item: 'Punjabi Samosa', soldUnits: 92, surplusRescued: 24, unsoldWaste: 4 },
    { item: 'Veg Grilled Sandwich', soldUnits: 63, surplusRescued: 19, unsoldWaste: 3 },
    { item: 'Paneer Masala Puff', soldUnits: 74, surplusRescued: 14, unsoldWaste: 2 },
    { item: 'Rajma Chawal Bowl', soldUnits: 46, surplusRescued: 12, unsoldWaste: 2 },
  ];

  return (
    <div className="space-y-8">
      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Active Batch Units Today</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#17231B]">
            {totalStockRemaining} / {totalStockPrepared}
          </div>
          <div className="text-xs text-[#16A34A] mt-1.5">
            {totalStockPrepared - totalStockRemaining} units sold or redistributed
          </div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Approaching Expiry Batches</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#B45309]">
            {approachingExpiryCount} Batches
          </div>
          <div className="text-xs text-[#17231B]/60 mt-1.5">
            Ready for discounted student flash listing
          </div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Student Surplus Reservations</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#14532D]">
            {canteenClaims.length} Orders
          </div>
          <div className="text-xs text-[#17231B]/60 mt-1.5">
            Verified via RB-XXXX pickup passes
          </div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Weekly Revenue Recovered</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#16A34A]">
            ₹{weeklyCostSavedInr.toLocaleString()}
          </div>
          <div className="text-xs text-[#17231B]/60 mt-1.5">
            From discounted pre-closing flash sales
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#17231B]/10 rounded-xl">
        {[
          { id: 'overview', label: 'A. Inventory & Expiry Management' },
          { id: 'surplus', label: 'B. Surplus Reporting & Student Reservations' },
          { id: 'analytics', label: 'C. Waste Analytics & AI Business Insights' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#17231B] text-white'
                : 'text-[#17231B]/70 hover:text-[#17231B] hover:bg-[#F8FAF7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {convertSuccessMsg && (
        <div className="p-4 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-semibold text-[#14532D]">
          {convertSuccessMsg}
        </div>
      )}

      {/* TAB A: INVENTORY & EXPIRY MANAGEMENT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold text-[#17231B] mb-1">
              Live Canteen Batch Inventory & Shelf-Life Monitor
            </h2>
            <p className="text-xs text-[#17231B]/60 mb-5">
              Adjust remaining stock counts or convert approaching-expiry batches into discounted student surplus listings in one click.
            </p>

            <div className="space-y-4">
              {db.canteenInventory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#17231B]/60 mb-1">
                      <span className="font-mono font-semibold text-[#14532D]">{item.batchCode}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>Prepared: {item.preparedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-amber-800">Expiry: {item.expiryTime}</span>
                    </div>
                    <h3 className="text-base font-display font-bold text-[#17231B]">{item.name}</h3>
                    <div className="text-xs text-[#17231B]/75 mt-1">
                      Regular Price: <span className="font-mono font-semibold">₹{item.unitPriceInr}</span> · Flash Surplus Price:{' '}
                      <span className="font-mono font-semibold text-[#16A34A]">₹{item.discountedPriceInr}</span> · Status:{' '}
                      <strong
                        className={
                          item.status === 'Approaching Expiry'
                            ? 'text-amber-700'
                            : item.status === 'Converted to Surplus'
                            ? 'text-[#16A34A]'
                            : 'text-[#17231B]'
                        }
                      >
                        {item.status}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#17231B]/60">Stock:</span>
                      <input
                        type="number"
                        min={0}
                        max={item.totalPreparedUnits}
                        value={item.remainingUnits}
                        onChange={(e) => updateCanteenStock(item.id, Number(e.target.value))}
                        className="w-16 px-2 py-1.5 text-xs font-mono font-bold text-right bg-white border border-[#17231B]/20 rounded-lg"
                      />
                      <span className="text-xs font-mono text-[#17231B]/55">
                        / {item.totalPreparedUnits}
                      </span>
                    </div>

                    {item.remainingUnits > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setConvertingItemId(item.id);
                          setConvertPortions(item.remainingUnits);
                          setConvertDiscountPrice(item.discountedPriceInr);
                        }}
                        className="px-3 py-2 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Publish as Surplus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Conversion Drawer */}
            {convertingItemId && (
              <div className="mt-6 p-5 rounded-xl bg-[#14532D] text-white">
                <h4 className="text-sm font-display font-bold mb-3">
                  Convert Batch to Discounted / Free Student Surplus Listing
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] text-white/75 mb-1">
                      Portions to Publish
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={convertPortions}
                      onChange={(e) => setConvertPortions(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono text-[#17231B] bg-white rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/75 mb-1">
                      Discounted Price (₹, set 0 for Free)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={convertDiscountPrice}
                      onChange={(e) => setConvertDiscountPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono text-[#17231B] bg-white rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/75 mb-1">
                      Collection Deadline
                    </label>
                    <input
                      type="text"
                      value={convertDeadline}
                      onChange={(e) => setConvertDeadline(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-[#17231B] bg-white rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleConfirmConversion(convertingItemId)}
                    className="px-4 py-2 bg-[#16A34A] hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Confirm & Broadcast to Students
                  </button>
                  <button
                    type="button"
                    onClick={() => setConvertingItemId(null)}
                    className="px-3 py-2 bg-white/10 text-white text-xs rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add New Canteen Product Batch */}
          <div className="lg:col-span-4 bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
              Log Fresh Canteen Product Batch
            </h3>
            <p className="text-xs text-[#17231B]/60 mb-5">
              Tracks preparation timestamp and automatically flags approaching expiry windows.
            </p>

            <form onSubmit={handleAddProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Food Item Name
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g., Paneer Kathi Roll / Masala Vada Pav"
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Category
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  >
                    <option value="Hot Snacks">Hot Snacks</option>
                    <option value="Fresh Bakery">Fresh Bakery</option>
                    <option value="Packaged Meals">Packaged Meals</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Batch Code
                  </label>
                  <input
                    type="text"
                    required
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Prepared Time
                  </label>
                  <input
                    type="text"
                    required
                    value={preparedAt}
                    onChange={(e) => setPreparedAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Expiry Cutoff
                  </label>
                  <input
                    type="text"
                    required
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Total Units Prepared
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Retail Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={unitPriceInr}
                    onChange={(e) => setUnitPriceInr(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Batch to Canteen Inventory</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB B: SURPLUS REPORTING & STUDENT RESERVATIONS */}
      {activeTab === 'surplus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Direct Surplus Upload Form */}
          <div className="lg:col-span-6 bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold text-[#17231B] mb-1">
              Publish Direct Canteen Surplus Listing
            </h2>
            <p className="text-xs text-[#17231B]/60 mb-5">
              List combo snack bags or end-of-day items at discounted or free student sustainability rates.
            </p>

            <form onSubmit={handleCustomSurplusPublish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Surplus Pack / Item Title
                </label>
                <input
                  type="text"
                  required
                  value={customFoodName}
                  onChange={(e) => setCustomFoodName(e.target.value)}
                  placeholder="e.g., Evening Bakery Surprise Box (2 Sandwiches + 2 Puffs)"
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Quantity (Packs)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={customPortions}
                    onChange={(e) => setCustomPortions(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Surplus Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={customPriceInr}
                    onChange={(e) => setCustomPriceInr(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={customOriginalPriceInr}
                    onChange={(e) => setCustomOriginalPriceInr(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Student Pickup Deadline
                </label>
                <input
                  type="text"
                  required
                  value={customDeadline}
                  onChange={(e) => setCustomDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1.5">
                  Product Photo
                </label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg text-xs font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Upload Custom Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Publish Canteen Surplus Listing
              </button>
            </form>
          </div>

          {/* Manage Student Reservations */}
          <div className="lg:col-span-6 bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
              Student Surplus Reservations & Pickup Verification ({canteenClaims.length})
            </h3>
            <p className="text-xs text-[#17231B]/60 mb-4">
              Verify student pickup code at counter handover and mark collected.
            </p>

            {canteenClaims.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAF7] rounded-xl border border-[#17231B]/10 text-xs text-[#17231B]/60">
                No canteen reservations yet. Convert an approaching-expiry batch to receive instant student claims.
              </div>
            ) : (
              <div className="space-y-3">
                {canteenClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-[#14532D]">
                        Code: {claim.pickupCode} · {claim.portionsClaimed} Portion(s)
                      </div>
                      <div className="text-sm font-bold text-[#17231B] mt-0.5">{claim.foodName}</div>
                      <div className="text-xs text-[#17231B]/65 mt-0.5">
                        Reserved by: {claim.claimantName} · Due: {claim.pickupDeadline}
                      </div>
                    </div>

                    <div>
                      {claim.status === 'Reserved' ? (
                        <button
                          type="button"
                          onClick={() => markClaimCollected(claim.id)}
                          className="px-3 py-2 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          Verify & Hand Over
                        </button>
                      ) : (
                        <span className="text-xs font-mono font-semibold text-[#16A34A]">
                          Handed Over
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB C: FOOD WASTE ANALYTICS & AI BUSINESS INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
              Product-Level Sales vs. Rescued Flash Surplus & Unsold Wastage (Units)
            </h3>
            <p className="text-xs text-[#17231B]/60 mb-6">
              Compares regular counter sales against ReBite flash-surplus rescues and remaining unsold loss.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={canteenWasteChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="item" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="soldUnits" name="Regular Sales" fill="#14532D" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="surplusRescued"
                    name="Rescued via ReBite"
                    fill="#16A34A"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="unsoldWaste" name="Unsold Waste" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gemini AI Canteen Business Insights */}
          <div className="bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-semibold text-[#16A34A] flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini AI Canteen Retail & Inventory Strategist</span>
                </div>
                <h3 className="text-base font-display font-bold text-[#17231B]">
                  High-Demand Item Predictions & Batch Size Optimization
                </h3>
              </div>
              <button
                type="button"
                onClick={fetchCanteenAiInsights}
                disabled={aiLoading}
                className="px-4 py-2 bg-[#16A34A] hover:bg-[#14532D] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer self-start"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'Analyzing Inventory...' : 'Run Gemini Inventory Analysis'}</span>
              </button>
            </div>

            {aiError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 mb-4">
                {aiError}
              </div>
            )}

            {aiInsights ? (
              <div className="space-y-4">
                <p className="text-xs text-[#17231B]/80 bg-[#F8FAF7] p-3.5 rounded-xl border border-[#17231B]/10">
                  {aiInsights.summaryInsight}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.recommendations?.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl border border-[#17231B]/10 bg-[#F8FAF7]/50">
                      <div className="text-xs font-bold text-[#14532D] mb-1">{rec.title}</div>
                      <p className="text-xs text-[#17231B]/75">{rec.action}</p>
                      <div className="text-[11px] font-mono text-[#16A34A] mt-2">
                        Financial & Waste Impact: {rec.expectedImpact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                  <div className="text-xs font-bold text-[#14532D] mb-1">
                    01. Shift Afternoon Samosa Frying Batch
                  </div>
                  <p className="text-xs text-[#17231B]/75 leading-relaxed">
                    23% of the 11:00 AM samosa batch remains unsold after 4:30 PM. Fry 95 units at 11:00 AM and a fresh 25-unit batch at 4:15 PM during evening tea break.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                  <div className="text-xs font-bold text-[#14532D] mb-1">
                    02. Automated 5:30 PM Flash Discount Trigger
                  </div>
                  <p className="text-xs text-[#17231B]/75 leading-relaxed">
                    Publishing Multigrain Veg Sandwiches at ₹20 (55% off) 2 hours before closing recovers ₹440/day in ingredient costs and eliminates sandwich disposal.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                  <div className="text-xs font-bold text-[#14532D] mb-1">
                    03. High Demand on Biryani/Special Dinner Days
                  </div>
                  <p className="text-xs text-[#17231B]/75 leading-relaxed">
                    On Wednesdays when Central Mess serves Veg Dum Biryani at night, evening canteen meal bowl sales drop by 28%. Reduce Rajma Bowl prep from 60 to 42 units.
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
