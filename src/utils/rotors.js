/**
 * A Rotor
 * @typedef {Object} Rotor
 * @property {string} key
 * @property {number} rotorType
 * @property {number} position
 * @property {string} turnover
 * @property {boolean} updated - if the rotor's postion was just updated
 */

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
 * @param {Rotor[]} rotors
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
 * @param {Rotor[]} rotors
 * @param {string[]} currentCiphers ciphers at the current rotor positions
 */
function alphaToCipher(char, rotors, currentCiphers) {
  // The current encoded character after each rotor is derived from the "alphabet"
  // created from the previous rotor's position.
  const encodedChar = rotors.reduce(function (
    inputChar,
    _rotor,
    current,
    rotorsList,
  ) {
    const cipher = currentCiphers[current];
    const previousRotor = rotorsList[current - 1];

    // Use the alphabet from the previous rotor if there is one.
    const position = previousRotor?.position;
    const isFirstRotor = current === 0;
    const currentAlphabet = isFirstRotor
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
 * @param {Rotor[]} rotors
 * @param {string[]} currentCiphers ciphers at the current rotor positions
 */
function cipherToAlpha(char, rotors, currentCiphers) {
  const charIndex = ALPHABET.indexOf(char);

  const encodedCharIndex = rotors.reduce(function (
    inputIndex,
    {position},
    current,
  ) {
    const cipher = currentCiphers[current];

    // The first rotor and the reflector align with the first alphabet
    const isFirstRotor = current === 0;
    const currentAlphabet = isFirstRotor
      ? ALPHABET
      : ALPHABET.slice(position) + ALPHABET.slice(0, position);

    // Which char alpha from the alphabet has the same position as the input char
    const matchingChar = currentAlphabet[inputIndex];

    // What's the index of character alpha in the cipher C of the curent form
    const outputIndex = cipher.indexOf(matchingChar);
    return outputIndex;
  },
  charIndex);

  return ALPHABET[encodedCharIndex];
}

/**
 * Retrieves the current cipher of a rotor, given its position
 * @param {Rotor}
 * @returns {string}
 */
function extractCipher({rotorType, position}) {
  let {cipher} = ROTORS[rotorType - 1];
  cipher = cipher.slice(position) + cipher.slice(0, position);
  return cipher;
}

/**
 * Retrieves the turnover index from the rotor's type
 * @param {string} rotorType
 */
function getTurnoverIndex(rotorType) {
  const {turnover} = ROTORS[rotorType - 1];
  const turnoverIndex = ALPHABET.indexOf(turnover);
  return turnoverIndex;
}

/**
 * Create a rotor list based on a selection of their type indices
 * @param {number[]} rotorTypes
 * @returns {Rotor[]} The selected rotors inital settings
 */
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

/**
 * Increment the position of the rotor
 * @param {Rotor} rotor
 */
function incrementPosition(rotor) {
  rotor.position += 1;
  rotor.position %= 26;
  rotor.updated = true;
}

/**
 * Update the rotor's position depending on its position in the box
 * @param {Rotor} rotor
 * @param {number} index
 * @param {Rotor[]} rotorList
 */
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

/**
 * Update positions accurately with each type
 * @param {Rotor[]} rotors
 */
function updateRotorsPositions(rotors) {
  // Reversing the rotors in both places is the fastest way to update them
  // Avoid mutating the original rotors by cloning the objects
  const newRotors = rotors.map((rotor) => ({...rotor})).reverse();
  const newRotorState = newRotors.map(updateTurnover).reverse();
  return newRotorState;
}

export {ALPHABET, ROTORS, encodeChar, getRotors, updateRotorsPositions};
