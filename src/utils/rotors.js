// TODO maybe switch the alphabet to a string, most methods will be preserved and code will be terser
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

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
  // The encoding is done from last to first (RTL)
  const reverseRotors = [...rotors].reverse();

  // Get the ciphers for the current rotor positions
  const reversedCiphers = reverseRotors.map(extractCipher);

  // Encoding produced from the input to the reflector
  const firstPassChar = alphaToCipher(char, reverseRotors, reversedCiphers);

  // Get the new characater from the reflector
  const reflector = REFLECTORS.get('B');
  const reflectedChar = ALPHABET[reflector.indexOf(firstPassChar)];

  // This encoding is done from first to last (LTR)
  // Get the ciphers from the original rotor position
  const currentCiphers = rotors.map(extractCipher);
  const encodedChar = cipherToAlpha(reflectedChar, rotors, currentCiphers);

  return encodedChar;
}

/**
 * Encrypts the plaintext to the character to be transferred to the reflector
 * @param {string} char the plain text character
 * @param {{rotorType: number, position: number, turnover: number}[]} rotors
 * @param {string[]} currentCiphers ciphers at the current rotor positions
 */
function alphaToCipher(char, rotors, currentCiphers) {
  // The current encoded character after each rotor is derived from the "alphabet"
  // created from the previous rotor's position.
  const encodedChar = rotors.reduce(function (
    inputChar,
    _rotor,
    index,
    rotorsList,
  ) {
    const cipher = currentCiphers[index];
    const previousRotor = rotorsList[index - 1];

    // Use the alphabet from the previous rotor if there is one.
    const position = previousRotor?.position;
    const currentAlphabet =
      index === 0
        ? ALPHABET
        : ALPHABET.slice(position) + ALPHABET.slice(0, position);

    return cipher[currentAlphabet.indexOf(inputChar)];
  },
  char);

  return encodedChar;
}

/**
 * Encrypts the plaintext to the character to be transferred to the reflector
 * @param {string} char the plain text character
 * @param {{rotorType: number, position: number, turnover: number}[]} rotors
 * @param {string[]} currentCiphers ciphers at the current rotor positions
 */
function cipherToAlpha(char, rotors, currentCiphers) {
  const charIndex = ALPHABET.indexOf(char);
  // Return that character for the next rotor
  const encodedCharIndex = rotors.reduce(function (
    inputIndex,
    {position},
    current,
  ) {
    const cipher = currentCiphers[current];
    const currentAlphabet =
      ALPHABET.slice(position) + ALPHABET.slice(0, position);
    // Which char alpha from the alphabet has the same position as the input char
    const matchingChar = currentAlphabet[inputIndex];

    // What's the index of character alpha in the cipher C of the curent form
    const outputIndex = cipher.indexOf(matchingChar);
    return outputIndex;
  },
  charIndex);

  return ALPHABET[encodedCharIndex];
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
    updated: false,
  }));

  return rotors;
}

function incrementPosition(rotor) {
  rotor.position += 1;
  rotor.position %= 26;
  rotor.updated = true;
}

function updateTurnover(rotor, index, rotorList) {
  // Always increment the last rotor's position
  const nextRotor = rotorList[index + 1];
  if (index === 0) {
    incrementPosition(rotor);
  }

  // Eagerly increment next rotor when current has just been updated over its turnover
  // This is the best way, as of now, to avoid false updates
  if (nextRotor && rotor.updated && rotor.position === rotor.turnover + 1) {
    incrementPosition(nextRotor);
    rotor.updated = false;
  }

  return rotor;
}

function updateRotorsPositions(rotors) {
  // Reversing the array here is the fastest way to update them
  const reversedRotors = [...rotors].reverse();
  const newRotorState = reversedRotors.map(updateTurnover);
  return newRotorState.reverse();
}

export {ALPHABET, ROTORS, encodeChar, getRotors, updateRotorsPositions};
