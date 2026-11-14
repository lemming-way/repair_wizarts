import React from 'react';
import '@testing-library/jest-dom';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = window.ResizeObserver || ResizeObserver;

// Mock the language module to avoid require.context issues
jest.mock('app/state/language', () => ({
  useLanguage: () => (key: string) => key,
  useCurrentLocale: () => 'ru',
  setLanguage: jest.fn(),
}));

// Mock AnyMedia which uses language
jest.mock('app/shared/ui/AnyMedia', () => ({
  AnyImage: ({ src, alt, className }) => <img src={src} alt={alt} className={className} />,
}));

// Mock react-multilevel-dropdown if needed
jest.mock('react-multilevel-dropdown', () => ({
  MultiLevelMenu: ({ children }) => <div>{children}</div>,
}));
