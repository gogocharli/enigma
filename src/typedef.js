/**
 * Action types for the reducer
 * @typedef {'setup' | 'init' | 'position'| 'encode'| 'jump'| 'reset'} ActionTypes
 */

/**
 * Possible reducer actions for the rotors' box
 * @typedef {Object} Action
 * @property {ActionTypes} type
 * @property {keyof RotorState} payload
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
 * The current state of all selected rotors
 * @typedef {Object} RotorState
 * @property {Rotor[]} rotors
 * @property {Reflector} reflector
 * @property {string} plainText
 * @property {string} encodedText
 * @property {Action} lastAction
 */

/**
 * A collection of the previous values from the rotor box
 * @typedef {Object} RotorStateCache
 * @property {number} step
 * @property {function} setStep
 * @property {RotorState[]} history
 * @property {function} setHistory
 */

/**
 * Different reflector types
 * @typedef {'A' | 'B' | 'B-thin' | 'Beta' | 'C' | 'C-thin' | 'ETW' | 'Gamma' } Reflector
 */

/**
 * Defines a key-value pair for each plug and its match
 * @typedef {Map<string, string | null>} Connections
 */

/**
 * @typedef {Object} PlugState
 * @property {string} letter
 * @property {-1 | 0 | 1} status
 * @property {(event: InputEvent) => void} onChange
 */
