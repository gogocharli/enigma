import * as React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import App from './App';
import {ALPHABET, ROTORS} from './utils/rotors';

const DEFAULT_REFLECTOR = 'B-thin';

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
  const {container} = render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {name: /output/i});
  const reflector = screen.getByRole('combobox', {name: /reflector/i});
  const rotors = container.querySelectorAll('[id*=rotor-]');

  userEvent.type(input, 'enigma');
  userEvent.click(screen.getByRole('button', {name: /reset/i}));

  expect(input.value).toBe('');
  expect(output.value).toBe('');
  expect(reflector.value).toBe(DEFAULT_REFLECTOR);

  rotors.forEach((rotor, index) => {
    const {value: position} = rotor.querySelector('input');
    const {value: rotorIndex} = rotor.querySelector('select');

    expect(position).toBe('0');
    expect(Number(rotorIndex)).toBe(index + 1);
  });
});

const turnovers = ROTORS.map((rotor) => ALPHABET.indexOf(rotor.turnover));

test('turnovers respect a normal step sequence', () => {
  const {container} = render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const rotors = container.querySelectorAll('[id*=rotor-]');

  const lastRotor = {
    input: rotors[2].querySelector('input'),
    type: +rotors[2].querySelector('select').value - 1,
  };

  // Move the rotor slider one position before the turnover notch
  fireEvent.change(lastRotor.input, {
    target: {value: turnovers[lastRotor.type]},
  });

  userEvent.type(input, 'e');

  expect(+rotors[0].querySelector('input').value).toBe(0);
  expect(+rotors[1].querySelector('input').value).toBe(1);
  expect(+rotors[2].querySelector('input').value).toBe(
    turnovers[lastRotor.type] + 1,
  );
});

test('turnovers respect a double step sequence', () => {
  const {container} = render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const rotors = container.querySelectorAll('[id*=rotor-]');

  const secondRetor = {
    input: rotors[1].querySelector('input'),
    type: +rotors[1].querySelector('select').value - 1,
  };

  const lastRotor = {
    input: rotors[2].querySelector('input'),
    type: +rotors[2].querySelector('select').value - 1,
  };

  fireEvent.change(secondRetor.input, {
    target: {value: turnovers[secondRetor.type]},
  });

  fireEvent.change(lastRotor.input, {
    target: {value: turnovers[lastRotor.type]},
  });

  userEvent.type(input, 'e');

  expect(+rotors[0].querySelector('input').value).toBe(1);
  expect(+rotors[1].querySelector('input').value).toBe(
    turnovers[secondRetor.type] + 1,
  );
  expect(+rotors[2].querySelector('input').value).toBe(
    turnovers[lastRotor.type] + 1,
  );
});

// Input and output can be reversed for one another

// Changing the rotor order works

// We can create and remove a plugboard connection

// Encoding is transformed with the plugboard connections
