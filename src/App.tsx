/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WrapperConfig } from './types';
import { Header } from './components/Header';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { WindowsDesktopSimulator } from './components/WindowsDesktopSimulator';
import { PeHeaderInspector } from './components/PeHeaderInspector';
import { HexDumpViewer } from './components/HexDumpViewer';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { IconStudioModal } from './components/IconStudioModal';
import { ExportModal } from './components/ExportModal';

const INITIAL_CONFIG: WrapperConfig = {
  app: {
    name: 'GitHub Desktop Web',
    executableName: 'GitHubDesktop.exe',
    url: 'https://github.com',
    version: '1.0.0.0',
    company: 'Enterprise Software Studio',
    copyright: 'Copyright © 2026. All rights reserved.',
    description: 'Native Windows desktop wrapper application',
    guid: '8E0F7A12-BFB3-4FE8-B9A5-48FD50A15A9A',
    iconDataUrl: '',
  },
  window: {
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 550,
    maxWidth: 0,
    maxHeight: 0,
    style: 'standard',
    initialState: 'normal',
    resizable: true,
    alwaysOnTop: false,
    centerScreen: true,
    rememberBounds: true,
    showTitleBarIcon: true,
    darkTitleBar: true,
    backgroundColor: '#030712',
  },
  native: {
    enableSystemTray: true,
    minimizeToTray: true,
    closeToTray: false,
    singleInstanceLock: true,
    startWithWindows: false,
    customUserAgent: '',
    enableDevTools: true,
    enableContextMenu: true,
    enableNavigationShortcuts: true,
    externalLinksBehavior: 'system_browser',
    grantPermissionsAutomatically: true,
    customCss: `/* Injected Native Window CSS */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.7);
}`,
    customJs: `// Injected Client-Side Bridge
console.log('WebToExe Native Windows Desktop Container Loaded');
window.isNativeDesktopApp = true;`,
    offlineFallbackHtml: `<div style="font-family: sans-serif; text-align: center; padding: 50px;">
  <h2>Offline Mode</h2>
  <p>Please check your network connection and reload.</p>
</div>`,
    splashScreenEnabled: false,
    splashDurationMs: 800,
  },
};

export default function App() {
  const [config, setConfig] = useState<WrapperConfig>(INITIAL_CONFIG);
  const [activeTab, setActiveTab] = useState<'simulator' | 'headers' | 'hex' | 'source'>('simulator');
  const [isIconStudioOpen, setIsIconStudioOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleUpdateIcon = (dataUrl: string) => {
    setConfig((prev) => ({
      ...prev,
      app: {
        ...prev.app,
        iconDataUrl: dataUrl,
      },
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased">
      {/* Header */}
      <Header
        config={config}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenIconStudio={() => setIsIconStudioOpen(true)}
        onOpenCodeViewer={() => setActiveTab('source')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace: Split into Left Config Sidebar & Right Interactive Viewer */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Configuration Studio */}
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 h-[45vh] lg:h-full border-b lg:border-b-0 border-slate-800">
          <ConfigurationPanel
            config={config}
            onChange={setConfig}
            onOpenIconStudio={() => setIsIconStudioOpen(true)}
          />
        </div>

        {/* Right Column: Tab View */}
        <main className="flex-1 h-[55vh] lg:h-full overflow-hidden bg-slate-950 flex flex-col">
          {activeTab === 'simulator' && (
            <WindowsDesktopSimulator config={config} />
          )}

          {activeTab === 'headers' && (
            <PeHeaderInspector config={config} />
          )}

          {activeTab === 'hex' && (
            <HexDumpViewer config={config} />
          )}

          {activeTab === 'source' && (
            <SourceCodeViewer config={config} />
          )}
        </main>
      </div>

      {/* Modals */}
      <IconStudioModal
        isOpen={isIconStudioOpen}
        onClose={() => setIsIconStudioOpen(false)}
        config={config}
        onUpdateIcon={handleUpdateIcon}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={config}
      />
    </div>
  );
}
