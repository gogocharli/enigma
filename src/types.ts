/**
 * Action types for the reducer
 */
export type ActionTypes =
  | 'setup'
  | 'init'
  | 'position'
  | 'encode'
  | 'jump'
  | 'reset';

export type ActionPayload = {
  position: number;
  type: number;
  rotors: Rotor[];
  types: number[];
  plainText: string;
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
  updated: boolean;
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
 * Different reflector types
 */
export type Reflector =
  | 'A'
  | 'B'
  | 'B-thin'
  | 'Beta'
  | 'C'
  | 'C-thin'
  | 'ETW'
  | 'Gamma';

/**
 * Defines a key-value pair for each plug and its match
 */
export type Connections = Map<string, string | null>;

export interface PlugState {
  letter: string;
  status: -1 | 0 | 1;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}
