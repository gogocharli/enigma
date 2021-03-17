/*
|--------------------------------------------------------------------------
| Controls the flow of state inside the application
|--------------------------------------------------------------------------
|
| The overall state of the application looks like the following:
|
| rotors: The current list of rotors and their positions
| reflector: The reflector to be used for encoding
| plaintext: The current plainText content typed by the user
| encodedText: The encoded text after passing through the machine
| lastAction: An enum to track the previously initiated action by the reducer
|
*/

import {
  getRotors,
  updateRotorsPositions,
  initReflector,
} from '../../utils/rotors';

/**
 * Returns new rotor state from a specified action type
 * @param {RotorState} state
 * @param {Action} action
 * @returns {RotorState} new state
 */
function rotorReducer(state, action) {
  switch (action.type) {
    case 'setup': {
      // Choose rotors
      const {types: rotorTypes, reflector} = action.payload;
      return {
        rotors: getRotors(rotorTypes),
        reflector,
        plainText: '',
        encodedText: '',
        lastAction: 'setup',
      };
    }
    case 'position': {
      // Set position of a rotor
      const {type, position: newPosition} = action.payload;
      const {rotors: previousRotors} = state;
      const rotor = previousRotors.find(({rotorType}) => rotorType === type);
      const rotorIndex = previousRotors.indexOf(rotor);

      // Create a new object to avoid mutating the history state
      const rotorToUpdate = {...previousRotors[rotorIndex]};
      rotorToUpdate.position = newPosition;
      const updatedRotors = [...previousRotors];
      updatedRotors[rotorIndex] = rotorToUpdate;

      return {
        ...state,
        rotors: updatedRotors,
        lastAction: 'position',
      };
    }
    case 'encode': {
      // Transform plainText into encodedText
      const {rotors: previousRotors, encodedText, reflector} = state;

      // When a key is pressed, the rotor moves position before encoding
      const updatedRotors = updateRotorsPositions(previousRotors);

      // Get the corresponding character from the cypher
      const {plainText, updateChar} = action.payload;
      const encodeChar = initReflector(reflector);
      const newCipherChar = encodeChar(updateChar, updatedRotors);
      return {
        ...state,
        rotors: updatedRotors,
        plainText,
        encodedText: encodedText + newCipherChar,
        lastAction: 'encode',
      };
    }
    case 'jump': {
      // Go back to a previous state
      return {
        ...state,
        ...action.payload,
        lastAction: 'jump',
      };
    }
    case 'reset':
      return initRotors(action.payload);
    default:
      throw new Error(`Invalid action type "${action.type}" in rotorReducer`);
  }
}

/**
 * Create the default state from a set of rotor types
 * @param {Rotor[]} initialTypes
 * @returns {RotorState}
 */
function initRotors(initialTypes) {
  const rotors = getRotors(initialTypes);
  return {
    rotors,
    reflector: '',
    plainText: '',
    encodedText: '',
    lastAction: 'init',
  };
}

export {rotorReducer, initRotors};
