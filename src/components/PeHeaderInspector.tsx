/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { WrapperConfig } from '../types';
import { generatePeBinary, analyzePeBinary } from '../utils/peGenerator';
import { 
  FileCode, 
  Cpu, 
  CheckCircle, 
  Layers, 
  Binary, 
  Copy, 
  Download, 
  Info,
  ShieldAlert
} from 'lucide-react';

interface PeHeaderInspectorProps {
  config: WrapperConfig;
}

export const PeHeaderInspector: React.FC<PeHeaderInspectorProps> = ({ config }) => {
  const binaryData = useMemo(() => {
    return generatePeBinary(config);
  }, [config]);

  const analysis = useMemo(() => {
    return analyzePeBinary(binaryData, config);
  }, [binaryData, config]);

  const handleDownloadBinary = () => {
    const blob = new Blob([binaryData.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.app.executableName || 'App.exe'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCppStructs = () => {
    const cppCode = `// Windows PE32+ Header Structures Representation
#pragma pack(push, 1)

struct IMAGE_DOS_HEADER {
    WORD   e_magic;      // 0x5A4D ('MZ')
    WORD   e_cblp;       // Bytes on last page of file
    WORD   e_cp;         // Pages in file
    WORD   e_crlc;       // Relocations
    WORD   e_cparhdr;    // Size of header in paragraphs
    WORD   e_minalloc;   // Minimum extra paragraphs needed
    WORD   e_maxalloc;   // Maximum extra paragraphs needed
    WORD   e_ss;         // Initial (relative) SS value
    WORD   e_sp;         // Initial SP value
    WORD   e_csum;       // Checksum
    WORD   e_ip;         // Initial IP value
    WORD   e_cs;         // Initial (relative) CS value
    WORD   e_lfarlc;     // File address of relocation table
    WORD   e_ovno;       // Overlay number
    WORD   e_res[4];     // Reserved words
    WORD   e_oemid;      // OEM identifier
    WORD   e_oeminfo;    // OEM information
    WORD   e_res2[10];   // Reserved words
    LONG   e_lfanew;     // File address of new exe header (0x80)
};

struct IMAGE_FILE_HEADER {
    WORD   Machine;              // 0x8664 (AMD64)
    WORD   NumberOfSections;     // 4 (.text, .rdata, .data, .rsrc)
    DWORD  TimeDateStamp;        // ${analysis.fileHeader.timeDateStamp}
    DWORD  PointerToSymbolTable; // 0
    DWORD  NumberOfSymbols;      // 0
    WORD   SizeOfOptionalHeader; // 0xF0 (240 bytes)
    WORD   Characteristics;      // 0x0022 (EXECUTABLE | LARGE_ADDRESS_AWARE)
};

struct IMAGE_OPTIONAL_HEADER64 {
    WORD        Magic;                       // 0x020B (PE32+)
    BYTE        MajorLinkerVersion;          // 14
    BYTE        MinorLinkerVersion;          // 38
    DWORD       SizeOfCode;                  // Code section size
    DWORD       SizeOfInitializedData;       // Initialized data size
    DWORD       SizeOfUninitializedData;     // 0
    DWORD       AddressOfEntryPoint;         // 0x1000
    DWORD       BaseOfCode;                  // 0x1000
    ULONGLONG   ImageBase;                   // 0x0000000140000000
    DWORD       SectionAlignment;            // 0x1000 (4096)
    DWORD       FileAlignment;               // 0x200 (512)
    WORD        MajorOperatingSystemVersion; // 10
    WORD        MinorOperatingSystemVersion; // 0
    WORD        MajorSubsystemVersion;       // 10
    WORD        MinorSubsystemVersion;       // 0
    DWORD       SizeOfImage;                 // Total virtual image size
    DWORD       SizeOfHeaders;               // 0x400
    DWORD       CheckSum;                    // 0
    WORD        Subsystem;                   // 2 (IMAGE_SUBSYSTEM_WINDOWS_GUI)
    WORD        DllCharacteristics;          // 0x8160 (ASLR, DEP, High-Entropy)
    ULONGLONG   SizeOfStackReserve;          // 0x100000 (1MB)
    ULONGLONG   SizeOfStackCommit;           // 0x1000 (4KB)
    ULONGLONG   SizeOfHeapReserve;           // 0x100000 (1MB)
    ULONGLONG   SizeOfHeapCommit;            // 0x1000 (4KB)
    DWORD       LoaderFlags;                 // 0
    DWORD       NumberOfRvaAndSizes;         // 16
};

#pragma pack(pop)`;

    navigator.clipboard.writeText(cppCode);
    alert('Copied C++ PE Header struct definitions to clipboard!');
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 space-y-6">
      {/* Top Banner / Metrics Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-100">PE32+ Header Specification</h2>
            <span className="text-xs text-slate-400 font-mono">AMD64 x86_64</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Windows Portable Executable binary structure compiled for {config.app.executableName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCppStructs}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy C++ Structs</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadBinary}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .EXE Binary</span>
          </button>
        </div>
      </div>

      {/* Primary Diagnostic Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">Architecture</span>
          <div className="text-sm font-semibold text-slate-100">{analysis.fileHeader.machine}</div>
          <span className="text-[10px] text-slate-400 font-mono">0x8664 AMD64</span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">Subsystem</span>
          <div className="text-sm font-semibold text-slate-100">Windows GUI (2)</div>
          <span className="text-[10px] text-emerald-400">No console window flash</span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">Sections</span>
          <div className="text-sm font-semibold text-slate-100">{analysis.sections.length} Sections</div>
          <span className="text-[10px] text-slate-400 font-mono">.text, .rdata, .data, .rsrc</span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">Binary Raw Size</span>
          <div className="text-sm font-semibold text-slate-100">
            {(analysis.totalFileSize / 1024).toFixed(2)} KB
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{analysis.totalFileSize} bytes</span>
        </div>
      </div>

      {/* Structural Breakdown Accordions / Cards */}
      <div className="space-y-4">
        {/* 1. DOS HEADER & STUB */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-200">IMAGE_DOS_HEADER &amp; DOS Stub</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Offset: 0x000000 - 0x00007F</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">e_magic (Signature)</span>
              <span className="font-mono text-slate-200 font-semibold">{analysis.dosHeader.magic} (0x5A4D)</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Mark Zbikowski DOS signature</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">e_lfanew (PE Header Pointer)</span>
              <span className="font-mono text-slate-200 font-semibold">0x00000080</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Points to PE signature at byte 128</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">DOS Compatibility Stub</span>
              <span className="text-slate-200 font-mono truncate block">"This program cannot be run in DOS mode."</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">16-bit fallback message</span>
            </div>
          </div>
        </div>

        {/* 2. COFF FILE HEADER */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-semibold text-slate-200">PE Signature &amp; COFF File Header</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Offset: 0x000080 - 0x000097</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">PE Signature</span>
              <span className="font-mono text-blue-400 font-semibold">0x00004550 ("PE\0\0")</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">Machine Architecture</span>
              <span className="font-mono text-slate-200 font-semibold">0x8664 (IMAGE_FILE_MACHINE_AMD64)</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">Compilation TimeStamp</span>
              <span className="font-mono text-slate-200 text-[11px] block">{analysis.fileHeader.timeDateStr}</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">Characteristics</span>
              <span className="font-mono text-slate-200 font-semibold">0x0022</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">EXECUTABLE | LARGE_ADDRESS_AWARE</span>
            </div>
          </div>
        </div>

        {/* 3. OPTIONAL HEADER */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <h3 className="text-sm font-semibold text-slate-200">IMAGE_OPTIONAL_HEADER64</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Offset: 0x000098 - 0x000187</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">Magic Format</span>
              <span className="font-mono text-purple-400 font-semibold">0x020B (PE32+ 64-bit)</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">Image Base</span>
              <span className="font-mono text-slate-200 font-semibold">{analysis.optionalHeader.imageBase}</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">Section / File Alignment</span>
              <span className="font-mono text-slate-200 font-semibold">4096 / 512 bytes</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60">
              <span className="text-slate-400 block mb-0.5">Subsystem</span>
              <span className="font-mono text-emerald-400 font-semibold">2 (WINDOWS_GUI)</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded border border-slate-800/60 text-xs">
            <span className="text-slate-400 block mb-1">Active Windows Security Flags (DllCharacteristics 0x8160)</span>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-300">
              <span className="text-slate-300">HIGH_ENTROPY_VA (64-bit ASLR)</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">DYNAMIC_BASE (Address Space Layout Randomization)</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">NX_COMPAT (Data Execution Prevention / DEP)</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">TERMINAL_SERVER_AWARE</span>
            </div>
          </div>
        </div>

        {/* 4. SECTION TABLE & EMBEDDED PAYLOAD */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-semibold text-slate-200">Section Table (IMAGE_SECTION_HEADER)</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Offset: 0x000188</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-2 px-3">Section</th>
                  <th className="py-2 px-3">Virtual Size</th>
                  <th className="py-2 px-3">Virtual Address</th>
                  <th className="py-2 px-3">Raw Size</th>
                  <th className="py-2 px-3">Raw Offset</th>
                  <th className="py-2 px-3">Characteristics</th>
                  <th className="py-2 px-3">Payload Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {analysis.sections.map((sec) => (
                  <tr key={sec.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-amber-400">{sec.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">0x{sec.virtualSize.toString(16).toUpperCase()}</td>
                    <td className="py-2.5 px-3 text-slate-300">0x{sec.virtualAddress.toString(16).toUpperCase()}</td>
                    <td className="py-2.5 px-3 text-slate-300">0x{sec.rawSize.toString(16).toUpperCase()}</td>
                    <td className="py-2.5 px-3 text-slate-300">0x{sec.rawOffset.toString(16).toUpperCase()}</td>
                    <td className="py-2.5 px-3 text-slate-400">{sec.characteristicsStr}</td>
                    <td className="py-2.5 px-3 font-sans text-xs text-slate-300">{sec.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Embedded Config Block Inspector */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Embedded WebToExe .data Section Payload
            </h3>
            <span className="text-xs text-slate-400 font-mono">Magic: W2EX_CONFIG_V1</span>
          </div>
          <p className="text-xs text-slate-400">
            This structured configuration block is embedded directly inside the compiled Windows binary and parsed by the native runtime on execution:
          </p>
          <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-56">
            {JSON.stringify(
              {
                magic: "W2EX_CONFIG_V1",
                app: config.app,
                window: config.window,
                native: {
                  ...config.native,
                  customCss: config.native.customCss ? `[${config.native.customCss.length} bytes CSS]` : "",
                  customJs: config.native.customJs ? `[${config.native.customJs.length} bytes JS]` : "",
                },
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};
