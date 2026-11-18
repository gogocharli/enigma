/*
|--------------------------------------------------------------------------
| Machine settings from the outside world
|--------------------------------------------------------------------------
|
| This is the only place where settings enter the app from outside (today a
| shared link). Everything is checked here, and a single problem rejects the
| whole configuration: the machine is never set up half-valid. Each error has
| a stable code and a message a person, or an agent writing the link, can
| act on.
|
*/

import type {Connections, MachineSetup, Reflector, Rotor} from '../types';
import {ALPHABET, DEFAULT_REFLECTOR, REFLECTOR_TYPES, ROTORS} from './rotors';
import {createConnections, getPairs} from './plugboard';

type RotorName = (typeof ROTORS)[number]['type'];

const ROTOR_NAMES: RotorName[] = ROTORS.map(({type}) => type);

export interface MachineConfig {
  /** Rotor names from left to right, e.g. ['II', 'IV', 'I'] */
  rotors: [RotorName, RotorName, RotorName];
  /** Starting letter of each rotor from left to right, e.g. 'EQV' */
  positions: string;
  reflector: Reflector;
  /** Plugboard cables as letter pairs, e.g. ['AK', 'QZ'] */
  plugs: string[];
}

export type ConfigErrorCode =
  | 'not-an-object'
  | 'not-text'
  | 'wrong-rotor-count'
  | 'unknown-rotor'
  | 'duplicate-rotor'
  | 'bad-position'
  | 'unknown-reflector'
  | 'bad-pair'
  | 'plug-self'
  | 'plug-reused';

export interface ConfigError {
  code: ConfigErrorCode;
  field: keyof MachineConfig | 'config';
  message: string;
}

export type ParseResult =
  {ok: true; config: MachineConfig} | {ok: false; errors: ConfigError[]};

/** The query parameter holding each field */
const PARAMS = {
  rotors: 'rotors',
  positions: 'pos',
  reflector: 'reflector',
  plugs: 'plugs',
} as const satisfies Record<keyof MachineConfig, string>;

const DEFAULT_CONFIG: MachineConfig = {
  rotors: ['I', 'II', 'III'],
  positions: 'AAA',
  reflector: DEFAULT_REFLECTOR,
  plugs: [],
};

const isRotorName = (name: string): name is RotorName =>
  (ROTOR_NAMES as string[]).includes(name);

const splitList = (value: string) =>
  value === '' ? [] : value.split(',').map((item) => item.trim().toUpperCase());

function parseRotors(value: string, errors: ConfigError[]) {
  const names = splitList(value);
  const field = 'rotors';

  if (names.length !== 3) {
    errors.push({
      code: 'wrong-rotor-count',
      field,
      message: `Pick exactly 3 rotors separated by commas, like "I,II,III" (got ${names.length}).`,
    });
  }

  const seen = new Set<string>();
  for (const name of names) {
    if (!isRotorName(name)) {
      errors.push({
        code: 'unknown-rotor',
        field,
        message: `Unknown rotor "${name}". Use one of ${ROTOR_NAMES.join(', ')}.`,
      });
    } else if (seen.has(name)) {
      errors.push({
        code: 'duplicate-rotor',
        field,
        message: `Rotor ${name} is used twice. Each rotor can only be placed once.`,
      });
    }
    seen.add(name);
  }

  return names as MachineConfig['rotors'];
}

function parsePositions(value: string, errors: ConfigError[]) {
  if (!/^[A-Z]{3}$/i.test(value)) {
    errors.push({
      code: 'bad-position',
      field: 'positions',
      message: `Positions must be 3 letters, one per rotor, like "AAA" (got "${value}").`,
    });
  }
  return value.toUpperCase();
}

function parseReflector(value: string, errors: ConfigError[]) {
  const reflector = REFLECTOR_TYPES.find(
    (type) => type.toLowerCase() === value.toLowerCase(),
  );
  if (!reflector) {
    errors.push({
      code: 'unknown-reflector',
      field: 'reflector',
      message: `Unknown reflector "${value}". Use one of ${REFLECTOR_TYPES.join(', ')}.`,
    });
  }
  return reflector ?? DEFAULT_REFLECTOR;
}

