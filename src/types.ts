/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WindowStyle = 'standard' | 'frameless' | 'mica' | 'acrylic' | 'transparent';

export type WindowInitialState = 'normal' | 'maximized' | 'fullscreen' | 'kiosk';

export type ExternalLinksBehavior = 'system_browser' | 'inside_window' | 'ask_user';

export interface AppMetadata {
  name: string;
  executableName: string;
  url: string;
  version: string;
  company: string;
  copyright: string;
  description: string;
  guid: string;
  iconDataUrl?: string;
  iconName?: string;
}

export interface WindowConfig {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  style: WindowStyle;
  initialState: WindowInitialState;
  resizable: boolean;
  alwaysOnTop: boolean;
  centerScreen: boolean;
  rememberBounds: boolean;
  showTitleBarIcon: boolean;
  darkTitleBar: boolean;
  backgroundColor: string;
}

export interface NativeFeatures {
  enableSystemTray: boolean;
  minimizeToTray: boolean;
  closeToTray: boolean;
  singleInstanceLock: boolean;
  startWithWindows: boolean;
  customUserAgent: string;
  enableDevTools: boolean;
  enableContextMenu: boolean;
  enableNavigationShortcuts: boolean; // F5, Ctrl+R
  externalLinksBehavior: ExternalLinksBehavior;
  grantPermissionsAutomatically: boolean;
  customCss: string;
  customJs: string;
  offlineFallbackHtml: string;
  splashScreenEnabled: boolean;
  splashDurationMs: number;
}

export interface WrapperConfig {
  app: AppMetadata;
  window: WindowConfig;
  native: NativeFeatures;
}

export interface PeSectionInfo {
  name: string;
  virtualSize: number;
  virtualAddress: number;
  rawSize: number;
  rawOffset: number;
  characteristics: number;
  characteristicsStr: string;
  description: string;
}

export interface PeHeaderBreakdown {
  dosHeader: {
    magic: string;
    e_lfanew: number;
    rawHex: string;
  };
  fileHeader: {
    machine: string;
    machineCode: number;
    numberOfSections: number;
    timeDateStamp: number;
    timeDateStr: string;
    characteristics: string[];
  };
  optionalHeader: {
    magic: string;
    magicCode: number;
    entryPointRVA: number;
    imageBase: string;
    sectionAlignment: number;
    fileAlignment: number;
    subsystem: string;
    subsystemCode: number;
    dllCharacteristics: string[];
    sizeOfImage: number;
    sizeOfHeaders: number;
    checksum: number;
  };
  sections: PeSectionInfo[];
  totalFileSize: number;
}
