import {afterEach, describe, expect, test} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  getByRole,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import {ALPHABET, ROTORS} from './utils/rotors';

const DEFAULT_REFLECTOR = 'B';

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

test('a rotor can be turned back to A', () => {
  render(<App />);

  const [rotor] = screen.getAllByRole('group', {name: /rotor/i});
  const slider = getByRole(rotor, 'slider') as HTMLInputElement;

  fireEvent.change(slider, {target: {value: 5}});
  expect(slider.value).toBe('5');

  // Regression: position 0 used to be ignored as a missing value
  fireEvent.change(slider, {target: {value: 0}});
  expect(slider.value).toBe('0');
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

const plug = (plugboard: HTMLElement, letter: string) =>
  getByRole(plugboard, 'button', {name: new RegExp(`^plug ${letter}\\b`, 'i')});

test('plugboard can be connected', async () => {
  render(<App />);

  const plugboard = screen.getByRole('group', {name: /plugboard/i});

  await userEvent.click(plug(plugboard, 'a'));
  expect(plug(plugboard, 'a')).toHaveAttribute('aria-pressed', 'true');
  expect(plug(plugboard, 'a')).toHaveAccessibleName(
    'Plug A, waiting for a partner',
  );

  await userEvent.click(plug(plugboard, 'b'));
  expect(plug(plugboard, 'a')).toHaveAccessibleName('Plug A, connected to B');
  expect(plug(plugboard, 'b')).toHaveAccessibleName('Plug B, connected to A');
  expect(plug(plugboard, 'a')).toHaveAttribute('aria-pressed', 'false');
});

test('a plugged letter can be unplugged', async () => {
  render(<App />);

  const plugboard = screen.getByRole('group', {name: /plugboard/i});
  await userEvent.click(plug(plugboard, 'a'));
  await userEvent.click(plug(plugboard, 'b'));
  await userEvent.click(plug(plugboard, 'b'));

  expect(plug(plugboard, 'a')).toHaveAccessibleName('Plug A');
  expect(plug(plugboard, 'b')).toHaveAccessibleName('Plug B');
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

  await userEvent.click(plug(plugboard, 'a'));
  await userEvent.click(plug(plugboard, 'b'));

  expect(input.value).toBeFalsy();
  expect(output.value).toBeFalsy();

  await userEvent.type(input, 'enigma');
  const pluggedEncoding = output.value;

  expect(unpluggedEncoding).not.toBe(pluggedEncoding);
});

test('an on-screen key lights the lamp of the encoded letter', async () => {
  render(<App />);

  const keyboard = screen.getByRole('region', {name: /keyboard/i});
  const output = screen.getByRole('textbox', {
    name: /output/i,
  }) as HTMLInputElement;

  await userEvent.click(getByRole(keyboard, 'button', {name: 'E'}));
  const lamp = output.value.at(-1);

  expect(output.value).toHaveLength(1);
  expect(lamp).not.toBe('E');
  expect(screen.getByText(`Lamp ${lamp} is lit`)).toBeInTheDocument();
});

test('the signal path ends at the lit lamp', async () => {
  render(<App />);

  const input = screen.getByRole('textbox', {name: /input/i});
  const output = screen.getByRole('textbox', {
    name: /output/i,
  }) as HTMLInputElement;

  await userEvent.type(input, 'hello');
  const path = screen.getByRole('list', {name: /signal path/i});
  const steps = within(path).getAllByRole('listitem');

  // key, plugboard, 3 rotors, reflector, 3 rotors, plugboard, lamp
  expect(steps).toHaveLength(11);
  expect(steps[0]).toHaveTextContent('key O');
  expect(steps.at(-1)).toHaveTextContent(`lamp ${output.value.at(-1)}`);
  expect(
    screen.getByRole('img', {name: /signal path for key o/i}),
  ).toBeInTheDocument();
});

test('typing on the page presses the machine keys', async () => {
  render(<App />);

  const output = screen.getByRole('textbox', {
    name: /output/i,
  }) as HTMLInputElement;

  await userEvent.keyboard('ab');
  expect(output.value).toHaveLength(2);

  await userEvent.keyboard('{Backspace}');
  expect(output.value).toHaveLength(1);
});

test('only true reflectors can be chosen', () => {
  render(<App />);

  const reflector = screen.getByRole('combobox', {name: /reflector/i});
  const options = within(reflector)
    .getAllByRole('option')
    .map((option) => option.textContent);

  expect(options).toEqual(['A', 'B', 'C', 'B-thin', 'C-thin']);
});

describe('shared links', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  test('a valid link sets the machine up', () => {
    window.history.replaceState(
      {},
      '',
      '/?rotors=II,IV,I&pos=EQV&reflector=C&plugs=AK',
    );
    render(<App />);

    const rotors = screen.getAllByRole('group', {name: /rotor/i});
    const types = rotors.map(
      (rotor) => (getByRole(rotor, 'combobox') as HTMLSelectElement).value,
    );
    const positions = rotors.map(
      (rotor) => (getByRole(rotor, 'slider') as HTMLInputElement).value,
    );
    const plugboard = screen.getByRole('group', {name: /plugboard/i});

    expect(types).toEqual(['2', '4', '1']);
    expect(positions).toEqual(['4', '16', '21']);
    expect(screen.getByRole('combobox', {name: /reflector/i})).toHaveValue('C');
    expect(plug(plugboard, 'a')).toHaveAccessibleName('Plug A, connected to K');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('an invalid link explains itself and keeps the default setup', () => {
    window.history.replaceState({}, '', '/?rotors=I,I,II&plugs=AB,BC');
    render(<App />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Rotor I is used twice');
    expect(alert).toHaveTextContent('B has more than one cable');

    const rotors = screen.getAllByRole('group', {name: /rotor/i});
    const types = rotors.map(
      (rotor) => (getByRole(rotor, 'combobox') as HTMLSelectElement).value,
    );
    expect(types).toEqual(['1', '2', '3']);
  });
});