function parsePlugs(value: string, errors: ConfigError[]) {
  const pairs = splitList(value);
  const field = 'plugs';
  const used = new Set<string>();

  for (const pair of pairs) {
    if (!/^[A-Z]{2}$/.test(pair)) {
      errors.push({
        code: 'bad-pair',
        field,
        message: `"${pair}" isn't a pair of letters. Use two letters per cable, like "AK".`,
      });
      continue;
    }
    const [plug, match] = pair;
    if (plug === match) {
      errors.push({
        code: 'plug-self',
        field,
        message: `${plug} can't be plugged into itself.`,
      });
      continue;
    }
    for (const letter of pair) {
      if (used.has(letter)) {
        errors.push({
          code: 'plug-reused',
          field,
          message: `${letter} has more than one cable. Each letter takes one cable at most.`,
        });
      }
      used.add(letter);
    }
  }

  return pairs;
}

/**
 * Checks raw settings, e.g. the query of a shared link. Missing fields use
 * the defaults; any invalid field rejects the whole configuration.
 * Never throws.
 */
function parseConfig(input: unknown): ParseResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return {
      ok: false,
      errors: [
        {
          code: 'not-an-object',
          field: 'config',
          message:
            'Settings must be a set of named text fields, like {rotors: "I,II,III", pos: "AAA"}.',
        },
      ],
    };
  }

  const fields = input as Record<string, unknown>;
  const errors: ConfigError[] = [];

  function read(field: keyof MachineConfig): string | undefined {
    const value = fields[PARAMS[field]];
    if (value === undefined) return undefined;
    if (typeof value !== 'string') {
      errors.push({
        code: 'not-text',
        field,
        message: `"${PARAMS[field]}" must be text.`,
      });
      return undefined;
    }
    return value.trim();
  }

  const rotors = read('rotors');
  const positions = read('positions');
  const reflector = read('reflector');
  const plugs = read('plugs');

  const config: MachineConfig = {
    rotors:
      rotors === undefined
        ? DEFAULT_CONFIG.rotors
        : parseRotors(rotors, errors),
    positions:
      positions === undefined
        ? DEFAULT_CONFIG.positions
        : parsePositions(positions, errors),
    reflector:
      reflector === undefined
        ? DEFAULT_CONFIG.reflector
        : parseReflector(reflector, errors),
    plugs: plugs === undefined ? [] : parsePlugs(plugs, errors),
  };

  return errors.length > 0 ? {ok: false, errors} : {ok: true, config};
}

/**
 * Writes a configuration as a query string; parseConfig reads it back.
 * Values only ever hold letters, commas and dashes, so they stay readable.
 */
function serializeConfig(config: MachineConfig) {
  const params = [
    `${PARAMS.rotors}=${config.rotors.join(',')}`,
    `${PARAMS.positions}=${config.positions}`,
    `${PARAMS.reflector}=${config.reflector}`,
  ];
  if (config.plugs.length > 0) {
    params.push(`${PARAMS.plugs}=${config.plugs.join(',')}`);
  }
  return params.join('&');
}

/**
 * Whether a query mentions any machine setting at all
 */
function hasConfigParams(params: URLSearchParams) {
  return Object.values(PARAMS).some((param) => params.has(param));
}

function toSetup(config: MachineConfig): MachineSetup {
  return {
    types: config.rotors.map((name) => ROTOR_NAMES.indexOf(name) + 1),
    positions: [...config.positions].map((letter) => ALPHABET.indexOf(letter)),
    reflector: config.reflector,
    connections: createConnections(config.plugs),
  };
}

function fromMachine(
  rotors: Rotor[],
  reflector: Reflector,
  connections: Connections,
): MachineConfig {
  return {
    rotors: rotors.map(
      ({rotorType}) => ROTOR_NAMES[rotorType - 1],
    ) as MachineConfig['rotors'],
    positions: rotors.map(({position}) => ALPHABET[position]).join(''),
    reflector,
    plugs: getPairs(connections),
  };
}

/**
 * Reads the machine settings from the page's link. An invalid link leaves
 * the default setup in place and reports why.
 */
function readSetupFromLocation(search: string): {
  setup: MachineSetup;
  errors: ConfigError[];
} {
  const params = new URLSearchParams(search);
  if (!hasConfigParams(params)) {
    return {setup: toSetup(DEFAULT_CONFIG), errors: []};
  }
  const result = parseConfig(Object.fromEntries(params));
  return result.ok
    ? {setup: toSetup(result.config), errors: []}
    : {setup: toSetup(DEFAULT_CONFIG), errors: result.errors};
}

export {
  DEFAULT_CONFIG,
  ROTOR_NAMES,
  parseConfig,
  serializeConfig,
  toSetup,
  fromMachine,
  readSetupFromLocation,
};
export type {RotorName};
