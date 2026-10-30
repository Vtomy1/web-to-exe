/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { WrapperConfig } from '../types';
import { generatePeBinary, formatHexDump } from '../utils/peGenerator';
import { Search, Copy, Download, Binary, ArrowRight } from 'lucide-react';

interface HexDumpViewerProps {
  config: WrapperConfig;
}

export const HexDumpViewer: React.FC<HexDumpViewerProps> = ({ config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxBytes, setMaxBytes] = useState(2048);

  const binaryData = useMemo(() => {
    return generatePeBinary(config);
  }, [config]);

  const hexLines = useMemo(() => {
    return formatHexDump(binaryData, maxBytes);
  }, [binaryData, maxBytes]);

  const filteredLines = useMemo(() => {
    if (!searchTerm.trim()) return hexLines;
    const term = searchTerm.toLowerCase();
    return hexLines.filter(
      (line) =>
        line.offset.toLowerCase().includes(term) ||
        line.ascii.toLowerCase().includes(term) ||
        line.hex.join(' ').toLowerCase().includes(term) ||
        line.region.toLowerCase().includes(term)
    );
  }, [hexLines, searchTerm]);

  const handleCopyDump = () => {
    const text = hexLines
      .map((l) => `${l.offset}  ${l.hex.join(' ')}  |${l.ascii}|  [${l.region}]`)
      .join('\n');
    navigator.clipboard.writeText(text);
    alert('Copied hex dump to clipboard!');
  };

  const getRegionColor = (region: string) => {
    switch (region) {
      case 'DOS Header':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case 'DOS Stub':
        return 'text-slate-400 bg-slate-900 border-slate-800';
      case 'PE Signature':
      case 'COFF File Header':
        return 'text-blue-400 bg-blue-950/40 border-blue-800/60';
      case 'Optional Header':
        return 'text-purple-400 bg-purple-950/40 border-purple-800/60';
      case 'Section Table':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case '.text (Code)':
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60';
      case '.data (Config Payload)':
        return 'text-pink-400 bg-pink-950/40 border-pink-800/60';
      case '.rsrc (Manifest/Resources)':
        return 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-hidden text-slate-300">
      {/* Top Header & Search Tools */}
      <div className="h-14 px-4 sm:px-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100">Portable Executable Hex Viewer</h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Total binary size: {binaryData.length} bytes
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hex / ASCII..."
              className="bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-52"
            />
          </div>

          <button
            type="button"
            onClick={handleCopyDump}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Copy Hex representation"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy</span>
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/80 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
        <span className="text-slate-400 font-sans mr-1">Regions:</span>
        <span className="px-2 py-0.5 rounded border text-emerald-400 border-emerald-800/60 bg-emerald-950/30">
          DOS Header (MZ)
        </span>
        <span className="px-2 py-0.5 rounded border text-blue-400 border-blue-800/60 bg-blue-950/30">
          PE Signature &amp; COFF
        </span>
        <span className="px-2 py-0.5 rounded border text-purple-400 border-purple-800/60 bg-purple-950/30">
          Optional Header (GUI)
        </span>
        <span className="px-2 py-0.5 rounded border text-amber-400 border-amber-800/60 bg-amber-950/30">
          Section Headers
        </span>
        <span className="px-2 py-0.5 rounded border text-cyan-400 border-cyan-800/60 bg-cyan-950/30">
          .text (Code Stub)
        </span>
        <span className="px-2 py-0.5 rounded border text-pink-400 border-pink-800/60 bg-pink-950/30">
          .data (URL Payload)
        </span>
        <span className="px-2 py-0.5 rounded border text-indigo-400 border-indigo-800/60 bg-indigo-950/30">
          .rsrc (Manifest)
        </span>
      </div>

      {/* Hex Dump Table */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs select-text">
        <div className="min-w-[700px] space-y-1">
          {filteredLines.map((line, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 py-0.5 px-2 rounded hover:bg-slate-900 transition-colors"
            >
              {/* Offset */}
              <span className="text-slate-400 font-semibold w-24 shrink-0 select-none">
                {line.offset}
              </span>

              {/* 16 Hex bytes grouped into 8 + 8 */}
              <div className="flex items-center gap-2 w-96 shrink-0">
                <div className="grid grid-cols-8 gap-1.5">
                  {line.hex.slice(0, 8).map((byte, bIdx) => (
                    <span
                      key={bIdx}
                      className={
                        byte === '4D' && line.offset === '0x000000' && bIdx === 0
                          ? 'text-emerald-400 font-bold'
                          : byte === '5A' && line.offset === '0x000000' && bIdx === 1
                          ? 'text-emerald-400 font-bold'
                          : byte === '50' && line.offset === '0x000080' && bIdx === 0
                          ? 'text-blue-400 font-bold'
                          : byte === '45' && line.offset === '0x000080' && bIdx === 1
                          ? 'text-blue-400 font-bold'
                          : byte === '00'
                          ? 'text-slate-600'
                          : 'text-slate-300'
                      }
                    >
                      {byte}
                    </span>
                  ))}
                </div>
                <span className="text-slate-700 select-none">|</span>
                <div className="grid grid-cols-8 gap-1.5">
                  {line.hex.slice(8, 16).map((byte, bIdx) => (
                    <span
                      key={bIdx}
                      className={byte === '00' ? 'text-slate-600' : 'text-slate-300'}
                    >
                      {byte}
                    </span>
                  ))}
                </div>
              </div>

              {/* ASCII representation */}
              <div className="text-slate-300 tracking-wider bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800/60 w-44 shrink-0">
                {line.ascii}
              </div>

              {/* Region Label */}
              <div className="shrink-0">
                <span className={`px-2 py-0.5 rounded text-[10px] border ${getRegionColor(line.region)}`}>
                  {line.region}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button if truncated */}
        {maxBytes < binaryData.length && (
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setMaxBytes((prev) => Math.min(prev + 2048, binaryData.length))}
              className="px-4 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors"
            >
              Load Next 2048 Bytes (Total: {binaryData.length} bytes)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
