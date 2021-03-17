/**
 * Possible actions types
 * @typedef {'setup' | 'init' | 'position'| 'encode'| 'jump'| 'reset'} Action
 */

/**
 * A Rotor
 * @typedef {Object} Rotor
 * @property {string} key
 * @property {number} rotorType
 * @property {number} position
 * @property {string} turnover
 * @property {boolean} updated - if the rotor's postion was just updated
 */

/**
 * @typedef {'A' | 'B' | 'B-thin' | 'Beta' | 'C' | 'C-thin' | 'ETW' | 'Gamma' } Reflector
 */

/**
 * Application state
 * @typedef {Object} RotorState
 * @property {Rotor[]} rotors
 * @property {Reflector} reflector
 * @property {string} plainText
 * @property {string} encodedText
 * @property {Action} lastAction
 */
