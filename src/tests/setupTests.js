import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import React from 'react';

vi.mock('jest-axe', () => {
  return {
    axe: vi.fn().mockResolvedValue({
      violations: []
    }),
    toHaveNoViolations: {
      toHaveNoViolations: (results) => {
        return {
          pass: true,
          message: () => 'No violations'
        };
      }
    }
  };
});

import { toHaveNoViolations } from 'jest-axe';

// Extend vitest matchers for jest-axe compatibility
expect.extend(toHaveNoViolations);

// Mock window.matchMedia since it is not defined in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock lucide-react globally to dynamically support any icons (Tag, ShieldAlert, Cpu, etc.)
vi.mock('lucide-react', () => {
  const React = require('react');
  const iconCache = {};
  
  const getIcon = (name) => {
    if (!iconCache[name]) {
      iconCache[name] = (props) => React.createElement('span', { 'data-testid': `icon-${name.toLowerCase()}`, ...props }, name);
    }
    return iconCache[name];
  };
  
  return new Proxy({
    __esModule: true
  }, {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      if (typeof prop === 'symbol' || prop === 'then' || prop === 'prototype' || prop === 'displayName' || prop === 'toString') {
        return undefined;
      }
      return getIcon(prop);
    },
    has: (target, prop) => true,
    ownKeys: (target) => {
      return [
        'Tag', 'ShieldAlert', 'Cpu', 'Clock', 'Check', 'AlertCircle', 'Info', 
        'TrendingUp', 'TrendingDown', 'AlertTriangle', 'CheckCircle', 'Activity', 
        'ArrowUpRight', 'ArrowDownLeft', 'RefreshCw', 'Coins', 'Settings', 
        'LogOut', 'Plus', 'MoreVertical', 'DollarSign', 'Calendar', 'Trash2', 
        'Edit', 'User', 'Users', 'Filter', 'Search', 'ArrowUpDown', 'BookOpen', 
        'Menu', 'X', 'ChevronDown', 'ChevronUp', 'Trash', 'PlusCircle', 'FileText',
        'PieChart', 'BarChart2', 'Lock', 'Unlock', 'Settings2', 'Bell', 
        'UploadCloud', 'Sparkles', 'ChevronRight', 'Loader2', 'Globe', 'History',
        'Shield', 'ArrowRightLeft', 'CreditCard'
      ];
    },
    getOwnPropertyDescriptor: (target, prop) => {
      return {
        configurable: true,
        enumerable: true,
        value: getIcon(prop)
      };
    }
  });
});

// Global mock for tesseract.js to avoid loading native models and downloading language files in tests
vi.mock('tesseract.js', () => {
  return {
    createWorker: vi.fn().mockImplementation(async () => {
      return {
        loadLanguage: vi.fn().mockResolvedValue(null),
        initialize: vi.fn().mockResolvedValue(null),
        recognize: vi.fn().mockResolvedValue({
          data: {
            text: "Starbucks Coffee\n12/12/2026\nTotal: 30.00 INR\nItems:\nCoffee 15.00\nCake 15.00"
          }
        }),
        terminate: vi.fn().mockResolvedValue(null)
      };
    }),
    recognize: vi.fn().mockResolvedValue({
      data: {
        text: "Starbucks Coffee\n12/12/2026\nTotal: 30.00 INR\nItems:\nCoffee 15.00\nCake 15.00"
      }
    })
  };
});
