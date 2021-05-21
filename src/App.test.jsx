import * as React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

test('loads correctly', () => {
  render(<App />);
});

test('correctly display outputs encoded text', () => {
  render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {name: /output/i});

  userEvent.type(input, 'enigma');
  const encodedText = output.value;

  expect(encodedText).toBeDefined();
  expect(encodedText).toHaveLength(6);
});

test('can undo and return to previous state', () => {
  render(<App />);

  let encodedText;
  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {name: /output/i});

  userEvent.type(input, 'enigma');
  encodedText = output.value;
  expect(encodedText).toHaveLength(6);

  userEvent.click(screen.getByRole('button', {name: /undo/i}));
  encodedText = output.value;
  expect(encodedText).toHaveLength(5);

  userEvent.type(input, '{backspace}');
  encodedText = output.value;
  expect(encodedText).toHaveLength(4);
});

test('can be reset to default state', () => {
  const container = render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {name: /output/i});

  userEvent.type(input, 'enigma');
  userEvent.click(screen.getByRole('button', {name: /reset/i}));

  // todo test for rotors and reflector using container
  expect(input.value).toBe('');
  expect(output.value).toBe('');
});

// Setting up the rotors position and typing works

// Check the turnovers work as intended

// Input and output can be reversed for one another

// Changing the rotor order works

// We can create and remove a plugboard connection

// Encoding is transformed with the plugboard connections
const defaultAppState = {
  reflector: 'B-thin',
  rotors: [
    {type: 'I', position: 'A'},
    {type: 'II', position: 'A'},
    {type: 'III', position: 'A'},
  ],
};
