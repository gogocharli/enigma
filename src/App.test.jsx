import * as React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

test('loads correctly', () => {
  render(<App />);
});
