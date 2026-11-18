/*
|--------------------------------------------------------------------------
| Properties that must hold for every valid configuration
|--------------------------------------------------------------------------
|
| fast-check generates random machines (any 3 distinct rotors, any
| positions, any reflector, 0 to 13 cables) and random messages, then
| shrinks any failure down to the smallest setup that breaks the rule.
|
*/

import {describe, expect, test} from 'vitest';
import fc from 'fast-check';
import type {Connections, Reflector, Rotor} from '../types';
import {
  ALPHABET,
  REFLECTOR_TYPES,
  getRotors,
  initReflector,
  traceChar,
  updateRotorsPositions,
} from './rotors';
import {
  createConnections,
  encodeThroughPlugboard,
  swapThroughPlugboard,
} from './plugboard';

interface Machine {
  rotors: Rotor[];
  reflector: Reflector;
  connections: Connections;
}

const letter = fc.constantFrom(...ALPHABET);

const machine = fc
  .record({
    types: fc.shuffledSubarray([1, 2, 3, 4, 5], {minLength: 3, maxLength: 3}),
    positions: fc.array(fc.integer({min: 0, max: 25}), {
      minLength: 3,
      maxLength: 3,
    }),
    reflector: fc.constantFrom(...REFLECTOR_TYPES),
    plugLetters: fc.shuffledSubarray([...ALPHABET]),
  })
  .map(({types, positions, reflector, plugLetters}): Machine => {
    const pairs: string[] = [];
    for (let i = 0; i + 1 < plugLetters.length; i += 2) {
      pairs.push(plugLetters[i] + plugLetters[i + 1]);
    }
    return {
      rotors: getRotors(types).map((rotor, index) => ({
        ...rotor,
        position: positions[index],
      })),
      reflector,
      connections: createConnections(pairs),
    };
  });

const message = fc
  .array(letter, {minLength: 1, maxLength: 60})
  .map((letters) => letters.join(''));

/** Encrypts the way the app does: step, then trace through every part */
function encrypt({rotors, reflector, connections}: Machine, text: string) {
  let current = rotors;
  return [...text]
    .map((key) => {
      current = updateRotorsPositions(current);
      const stages = traceChar(key, current, reflector, connections);
      return ALPHABET[stages.at(-1)!.output];
    })
    .join('');
}

describe('every valid machine', () => {
  test('decrypts what it encrypts with the same settings', () => {
    fc.assert(
      fc.property(machine, message, (setup, text) => {
        expect(encrypt(setup, encrypt(setup, text))).toBe(text);
      }),
    );
  });

  test('never encrypts a letter to itself', () => {
    fc.assert(
      fc.property(machine, message, (setup, text) => {
        const cipher = encrypt(setup, text);
        [...text].forEach((key, index) => expect(cipher[index]).not.toBe(key));
      }),
    );
  });

  test('gives the diagram an unbroken path from key to lamp', () => {
    fc.assert(
      fc.property(machine, letter, ({rotors, reflector, connections}, key) => {
        const stages = traceChar(key, rotors, reflector, connections);

        expect(stages.map((stage) => stage.part)).toEqual([
          'plugboard',
          'rotor',
          'rotor',
          'rotor',
          'reflector',
          'rotor',
          'rotor',
          'rotor',
          'plugboard',
        ]);
        expect(stages[0].input).toBe(ALPHABET.indexOf(key));
        stages.slice(1).forEach((stage, index) => {
          expect(stage.input).toBe(stages[index].output);
        });
      }),
    );
  });

  test('shows the same letter the board encodes', () => {
    // The board plugs the key, encodes, then plugs the result again
    fc.assert(
      fc.property(machine, letter, ({rotors, reflector, connections}, key) => {
        const plugged = swapThroughPlugboard(connections, key);
        const encoded = initReflector(reflector)(plugged, rotors);
        const stages = traceChar(key, rotors, reflector, connections);

        expect(ALPHABET[stages.at(-1)!.output]).toBe(
          encodeThroughPlugboard(connections, encoded),
        );
      }),
    );
  });

  test('has a plugboard that swaps letters in pairs', () => {
    fc.assert(
      fc.property(machine, letter, ({connections}, key) => {
        const swapped = swapThroughPlugboard(connections, key);
        expect(swapThroughPlugboard(connections, swapped)).toBe(key);
      }),
    );
  });
});
