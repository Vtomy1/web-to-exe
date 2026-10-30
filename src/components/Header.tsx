/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WrapperConfig } from '../types';
import { 
  Download, 
  Code2, 
  Cpu, 
  Sparkles,
  Layers, 
  Palette,
  FileCode,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  config: WrapperConfig;
  onOpenExport: () => void;
  onOpenIconStudio: () => void;
  onOpenCodeViewer: () => void;
  activeTab: 'simulator' | 'headers' | 'hex' | 'source';
  setActiveTab: (tab: 'simulator' | 'headers' | 'hex' | 'source') => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenExport,
  onOpenIconStudio,
  onOpenCodeViewer,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-100 tracking-tight">WebToExe</h1>
              <span className="text-xs text-slate-400 font-mono">PE32+ x64</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Windows Native Wrapper</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 truncate max-w-[200px] sm:max-w-[280px]">
                {config.app.url || 'No URL specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: View Switcher (Segmented Button Tabs) */}
        <div className="hidden md:flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Desktop Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'headers'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>PE Header Inspector</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hex')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'hex'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Hex Dump</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('source')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'source'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Native Source</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenIconStudio}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/70 rounded-md transition-colors flex items-center gap-1.5"
            title="Create or customize Windows .ico file"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Icon Studio</span>
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-md shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Compile &amp; Export</span>
          </button>
        </div>
      </div>

      {/* Mobile sub-bar for tabs */}
      <div className="flex md:hidden border-t border-slate-800/80 px-4 py-2 bg-slate-900/60 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeTab === 'simulator' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Simulator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeTab === 'headers' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          PE Headers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hex')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeTab === 'hex' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Hex Dump
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('source')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeTab === 'source' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Source Files
        </button>
      </div>
    </header>
  );
};
