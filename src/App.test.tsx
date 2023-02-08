import {expect, test} from 'vitest';
import {render, screen, fireEvent, getByRole} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import {ALPHABET, ROTORS} from './utils/rotors';

const DEFAULT_REFLECTOR = 'B-thin';

test('loads correctly', () => {
  render(<App />);
});

test('correctly display outputs encoded text', async () => {
  render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {
    name: /output/i,
  }) as HTMLInputElement;

  await userEvent.type(input, 'enigma');
  const encodedText = output.value;

  expect(encodedText).toBeTruthy();
  expect(encodedText).toHaveLength(6);
});

test('can undo and return to previous state', async () => {
  render(<App />);

  let encodedText;
  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {
    name: /output/i,
  }) as HTMLInputElement;

  await userEvent.type(input, 'enigma');
  encodedText = output.value;
  expect(encodedText).toHaveLength(6);

  await userEvent.click(screen.getByRole('button', {name: /undo/i}));
  encodedText = output.value;
  expect(encodedText).toHaveLength(5);

  await userEvent.type(input, '{backspace}');
  encodedText = output.value;
  expect(encodedText).toHaveLength(4);
});

test('can be reset to default state', async () => {
  render(<App />);

  const input = screen.getByRole('textbox', {
    name: /input/i,
  }) as HTMLInputElement;
  const output = screen.getByRole('textbox', {
    name: /output/i,
  }) as HTMLInputElement;
  const reflector = screen.getByRole('combobox', {
    name: /reflector/i,
  }) as HTMLSelectElement;
  const rotors = screen.getAllByRole('group', {name: /rotor/i});

  await userEvent.type(input, 'enigma');
  await userEvent.click(screen.getByRole('button', {name: /reset/i}));

  expect(input.value).toBe('');
  expect(output.value).toBe('');
  expect(reflector.value).toBe(DEFAULT_REFLECTOR);

  rotors.forEach((rotor, index) => {
    const {value: position} = getByRole(rotor, 'slider') as HTMLInputElement;
    const {value: rotorIndex} = getByRole(
      rotor,
      'combobox',
    ) as HTMLInputElement;

    expect(position).toBe('0');
    expect(Number(rotorIndex)).toBe(index + 1);
  });
});

const turnovers = ROTORS.map((rotor) => ALPHABET.indexOf(rotor.turnover));

test('turnovers respect a normal step sequence', async () => {
  render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const rotors = screen.getAllByRole('group', {name: /rotor/i});

  const lastRotor = {
    input: getByRole(rotors[2], 'slider'),
    type: +(getByRole(rotors[2], 'combobox') as HTMLInputElement).value - 1,
  };

  // Move the rotor slider one position before the turnover notch
  fireEvent.change(lastRotor.input, {
    target: {value: turnovers[lastRotor.type]},
  });

  await userEvent.type(input, 'e');

  expect(+(getByRole(rotors[0], 'slider') as HTMLInputElement).value).toBe(0);
  expect(+(getByRole(rotors[1], 'slider') as HTMLInputElement).value).toBe(1);
  expect(+(getByRole(rotors[2], 'slider') as HTMLInputElement).value).toBe(
    turnovers[lastRotor.type] + 1,
  );
});

test('turnovers respect a double step sequence', async () => {
  render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const rotors = screen.getAllByRole('group', {name: /rotor/i});

  const secondRotor = {
    input: getByRole(rotors[1], 'slider'),
    type: +(getByRole(rotors[1], 'combobox') as HTMLSelectElement).value - 1,
  };

  const lastRotor = {
    input: getByRole(rotors[2], 'slider'),
    type: +(getByRole(rotors[2], 'combobox') as HTMLSelectElement).value - 1,
  };

  fireEvent.change(secondRotor.input, {
    target: {value: turnovers[secondRotor.type]},
  });

  fireEvent.change(lastRotor.input, {
    target: {value: turnovers[lastRotor.type]},
  });

  await userEvent.type(input, 'e');

  expect(+(getByRole(rotors[0], 'slider') as HTMLInputElement).value).toBe(1);
  expect(+(getByRole(rotors[1], 'slider') as HTMLInputElement).value).toBe(
    turnovers[secondRotor.type] + 1,
  );
  expect(+(getByRole(rotors[2], 'slider') as HTMLInputElement).value).toBe(
    turnovers[lastRotor.type] + 1,
  );
});

test('input and output encode to one another', async () => {
  render(<App />);

  const plainText = 'enigma';
  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {
    name: /output/i,
  }) as HTMLInputElement;

  await userEvent.type(input, plainText);
  const encodedText = output.value;

  await userEvent.click(screen.getByRole('button', {name: /reset/i}));

  await userEvent.type(input, encodedText);
  expect(output.value).toBe(plainText.toUpperCase());
});

// Changing the rotor order works
test('rotor order can be changed', async () => {
  render(<App />);
  let rotors = screen.getAllByRole('group', {name: /rotor/i});

  await userEvent.selectOptions(getByRole(rotors[0], 'combobox'), '3');
  await userEvent.selectOptions(getByRole(rotors[1], 'combobox'), '5');

  // Querying a second time because the order changes
  rotors = screen.getAllByRole('group', {name: /rotor/i});

  expect((getByRole(rotors[0], 'combobox') as HTMLSelectElement).value).toBe(
    '3',
  );
  expect((getByRole(rotors[1], 'combobox') as HTMLSelectElement).value).toBe(
    '5',
  );
  expect((getByRole(rotors[2], 'combobox') as HTMLSelectElement).value).toBe(
    '1',
  );
});

test('plugboard can be connected', async () => {
  render(<App />);

  const plugboard = screen.getByRole('group', {name: /plugboard/i});

  await userEvent.click(getByRole(plugboard, 'checkbox', {name: /a/i}));
  expect(
    getByRole(plugboard, 'checkbox', {name: /a/i}) as HTMLInputElement,
  ).not.toBeChecked();
  expect(
    (getByRole(plugboard, 'checkbox', {name: /a/i}) as HTMLInputElement)
      .indeterminate,
  ).toBe(true);

  await userEvent.click(getByRole(plugboard, 'checkbox', {name: /b/i}));
  expect(getByRole(plugboard, 'checkbox', {name: /a/i})).toBeChecked();
  expect(getByRole(plugboard, 'checkbox', {name: /b/i})).toBeChecked();
});

test('Encoding is transformed with the plugboard connections', async () => {
  render(<App />);

  const input = screen.getByRole('textbox', {
    name: /input/i,
  }) as HTMLInputElement;
  const output = screen.getByRole('textbox', {
    name: /output/i,
  }) as HTMLInputElement;

  const plugboard = screen.getByRole('group', {name: /plugboard/i});
  await userEvent.type(input, 'enigma');
  const unpluggedEncoding = output.value;

  await userEvent.click(getByRole(plugboard, 'checkbox', {name: /a/i}));
  await userEvent.click(getByRole(plugboard, 'checkbox', {name: /b/i}));

  expect(input.value).toBeFalsy();
  expect(output.value).toBeFalsy();

  await userEvent.type(input, 'enigma');
  const pluggedEncoding = output.value;

  expect(unpluggedEncoding).not.toBe(pluggedEncoding);
});
