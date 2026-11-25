import React, { useState } from 'react';
import {
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Thermometer,
  Truck,
  Users,
  Scale,
  RefreshCw,
  Search,
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
import { GENERATED_IMAGES, SurplusListing } from '../../types/rebite';
import { SafeFoodImage } from '../common/SafeFoodImage';

interface NgoInspectorDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const NgoInspectorDashboard: React.FC<NgoInspectorDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    db,
    currentUser,
    submitFoodInspection,
    recordFoodRedistribution,
    updateRedistributionStatus,
  } = useReBite();

  // Filter state for Available Food Discovery
  const [locationFilter, setLocationFilter] = useState('');
  const [minPortionsFilter, setMinPortionsFilter] = useState<number>(0);

  // AI-Assisted Food Quality Assessment State
  const [selectedSurplusId, setSelectedSurplusId] = useState<string>(
    db.surplusListings[0]?.id || ''
  );
  const [foodName, setFoodName] = useState<string>(
    db.surplusListings[0]?.foodName || 'Paneer Butter Masala, Dal Tadka & Jeera Rice Thali'
  );
  const [prepTime, setPrepTime] = useState<string>(
    db.surplusListings[0]?.preparedAt || '12:00 PM'
  );
  const [storageTemp, setStorageTemp] = useState<string>(
    `${db.surplusListings[0]?.storageTempCelsius || 64}°C (Hot Holding Bain-Marie)`
  );
  const [storageDurationHours, setStorageDurationHours] = useState<number>(2.0);
  const [packagingCondition, setPackagingCondition] = useState<string>(
    db.surplusListings[0]?.packagingCondition ||
      'Food-grade 304 Stainless Steel Sealed Containers'
  );
  const [transportCondition, setTransportCondition] = useState<string>(
    'Insulated NGO Distribution Van with Active Thermal Carrier'
  );
  const [inspectionImageUrl, setInspectionImageUrl] = useState<string>(
    db.surplusListings[0]?.imageUrl || GENERATED_IMAGES.SURPLUS_PANEER_THALI
  );
  const [uploadedBase64, setUploadedBase64] = useState<string>('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiObservations, setAiObservations] = useState<{
    visualFreshnessObservations: string[];
    possibleQualityConcerns: string[];
    missingSafetyInformation: string[];
    recommendedNextInspectionSteps: string[];
    riskLevelIndicator: string;
    mandatorySafetyDisclaimer: string;
  } | null>(null);

  // Mandatory Human Inspector Verification State
  const [inspectorName, setInspectorName] = useState<string>(
    currentUser?.name || 'Dr. Kavita Menon'
  );
  const [inspectorLicense, setInspectorLicense] = useState<string>(
    currentUser?.verifiedId || 'FSSAI-INSP-88412'
  );
  const [humanVerifiedThermometer, setHumanVerifiedThermometer] = useState(false);
  const [humanVerifiedSensory, setHumanVerifiedSensory] = useState(false);
  const [humanVerifiedPackaging, setHumanVerifiedPackaging] = useState(false);
  const [humanInspectorNotes, setHumanInspectorNotes] = useState('');
  const [inspectionBanner, setInspectionBanner] = useState('');

  // Redistribution Logging Form State
  const [redistSurplusId, setRedistSurplusId] = useState<string>(
    db.surplusListings.find((s) => s.status === 'NGO Approved')?.id ||
      db.surplusListings[0]?.id ||
      ''
  );
  const [ngoName, setNgoName] = useState('Feeding Hope NGO · Campus Chapter');
  const [beneficiaryCommunity, setBeneficiaryCommunity] = useState(
    'Kanjurmarg Night Shelter & Community Learning Center'
  );
  const [qtyReceived, setQtyReceived] = useState<number>(45);
  const [qtyDistributed, setQtyDistributed] = useState<number>(45);
  const [beneficiariesCount, setBeneficiariesCount] = useState<number>(45);
  const [redistSuccessMsg, setRedistSuccessMsg] = useState('');

  // Aggregated Impact Stats
  const totalCollectedPortions = db.redistributionRecords.reduce(
    (acc, r) => acc + r.quantityReceivedPortions,
    0
  );
  const totalDistributedPortions = db.redistributionRecords.reduce(
    (acc, r) => acc + r.quantityDistributedPortions,
    0
  );
  const totalBeneficiariesServed = db.redistributionRecords.reduce(
    (acc, r) => acc + r.beneficiariesCount,
    0
  );
  const totalNgoFoodSavedKg = Number(
    db.redistributionRecords.reduce((acc, r) => acc + r.weightSavedKg, 0).toFixed(1)
  );

  const filteredAvailableSurplus = db.surplusListings.filter((item) => {
    if (item.remainingPortions < minPortionsFilter) return false;
    if (
      locationFilter.trim() &&
      !item.location.toLowerCase().includes(locationFilter.toLowerCase()) &&
      !item.sourceName.toLowerCase().includes(locationFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const loadBatchIntoInspector = (batch: SurplusListing) => {
    setSelectedSurplusId(batch.id);
    setFoodName(batch.foodName);
    setPrepTime(batch.preparedAt);
    setStorageTemp(`${batch.storageTempCelsius}°C (${batch.storageCondition})`);
    setPackagingCondition(batch.packagingCondition);
    setInspectionImageUrl(batch.imageUrl);
    setUploadedBase64('');
    setAiObservations(null);
    setHumanVerifiedThermometer(false);
    setHumanVerifiedSensory(false);
    setHumanVerifiedPackaging(false);
    setActiveTab('inspect');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setInspectionImageUrl(reader.result);
        setUploadedBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const runGeminiVisualAssessment = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/ai/inspect-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName,
          prepTime,
          storageTemp,
          storageDurationHours,
          packagingCondition,
          transportCondition,
          imageBase64: uploadedBase64 || undefined,
          imageUrl: !uploadedBase64 ? inspectionImageUrl : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI food observations');
      }
      setAiObservations(data);
    } catch (err: any) {
      setAiError(err.message || 'Unable to run Gemini visual inspection.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleHumanInspectionDecision = (
    decision: 'Approved for Redistribution' | 'Rejected - Composting Only'
  ) => {
    if (
      decision === 'Approved for Redistribution' &&
      (!humanVerifiedThermometer || !humanVerifiedSensory || !humanVerifiedPackaging)
    ) {
      setAiError(
        'Mandatory Safety Requirement: You must complete and check all three physical human inspection checks before approving food for redistribution.'
      );
      return;
    }

    const targetBatch = db.surplusListings.find((s) => s.id === selectedSurplusId);

    submitFoodInspection({
      surplusId: selectedSurplusId,
      foodName,
      sourceName: targetBatch?.sourceName || 'Campus Dining Facility',
      inspectorId: currentUser?.id || 'usr-ngo-401',
      inspectorName: inspectorName.trim() || 'Dr. Kavita Menon',
      inspectorLicense: inspectorLicense.trim() || 'FSSAI-INSP-88412',
      prepTime,
      storageTemp,
      storageDurationHours,
      packagingCondition,
      transportCondition,
      imageUrl: inspectionImageUrl,
      aiObservations: aiObservations || {
        visualFreshnessObservations: ['Manual visual inspection logged by human inspector.'],
        possibleQualityConcerns: ['Verify core holding temperature >= 60°C prior to dispatch.'],
        missingSafetyInformation: ['Recorded directly on physical thermometer log.'],
        recommendedNextInspectionSteps: ['Seal container with timestamped FSSAI transfer label.'],
        riskLevelIndicator: 'Standard Physical Verification Required',
        mandatorySafetyDisclaimer:
          'AI visual observations cannot certify food safety. Human physical thermometer and sensory verification completed.',
      },
      humanVerifiedThermometer,
      humanVerifiedSensory,
      humanVerifiedPackaging,
      humanInspectorNotes:
        humanInspectorNotes.trim() ||
        `Physical thermometer and organoleptic check completed. Decision: ${decision}.`,
      decision,
    });

    setRedistSurplusId(selectedSurplusId);
    if (targetBatch) {
      setQtyReceived(targetBatch.remainingPortions);
      setQtyDistributed(targetBatch.remainingPortions);
      setBeneficiariesCount(targetBatch.remainingPortions);
    }

    setInspectionBanner(
      `Inspection logged: "${decision}" by ${inspectorName} (${inspectorLicense}). Campus status updated.`
    );
    setTimeout(() => setInspectionBanner(''), 5000);
  };

  const handleRecordRedistribution = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBatch = db.surplusListings.find((s) => s.id === redistSurplusId);
    const weightPerPortion = targetBatch?.weightPerPortionKg || 0.42;
    const savedKg = Number((qtyDistributed * weightPerPortion).toFixed(1));

    recordFoodRedistribution({
      surplusId: redistSurplusId,
      inspectionId: db.foodInspections[0]?.id || 'insp-manual',
      foodName: targetBatch?.foodName || foodName,
      sourceName: targetBatch?.sourceName || 'Aravalli & Vindhya Central Mess',
      ngoName: ngoName.trim(),
      inspectorName: inspectorName.trim(),
      quantityReceivedPortions: Number(qtyReceived),
      quantityDistributedPortions: Number(qtyDistributed),
      weightSavedKg: savedKg,
      beneficiaryCommunity: beneficiaryCommunity.trim(),
      beneficiariesCount: Number(beneficiariesCount),
      collectionStatus: 'Distributed',
    });

    setRedistSuccessMsg(
      `Redistribution recorded! ${qtyDistributed} meals (${savedKg} kg) added to campus impact metrics.`
    );
    setTimeout(() => setRedistSuccessMsg(''), 5000);
  };

  const monthlyImpactChartData = [
    { month: 'Aug', collectedKg: 310, distributedKg: 302, beneficiaries: 755 },
    { month: 'Sep', collectedKg: 420, distributedKg: 412, beneficiaries: 1030 },
    { month: 'Oct', collectedKg: 495, distributedKg: 488, beneficiaries: 1220 },
    {
      month: 'Nov (Live)',
      collectedKg: 520 + totalNgoFoodSavedKg,
      distributedKg: 515 + totalNgoFoodSavedKg,
      beneficiaries: 1290 + totalBeneficiariesServed,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Total Food Collected (Batch Log)</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#17231B]">
            {totalCollectedPortions} Portions
          </div>
          <div className="text-xs text-[#16A34A] mt-1.5">
            From {db.redistributionRecords.length} verified campus dispatches
          </div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Total Meals Distributed</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#14532D]">
            {totalDistributedPortions} Meals
          </div>
          <div className="text-xs text-[#17231B]/60 mt-1.5">
            100% FSSAI human-inspector verified
          </div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">Community Beneficiaries</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#16A34A]">
            {totalBeneficiariesServed} People
          </div>
          <div className="text-xs text-[#17231B]/60 mt-1.5">
            Shelters, night schools & worker camps
          </div>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-xl p-5">
          <div className="text-xs text-[#17231B]/60 mb-1">NGO Food Weight Rescued</div>
          <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#14532D]">
            {totalNgoFoodSavedKg} kg
          </div>
          <div className="text-xs text-[#17231B]/60 mt-1.5">
            Active recent batch dispatches
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#17231B]/10 rounded-xl">
        {[
          { id: 'overview', label: 'A. Available Food Discovery' },
          { id: 'inspect', label: 'B. AI-Assisted Quality Assessment & Human Sign-Off' },
          { id: 'redistribution', label: 'C. Food Redistribution & Beneficiary Log' },
          { id: 'reports', label: 'D. Inspection History & Impact Reports' },
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

      {inspectionBanner && (
        <div className="p-4 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-semibold text-[#14532D]">
          {inspectionBanner}
        </div>
      )}

      {/* TAB A: AVAILABLE FOOD DISCOVERY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#17231B]/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#17231B]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Filter by mess hall, hostel block, or pickup location..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/15 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#17231B]/70 whitespace-nowrap">
                Min Quantity:
              </span>
              <select
                value={minPortionsFilter}
                onChange={(e) => setMinPortionsFilter(Number(e.target.value))}
                className="px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/15 rounded-lg"
              >
                <option value={0}>All Batch Sizes</option>
                <option value={15}>15+ Portions (Bulk NGO)</option>
                <option value={30}>30+ Portions</option>
                <option value={50}>50+ Portions</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAvailableSurplus.map((batch) => (
              <div
                key={batch.id}
                className="bg-white border border-[#17231B]/10 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-[#14532D]">
                    <SafeFoodImage
                      src={batch.imageUrl}
                      alt={batch.foodName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                      <span>Prepared: {batch.preparedAt}</span>
                      <span className="font-mono font-bold text-[#4ADE80]">
                        {batch.storageTempCelsius}°C Holding
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="text-xs text-[#17231B]/60 mb-1">
                      <strong className="text-[#14532D]">{batch.sourceName}</strong> · Status:{' '}
                      <span className="font-semibold text-[#16A34A]">{batch.status}</span>
                    </div>
                    <h3 className="text-base font-display font-bold text-[#17231B] mb-2">
                      {batch.foodName}
                    </h3>
                    <div className="space-y-1.5 text-xs text-[#17231B]/75 pt-3 border-t border-[#17231B]/10">
                      <div className="flex justify-between">
                        <span className="text-[#17231B]/60">Available Quantity</span>
                        <span className="font-mono font-bold">
                          {batch.remainingPortions} portions ({(batch.remainingPortions * batch.weightPerPortionKg).toFixed(1)} kg)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#17231B]/60">Storage Info</span>
                        <span>{batch.storageCondition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#17231B]/60">Packaging</span>
                        <span className="truncate max-w-[180px]">{batch.packagingCondition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#17231B]/60">Pickup Deadline</span>
                        <span className="font-mono font-semibold text-amber-700">
                          {batch.collectionDeadline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadBatchIntoInspector(batch)}
                    className="flex-1 py-2.5 px-3 bg-[#14532D] hover:bg-[#16A34A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Inspect & Assess Quality
                  </button>
                  {batch.status === 'NGO Approved' && (
                    <button
                      type="button"
                      onClick={() => {
                        setRedistSurplusId(batch.id);
                        setQtyReceived(batch.remainingPortions);
                        setQtyDistributed(batch.remainingPortions);
                        setBeneficiariesCount(batch.remainingPortions);
                        setActiveTab('redistribution');
                      }}
                      className="py-2.5 px-3 bg-[#16A34A] text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Dispatch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB B: AI-ASSISTED FOOD QUALITY ASSESSMENT & MANDATORY HUMAN INSPECTION */}
      {activeTab === 'inspect' && (
        <div className="space-y-6">
          {/* Mandatory Safety Governance Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-bold">Mandatory Food Safety Governance Policy:</strong> Gemini AI visual observations assist inspectors by surfacing preliminary visual texture notes, holding-time alerts, and missing safety fields.{' '}
              <strong>AI never certifies food as safe to eat and cannot automatically approve food for distribution.</strong> An authorized human inspector must perform physical core thermometer and organoleptic verification before sign-off.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Step 1: Food Batch Parameters & Photo Input */}
            <div className="lg:col-span-6 bg-white border border-[#17231B]/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-[#17231B]">
                  1. Batch Metadata & Visual Upload
                </h2>
                <select
                  value={selectedSurplusId}
                  onChange={(e) => {
                    const found = db.surplusListings.find((s) => s.id === e.target.value);
                    if (found) loadBatchIntoInspector(found);
                  }}
                  className="px-3 py-1.5 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                >
                  {db.surplusListings.map((s) => (
                    <option key={s.id} value={s.id}>
                      Load Batch: {s.foodName.slice(0, 28)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Food Name
                  </label>
                  <input
                    type="text"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Preparation Time
                  </label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Storage Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={storageDurationHours}
                    onChange={(e) => setStorageDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Storage Temperature
                  </label>
                  <input
                    type="text"
                    value={storageTemp}
                    onChange={(e) => setStorageTemp(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Packaging Condition
                  </label>
                  <input
                    type="text"
                    value={packagingCondition}
                    onChange={(e) => setPackagingCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Transportation Conditions
                  </label>
                  <input
                    type="text"
                    value={transportCondition}
                    onChange={(e) => setTransportCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
              </div>

              {/* Photo Preview & Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[#17231B]">
                    Food Batch Inspection Photograph
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAF7] hover:bg-[#16A34A]/10 border border-[#17231B]/20 rounded-lg text-xs font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                <div className="h-44 rounded-xl overflow-hidden border border-[#17231B]/10">
                  <SafeFoodImage
                    src={inspectionImageUrl}
                    alt={foodName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={runGeminiVisualAssessment}
                disabled={aiLoading}
                className="w-full py-3 px-4 bg-[#14532D] hover:bg-[#16A34A] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {aiLoading
                    ? 'Analyzing Photograph & Holding Conditions with Gemini Vision...'
                    : 'Run Gemini Preliminary Visual & Holding Assessment'}
                </span>
              </button>
            </div>

            {/* Step 2: Gemini Preliminary Observations + Mandatory Human Verification */}
            <div className="lg:col-span-6 space-y-6">
              {/* Gemini Output Card */}
              <div className="bg-white border border-[#17231B]/10 rounded-2xl p-6">
                <h3 className="text-base font-display font-bold text-[#17231B] mb-2">
                  2. Preliminary AI Visual & Thermal Observations
                </h3>

                {aiError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 mb-3">
                    {aiError}
                  </div>
                )}

                {aiObservations ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#F8FAF7] border border-[#17231B]/10">
                      <div className="font-bold text-[#14532D] mb-1">
                        Visual Freshness Observations
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[#17231B]/80">
                        {aiObservations.visualFreshnessObservations?.map((obs, i) => (
                          <li key={i}>{obs}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
                      <div className="font-bold text-amber-900 mb-1">
                        Possible Quality & Holding Concerns
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-amber-900/90">
                        {aiObservations.possibleQualityConcerns?.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-[#F8FAF7] border border-[#17231B]/10">
                      <div className="font-bold text-[#17231B] mb-1">
                        Missing Safety Information to Verify Physically
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[#17231B]/75">
                        {aiObservations.missingSafetyInformation?.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/25">
                      <div className="font-bold text-[#14532D] mb-1">
                        Recommended Next Physical Inspection Steps
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[#14532D]">
                        {aiObservations.recommendedNextInspectionSteps?.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[11px] text-[#17231B]/60 italic">
                      {aiObservations.mandatorySafetyDisclaimer}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#17231B]/60 py-4">
                    Click "Run Gemini Preliminary Visual & Holding Assessment" on the left to analyze the food image and thermal parameters before completing your physical checklist below.
                  </p>
                )}
              </div>

              {/* Mandatory Human Inspector Checklist & Decision Sign-Off */}
              <div className="bg-white border border-[#17231B]/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-display font-bold text-[#17231B]">
                  3. Authorized Human Inspector Sign-Off (Required)
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#17231B] mb-1">
                      Authorized Inspector Name
                    </label>
                    <input
                      type="text"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17231B] mb-1">
                      FSSAI / Campus Inspector ID
                    </label>
                    <input
                      type="text"
                      value={inspectorLicense}
                      onChange={(e) => setInspectorLicense(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 p-3.5 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={humanVerifiedThermometer}
                      onChange={(e) => setHumanVerifiedThermometer(e.target.checked)}
                      className="accent-[#16A34A] w-4 h-4 mt-0.5"
                    />
                    <span>
                      <strong>Core Probe Thermometer Check Passed:</strong> Verified hot food core temperature &ge; 60°C (or cold chain &le; 5°C).
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={humanVerifiedSensory}
                      onChange={(e) => setHumanVerifiedSensory(e.target.checked)}
                      className="accent-[#16A34A] w-4 h-4 mt-0.5"
                    />
                    <span>
                      <strong>Physical Organoleptic Check Passed:</strong> Aroma, appearance, and taste verified free of spoilage by human inspector.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={humanVerifiedPackaging}
                      onChange={(e) => setHumanVerifiedPackaging(e.target.checked)}
                      className="accent-[#16A34A] w-4 h-4 mt-0.5"
                    />
                    <span>
                      <strong>Hygienic Container & Transport Verified:</strong> Food-grade sealed pans with timestamp label ready for insulated transport.
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Inspector Observations & Probe Reading Notes
                  </label>
                  <textarea
                    rows={2}
                    value={humanInspectorNotes}
                    onChange={(e) => setHumanInspectorNotes(e.target.value)}
                    placeholder="e.g., Core probe reading 64.2°C at center of gastronorm pan. Approved for immediate dispatch."
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleHumanInspectionDecision('Approved for Redistribution')}
                    className="py-2.5 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve for Redistribution</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHumanInspectionDecision('Rejected - Composting Only')}
                    className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject (Route to Biogas/Compost)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: FOOD REDISTRIBUTION & BENEFICIARY LOGGING */}
      {activeTab === 'redistribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold text-[#17231B] mb-1">
              Log NGO Collection & Community Distribution
            </h2>
            <p className="text-xs text-[#17231B]/60 mb-5">
              Records chain of custody from approved campus surplus to community beneficiaries and updates campus-wide impact metrics.
            </p>

            {redistSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-semibold text-[#14532D]">
                {redistSuccessMsg}
              </div>
            )}

            <form onSubmit={handleRecordRedistribution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Select Approved Surplus Batch
                </label>
                <select
                  value={redistSurplusId}
                  onChange={(e) => {
                    setRedistSurplusId(e.target.value);
                    const found = db.surplusListings.find((s) => s.id === e.target.value);
                    if (found) {
                      setQtyReceived(found.remainingPortions);
                      setQtyDistributed(found.remainingPortions);
                      setBeneficiariesCount(found.remainingPortions);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                >
                  {db.surplusListings.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.foodName} ({s.remainingPortions} portions · {s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Partner NGO Name
                </label>
                <input
                  type="text"
                  required
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-1">
                  Beneficiary Location / Community Center
                </label>
                <input
                  type="text"
                  required
                  value={beneficiaryCommunity}
                  onChange={(e) => setBeneficiaryCommunity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Portions Received
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={qtyReceived}
                    onChange={(e) => setQtyReceived(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Distributed
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={qtyDistributed}
                    onChange={(e) => setQtyDistributed(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Beneficiaries
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={beneficiariesCount}
                    onChange={(e) => setBeneficiariesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF7] border border-[#17231B]/20 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Record Completed Distribution & Update Impact
              </button>
            </form>
          </div>

          {/* Active & Completed Redistribution Ledger */}
          <div className="lg:col-span-7 bg-white border border-[#17231B]/10 rounded-2xl p-6">
            <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
              Food Redistribution & Beneficiary Chain-of-Custody Log
            </h3>
            <p className="text-xs text-[#17231B]/60 mb-4">
              Track collection status from campus loading bay to final community meal distribution.
            </p>

            <div className="space-y-3">
              {db.redistributionRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs text-[#17231B]/60 mb-1">
                      <strong className="text-[#14532D]">{rec.ngoName}</strong> · Source: {rec.sourceName}
                    </div>
                    <h4 className="text-sm font-display font-bold text-[#17231B]">{rec.foodName}</h4>
                    <div className="text-xs text-[#17231B]/75 mt-1">
                      Beneficiaries: <strong>{rec.beneficiariesCount} people</strong> at{' '}
                      <strong>{rec.beneficiaryCommunity}</strong>
                    </div>
                    <div className="text-xs font-mono text-[#16A34A] mt-1">
                      Received: {rec.quantityReceivedPortions} · Distributed: {rec.quantityDistributedPortions} portions ({rec.weightSavedKg} kg)
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-[#14532D]">
                      Status: {rec.collectionStatus}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(['Requested', 'In Transit', 'Distributed'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateRedistributionStatus(rec.id, st)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border cursor-pointer ${
                            rec.collectionStatus === st
                              ? 'bg-[#16A34A] text-white border-[#16A34A]'
                              : 'bg-white text-[#17231B]/70 border-[#17231B]/15'
                          }`}
                        >
                          {st}
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

      {/* TAB D: INSPECTION HISTORY & IMPACT REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Redistribution Report Chart */}
            <div className="lg:col-span-7 bg-white border border-[#17231B]/10 rounded-2xl p-6">
              <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
                Monthly Campus Food Redistribution & Community Impact (kg & Beneficiaries)
              </h3>
              <p className="text-xs text-[#17231B]/60 mb-6">
                Verified food weight collected and distributed across partner community shelters.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyImpactChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="distributedKg"
                      name="Food Distributed (kg)"
                      fill="#16A34A"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="beneficiaries"
                      name="Beneficiaries Served"
                      fill="#14532D"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inspection Audit Log */}
            <div className="lg:col-span-5 bg-white border border-[#17231B]/10 rounded-2xl p-6">
              <h3 className="text-base font-display font-bold text-[#17231B] mb-1">
                Authorized Food Quality Inspection History ({db.foodInspections.length})
              </h3>
              <p className="text-xs text-[#17231B]/60 mb-4">
                Complete audit trail of AI preliminary observations and human thermometer approvals.
              </p>

              <div className="space-y-3">
                {db.foodInspections.map((insp) => (
                  <div
                    key={insp.id}
                    className="p-4 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10 text-xs"
                  >
                    <div className="flex items-center justify-between text-[#17231B]/60 mb-1">
                      <span className="font-mono font-semibold text-[#14532D]">
                        {insp.inspectorName} ({insp.inspectorLicense})
                      </span>
                      <span
                        className={`font-bold ${
                          insp.decision.includes('Approved') ? 'text-[#16A34A]' : 'text-red-600'
                        }`}
                      >
                        {insp.decision}
                      </span>
                    </div>
                    <div className="font-bold text-[#17231B] text-sm">{insp.foodName}</div>
                    <div className="text-[#17231B]/65 mt-0.5">
                      {insp.sourceName} · Storage: {insp.storageTemp} ({insp.storageDurationHours}h)
                    </div>
                    <p className="text-[#17231B]/80 mt-2 pt-2 border-t border-[#17231B]/10">
                      <strong>Human Inspector Note:</strong> {insp.humanInspectorNotes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
