/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WrapperConfig } from '../types';
import { 
  Minus, 
  Square, 
  X, 
  RotateCw, 
  ExternalLink, 
  Wifi, 
  Volume2, 
  Shield, 
  LayoutGrid,
  Maximize2,
  Terminal,
  Eye,
  Sliders
} from 'lucide-react';

interface WindowsDesktopSimulatorProps {
  config: WrapperConfig;
}

export const WindowsDesktopSimulator: React.FC<WindowsDesktopSimulatorProps> = ({ config }) => {
  const [isWindowMaximized, setIsWindowMaximized] = useState(config.window.initialState === 'maximized');
  const [isWindowVisible, setIsWindowVisible] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [clockTime, setClockTime] = useState('');
  const [previewMode, setPreviewMode] = useState<'iframe' | 'mockup'>('iframe');
  const [isKioskActive, setIsKioskActive] = useState(config.window.initialState === 'kiosk');

  useEffect(() => {
    setIsWindowMaximized(config.window.initialState === 'maximized');
    setIsKioskActive(config.window.initialState === 'kiosk');
  }, [config.window.initialState]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
    setIframeError(false);
  };

  const handleClose = () => {
    if (config.native.closeToTray && config.native.enableSystemTray) {
      setIsWindowVisible(false);
    } else {
      setIsWindowVisible(false);
    }
  };

  const handleMinimize = () => {
    if (config.native.minimizeToTray && config.native.enableSystemTray) {
      setIsWindowVisible(false);
    } else {
      setIsWindowVisible(false);
    }
  };

  const handleTrayIconClick = () => {
    setIsWindowVisible(true);
  };

  const titleBarBg = config.window.darkTitleBar ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-200';

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Simulator Control Bar */}
      <div className="h-10 px-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-200">Windows 11 Native Simulator</span>
          <span aria-hidden="true">·</span>
          <span>{config.window.width}×{config.window.height}px</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{config.window.style} Frame</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview Mode Switcher */}
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded">
            <button
              type="button"
              onClick={() => setPreviewMode('iframe')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                previewMode === 'iframe' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Live Iframe
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mockup')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                previewMode === 'mockup' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Native Viewport
            </button>
          </div>

          <button
            type="button"
            onClick={handleReload}
            className="p-1 hover:text-slate-100 transition-colors"
            title="Reload content"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated Windows 11 Desktop Canvas */}
      <div className="relative flex-1 bg-gradient-to-br from-slate-900 via-[#0b1329] to-[#040814] overflow-hidden flex items-center justify-center p-4">
        {/* Subtle Windows 11 Bloom / Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        {/* Windows Desktop App Window */}
        {isWindowVisible ? (
          <div
            className={`transition-all duration-200 flex flex-col shadow-2xl rounded-lg overflow-hidden border ${
              config.window.darkTitleBar ? 'border-slate-800' : 'border-slate-700'
            } ${
              isKioskActive
                ? 'absolute inset-0 rounded-none border-none z-20'
                : isWindowMaximized
                ? 'w-full h-full rounded-none'
                : 'w-[94%] max-w-[960px] h-[82%] max-h-[620px]'
            } ${
              config.window.style === 'acrylic'
                ? 'bg-slate-900/70 backdrop-blur-xl'
                : config.window.style === 'mica'
                ? 'bg-slate-900/90 backdrop-blur-md'
                : 'bg-slate-950'
            }`}
          >
            {/* Window Title Bar */}
            {!isKioskActive && (
              <div
                className={`h-9 px-3 flex items-center justify-between border-b ${
                  config.window.darkTitleBar ? 'border-slate-800/80' : 'border-slate-800'
                } ${titleBarBg} select-none`}
              >
                {/* Window Title & Icon */}
                <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                  {config.window.showTitleBarIcon && (
                    <div className="w-4 h-4 rounded bg-blue-600/30 flex items-center justify-center shrink-0 overflow-hidden">
                      {config.app.iconDataUrl ? (
                        <img src={config.app.iconDataUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-blue-400">
                          {(config.app.name || 'A').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="text-xs font-medium truncate text-slate-200">
                    {config.app.name || 'Untitled Application'}
                  </span>
                </div>

                {/* Windows 11 Fluent Window Caption Buttons */}
                <div className="flex items-center h-full -mr-3">
                  <button
                    type="button"
                    onClick={handleMinimize}
                    className="h-full px-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors flex items-center justify-center"
                    title="Minimize"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWindowMaximized(!isWindowMaximized)}
                    className="h-full px-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors flex items-center justify-center"
                    title={isWindowMaximized ? 'Restore' : 'Maximize'}
                  >
                    <Square className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-full px-3.5 text-slate-400 hover:text-white hover:bg-red-600 transition-colors flex items-center justify-center"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Embedded Native WebView Content Area */}
            <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col">
              {previewMode === 'iframe' ? (
                <>
                  <iframe
                    key={iframeKey}
                    src={config.app.url || 'about:blank'}
                    title={config.app.name}
                    className="w-full h-full border-none bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    onError={() => setIframeError(true)}
                  />

                  {/* Fallback Overlay when website blocks iframe embedding via X-Frame-Options */}
                  {iframeError && (
                    <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-slate-300">
                      <Shield className="w-10 h-10 text-blue-400 mb-3" />
                      <h3 className="text-sm font-semibold text-slate-100 mb-1">
                        Domain Has Protected Iframe Policy
                      </h3>
                      <p className="text-xs text-slate-400 max-w-md mb-4">
                        The remote site headers (X-Frame-Options / CSP) block browser web embedding.
                        However, when compiled into your native Windows executable via Microsoft Edge WebView2,
                        it will run unrestricted with full desktop permissions.
                      </p>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('mockup')}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                      >
                        Switch to Native Viewport Preview
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Native Viewport Mockup */
                <div className="w-full h-full flex flex-col bg-slate-950 p-6 text-slate-300">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                        {(config.app.name || 'W').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{config.app.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{config.app.url}</div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <div>WebView2 Runtime Active</div>
                      <div className="text-emerald-400">Status 200 OK</div>
                    </div>
                  </div>

                  <div className="flex-1 py-8 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <ExternalLink className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-100">
                      Ready for Windows Execution
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This application will launch {config.app.url} directly inside a high-performance native Win32 window backed by Microsoft Edge WebView2.
                    </p>

                    <div className="w-full pt-4 space-y-2 text-left text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Subsystem</span>
                        <span className="text-slate-200 font-mono">IMAGE_SUBSYSTEM_WINDOWS_GUI</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Process Arch</span>
                        <span className="text-slate-200 font-mono">x86_64 (AMD64)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">DevTools F12</span>
                        <span className="text-slate-200 font-mono">{config.native.enableDevTools ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Tray Minimization</span>
                        <span className="text-slate-200 font-mono">{config.native.enableSystemTray ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Minimized State Notice */
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl text-center space-y-2 text-slate-300">
            <div className="text-sm font-medium text-slate-100">Window Minimized to System Tray</div>
            <p className="text-xs text-slate-400">
              Click the app icon in the Windows taskbar system tray below to restore.
            </p>
            <button
              type="button"
              onClick={() => setIsWindowVisible(true)}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
            >
              Restore Window
            </button>
          </div>
        )}
      </div>

      {/* Simulated Windows 11 Taskbar */}
      <div className="h-12 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between z-10 select-none">
        {/* Left: Desktop Widgets / Quiet Area */}
        <div className="w-20 hidden sm:block text-[11px] text-slate-400">
          Windows 11
        </div>

        {/* Center: Windows 11 Centered Taskbar Icons */}
        <div className="flex items-center gap-1.5">
          {/* Start Icon */}
          <button
            type="button"
            className="w-9 h-9 rounded hover:bg-slate-800/80 flex items-center justify-center text-blue-400 transition-colors"
            title="Start"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Our Running Wrapped App */}
          <button
            type="button"
            onClick={() => setIsWindowVisible(!isWindowVisible)}
            className={`relative w-9 h-9 rounded flex items-center justify-center transition-colors ${
              isWindowVisible ? 'bg-slate-800/90 text-white' : 'hover:bg-slate-800/60 text-slate-400'
            }`}
            title={config.app.name}
          >
            <div className="w-5 h-5 rounded bg-blue-600/30 flex items-center justify-center overflow-hidden">
              {config.app.iconDataUrl ? (
                <img src={config.app.iconDataUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[11px] font-bold text-blue-400">
                  {(config.app.name || 'A').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Active Running Indicator Dot / Bar */}
            {isWindowVisible && (
              <span className="absolute bottom-1 w-3 h-0.5 bg-blue-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Right: Windows System Tray & Clock */}
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          {/* Tray App Icon */}
          {config.native.enableSystemTray && (
            <button
              type="button"
              onClick={handleTrayIconClick}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title={`${config.app.name} - System Tray`}
            >
              <div className="w-3.5 h-3.5 rounded-sm bg-blue-500/30 border border-blue-400 flex items-center justify-center text-[8px] text-blue-300 font-bold">
                {(config.app.name || 'A').charAt(0).toUpperCase()}
              </div>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-default">
            <Wifi className="w-3.5 h-3.5" />
            <Volume2 className="w-3.5 h-3.5" />
          </div>

          <div className="text-right text-[11px] leading-tight px-1 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-default">
            <div>{clockTime || '12:00 PM'}</div>
            <div className="text-[10px] text-slate-400">
              {new Date().toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
