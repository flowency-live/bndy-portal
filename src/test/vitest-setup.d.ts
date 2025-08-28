/// <reference types="@testing-library/jest-dom" />
import 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers {}
}

interface TestingLibraryMatchers<R = unknown, T = {}> {
  toBeInTheDocument(): R;
  toHaveClass(...classNames: string[]): R;
  toHaveTextContent(text: string | RegExp | ((content: string) => boolean)): R;
  toHaveAttribute(attr: string, value?: string): R;
  toBeVisible(): R;
  toBeDisabled(): R;
  toBeEnabled(): R;
  toHaveValue(value: string | number): R;
  toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
  toBeChecked(): R;
  toHaveFocus(): R;
}
