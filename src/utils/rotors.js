// TODO maybe switch the alphabet to a string, most methods will be preserved and code will be terser
const ALPHABET = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

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
];

const REFLECTORS = new Map([
  ['A', 'EJMZALYXVBWFCRQUONTSPIKHGD'],
  ['B', 'YRUHQSLDPXNGOKMIEBFZCWVJAT'],
]);

/**
 * Encodes an alphabetical character to the matching cipher caracter
 * @param {string} char
 * @param {{rotorType: number, position: number, turnover: number}[]} rotors
 */
function encodeChar(char, rotors) {
  // The encoding is done from last to first
  const reverseRotors = [...rotors].reverse();

  // Get the current cipher for each rotor
  const currentCiphers = reverseRotors.map(extractCipher);

  // Each character gets encoded from the rotors twice
  const firstPassChar = alphaToCipher(char, reverseRotors, currentCiphers);

  // Get the new charcater from the reflector
  const reflector = REFLECTORS.get('B');
  const reflectedChar = reflector[ALPHABET.indexOf(firstPassChar)];

  // TODO Second pass through the encoding

  return reflectedChar;
}

/**
 * Encrypts the plaintext to the character to be transferred to the reflector
 * @param {string} char the plain text character
 * @param {{rotorType: number, position: number, turnover: number}[]} rotors
 * @param {string[]} currentCiphers ciphers at the current rotor positions
 */
function alphaToCipher(char, rotors, currentCiphers) {
  let encodedChar = char;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < rotors.length; i++) {
    const cipher = currentCiphers[i];
    const previousRotor = rotors[i - 1];
    const position = previousRotor?.position;

    // Use the alphabet derived from the previous rotor position
    const alphabet =
      i === 0
        ? ALPHABET
        : [...ALPHABET.slice(position), ...ALPHABET.slice(0, position)];

    encodedChar = cipher[alphabet.indexOf(encodedChar)];
  }
  return encodedChar;
}

function extractCipher({rotorType, position}) {
  let {cipher} = ROTORS[rotorType - 1];
  cipher = cipher.slice(position) + cipher.slice(0, position);
  return cipher;
}

function getTurnoverIndex(rotorType) {
  const {turnover} = ROTORS[rotorType - 1];
  const turnoverIndex = ALPHABET.indexOf(turnover);
  return turnoverIndex;
}

function getRotors(rotorTypes) {
  const rotors = rotorTypes.map((rotorType) => ({
    key: ROTORS[rotorType - 1].type,
    rotorType,
    position: 0,
    turnover: getTurnoverIndex(rotorType),
  }));

  return rotors;
}

function updateTurnover(rotor, index, rotorList) {
  // Always increment the last rotor's position
  // Increment a rotor if the previous just incremented past their turnover position
  const previousRotor = rotorList[index - 1];
  if (index === 0 || previousRotor.position === previousRotor.turnover + 1) {
    rotor.position += 1;
    rotor.position %= 26;
  }
  return rotor;
}

function updateRotorsPositions(rotors) {
  // Reversing the array here is the fastest way to update them
  const newRotorState = [...rotors].reverse().map(updateTurnover);
  return newRotorState.reverse();
}

export {ALPHABET, ROTORS, encodeChar, getRotors, updateRotorsPositions};
