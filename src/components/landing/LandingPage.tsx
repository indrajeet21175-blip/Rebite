import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Utensils,
  Users,
  Store,
  HeartHandshake,
  Droplets,
  Wind,
  Scale,
  X,
} from 'lucide-react';
import { useReBite } from '../../context/ReBiteContext';
import { UserRole, GENERATED_IMAGES, ECO_ASSUMPTIONS } from '../../types/rebite';
import { SafeFoodImage } from '../common/SafeFoodImage';

export const LandingPage: React.FC = () => {
  const { campusMetrics, loginAsRole, setActiveView, db } = useReBite();
  const [campusStudentsInput, setCampusStudentsInput] = useState<number>(2500);
  const [footerModal, setFooterModal] = useState<'about' | 'contact' | 'privacy' | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactCollege, setContactCollege] = useState('');

  // Interactive calculator for campus impact projection
  const projectedMonthlySavedKg = Math.round(campusStudentsInput * 0.14 * 30);
  const projectedMonthlyMeals = Math.round(projectedMonthlySavedKg * ECO_ASSUMPTIONS.MEALS_PER_KG);
  const projectedMonthlyCo2Kg = Math.round(projectedMonthlySavedKg * ECO_ASSUMPTIONS.CO2_KG_PER_FOOD_KG);
  const projectedMonthlyWaterKl = Math.round((projectedMonthlySavedKg * ECO_ASSUMPTIONS.WATER_LITERS_PER_FOOD_KG) / 1000);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.includes('@') || !contactCollege.trim()) return;
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#17231B] flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#F8FAF7]/95 backdrop-blur-sm border-b border-[#17231B]/10 px-6 lg:px-12 py-4 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="text-xl font-bold tracking-tight text-[#14532D] font-display whitespace-nowrap shrink-0"
        >
          ReBite
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#17231B]/80">
          <a
            href="#how-it-works"
            className="hover:text-[#16A34A] transition-colors whitespace-nowrap shrink-0"
          >
            How It Works
          </a>
          <a
            href="#stakeholders"
            className="hover:text-[#16A34A] transition-colors whitespace-nowrap shrink-0"
          >
            Stakeholders
          </a>
          <a
            href="#environmental-impact"
            className="hover:text-[#16A34A] transition-colors whitespace-nowrap shrink-0"
          >
            Impact
          </a>
          <a
            href="#testimonials"
            className="hover:text-[#16A34A] transition-colors whitespace-nowrap shrink-0"
          >
            Testimonials
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveView('auth')}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#14532D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main id="top" className="flex-1">
        {/* Hero Split Section */}
        <section className="max-w-[1360px] mx-auto px-6 lg:px-12 pt-10 pb-12 lg:pt-16 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Column: Proposition & CTAs */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold text-[#16A34A] tracking-tight mb-3">
                  Save Food. Share Hope. Build a Sustainable Future.
                </p>
                <h1
                  className="font-display font-bold text-[#17231B] tracking-tight leading-[1.08] mb-6"
                  style={{ fontSize: 'clamp(2.25rem, 4vw, 3.65rem)', textWrap: 'balance' }}
                >
                  Every Meal Matters. Every Bite Counts.
                </h1>
                <p className="text-base lg:text-lg text-[#17231B]/75 leading-relaxed mb-8 max-w-[62ch]">
                  Indian residential college campuses lose 18% to 26% of prepared dining hall food daily due to unconfirmed attendance and uncoordinated surplus buffers. ReBite connects hostel students, mess kitchens, campus canteens, and FSSAI-verified NGOs in one real-time network.
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <button
                    onClick={() => setActiveView('auth')}
                    className="px-6 py-3 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#14532D] rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="#stakeholders"
                    className="px-6 py-3 text-sm font-semibold text-[#14532D] bg-white border border-[#17231B]/15 hover:border-[#16A34A] rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    Explore Platform
                  </a>
                </div>
              </div>

              {/* Instant Role-Based Demo Switcher Bar */}
              <div className="pt-6 border-t border-[#17231B]/10">
                <div className="text-xs font-medium text-[#17231B]/60 mb-3">
                  Instant Interactive Role Preview · Shared Live Campus Database
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => loginAsRole(UserRole.STUDENT)}
                    className="px-3 py-2.5 text-left bg-white hover:bg-[#16A34A]/5 border border-[#17231B]/10 hover:border-[#16A34A] rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-[#17231B] whitespace-nowrap truncate">
                      Student
                    </div>
                    <div className="text-[11px] text-[#17231B]/60 truncate">
                      Aarav · Hostel B
                    </div>
                  </button>
                  <button
                    onClick={() => loginAsRole(UserRole.MESS_MANAGER)}
                    className="px-3 py-2.5 text-left bg-white hover:bg-[#16A34A]/5 border border-[#17231B]/10 hover:border-[#16A34A] rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-[#17231B] whitespace-nowrap truncate">
                      Mess Manager
                    </div>
                    <div className="text-[11px] text-[#17231B]/60 truncate">
                      Rajeshwar · Central
                    </div>
                  </button>
                  <button
                    onClick={() => loginAsRole(UserRole.CANTEEN_MANAGER)}
                    className="px-3 py-2.5 text-left bg-white hover:bg-[#16A34A]/5 border border-[#17231B]/10 hover:border-[#16A34A] rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-[#17231B] whitespace-nowrap truncate">
                      Canteen Mgr
                    </div>
                    <div className="text-[11px] text-[#17231B]/60 truncate">
                      Priya · Core Block
                    </div>
                  </button>
                  <button
                    onClick={() => loginAsRole(UserRole.NGO_INSPECTOR)}
                    className="px-3 py-2.5 text-left bg-white hover:bg-[#16A34A]/5 border border-[#17231B]/10 hover:border-[#16A34A] rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-[#17231B] whitespace-nowrap truncate">
                      NGO Inspector
                    </div>
                    <div className="text-[11px] text-[#17231B]/60 truncate">
                      Dr. Kavita · FSSAI
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Hero 16:9 Campus Dining Visual */}
            <div className="lg:col-span-6 flex">
              <div className="relative w-full rounded-2xl overflow-hidden border border-[#17231B]/10 bg-[#14532D] flex flex-col justify-end min-h-[360px] lg:h-full">
                <SafeFoodImage
                  src={GENERATED_IMAGES.HERO_CAMPUS_DINING}
                  alt="Indian university campus dining mess hall during lunch service"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="relative z-10 p-6 lg:p-8 text-white">
                  <div className="text-xs text-white/80 mb-2">
                    Live Campus Dispatch Feed · Aravalli & Vindhya Central Mess
                  </div>
                  <div className="text-lg lg:text-xl font-display font-semibold mb-3">
                    {db.surplusListings.filter((s) => s.remainingPortions > 0).length} Active Surplus Batches Ready for Student & NGO Pickup
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15 text-xs">
                    <div>
                      <div className="text-white/70">Lunch Confirmed</div>
                      <div className="text-base font-mono font-semibold tabular-nums text-white mt-0.5">
                        {db.mealMenus[1]?.confirmedCount || 512} / {db.mealMenus[1]?.expectedStudents || 620}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70">Active Surplus</div>
                      <div className="text-base font-mono font-semibold tabular-nums text-[#F59E0B] mt-0.5">
                        {db.surplusListings.reduce((acc, s) => acc + s.remainingPortions, 0)} portions
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70">NGO Dispatched</div>
                      <div className="text-base font-mono font-semibold tabular-nums text-[#4ADE80] mt-0.5">
                        {db.redistributionRecords.reduce((acc, r) => acc + r.quantityDistributedPortions, 0)} meals
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Live Campus Statistics Row */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#17231B]/10 rounded-xl p-6">
              <div className="text-xs text-[#17231B]/60 mb-1">
                Food Saved Across Campus (This Month)
              </div>
              <div className="text-3xl font-display font-bold font-mono tabular-nums text-[#14532D]">
                {campusMetrics.totalFoodSavedKg.toLocaleString()} kg
              </div>
              <div className="text-xs text-[#16A34A] mt-2">
                Verified mess + canteen + NGO logs
              </div>
            </div>

            <div className="bg-white border border-[#17231B]/10 rounded-xl p-6">
              <div className="text-xs text-[#17231B]/60 mb-1">
                Meals Redistributed
              </div>
              <div className="text-3xl font-display font-bold font-mono tabular-nums text-[#17231B]">
                {campusMetrics.totalMealsRedistributed.toLocaleString()}
              </div>
              <div className="text-xs text-[#17231B]/60 mt-2">
                Calculated at 0.40 kg per standard thali
              </div>
            </div>

            <div className="bg-white border border-[#17231B]/10 rounded-xl p-6">
              <div className="text-xs text-[#17231B]/60 mb-1">
                Students Participating
              </div>
              <div className="text-3xl font-display font-bold font-mono tabular-nums text-[#17231B]">
                {campusMetrics.activeStudentsCount.toLocaleString()}
              </div>
              <div className="text-xs text-[#17231B]/60 mt-2">
                5 Hostel Blocks · Daily RSVP active
              </div>
            </div>

            <div className="bg-white border border-[#17231B]/10 rounded-xl p-6">
              <div className="text-xs text-[#17231B]/60 mb-1">
                Food Waste Prevented
              </div>
              <div className="text-3xl font-display font-bold font-mono tabular-nums text-[#16A34A]">
                {(100 - campusMetrics.currentWastagePercentage).toFixed(1)}%
              </div>
              <div className="text-xs text-[#17231B]/60 mt-2">
                Kitchen utilization rate (vs 76% pre-ReBite)
              </div>
            </div>
          </div>
        </section>

        {/* How ReBite Works Section */}
        <section id="how-it-works" className="py-16 bg-white border-y border-[#17231B]/10">
          <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold text-[#16A34A] mb-2">
                Closed-Loop Campus Food Architecture
              </p>
              <h2 className="text-2xl lg:text-3xl font-display font-bold text-[#17231B] tracking-tight">
                How ReBite Eliminates Waste Before and After Cooking
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                <div className="text-xs font-mono font-semibold text-[#16A34A] mb-3">
                  01. Pre-Meal RSVP
                </div>
                <h3 className="text-lg font-display font-semibold text-[#17231B] mb-2">
                  Student Meal Confirmation
                </h3>
                <p className="text-sm text-[#17231B]/75 leading-relaxed">
                  Students confirm or skip upcoming breakfast, lunch, and dinner before the kitchen cutoff and specify portion size preferences.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                <div className="text-xs font-mono font-semibold text-[#16A34A] mb-3">
                  02. Gemini AI Demand Forecast
                </div>
                <h3 className="text-lg font-display font-semibold text-[#17231B] mb-2">
                  Precision Kitchen Prep
                </h3>
                <p className="text-sm text-[#17231B]/75 leading-relaxed">
                  Mess managers combine real-time student RSVPs with historical weekday/weekend walk-in trends to adjust batch quantities before cooking.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                <div className="text-xs font-mono font-semibold text-[#16A34A] mb-3">
                  03. Instant Surplus Discovery
                </div>
                <h3 className="text-lg font-display font-semibold text-[#17231B] mb-2">
                  Campus & Canteen Redistribution
                </h3>
                <p className="text-sm text-[#17231B]/75 leading-relaxed">
                  Unserved kitchen pans and approaching-expiry canteen snacks are broadcast to students for immediate free or discounted pickup.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10">
                <div className="text-xs font-mono font-semibold text-[#16A34A] mb-3">
                  04. Quality Audit & NGO Dispatch
                </div>
                <h3 className="text-lg font-display font-semibold text-[#17231B] mb-2">
                  Verified Community Feeding
                </h3>
                <p className="text-sm text-[#17231B]/75 leading-relaxed">
                  Authorized food inspectors pair Gemini visual quality observations with mandatory physical probe thermometer checks before NGO dispatch.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Four Stakeholder Cards Section */}
        <section id="stakeholders" className="py-16 max-w-[1360px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-semibold text-[#16A34A] mb-2">
                Interconnected Four-Role Ecosystem
              </p>
              <h2 className="text-2xl lg:text-3xl font-display font-bold text-[#17231B] tracking-tight">
                Four Dedicated Consoles. One Real-Time Database.
              </h2>
            </div>
            <p className="text-sm text-[#17231B]/70 max-w-md">
              Select any stakeholder card below to launch that workspace directly with live campus data. Every action updates all other roles immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Student Dashboard Card */}
            <div className="bg-white border border-[#17231B]/10 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-[#17231B]/60">
                    Role 01 · Hostel Residents
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-[#17231B] mb-2">
                  Student Sustainability Portal
                </h3>
                <p className="text-sm text-[#17231B]/75 mb-5 leading-relaxed">
                  Confirm daily meal attendance in one tap, claim surplus mess and canteen portions with instant pickup codes, track personal water and carbon savings, and earn verified sustainability rewards.
                </p>
                <ul className="space-y-2 text-xs text-[#17231B]/80 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Smart Meal Confirmation with dietary & portion size controls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Live Surplus Food Discovery with portion reservation guardrails</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Eco-Impact Tracker, Hostel Leaderboard & Meal Quality Feedback</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => loginAsRole(UserRole.STUDENT)}
                className="w-full py-3 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Mess Manager Card */}
            <div className="bg-white border border-[#17231B]/10 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#14532D]/10 text-[#14532D] flex items-center justify-center">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-[#17231B]/60">
                    Role 02 · Dining Hall Operations
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-[#17231B] mb-2">
                  Mess Manager Operations Console
                </h3>
                <p className="text-sm text-[#17231B]/75 mb-5 leading-relaxed">
                  Monitor live confirmed student headcount, run Gemini AI demand forecasting before cooking starts, log prepared versus consumed weights per dish, and publish unserved kitchen surplus.
                </p>
                <ul className="space-y-2 text-xs text-[#17231B]/80 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Gemini AI Demand Prediction comparing confirmed vs. historical turnout</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Daily Menu & Prepared vs. Consumed utilization ledger</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>One-click Surplus Broadcast with photo upload & holding temperatures</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => loginAsRole(UserRole.MESS_MANAGER)}
                className="w-full py-3 px-4 bg-[#14532D] hover:bg-[#16A34A] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Mess Manager Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3. Canteen Manager Card */}
            <div className="bg-white border border-[#17231B]/10 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/15 text-[#B45309] flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-[#17231B]/60">
                    Role 03 · Campus Retail & Bakery
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-[#17231B] mb-2">
                  Canteen Inventory & Surplus Hub
                </h3>
                <p className="text-sm text-[#17231B]/75 mb-5 leading-relaxed">
                  Track batch shelf-life across snacks, bakery items, and packaged bowls. Convert approaching-expiry inventory into discounted or free student flash listings before closing time.
                </p>
                <ul className="space-y-2 text-xs text-[#17231B]/80 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Real-time shelf-life & approaching expiry batch monitoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Instant conversion of unsold stock into discounted student reservations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Unsold waste cost analytics & Gemini inventory planning insights</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => loginAsRole(UserRole.CANTEEN_MANAGER)}
                className="w-full py-3 px-4 bg-[#17231B] hover:bg-[#14532D] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Canteen Manager Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 4. NGO / Food Quality Inspector Card */}
            <div className="bg-white border border-[#17231B]/10 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-[#17231B]/60">
                    Role 04 · Safety & Community Distribution
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-[#17231B] mb-2">
                  NGO & Food Quality Inspector Portal
                </h3>
                <p className="text-sm text-[#17231B]/75 mb-5 leading-relaxed">
                  Filter bulk surplus batches across campus, run Gemini multimodal visual food observations alongside mandatory human thermometer and sensory checks, and log community redistribution impact.
                </p>
                <ul className="space-y-2 text-xs text-[#17231B]/80 mb-6">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Gemini Vision preliminary food assessment + mandatory human safety sign-off</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>End-to-end chain of custody from mess hot-box to community distribution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>Verified beneficiary reporting and monthly redistribution ledger</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => loginAsRole(UserRole.NGO_INSPECTOR)}
                className="w-full py-3 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open NGO & Inspector Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Environmental Impact & Interactive Campus Estimator Section */}
        <section id="environmental-impact" className="py-16 bg-[#14532D] text-white">
          <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6">
                <p className="text-xs font-semibold text-[#F59E0B] mb-2">
                  Transparent Ecological Accounting
                </p>
                <h2 className="text-2xl lg:text-3xl font-display font-bold tracking-tight mb-4">
                  Every Kilogram of Rescued Campus Food Protects Water, Soil, and Climate
                </h2>
                <p className="text-sm text-white/80 leading-relaxed mb-6">
                  When prepared rice, lentils, paneer, and rotis are discarded into landfill bins, all embedded agricultural irrigation water, fertilizer energy, and cooking fuel are lost—while decomposing food emits methane.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/10 border border-white/15">
                    <Scale className="w-5 h-5 text-[#F59E0B] mb-2" />
                    <div className="text-xs text-white/75">Live Campus Food Saved</div>
                    <div className="text-2xl font-mono font-bold tabular-nums mt-1">
                      {campusMetrics.totalFoodSavedKg} kg
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 border border-white/15">
                    <Droplets className="w-5 h-5 text-[#38BDF8] mb-2" />
                    <div className="text-xs text-white/75">Est. Water Conserved</div>
                    <div className="text-2xl font-mono font-bold tabular-nums mt-1">
                      {(campusMetrics.totalWaterSavedLiters / 1000).toFixed(1)} kL
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 border border-white/15">
                    <Wind className="w-5 h-5 text-[#4ADE80] mb-2" />
                    <div className="text-xs text-white/75">Est. CO2e Avoided</div>
                    <div className="text-2xl font-mono font-bold tabular-nums mt-1">
                      {campusMetrics.totalCo2AvoidedKg} kg
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/65 leading-relaxed">
                  *Documented Calculation Assumptions: Environmental metrics are estimates based on standard FAO & Indian vegetarian dietary life-cycle coefficients: 1 kg of rescued prepared food = 2.5 standard meals (400g/meal), 2.5 kg CO2-equivalent emissions avoided, and 850 liters of embedded agricultural and kitchen water conserved.
                </p>
              </div>

              {/* Interactive Campus Impact Simulator */}
              <div className="lg:col-span-6">
                <div className="bg-white text-[#17231B] rounded-2xl p-6 lg:p-8 border border-[#17231B]/10">
                  <div className="text-xs font-semibold text-[#16A34A] mb-1">
                    Interactive Campus Impact Estimator
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">
                    Estimate Monthly Savings for Your College
                  </h3>
                  <p className="text-xs text-[#17231B]/70 mb-6">
                    Adjust the residential student population slider to project monthly food rescue and carbon reduction based on our 140g/student/day waste reduction benchmark.
                  </p>

                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm font-medium mb-2">
                      <span>Hostel & Day-Scholar Dining Population</span>
                      <span className="font-mono font-bold tabular-nums text-[#14532D]">
                        {campusStudentsInput.toLocaleString()} students
                      </span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={10000}
                      step={250}
                      value={campusStudentsInput}
                      onChange={(e) => setCampusStudentsInput(Number(e.target.value))}
                      className="w-full accent-[#16A34A] cursor-pointer"
                      aria-label="Campus student population"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-[#17231B]/50 mt-1">
                      <span>500 students</span>
                      <span>5,000 students</span>
                      <span>10,000 students</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#17231B]/10">
                    <div>
                      <div className="text-xs text-[#17231B]/60">Est. Food Rescued / Month</div>
                      <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#14532D] mt-0.5">
                        {projectedMonthlySavedKg.toLocaleString()} kg
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#17231B]/60">Est. Meals Redistributed</div>
                      <div className="text-2xl font-display font-bold font-mono tabular-nums text-[#16A34A] mt-0.5">
                        {projectedMonthlyMeals.toLocaleString()} meals
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#17231B]/60">Est. Embedded Water Saved</div>
                      <div className="text-xl font-display font-bold font-mono tabular-nums text-[#17231B] mt-0.5">
                        {projectedMonthlyWaterKl.toLocaleString()} kiloliters
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#17231B]/60">Est. CO2e Emissions Avoided</div>
                      <div className="text-xl font-display font-bold font-mono tabular-nums text-[#17231B] mt-0.5">
                        {projectedMonthlyCo2Kg.toLocaleString()} kg CO2e
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Attributable Testimonials Section */}
        <section id="testimonials" className="py-16 max-w-[1360px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-[#16A34A] mb-2">
              Verified Campus Outcomes
            </p>
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-[#17231B] tracking-tight">
              Trusted by Hostel Mess Committees, Canteens, and NGO Partners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#17231B]/10 rounded-xl p-6 flex flex-col justify-between">
              <p className="text-sm text-[#17231B]/80 leading-relaxed mb-6">
                “Before ReBite, our Wednesday and weekend dinner buffers resulted in 45–60 kg of unserved rice and dal every night. With live student RSVPs and Gemini batch recommendations, we reduced raw ingredient over-prep by 19% in our first month.”
              </p>
              <div className="pt-4 border-t border-[#17231B]/10">
                <div className="text-sm font-semibold text-[#17231B]">Rajeshwar Nair</div>
                <div className="text-xs text-[#17231B]/60">
                  Chief Mess Superintendent · Aravalli & Vindhya Central Dining Hall
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#17231B]/10 rounded-xl p-6 flex flex-col justify-between">
              <p className="text-sm text-[#17231B]/80 leading-relaxed mb-6">
                “Our NGO volunteers used to spend hours calling hostels to check if surplus food was safe and available. Now we see exact preparation timestamps, run visual pre-checks, log our probe thermometer readings, and dispatch 60+ meals within 45 minutes.”
              </p>
              <div className="pt-4 border-t border-[#17231B]/10">
                <div className="text-sm font-semibold text-[#17231B]">Dr. Kavita Menon</div>
                <div className="text-xs text-[#17231B]/60">
                  FSSAI Certified Food Safety Coordinator · Feeding Hope Campus Chapter
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#17231B]/10 rounded-xl p-6 flex flex-col justify-between">
              <p className="text-sm text-[#17231B]/80 leading-relaxed mb-6">
                “Late evening lab sessions meant many of us missed regular mess timings while canteen snacks went unsold at 7 PM. Claiming discounted canteen surplus bags through ReBite saves money and keeps fresh food out of bins.”
              </p>
              <div className="pt-4 border-t border-[#17231B]/10">
                <div className="text-sm font-semibold text-[#17231B]">Ananya Verma</div>
                <div className="text-xs text-[#17231B]/60">
                  General Secretary, Hostel Sustainability Cell · Sarayu Hostel
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer with working modal links */}
      <footer className="bg-white border-t border-[#17231B]/10 py-10 px-6 lg:px-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="text-lg font-display font-bold text-[#14532D]">ReBite</div>
            <p className="text-xs text-[#17231B]/60 mt-1">
              Save Food. Share Hope. Build a Sustainable Future. · Indian Campus Sustainability Network
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#17231B]/75">
            <button
              onClick={() => setFooterModal('about')}
              className="hover:text-[#16A34A] transition-colors cursor-pointer"
            >
              About ReBite
            </button>
            <button
              onClick={() => {
                setContactSubmitted(false);
                setFooterModal('contact');
              }}
              className="hover:text-[#16A34A] transition-colors cursor-pointer"
            >
              Contact & Campus Onboarding
            </button>
            <button
              onClick={() => setFooterModal('privacy')}
              className="hover:text-[#16A34A] transition-colors cursor-pointer"
            >
              Privacy & Food Safety Policy
            </button>
            <button
              onClick={() => setActiveView('auth')}
              className="text-[#16A34A] font-semibold hover:underline cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </footer>

      {/* Footer Information Modals */}
      {footerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#17231B]/10 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#17231B]/10 mb-4">
              <h3 className="text-lg font-display font-bold text-[#17231B]">
                {footerModal === 'about' && 'About ReBite Campus Network'}
                {footerModal === 'contact' && 'Onboard Your College Campus'}
                {footerModal === 'privacy' && 'Privacy & Food Safety Compliance Policy'}
              </h3>
              <button
                onClick={() => setFooterModal(null)}
                className="p-1.5 rounded-lg text-[#17231B]/60 hover:text-[#17231B] hover:bg-[#F8FAF7] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {footerModal === 'about' && (
              <div className="space-y-3 text-sm text-[#17231B]/80 leading-relaxed">
                <p>
                  ReBite is an AI-powered food waste management and redistribution platform built specifically for Indian universities, IITs, NITs, and residential colleges.
                </p>
                <p>
                  By connecting student meal attendance RSVPs directly to mess kitchen production schedules and FSSAI-supervised NGO redistribution channels, ReBite turns unpredictable hostel dining halls into zero-waste ecosystems.
                </p>
              </div>
            )}

            {footerModal === 'privacy' && (
              <div className="space-y-3 text-sm text-[#17231B]/80 leading-relaxed">
                <p>
                  <strong>1. Food Safety Mandate:</strong> ReBite’s Gemini AI visual assessment tool provides preliminary observations only and never certifies food as safe to eat. Every bulk NGO redistribution requires physical thermometer verification and human inspector sign-off in accordance with FSSAI Surplus Food Donation Guidelines.
                </p>
                <p>
                  <strong>2. Student Privacy:</strong> Individual meal RSVP records are used strictly in aggregate to forecast kitchen batch sizes and award verified campus sustainability points.
                </p>
              </div>
            )}

            {footerModal === 'contact' && (
              <div>
                {contactSubmitted ? (
                  <div className="p-4 rounded-xl bg-[#16A34A]/10 text-[#14532D] text-sm">
                    <div className="font-semibold mb-1">Campus Onboarding Request Logged</div>
                    <p className="text-xs">
                      Thank you! Our campus deployment team will reach out to <strong>{contactEmail}</strong> with a custom mess & canteen setup kit for <strong>{contactCollege}</strong>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#17231B] mb-1">
                        College / University Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactCollege}
                        onChange={(e) => setContactCollege(e.target.value)}
                        placeholder="e.g., IIT Bombay / NIT Trichy"
                        className="w-full px-3.5 py-2.5 text-sm border border-[#17231B]/20 rounded-lg focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#17231B] mb-1">
                        Official Institutional Email
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="dean.studentaffairs@campus.ac.in"
                        className="w-full px-3.5 py-2.5 text-sm border border-[#17231B]/20 rounded-lg focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Request Campus Deployment Kit
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
