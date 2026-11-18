/**
 * Action types for the reducer
 */
export type ActionTypes =
  'setup' | 'position' | 'encode' | 'jump' | 'rewind' | 'reset';

export type ActionPayload = {
  position: number;
  type: number;
  rotors: Rotor[];
  types: number[];
  /** The key pressed on the keyboard */
  key: string;
  /** The key after passing through the plugboard */
  updateChar: string;
  reflector: Reflector;
};

/**
 * Possible reducer actions for the rotors' box
 */
export interface Action {
  type: ActionTypes;
  payload: Partial<ActionPayload>;
}

export interface Rotor {
  key: string;
  rotorType: number;
  position: number;
  turnover: number;
}

/**
 * The current state of all selected rotors
 */
export interface RotorState {
  rotors: Rotor[];
  reflector: Reflector;
  plainText: string;
  encodedText: string;
  lastAction: ActionTypes;
}

/**
 * A collection of the previous values from the rotor box
 */
export interface RotorStateCache {
  step: number;
  setStep: () => void;
  history: RotorState;
  setHistory: () => void;
}

/**
 * Different reflector types. Only true reflectors: the entry wheel (ETW) and
 * the M4's thin rotors (Beta, Gamma) would break the machine's guarantees.
 */
export type Reflector = 'A' | 'B' | 'C' | 'B-thin' | 'C-thin';

/**
 * One step of a key press through the machine. Contacts are housing
 * positions, from 0 (A) to 25 (Z).
 */
export interface TraceStage {
  part: 'plugboard' | 'rotor' | 'reflector';
  direction: 'forward' | 'return';
  /** Position of the rotor in the box, 0 being the leftmost */
  rotorIndex?: number;
  input: number;
  output: number;
}

/**
 * Defines a key-value pair for each plug and its match
 */
export type Connections = Map<string, string | null>;

/**
 * Everything needed to set the machine up before a message
 */
export interface MachineSetup {
  types: number[];
  positions: number[];
  reflector: Reflector;
  connections: Connections;
}
