/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { WrapperConfig } from '../types';
import { 
  generateCppWebView2Project, 
  generateCsharpWpfProject, 
  generateTauriProject, 
  generateInnoSetupScript, 
  generatePortableBatchLauncher 
} from '../utils/codeGenerators';
import { Copy, Download, FileText, Check, ChevronRight } from 'lucide-react';

interface SourceCodeViewerProps {
  config: WrapperConfig;
}

export const SourceCodeViewer: React.FC<SourceCodeViewerProps> = ({ config }) => {
  const [selectedTarget, setSelectedTarget] = useState<'cpp' | 'csharp' | 'tauri' | 'inno' | 'batch'>('cpp');
  const [selectedFile, setSelectedFile] = useState<string>('main.cpp');
  const [copied, setCopied] = useState(false);

  const cppFiles = useMemo(() => generateCppWebView2Project(config), [config]);
  const csharpFiles = useMemo(() => generateCsharpWpfProject(config), [config]);
  const tauriFiles = useMemo(() => generateTauriProject(config), [config]);
  const innoScript = useMemo(() => generateInnoSetupScript(config), [config]);
  const batchScript = useMemo(() => generatePortableBatchLauncher(config), [config]);

  // Compute available files for selected target
  const currentFiles: Record<string, string> = useMemo(() => {
    switch (selectedTarget) {
      case 'cpp':
        return cppFiles;
      case 'csharp':
        return csharpFiles;
      case 'tauri':
        return tauriFiles;
      case 'inno':
        return { 'setup.iss': innoScript };
      case 'batch':
        return { 'run_app.cmd': batchScript };
      default:
        return {};
    }
  }, [selectedTarget, cppFiles, csharpFiles, tauriFiles, innoScript, batchScript]);

  // Ensure selectedFile exists when switching targets
  const fileKeys = Object.keys(currentFiles);
  const activeFileKey = currentFiles[selectedFile] ? selectedFile : fileKeys[0] || '';
  const currentCode = currentFiles[activeFileKey] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFileKey;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-hidden text-slate-300">
      {/* Top Target Selector */}
      <div className="h-14 px-4 sm:px-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-950 border border-slate-800 rounded-lg">
          {[
            { id: 'cpp', label: 'C++ Win32 WebView2' },
            { id: 'csharp', label: 'C# .NET WPF' },
            { id: 'tauri', label: 'Rust Tauri 2.0' },
            { id: 'inno', label: 'Inno Setup (.iss)' },
            { id: 'batch', label: 'Windows Runner (.cmd)' },
          ].map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => {
                setSelectedTarget(target.id as any);
                // Auto-pick first file of that target
                if (target.id === 'cpp') setSelectedFile('main.cpp');
                if (target.id === 'csharp') setSelectedFile('MainWindow.xaml.cs');
                if (target.id === 'tauri') setSelectedFile('src-tauri/src/main.rs');
                if (target.id === 'inno') setSelectedFile('setup.iss');
                if (target.id === 'batch') setSelectedFile('run_app.cmd');
              }}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedTarget === target.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {target.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadFile}
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {activeFileKey}</span>
          </button>
        </div>
      </div>

      {/* Main Split: File Tree (Sidebar) & Code Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Files in this target */}
        <div className="w-56 border-r border-slate-800 bg-slate-900/40 p-3 overflow-y-auto shrink-0 space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 block mb-2">
            Target Files
          </span>
          {fileKeys.map((fname) => (
            <button
              key={fname}
              type="button"
              onClick={() => setSelectedFile(fname)}
              className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center gap-2 truncate font-mono ${
                activeFileKey === fname
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{fname}</span>
            </button>
          ))}
        </div>

        {/* Right: Code Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          <div className="h-8 px-4 border-b border-slate-800/80 bg-slate-900/30 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{activeFileKey}</span>
            <span>{currentCode.split('\n').length} lines · {currentCode.length} bytes</span>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed tab-size-4 select-text">
              <code>{currentCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
