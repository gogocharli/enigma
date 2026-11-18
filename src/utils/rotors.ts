import type {Connections, Reflector, Rotor, TraceStage} from '../types';
import {swapThroughPlugboard} from './plugboard';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' as const;

/**
 * Rotor wirings and the letter at which each one carries its neighbour
 * @see https://en.wikipedia.org/wiki/Enigma_rotor_details#Rotor_wiring_tables
 */
const ROTORS = [
  {
    type: 'I',
    cipher: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    turnover: 'Q',
  },
  {
    type: 'II',
    cipher: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    turnover: 'E',
  },
  {
    type: 'III',
    cipher: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    turnover: 'V',
  },
  {
    type: 'IV',
    cipher: 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
    turnover: 'J',
  },
  {
    type: 'V',
    cipher: 'VZBRGITYUPSDNHLXAWMJQOFECK',
    turnover: 'Z',
  },
] as const;

/**
 * Only true reflectors belong here: each one pairs every letter with a
 * different letter. That is what makes the machine reciprocal and stops a
 * letter from ever encrypting to itself (both are checked in the tests).
 */
const REFLECTORS = new Map<Reflector, string>([
  ['A', 'EJMZALYXVBWFCRQUONTSPIKHGD'],
  ['B', 'YRUHQSLDPXNGOKMIEBFZCWVJAT'],
  ['C', 'FVPJIAOYEDRZXWGCTKUQSBNMHL'],
  ['B-thin', 'ENKQAUYWJICOPBLMDXZVFTHRGS'],
  ['C-thin', 'RDOBJNTKVEHMLFCWZAXGYIPSUQ'],
]);

const REFLECTOR_TYPES = [...REFLECTORS.keys()];

const DEFAULT_REFLECTOR: Reflector = 'B';

const wrap = (index: number) => (index + 26) % 26;

/**
 * Passes a housing contact through a rotor at its current position,
 * towards the reflector (forward) or back from it (return)
 */
function throughRotor(
  {rotorType, position}: Rotor,
  contact: number,
  direction: TraceStage['direction'],
) {
  const {cipher} = ROTORS[rotorType - 1];
  const entry = ALPHABET[wrap(contact + position)];
  const exit =
    direction === 'forward'
      ? ALPHABET.indexOf(cipher[ALPHABET.indexOf(entry)])
      : cipher.indexOf(entry);
  return wrap(exit - position);
}

/**
 * Follows a key press through the whole machine, one stage at a time.
 * Inputs and outputs are housing contacts (0 = A), so the same trace drives
 * both the encoded letter and the signal diagram.
 */
function traceChar(
  char: string,
  rotors: Rotor[],
  reflectorType: Reflector,
  connections?: Connections,
): TraceStage[] {
  const key = ALPHABET.indexOf(char);
  const reflector = REFLECTORS.get(reflectorType);
  if (key === -1 || !reflector) return [];

  const plug = (contact: number) =>
    connections
      ? ALPHABET.indexOf(swapThroughPlugboard(connections, ALPHABET[contact]))
      : contact;

  const stages: TraceStage[] = [];
  const pass = (stage: Omit<TraceStage, 'output'>, output: number) => {
    stages.push({...stage, output});
    return output;
  };

  let contact = pass(
    {part: 'plugboard', direction: 'forward', input: key},
    plug(key),
  );

  // The signal enters on the right (fast) rotor and travels left
  for (let index = rotors.length - 1; index >= 0; index--) {
    contact = pass(
      {part: 'rotor', direction: 'forward', rotorIndex: index, input: contact},
      throughRotor(rotors[index], contact, 'forward'),
    );
  }

  contact = pass(
    {part: 'reflector', direction: 'return', input: contact},
    ALPHABET.indexOf(reflector[contact]),
  );

  for (let index = 0; index < rotors.length; index++) {
    contact = pass(
      {part: 'rotor', direction: 'return', rotorIndex: index, input: contact},
      throughRotor(rotors[index], contact, 'return'),
    );
  }

  pass({part: 'plugboard', direction: 'return', input: contact}, plug(contact));

  return stages;
}

/**
 * Initialize the reflector settings used for character encoding
 */
const initReflector = (reflectorType: Reflector) => {
  /**
   * Encodes an alphabetical character through the rotors and reflector.
   * The plugboard is applied separately by the board.
   */
  function encodeChar(char: string, rotors: Rotor[]) {
    const stages = traceChar(char, rotors, reflectorType);
    const lastStage = stages.at(-1);
    return lastStage ? ALPHABET[lastStage.output] : '';
  }

  return encodeChar;
};

/**
 * Retrieves the turnover index from the rotor's type
 */
function getTurnoverIndex(rotorType: number) {
  const {turnover} = ROTORS[rotorType - 1];
  return ALPHABET.indexOf(turnover);
}

/**
 * Create a rotor list based on a selection of their type indices
 * @returns The selected rotors inital settings
 */
function getRotors(rotorTypes: number[]): Rotor[] {
  return rotorTypes.map((rotorType) => ({
    key: ROTORS[rotorType - 1].type,
    rotorType,
    position: 0,
    turnover: getTurnoverIndex(rotorType),
  }));
}

/**
 * Steps the rotors the way the machine's pawls do when a key is pressed.
 * The rightmost rotor always steps. A rotor sitting at its notch is pushed
 * along with its left neighbour, which makes the middle rotor step twice in a
 * row (the "double step").
 */
function updateRotorsPositions(rotors: Rotor[]): Rotor[] {
  const atNotch = rotors.map(({position, turnover}) => position === turnover);
  const last = rotors.length - 1;

  return rotors.map((rotor, index) => {
    const steps =
      index === last || atNotch[index + 1] || (index > 0 && atNotch[index]);
    return steps ? {...rotor, position: wrap(rotor.position + 1)} : rotor;
  });
}

export {
  ALPHABET,
  ROTORS,
  REFLECTORS,
  REFLECTOR_TYPES,
  DEFAULT_REFLECTOR,
  throughRotor,
  traceChar,
  initReflector,
  getRotors,
  updateRotorsPositions,
};
