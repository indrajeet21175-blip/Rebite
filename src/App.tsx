/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ReBiteProvider, useReBite } from './context/ReBiteContext';
import { LandingPage } from './components/landing/LandingPage';
import { AuthView } from './components/auth/AuthView';
import { DashboardShell } from './components/layout/DashboardShell';
import { ReBiteAiAssistant } from './components/chat/ReBiteAiAssistant';

const ReBiteRouter: React.FC = () => {
  const { activeView } = useReBite();

  return (
    <>
      {activeView === 'landing' && <LandingPage />}
      {activeView === 'auth' && <AuthView />}
      {activeView === 'dashboard' && <DashboardShell />}
      <ReBiteAiAssistant />
    </>
  );
};

export default function App() {
  return (
    <ReBiteProvider>
      <ReBiteRouter />
    </ReBiteProvider>
  );
}
