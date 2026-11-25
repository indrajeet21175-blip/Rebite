import React, { useState } from 'react';
import { ArrowLeft, Home, Users, Utensils, Store, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { useReBite, DEMO_USERS } from '../../context/ReBiteContext';
import { UserRole } from '../../types/rebite';

export const AuthView: React.FC = () => {
  const { loginAsRole, registerOrLoginCustomUser, setActiveView, goBack } = useReBite();
  const [mode, setMode] = useState<'demo' | 'register'>('demo');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [campusUnit, setCampusUnit] = useState('');
  const [verifiedId, setVerifiedId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const roleDetails: Record<
    UserRole,
    { title: string; subtitle: string; unitPlaceholder: string; idPlaceholder: string; icon: React.ReactNode }
  > = {
    [UserRole.STUDENT]: {
      title: 'Hostel Student',
      subtitle: 'Confirm meals, claim surplus food, track eco-impact & leaderboard',
      unitPlaceholder: 'e.g., Vindhya Hostel Block B · Room 204',
      idPlaceholder: 'Roll Number (e.g., 22B0841)',
      icon: <Users className="w-5 h-5" />,
    },
    [UserRole.MESS_MANAGER]: {
      title: 'Mess Manager',
      subtitle: 'AI demand forecasting, menu prep tracking & kitchen surplus publishing',
      unitPlaceholder: 'e.g., Aravalli Central Dining Mess',
      idPlaceholder: 'Mess Staff ID (e.g., MESS-MGR-04)',
      icon: <Utensils className="w-5 h-5" />,
    },
    [UserRole.CANTEEN_MANAGER]: {
      title: 'Canteen Manager',
      subtitle: 'Batch inventory expiry alerts, discounted flash sales & waste analytics',
      unitPlaceholder: 'e.g., Gulmohar Core Block Canteen',
      idPlaceholder: 'Canteen Vendor Code (e.g., CNT-LIC-19)',
      icon: <Store className="w-5 h-5" />,
    },
    [UserRole.NGO_INSPECTOR]: {
      title: 'NGO / Food Quality Inspector',
      subtitle: 'AI-assisted visual quality review, thermometer sign-off & community redistribution',
      unitPlaceholder: 'e.g., Feeding Hope NGO · Campus Chapter',
      idPlaceholder: 'FSSAI Inspector / NGO License (e.g., FSSAI-88412)',
      icon: <HeartHandshake className="w-5 h-5" />,
    },
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || !campusUnit.trim() || !verifiedId.trim()) {
      setErrorMsg('Please complete all required campus verification fields.');
      return;
    }
    setErrorMsg('');
    registerOrLoginCustomUser(name, email, selectedRole, campusUnit, verifiedId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#17231B] flex flex-col justify-center py-12 px-6">
      <div className="max-w-3xl w-full mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={goBack}
            title="Go to previous page"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#17231B]/15 hover:border-[#16A34A] text-xs font-semibold text-[#17231B] hover:text-[#14532D] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Page</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('landing')}
            title="Go to Home page"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#17231B]/15 hover:border-[#16A34A] text-xs font-semibold text-[#17231B] hover:text-[#14532D] transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>

        <div className="bg-white border border-[#17231B]/10 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#17231B]/10 mb-6">
            <div>
              <div className="text-xs font-semibold text-[#16A34A] mb-1">
                Role-Based Campus Access
              </div>
              <h1 className="text-2xl font-display font-bold text-[#17231B]">
                Sign In or Register Stakeholder Account
              </h1>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#F8FAF7] border border-[#17231B]/10 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setMode('demo')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'demo'
                    ? 'bg-[#16A34A] text-white'
                    : 'text-[#17231B]/70 hover:text-[#17231B]'
                }`}
              >
                Instant Demo Accounts
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#16A34A] text-white'
                    : 'text-[#17231B]/70 hover:text-[#17231B]'
                }`}
              >
                Custom Registration
              </button>
            </div>
          </div>

          {mode === 'demo' ? (
            <div>
              <p className="text-sm text-[#17231B]/75 mb-6">
                Select any of the four pre-configured campus stakeholder accounts below to test the interconnected food redistribution workflow immediately. You can also switch roles inside the dashboard header at any time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(DEMO_USERS) as UserRole[]).map((role) => {
                  const demoUser = DEMO_USERS[role];
                  const meta = roleDetails[role];
                  return (
                    <div
                      key={role}
                      className="p-5 rounded-xl border border-[#17231B]/15 hover:border-[#16A34A] bg-[#F8FAF7]/60 flex flex-col justify-between transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="w-9 h-9 rounded-lg bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                            {meta.icon}
                          </div>
                          <span className="text-xs font-mono text-[#17231B]/60">
                            ID: {demoUser.verifiedId}
                          </span>
                        </div>
                        <div className="text-base font-display font-bold text-[#17231B]">
                          {meta.title}
                        </div>
                        <div className="text-xs font-semibold text-[#14532D] mt-0.5 mb-2">
                          {demoUser.name} · {demoUser.campusUnit}
                        </div>
                        <p className="text-xs text-[#17231B]/70 leading-relaxed mb-4">
                          {meta.subtitle}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => loginAsRole(role)}
                        className="w-full py-2.5 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Continue as {demoUser.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#17231B] mb-2">
                  1. Select Your Campus Stakeholder Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(roleDetails) as UserRole[]).map((role) => {
                    const active = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-[#16A34A] bg-[#16A34A]/10 text-[#14532D]'
                            : 'border-[#17231B]/15 bg-white text-[#17231B]/80 hover:border-[#17231B]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          {roleDetails[role].icon}
                          {active && <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />}
                        </div>
                        <div className="text-xs font-semibold leading-tight mt-1">
                          {roleDetails[role].title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Vikramaditya Rao"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#17231B]/20 rounded-lg focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Campus / Institutional Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@campus.ac.in"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#17231B]/20 rounded-lg focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Hostel / Mess / Canteen / NGO Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={campusUnit}
                    onChange={(e) => setCampusUnit(e.target.value)}
                    placeholder={roleDetails[selectedRole].unitPlaceholder}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#17231B]/20 rounded-lg focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17231B] mb-1">
                    Verification ID / Roll No / License
                  </label>
                  <input
                    type="text"
                    required
                    value={verifiedId}
                    onChange={(e) => setVerifiedId(e.target.value)}
                    placeholder={roleDetails[selectedRole].idPlaceholder}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#17231B]/20 rounded-lg focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#16A34A] hover:bg-[#14532D] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Create Account & Launch {roleDetails[selectedRole].title} Workspace
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
