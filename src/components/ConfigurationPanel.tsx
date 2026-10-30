/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WrapperConfig, WindowStyle, WindowInitialState, ExternalLinksBehavior } from '../types';
import { 
  Globe, 
  AppWindow, 
  ShieldCheck, 
  Code, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Monitor, 
  ExternalLink,
  ChevronRight,
  Palette
} from 'lucide-react';

interface ConfigurationPanelProps {
  config: WrapperConfig;
  onChange: (newConfig: WrapperConfig) => void;
  onOpenIconStudio: () => void;
}

const PRESET_URLS = [
  { name: 'GitHub', url: 'https://github.com', exe: 'GitHubDesktop.exe' },
  { name: 'Notion', url: 'https://www.notion.so', exe: 'Notion.exe' },
  { name: 'ChatGPT', url: 'https://chatgpt.com', exe: 'ChatGPT.exe' },
  { name: 'Figma', url: 'https://www.figma.com', exe: 'Figma.exe' },
  { name: 'Localhost Dev', url: 'http://localhost:5173', exe: 'LocalDevApp.exe' },
];

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onChange,
  onOpenIconStudio,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'window' | 'native' | 'scripts'>('general');

  const updateApp = (fields: Partial<typeof config.app>) => {
    onChange({
      ...config,
      app: { ...config.app, ...fields },
    });
  };

  const updateWindow = (fields: Partial<typeof config.window>) => {
    onChange({
      ...config,
      window: { ...config.window, ...fields },
    });
  };

  const updateNative = (fields: Partial<typeof config.native>) => {
    onChange({
      ...config,
      native: { ...config.native, ...fields },
    });
  };

  const handleApplyPreset = (preset: typeof PRESET_URLS[0]) => {
    onChange({
      ...config,
      app: {
        ...config.app,
        name: preset.name,
        url: preset.url,
        executableName: preset.exe,
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Configuration Section Switcher */}
      <div className="p-3 border-b border-slate-800 flex items-center gap-1 overflow-x-auto bg-slate-950/40">
        <button
          type="button"
          onClick={() => setActiveSubTab('general')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'general'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Target &amp; Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('window')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'window'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AppWindow className="w-3.5 h-3.5" />
          <span>Window Frame</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('native')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'native'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Runtime &amp; Tray</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('scripts')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'scripts'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Injections</span>
        </button>
      </div>

      {/* Configuration Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm text-slate-300">
        {/* SUBTAB 1: GENERAL & IDENTITY */}
        {activeSubTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Website URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={config.app.url}
                  onChange={(e) => updateApp({ url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                The web application or URL wrapped inside the native Windows shell.
              </p>
            </div>

            {/* Quick URL Presets */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_URLS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded border border-slate-700 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Application Branding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Application Title
                </label>
                <input
                  type="text"
                  value={config.app.name}
                  onChange={(e) => updateApp({ name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Windows Executable (.exe)
                </label>
                <input
                  type="text"
                  value={config.app.executableName}
                  onChange={(e) => updateApp({ executableName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={config.app.version}
                  onChange={(e) => updateApp({ version: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Publisher / Company
                </label>
                <input
                  type="text"
                  value={config.app.company}
                  onChange={(e) => updateApp({ company: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                File Description (PE VERSIONINFO)
              </label>
              <input
                type="text"
                value={config.app.description}
                onChange={(e) => updateApp({ description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Icon Configuration Preview & Action */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  {config.app.iconDataUrl ? (
                    <img src={config.app.iconDataUrl} alt="App icon" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-slate-200">
                      {(config.app.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-200">Windows Icon (.ico)</div>
                  <div className="text-[11px] text-slate-400">
                    256x256, 128x128, 64x64, 48x48, 32x32, 16x16 mipmaps
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenIconStudio}
                className="px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-600 transition-colors"
              >
                Customize Icon
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 2: WINDOW FRAME & DISPLAY */}
        {activeSubTab === 'window' && (
          <div className="space-y-4">
            {/* Dimensions */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Default Dimensions (px)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Width</span>
                  <input
                    type="number"
                    value={config.window.width}
                    onChange={(e) => updateWindow({ width: parseInt(e.target.value) || 800 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Height</span>
                  <input
                    type="number"
                    value={config.window.height}
                    onChange={(e) => updateWindow({ height: parseInt(e.target.value) || 600 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Window Style Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Window Frame Material &amp; Chrome
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'standard', label: 'Standard Chrome', desc: 'Standard Win32 Titlebar' },
                  { id: 'frameless', label: 'Modern Frameless', desc: 'Custom integrated title' },
                  { id: 'mica', label: 'Windows 11 Mica', desc: 'System backdrop material' },
                  { id: 'acrylic', label: 'Acrylic Blur', desc: 'Translucent glass effect' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateWindow({ style: item.id as WindowStyle })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      config.window.style === item.id
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-medium">{item.label}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Initial Launch State */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Initial Launch State
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                {[
                  { id: 'normal', label: 'Normal' },
                  { id: 'maximized', label: 'Maximized' },
                  { id: 'fullscreen', label: 'Fullscreen' },
                  { id: 'kiosk', label: 'Kiosk Mode' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateWindow({ initialState: item.id as WindowInitialState })}
                    className={`py-1 text-xs font-medium rounded transition-colors ${
                      config.window.initialState === item.id
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {config.window.initialState === 'kiosk' && (
                <p className="text-[11px] text-amber-400 mt-1">
                  Kiosk mode hides OS titlebar, taskbar, and locks window into dedicated full-display mode.
                </p>
              )}
            </div>

            {/* Checkbox toggles for window properties */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.window.centerScreen}
                  onChange={(e) => updateWindow({ centerScreen: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">Center window on startup</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.window.alwaysOnTop}
                  onChange={(e) => updateWindow({ alwaysOnTop: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">Always on top (TopMost)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.window.resizable}
                  onChange={(e) => updateWindow({ resizable: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">Resizable window frame</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.window.darkTitleBar}
                  onChange={(e) => updateWindow({ darkTitleBar: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">Windows 11 Immersive Dark Titlebar</span>
              </label>
            </div>
          </div>
        )}

        {/* SUBTAB 3: NATIVE INTEGRATIONS & RUNTIME */}
        {activeSubTab === 'native' && (
          <div className="space-y-4">
            {/* System Tray */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">System Tray Integration</div>
                  <div className="text-[11px] text-slate-400">Keep application running in Windows taskbar notification area</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.native.enableSystemTray}
                  onChange={(e) => updateNative({ enableSystemTray: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                />
              </div>

              {config.native.enableSystemTray && (
                <div className="pl-3 border-l-2 border-slate-800 space-y-2 mt-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.native.minimizeToTray}
                      onChange={(e) => updateNative({ minimizeToTray: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs text-slate-300">Minimize window to system tray</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.native.closeToTray}
                      onChange={(e) => updateNative({ closeToTray: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs text-slate-300">Close button hides to tray instead of quitting</span>
                  </label>
                </div>
              )}
            </div>

            {/* Mutex Single Instance */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Single Instance Mutex</div>
                <div className="text-[11px] text-slate-400">Prevent opening multiple duplicate windows of the same app</div>
              </div>
              <input
                type="checkbox"
                checked={config.native.singleInstanceLock}
                onChange={(e) => updateNative({ singleInstanceLock: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
              />
            </div>

            {/* Browser Engine Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-200 block">Security &amp; WebView2 Controls</span>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.native.enableDevTools}
                  onChange={(e) => updateNative({ enableDevTools: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">Enable Chromium F12 Developer Tools</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.native.enableContextMenu}
                  onChange={(e) => updateNative({ enableContextMenu: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">Enable Right-Click Context Menu</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.native.enableNavigationShortcuts}
                  onChange={(e) => updateNative({ enableNavigationShortcuts: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">Enable F5 / Ctrl+R page reload shortcuts</span>
              </label>
            </div>

            {/* External Links */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                External Hyperlinks Behavior
              </label>
              <select
                value={config.native.externalLinksBehavior}
                onChange={(e) => updateNative({ externalLinksBehavior: e.target.value as ExternalLinksBehavior })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="system_browser">Open outside links in default system browser (Chrome/Edge)</option>
                <option value="inside_window">Keep all navigations inside this native wrapper window</option>
              </select>
            </div>

            {/* Custom User Agent */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom User-Agent (Optional)
              </label>
              <input
                type="text"
                value={config.native.customUserAgent}
                onChange={(e) => updateNative({ customUserAgent: e.target.value })}
                placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) NativeApp/1.0"
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* SUBTAB 4: INJECTIONS & SCRIPTS */}
        {activeSubTab === 'scripts' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Injected Custom CSS Stylesheet
                </label>
                <span className="text-[11px] text-slate-400">Injected on DOM ready</span>
              </div>
              <textarea
                value={config.native.customCss}
                onChange={(e) => updateNative({ customCss: e.target.value })}
                rows={5}
                placeholder="/* Custom CSS to inject into the web app */&#10;::-webkit-scrollbar { width: 8px; }&#10;::-webkit-scrollbar-thumb { background: #3b82f6; }"
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Injected Custom JavaScript
                </label>
                <span className="text-[11px] text-slate-400">AddScriptToExecuteOnDocumentCreated</span>
              </div>
              <textarea
                value={config.native.customJs}
                onChange={(e) => updateNative({ customJs: e.target.value })}
                rows={5}
                placeholder="// Injected JavaScript bridge&#10;console.log('WebToExe Native Host Attached');&#10;window.isNativeDesktop = true;"
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Offline Fallback HTML
                </label>
                <span className="text-[11px] text-slate-400">Shown when offline</span>
              </div>
              <textarea
                value={config.native.offlineFallbackHtml}
                onChange={(e) => updateNative({ offlineFallbackHtml: e.target.value })}
                rows={3}
                placeholder="<h2>No Internet Connection</h2><p>Please check your connection and retry.</p>"
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
