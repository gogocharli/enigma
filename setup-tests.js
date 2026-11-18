import {afterEach} from 'vitest';
import {cleanup} from '@testing-library/react';
// extends Vitest's expect method with matchers from jest-dom
import '@testing-library/jest-dom/vitest';

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
