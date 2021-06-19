import * as React from 'react';
import {render, screen, fireEvent, getByRole} from '@testing-library/react';
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
  render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {name: /output/i});
  const reflector = screen.getByRole('combobox', {name: /reflector/i});
  const rotors = screen.getAllByRole('group', {name: /rotor/i});

  userEvent.type(input, 'enigma');
  userEvent.click(screen.getByRole('button', {name: /reset/i}));

  expect(input.value).toBe('');
  expect(output.value).toBe('');
  expect(reflector.value).toBe(DEFAULT_REFLECTOR);

  rotors.forEach((rotor, index) => {
    const {value: position} = getByRole(rotor, 'slider');
    const {value: rotorIndex} = getByRole(rotor, 'combobox');

    expect(position).toBe('0');
    expect(Number(rotorIndex)).toBe(index + 1);
  });
});

const turnovers = ROTORS.map((rotor) => ALPHABET.indexOf(rotor.turnover));

test('turnovers respect a normal step sequence', () => {
  render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const rotors = screen.getAllByRole('group', {name: /rotor/i});

  const lastRotor = {
    input: getByRole(rotors[2], 'slider'),
    type: +getByRole(rotors[2], 'combobox').value - 1,
  };

  // Move the rotor slider one position before the turnover notch
  fireEvent.change(lastRotor.input, {
    target: {value: turnovers[lastRotor.type]},
  });

  userEvent.type(input, 'e');

  expect(+getByRole(rotors[0], 'slider').value).toBe(0);
  expect(+getByRole(rotors[1], 'slider').value).toBe(1);
  expect(+getByRole(rotors[2], 'slider').value).toBe(
    turnovers[lastRotor.type] + 1,
  );
});

test('turnovers respect a double step sequence', () => {
  render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const rotors = screen.getAllByRole('group', {name: /rotor/i});

  const secondRotor = {
    input: getByRole(rotors[1], 'slider'),
    type: +getByRole(rotors[1], 'combobox').value - 1,
  };

  const lastRotor = {
    input: getByRole(rotors[2], 'slider'),
    type: +getByRole(rotors[2], 'combobox').value - 1,
  };

  fireEvent.change(secondRotor.input, {
    target: {value: turnovers[secondRotor.type]},
  });

  fireEvent.change(lastRotor.input, {
    target: {value: turnovers[lastRotor.type]},
  });

  userEvent.type(input, 'e');

  expect(+getByRole(rotors[0], 'slider').value).toBe(1);
  expect(+getByRole(rotors[1], 'slider').value).toBe(
    turnovers[secondRotor.type] + 1,
  );
  expect(+getByRole(rotors[2], 'slider').value).toBe(
    turnovers[lastRotor.type] + 1,
  );
});

test('input and output encode to one another', () => {
  render(<App />);

  const plainText = 'enigma';
  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {name: /output/i});

  userEvent.type(input, plainText);
  const encodedText = output.value;

  userEvent.click(screen.getByRole('button', {name: /reset/i}));

  userEvent.type(input, encodedText);
  expect(output.value).toBe(plainText.toUpperCase());
});

// Changing the rotor order works
test('rotor order can be changed', () => {
  render(<App />);
  let rotors = screen.getAllByRole('group', {name: /rotor/i});

  userEvent.selectOptions(getByRole(rotors[0], 'combobox'), '3');
  userEvent.selectOptions(getByRole(rotors[1], 'combobox'), '5');

  // Querying a second time because the order changes
  rotors = screen.getAllByRole('group', {name: /rotor/i});

  expect(getByRole(rotors[0], 'combobox').value).toBe('3');
  expect(getByRole(rotors[1], 'combobox').value).toBe('5');
  expect(getByRole(rotors[2], 'combobox').value).toBe('1');
});

test('plugboard can be connected', () => {
  render(<App />);

  const plugboard = screen.getByRole('group', {name: /plugboard/i});

  userEvent.click(getByRole(plugboard, 'checkbox', {name: /a/i}));
  expect(getByRole(plugboard, 'checkbox', {name: /a/i})).not.toBeChecked();
  expect(getByRole(plugboard, 'checkbox', {name: /a/i}).indeterminate).toBe(
    true,
  );

  userEvent.click(getByRole(plugboard, 'checkbox', {name: /b/i}));
  expect(getByRole(plugboard, 'checkbox', {name: /a/i})).toBeChecked();
  expect(getByRole(plugboard, 'checkbox', {name: /b/i})).toBeChecked();
});

test('Encoding is transformed with the plugboard connections', () => {
  render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {name: /output/i});

  const plugboard = screen.getByRole('group', {name: /plugboard/i});
  userEvent.type(input, 'enigma');
  const unpluggedEncoding = output.value;

  userEvent.click(getByRole(plugboard, 'checkbox', {name: /a/i}));
  userEvent.click(getByRole(plugboard, 'checkbox', {name: /b/i}));

  expect(input.value).toBeFalsy();
  expect(output.value).toBeFalsy();

  userEvent.type(input, 'enigma');
  const pluggedEncoding = output.value;

  expect(unpluggedEncoding).not.toBe(pluggedEncoding);
});
