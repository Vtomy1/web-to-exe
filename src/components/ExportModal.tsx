/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WrapperConfig } from '../types';
import { generatePeBinary } from '../utils/peGenerator';
import { 
  generateCppWebView2Project, 
  generateCsharpWpfProject, 
  generateTauriProject, 
  generateInnoSetupScript, 
  generatePortableBatchLauncher 
} from '../utils/codeGenerators';
import { createDefaultAppIconCanvas, generateIcoBinary } from '../utils/icoGenerator';
import JSZip from 'jszip';
import { 
  X, 
  Download, 
  Package, 
  Cpu, 
  Terminal, 
  Check, 
  Archive, 
  FolderArchive,
  Layers,
  Sparkles
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WrapperConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // 1. Download Compiled PE Executable (.exe)
  const handleDownloadExe = () => {
    const bytes = generatePeBinary(config);
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.app.executableName || 'App.exe';
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`Downloaded ${config.app.executableName}!`);
  };

  // 2. Download Standalone Portable Windows Runner (.cmd)
  const handleDownloadCmd = () => {
    const content = generatePortableBatchLauncher(config);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.app.executableName.replace(/\.exe$/i, '')}_Launcher.cmd`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Downloaded Windows Portable Runner script!');
  };

  // 3. Download Inno Setup Script (.iss)
  const handleDownloadInno = () => {
    const content = generateInnoSetupScript(config);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup.iss';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Downloaded Inno Setup script (setup.iss)!');
  };

  // 4. Download Full Native Bundle (.zip)
  const handleDownloadFullBundle = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();

      // Compiled PE binary
      const peBytes = generatePeBinary(config);
      zip.file(config.app.executableName, peBytes);

      // Icon (.ico)
      let icoBytes: Uint8Array;
      if (config.app.iconDataUrl) {
        const img = new Image();
        img.src = config.app.iconDataUrl;
        await new Promise((r) => (img.onload = r));
        icoBytes = await generateIcoBinary(img);
      } else {
        const defaultCanvas = createDefaultAppIconCanvas(config.app.name, '#2563EB', 256);
        icoBytes = await generateIcoBinary(defaultCanvas);
      }
      zip.file('app.ico', icoBytes);

      // Portable runner script (.cmd)
      zip.file('run_app.cmd', generatePortableBatchLauncher(config));

      // Inno Setup installer script (.iss)
      zip.file('setup.iss', generateInnoSetupScript(config));

      // C++ Win32 WebView2 Project
      const cppFolder = zip.folder('cpp-win32-webview2');
      const cppFiles = generateCppWebView2Project(config);
      Object.entries(cppFiles).forEach(([name, content]) => {
        cppFolder?.file(name, content);
      });
      cppFolder?.file('app.ico', icoBytes);

      // C# WPF Project
      const csFolder = zip.folder('csharp-wpf-webview2');
      const csFiles = generateCsharpWpfProject(config);
      Object.entries(csFiles).forEach(([name, content]) => {
        csFolder?.file(name, content);
      });
      csFolder?.file('app.ico', icoBytes);

      // Tauri Rust Project
      const tauriFolder = zip.folder('rust-tauri-desktop');
      const tauriFiles = generateTauriProject(config);
      Object.entries(tauriFiles).forEach(([name, content]) => {
        tauriFolder?.file(name, content);
      });

      // README documentation
      const readme = `# ${config.app.name} - Native Windows Desktop Package

Generated with WebToExe Windows Native Wrapper & PE Header Studio
Target Web URL: ${config.app.url}
Subsystem: IMAGE_SUBSYSTEM_WINDOWS_GUI (PE32+ x64)

## Package Contents:
1. \`${config.app.executableName}\`: Compiled Windows PE32+ executable with embedded configuration payload.
2. \`run_app.cmd\`: Zero-install Windows runner that opens ${config.app.url} directly in native app-mode using Microsoft Edge WebView2 engine.
3. \`setup.iss\`: Inno Setup compiler script to produce a Windows Installer setup wizard with desktop shortcuts and uninstaller.
4. \`app.ico\`: Multi-resolution Windows Icon (256, 128, 64, 48, 32, 16 px).
5. \`/cpp-win32-webview2\`: Full Native C++ Win32 MSVC solution with CMakeLists.txt and build.bat.
6. \`/csharp-wpf-webview2\`: C# .NET 8 WPF WebView2 solution.
7. \`/rust-tauri-desktop\`: Tauri 2.0 Rust native desktop crate.

## Quick Start:
- To run immediately on Windows 10/11: Double click \`run_app.cmd\`
- To build the C++ project: Open Developer Command Prompt and run \`build.bat\` inside \`/cpp-win32-webview2\`
- To compile the installer: Open \`setup.iss\` with Inno Setup Compiler and click Build
`;
      zip.file('README.md', readme);

      // Generate Zip blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.app.executableName.replace(/\.exe$/i, '')}_Windows_Native_Suite.zip`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Downloaded full Windows Native Suite (.zip)!');
    } catch (err) {
      console.error(err);
      alert('Error bundling zip archive');
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-slate-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Package className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Export &amp; Package Desktop Application</h3>
              <p className="text-xs text-slate-400">Choose compilation format or download all native targets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Toast */}
        {downloadSuccess && (
          <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-4 py-2 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Body Options */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Primary Option 1: Full Suite ZIP */}
          <div className="p-4 rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-950/30 to-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-semibold text-slate-100">Complete Windows Native Suite (.ZIP)</h4>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Includes PE binary, multi-size .ico file, C++ Win32 project, C# WPF project, Tauri Rust source, Inno Setup installer script, and portable launcher.
              </p>
            </div>

            <button
              type="button"
              disabled={isExportingZip}
              onClick={handleDownloadFullBundle}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all flex items-center gap-2 shrink-0 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingZip ? 'Packaging...' : 'Download Full Suite (.zip)'}</span>
            </button>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2">
            Individual Executable &amp; Script Outputs
          </div>

          {/* Option 2: Pure Windows PE Executable */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  {config.app.executableName} (Windows PE32+ Binary)
                </div>
                <div className="text-[11px] text-slate-400">
                  Valid 64-bit Windows GUI executable with embedded WebToExe configuration block
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadExe}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3 h-3" />
              <span>Download .EXE</span>
            </button>
          </div>

          {/* Option 3: Portable Windows App-Mode Runner */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Portable Windows Runner Script (.cmd)
                </div>
                <div className="text-[11px] text-slate-400">
                  Zero-install launcher: directly runs {config.app.url} inside a native window on Windows 10/11
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadCmd}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3 h-3" />
              <span>Download .CMD</span>
            </button>
          </div>

          {/* Option 4: Inno Setup Installer */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Inno Setup Windows Installer Script (setup.iss)
                </div>
                <div className="text-[11px] text-slate-400">
                  Compile with Inno Setup to create a professional desktop setup wizard and uninstaller
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadInno}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3 h-3" />
              <span>Download .ISS</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
