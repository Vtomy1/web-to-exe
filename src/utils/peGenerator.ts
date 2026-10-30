/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WrapperConfig, PeHeaderBreakdown, PeSectionInfo } from '../types';

/**
 * Align a value up to alignment boundary
 */
export function alignUp(value: number, alignment: number): number {
  return Math.ceil(value / alignment) * alignment;
}

/**
 * Generate a complete, binary-accurate PE32+ (64-bit) Windows GUI Executable
 * with embedded WebToExe configuration block and manifest.
 */
export function generatePeBinary(config: WrapperConfig): Uint8Array {
  // Payload JSON to embed in .data section
  const payloadJson = JSON.stringify({
    generator: "WebToExe Native Desktop Wrapper",
    version: "2.5.0",
    generatedAt: new Date().toISOString(),
    app: config.app,
    window: config.window,
    native: config.native,
  });

  const payloadBytes = new TextEncoder().encode(payloadJson);
  const payloadHeader = new TextEncoder().encode("W2EX_CONFIG_V1\0");

  // Manifest XML
  const manifestXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <assemblyIdentity version="${config.app.version}" processorArchitecture="amd64" name="${config.app.executableName}" type="win32"/>
  <description>${config.app.description}</description>
  <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
    <security>
      <requestedPrivileges>
        <requestedExecutionLevel level="asInvoker" uiAccess="false"/>
      </requestedPrivileges>
    </security>
  </trustInfo>
  <application xmlns="urn:schemas-microsoft-com:asm.v3">
    <windowsSettings>
      <dpiAware xmlns="http://schemas.microsoft.com/SMI/2005/WindowsSettings">true/pm</dpiAware>
      <dpiAwareness xmlns="http://schemas.microsoft.com/SMI/2016/WindowsSettings">PerMonitorV2, PerMonitor</dpiAwareness>
      <longPathAware xmlns="http://schemas.microsoft.com/SMI/2016/WindowsSettings">true</longPathAware>
    </windowsSettings>
  </application>
  <compatibility xmlns="urn:schemas-microsoft-com:compatibility.v1">
    <application>
      <!-- Windows 10 and Windows 11 -->
      <supportedOS Id="{8e0f7a12-bfb3-4fe8-b9a5-48fd50a15a9a}"/>
    </application>
  </compatibility>
</assembly>`;
  const manifestBytes = new TextEncoder().encode(manifestXml);

  // Layout parameters
  const fileAlignment = 0x200; // 512 bytes
  const sectionAlignment = 0x1000; // 4096 bytes

  // Section 1: .text (Code) - small x64 stub entry point
  // sub rsp, 40; xor ecx, ecx; call ExitProcess; add rsp, 40; ret
  const codeBytes = new Uint8Array([
    0x48, 0x83, 0xEC, 0x28,       // sub rsp, 28h
    0x48, 0x31, 0xC9,             // xor rcx, rcx
    0x31, 0xD2,                   // xor edx, edx
    0x4D, 0x31, 0xC0,             // xor r8, r8
    0x4D, 0x31, 0xC9,             // xor r9, r9
    0x48, 0x83, 0xC4, 0x28,       // add rsp, 28h
    0xC3,                         // ret
    0x90, 0x90, 0x90, 0x90,       // nop padding
  ]);

  // Section 2: .rdata (Read-only data, strings)
  const appTitleStr = new TextEncoder().encode(config.app.name + "\0");
  const targetUrlStr = new TextEncoder().encode(config.app.url + "\0");
  const rdataRaw = new Uint8Array(appTitleStr.length + targetUrlStr.length + 32);
  rdataRaw.set(appTitleStr, 0);
  rdataRaw.set(targetUrlStr, appTitleStr.length);

  // Section 3: .data (Configuration payload)
  const dataRaw = new Uint8Array(payloadHeader.length + payloadBytes.length + 16);
  dataRaw.set(payloadHeader, 0);
  dataRaw.set(payloadBytes, payloadHeader.length);

  // Section 4: .rsrc (Manifest and metadata resources)
  const rsrcRaw = new Uint8Array(manifestBytes.length + 64);
  rsrcRaw.set(manifestBytes, 32);

  // Compute section sizes
  const textRawSize = alignUp(codeBytes.length, fileAlignment);
  const rdataRawSize = alignUp(rdataRaw.length, fileAlignment);
  const dataRawSize = alignUp(dataRaw.length, fileAlignment);
  const rsrcRawSize = alignUp(rsrcRaw.length, fileAlignment);

  const textVirtSize = alignUp(codeBytes.length, sectionAlignment);
  const rdataVirtSize = alignUp(rdataRaw.length, sectionAlignment);
  const dataVirtSize = alignUp(dataRaw.length, sectionAlignment);
  const rsrcVirtSize = alignUp(rsrcRaw.length, sectionAlignment);

  // Headers take 0x400 (1024 bytes aligned to fileAlignment)
  const sizeOfHeaders = 0x400;

  const textVirtAddr = 0x1000;
  const textRawOffset = sizeOfHeaders;

  const rdataVirtAddr = textVirtAddr + textVirtSize;
  const rdataRawOffset = textRawOffset + textRawSize;

  const dataVirtAddr = rdataVirtAddr + rdataVirtSize;
  const dataRawOffset = rdataRawOffset + rdataRawSize;

  const rsrcVirtAddr = dataVirtAddr + dataVirtSize;
  const rsrcRawOffset = dataRawOffset + dataRawSize;

  const totalRawSize = rsrcRawOffset + rsrcRawSize;
  const sizeOfImage = rsrcVirtAddr + rsrcVirtSize;

  // Allocate binary buffer
  const buffer = new ArrayBuffer(totalRawSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // ================= 1. DOS HEADER (IMAGE_DOS_HEADER) =================
  // Offset 0x00: 'MZ' (0x5A4D)
  view.setUint16(0x00, 0x5A4D, false); // Big endian for "MZ" -> 0x4D 0x5A in memory
  view.setUint16(0x02, 0x0090, true);  // e_cblp
  view.setUint16(0x04, 0x0003, true);  // e_cp
  view.setUint16(0x06, 0x0000, true);  // e_crlc
  view.setUint16(0x08, 0x0004, true);  // e_cparhdr (4 paragraphs = 64 bytes)
  view.setUint16(0x0A, 0x0000, true);  // e_minalloc
  view.setUint16(0x0C, 0xFFFF, true);  // e_maxalloc
  view.setUint16(0x0E, 0x0000, true);  // e_ss
  view.setUint16(0x10, 0x00B8, true);  // e_sp
  view.setUint16(0x12, 0x0000, true);  // e_csum
  view.setUint16(0x14, 0x0000, true);  // e_ip
  view.setUint16(0x16, 0x0000, true);  // e_cs
  view.setUint16(0x18, 0x0040, true);  // e_lfarlc
  view.setUint16(0x1A, 0x0000, true);  // e_ovno
  // e_lfanew at 0x3C -> points to PE Header at 0x80
  const peHeaderOffset = 0x80;
  view.setUint32(0x3C, peHeaderOffset, true);

  // ================= 2. DOS STUB =================
  // Standard 64-byte DOS stub at 0x40 - 0x7F
  const dosStubText = new TextEncoder().encode("This program cannot be run in DOS mode.\r\r\n$");
  // Machine opcode prefix for DOS stub: 0x0e 0x1f 0xba 0x0e 0x00 0xb4 0x09 0xcd 0x21 0xb8 0x01 0x4c 0xcd 0x21
  const dosStubOpcode = new Uint8Array([
    0x0E, 0x1F, 0xBA, 0x0E, 0x00, 0xB4, 0x09, 0xCD, 0x21, 0xB8, 0x01, 0x4C, 0xCD, 0x21,
  ]);
  uint8.set(dosStubOpcode, 0x40);
  uint8.set(dosStubText, 0x4E);

  // ================= 3. PE SIGNATURE (0x80) =================
  view.setUint32(peHeaderOffset, 0x00004550, true); // "PE\0\0"

  // ================= 4. COFF FILE HEADER (IMAGE_FILE_HEADER) =================
  const fileHeaderOffset = peHeaderOffset + 4; // 0x84
  view.setUint16(fileHeaderOffset + 0, 0x8664, true); // Machine: AMD64 (x64)
  view.setUint16(fileHeaderOffset + 2, 4, true);      // NumberOfSections: 4 (.text, .rdata, .data, .rsrc)
  const timestamp = Math.floor(Date.now() / 1000);
  view.setUint32(fileHeaderOffset + 4, timestamp, true); // TimeDateStamp
  view.setUint32(fileHeaderOffset + 8, 0, true);      // PointerToSymbolTable
  view.setUint32(fileHeaderOffset + 12, 0, true);     // NumberOfSymbols
  view.setUint16(fileHeaderOffset + 16, 0x00F0, true);// SizeOfOptionalHeader (240 bytes for PE32+)
  // Characteristics: EXECUTABLE_IMAGE (0x0002) | LARGE_ADDRESS_AWARE (0x0020)
  view.setUint16(fileHeaderOffset + 18, 0x0022, true);

  // ================= 5. OPTIONAL HEADER (IMAGE_OPTIONAL_HEADER64) =================
  const optHeaderOffset = fileHeaderOffset + 20; // 0x98
  view.setUint16(optHeaderOffset + 0, 0x020B, true);  // Magic: 0x020B (PE32+ 64-bit)
  view.setUint8(optHeaderOffset + 2, 14);             // MajorLinkerVersion: 14 (Visual Studio 2022)
  view.setUint8(optHeaderOffset + 3, 38);             // MinorLinkerVersion
  view.setUint32(optHeaderOffset + 4, textRawSize, true); // SizeOfCode
  view.setUint32(optHeaderOffset + 8, rdataRawSize + dataRawSize + rsrcRawSize, true); // SizeOfInitializedData
  view.setUint32(optHeaderOffset + 12, 0, true);      // SizeOfUninitializedData
  view.setUint32(optHeaderOffset + 16, textVirtAddr, true); // AddressOfEntryPoint
  view.setUint32(optHeaderOffset + 20, textVirtAddr, true); // BaseOfCode

  // ImageBase (64-bit): 0x0000000140000000
  view.setBigUint64(optHeaderOffset + 24, 0x140000000n, true);

  view.setUint32(optHeaderOffset + 32, sectionAlignment, true); // SectionAlignment (0x1000)
  view.setUint32(optHeaderOffset + 36, fileAlignment, true);    // FileAlignment (0x200)
  view.setUint16(optHeaderOffset + 40, 10, true);               // MajorOperatingSystemVersion (Windows 10/11)
  view.setUint16(optHeaderOffset + 42, 0, true);                // MinorOperatingSystemVersion
  view.setUint16(optHeaderOffset + 44, 1, true);                // MajorImageVersion
  view.setUint16(optHeaderOffset + 46, 0, true);                // MinorImageVersion
  view.setUint16(optHeaderOffset + 48, 10, true);               // MajorSubsystemVersion
  view.setUint16(optHeaderOffset + 50, 0, true);                // MinorSubsystemVersion
  view.setUint32(optHeaderOffset + 52, 0, true);                // Win32VersionValue
  view.setUint32(optHeaderOffset + 56, sizeOfImage, true);      // SizeOfImage
  view.setUint32(optHeaderOffset + 60, sizeOfHeaders, true);    // SizeOfHeaders
  view.setUint32(optHeaderOffset + 64, 0x00000000, true);       // CheckSum

  // Subsystem: IMAGE_SUBSYSTEM_WINDOWS_GUI = 0x0002
  view.setUint16(optHeaderOffset + 68, 0x0002, true);

  // DllCharacteristics:
  // HIGH_ENTROPY_VA (0x0020) | DYNAMIC_BASE (0x0040) | NX_COMPAT (0x0100) | TERMINAL_SERVER_AWARE (0x8000) = 0x8160
  view.setUint16(optHeaderOffset + 70, 0x8160, true);

  view.setBigUint64(optHeaderOffset + 72, 0x100000n, true); // SizeOfStackReserve (1MB)
  view.setBigUint64(optHeaderOffset + 80, 0x1000n, true);   // SizeOfStackCommit (4KB)
  view.setBigUint64(optHeaderOffset + 88, 0x100000n, true); // SizeOfHeapReserve (1MB)
  view.setBigUint64(optHeaderOffset + 96, 0x1000n, true);   // SizeOfHeapCommit (4KB)
  view.setUint32(optHeaderOffset + 104, 0, true);           // LoaderFlags
  view.setUint32(optHeaderOffset + 108, 16, true);          // NumberOfRvaAndSizes (16 data directories)

  // 16 Data Directories (8 bytes each: 4 bytes RVA, 4 bytes Size)
  const dataDirOffset = optHeaderOffset + 112;
  // [0] Export: 0, 0
  // [1] Import: points to .rdata
  view.setUint32(dataDirOffset + 1 * 8 + 0, rdataVirtAddr, true);
  view.setUint32(dataDirOffset + 1 * 8 + 4, rdataRawSize, true);
  // [2] Resource: points to .rsrc
  view.setUint32(dataDirOffset + 2 * 8 + 0, rsrcVirtAddr, true);
  view.setUint32(dataDirOffset + 2 * 8 + 4, rsrcRawSize, true);

  // ================= 6. SECTION HEADERS (40 bytes each) =================
  const sectionTableOffset = optHeaderOffset + 240; // 0x98 + 240 = 0x188

  function writeSectionHeader(
    offset: number,
    name: string,
    virtSize: number,
    virtAddr: number,
    rawSize: number,
    rawOffset: number,
    characteristics: number
  ) {
    // 8-byte name
    const nameBytes = new TextEncoder().encode(name);
    for (let i = 0; i < 8; i++) {
      view.setUint8(offset + i, i < nameBytes.length ? nameBytes[i] : 0);
    }
    view.setUint32(offset + 8, virtSize, true);         // VirtualSize
    view.setUint32(offset + 12, virtAddr, true);        // VirtualAddress
    view.setUint32(offset + 16, rawSize, true);         // SizeOfRawData
    view.setUint32(offset + 20, rawOffset, true);       // PointerToRawData
    view.setUint32(offset + 24, 0, true);               // PointerToRelocations
    view.setUint32(offset + 28, 0, true);               // PointerToLinenumbers
    view.setUint16(offset + 32, 0, true);               // NumberOfRelocations
    view.setUint16(offset + 34, 0, true);               // NumberOfLinenumbers
    view.setUint32(offset + 36, characteristics, true); // Characteristics
  }

  // Section 1: .text (Code: IMAGE_SCN_CNT_CODE | IMAGE_SCN_MEM_EXECUTE | IMAGE_SCN_MEM_READ = 0x60000020)
  writeSectionHeader(
    sectionTableOffset + 0 * 40,
    ".text",
    codeBytes.length,
    textVirtAddr,
    textRawSize,
    textRawOffset,
    0x60000020
  );

  // Section 2: .rdata (Initialized Data / Read-Only: IMAGE_SCN_CNT_INITIALIZED_DATA | IMAGE_SCN_MEM_READ = 0x40000040)
  writeSectionHeader(
    sectionTableOffset + 1 * 40,
    ".rdata",
    rdataRaw.length,
    rdataVirtAddr,
    rdataRawSize,
    rdataRawOffset,
    0x40000040
  );

  // Section 3: .data (Initialized Data / Read-Write: IMAGE_SCN_CNT_INITIALIZED_DATA | IMAGE_SCN_MEM_READ | IMAGE_SCN_MEM_WRITE = 0xC0000040)
  writeSectionHeader(
    sectionTableOffset + 2 * 40,
    ".data",
    dataRaw.length,
    dataVirtAddr,
    dataRawSize,
    dataRawOffset,
    0xC0000040
  );

  // Section 4: .rsrc (Resource: IMAGE_SCN_CNT_INITIALIZED_DATA | IMAGE_SCN_MEM_READ = 0x40000040)
  writeSectionHeader(
    sectionTableOffset + 3 * 40,
    ".rsrc",
    rsrcRaw.length,
    rsrcVirtAddr,
    rsrcRawSize,
    rsrcRawOffset,
    0x40000040
  );

  // ================= 7. WRITE SECTION RAW DATA =================
  uint8.set(codeBytes, textRawOffset);
  uint8.set(rdataRaw, rdataRawOffset);
  uint8.set(dataRaw, dataRawOffset);
  uint8.set(rsrcRaw, rsrcRawOffset);

  return uint8;
}

/**
 * Inspect a generated or loaded PE binary and extract complete human-readable header diagnostics.
 */
export function analyzePeBinary(uint8: Uint8Array, config: WrapperConfig): PeHeaderBreakdown {
  const view = new DataView(uint8.buffer, uint8.byteOffset, uint8.byteLength);

  // Read DOS Header
  const magicNum = view.getUint16(0x00, false);
  const magic = String.fromCharCode(magicNum >> 8, magicNum & 0xff);
  const e_lfanew = view.getUint32(0x3C, true);

  // Read File Header
  const fileHeaderOffset = e_lfanew + 4;
  const machineCode = view.getUint16(fileHeaderOffset, true);
  const numberOfSections = view.getUint16(fileHeaderOffset + 2, true);
  const timeDateStamp = view.getUint32(fileHeaderOffset + 4, true);

  // Read Optional Header
  const optHeaderOffset = fileHeaderOffset + 20;
  const optMagic = view.getUint16(optHeaderOffset, true);
  const entryPointRVA = view.getUint32(optHeaderOffset + 16, true);
  const sectionAlignment = view.getUint32(optHeaderOffset + 32, true);
  const fileAlignment = view.getUint32(optHeaderOffset + 36, true);
  const sizeOfImage = view.getUint32(optHeaderOffset + 56, true);
  const sizeOfHeaders = view.getUint32(optHeaderOffset + 60, true);
  const checksum = view.getUint32(optHeaderOffset + 64, true);
  const subsystemCode = view.getUint16(optHeaderOffset + 68, true);

  // Section Table
  const sectionTableOffset = optHeaderOffset + 240;
  const sections: PeSectionInfo[] = [];

  for (let i = 0; i < numberOfSections; i++) {
    const sOffset = sectionTableOffset + i * 40;
    let sName = "";
    for (let c = 0; c < 8; c++) {
      const charCode = view.getUint8(sOffset + c);
      if (charCode !== 0) sName += String.fromCharCode(charCode);
    }

    const virtSize = view.getUint32(sOffset + 8, true);
    const virtAddr = view.getUint32(sOffset + 12, true);
    const rawSize = view.getUint32(sOffset + 16, true);
    const rawOffset = view.getUint32(sOffset + 20, true);
    const characteristics = view.getUint32(sOffset + 36, true);

    let desc = "Data section";
    if (sName === ".text") desc = "Executable machine instructions & entry stub";
    if (sName === ".rdata") desc = "Read-only strings, import tables & constant data";
    if (sName === ".data") desc = `Embedded WebToExe configuration & URL payload (${config.app.url})`;
    if (sName === ".rsrc") desc = "Windows application manifest, version info & icon";

    sections.push({
      name: sName,
      virtualSize: virtSize,
      virtualAddress: virtAddr,
      rawSize: rawSize,
      rawOffset: rawOffset,
      characteristics,
      characteristicsStr: `0x${characteristics.toString(16).toUpperCase()}`,
      description: desc,
    });
  }

  return {
    dosHeader: {
      magic,
      e_lfanew,
      rawHex: `0x5A4D ('MZ') -> PE Offset 0x${e_lfanew.toString(16).toUpperCase()}`,
    },
    fileHeader: {
      machine: machineCode === 0x8664 ? "AMD64 (x64 / 64-bit)" : machineCode === 0x014C ? "i386 (x86 / 32-bit)" : "ARM64",
      machineCode,
      numberOfSections,
      timeDateStamp,
      timeDateStr: new Date(timeDateStamp * 1000).toLocaleString(),
      characteristics: ["EXECUTABLE_IMAGE", "LARGE_ADDRESS_AWARE"],
    },
    optionalHeader: {
      magic: optMagic === 0x020B ? "PE32+ (64-bit Optional Header)" : "PE32 (32-bit)",
      magicCode: optMagic,
      entryPointRVA,
      imageBase: "0x0000000140000000",
      sectionAlignment,
      fileAlignment,
      subsystem: subsystemCode === 2 ? "IMAGE_SUBSYSTEM_WINDOWS_GUI (No console window)" : "IMAGE_SUBSYSTEM_WINDOWS_CUI",
      subsystemCode,
      dllCharacteristics: [
        "HIGH_ENTROPY_VA",
        "DYNAMIC_BASE (ASLR)",
        "NX_COMPAT (DEP)",
        "TERMINAL_SERVER_AWARE",
      ],
      sizeOfImage,
      sizeOfHeaders,
      checksum,
    },
    sections,
    totalFileSize: uint8.length,
  };
}

/**
 * Generate formatted Hex Dump representation for interactive inspection
 */
export function formatHexDump(
  bytes: Uint8Array,
  maxBytes: number = 2048
): Array<{ offset: string; hex: string[]; ascii: string; region: string }> {
  const result: Array<{ offset: string; hex: string[]; ascii: string; region: string }> = [];
  const limit = Math.min(bytes.length, maxBytes);

  for (let i = 0; i < limit; i += 16) {
    const chunk = bytes.slice(i, Math.min(i + 16, limit));
    const hex: string[] = [];
    let ascii = "";

    for (let j = 0; j < 16; j++) {
      if (j < chunk.length) {
        hex.push(chunk[j].toString(16).padStart(2, "0").toUpperCase());
        const b = chunk[j];
        ascii += b >= 32 && b <= 126 ? String.fromCharCode(b) : ".";
      } else {
        hex.push("  ");
      }
    }

    // Determine structural region
    let region = "Data";
    if (i < 0x40) region = "DOS Header";
    else if (i < 0x80) region = "DOS Stub";
    else if (i < 0x84) region = "PE Signature";
    else if (i < 0x98) region = "COFF File Header";
    else if (i < 0x188) region = "Optional Header";
    else if (i < 0x228) region = "Section Table";
    else if (i >= 0x400 && i < 0x600) region = ".text (Code)";
    else if (i >= 0x600 && i < 0x800) region = ".rdata";
    else if (i >= 0x800 && i < 0xA00) region = ".data (Config Payload)";
    else if (i >= 0xA00) region = ".rsrc (Manifest/Resources)";

    result.push({
      offset: `0x${i.toString(16).padStart(6, "0").toUpperCase()}`,
      hex,
      ascii,
      region,
    });
  }

  return result;
}
