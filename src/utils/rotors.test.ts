import {describe, expect, test} from 'vitest';
import type {Reflector, Rotor} from '../types';
import {
  ALPHABET,
  REFLECTORS,
  ROTORS,
  getRotors,
  initReflector,
  updateRotorsPositions,
} from './rotors';

function setRotors(types: number[], positions: string): Rotor[] {
  return getRotors(types).map((rotor, index) => ({
    ...rotor,
    position: ALPHABET.indexOf(positions[index]),
  }));
}

function encrypt(
  types: number[],
  positions: string,
  reflector: Reflector,
  text: string,
) {
  const encode = initReflector(reflector);
  let rotors = setRotors(types, positions);
  return [...text]
    .map((letter) => {
      rotors = updateRotorsPositions(rotors);
      return encode(letter, rotors);
    })
    .join('');
}

function stepThrough(types: number[], positions: string, presses: number) {
  let rotors = setRotors(types, positions);
  return Array.from({length: presses}, () => {
    rotors = updateRotorsPositions(rotors);
    return rotors.map(({position}) => ALPHABET[position]).join('');
  });
}

describe('wiring tables', () => {
  test.each([...REFLECTORS])(
    'reflector %s pairs every letter with a different letter',
    (_, wiring) => {
      [...wiring].forEach((partner, index) => {
        expect(partner).not.toBe(ALPHABET[index]);
        expect(wiring[ALPHABET.indexOf(partner)]).toBe(ALPHABET[index]);
      });
    },
  );

  test.each(ROTORS.map(({type, cipher}) => [type, cipher]))(
    'rotor %s is wired to every letter exactly once',
    (_, cipher) => {
      expect([...cipher].sort().join('')).toBe(ALPHABET);
    },
  );
});

describe('encryption', () => {
  test('matches the reference vector for Enigma I', () => {
    // Rotors I-II-III, reflector B, all at A, no plugboard
    expect(encrypt([1, 2, 3], 'AAA', 'B', 'AAAAA')).toBe('BDZGO');
  });

  test('the reflector stays fixed while the rotor next to it turns', () => {
    // Regression: the reflector used to turn along with the left rotor, so
    // turning a lone rotor only rotated the whole mapping. On the real
    // machine the reflector is fixed to the housing.
    const encode = initReflector('B');
    const mappingAt = (position: string) =>
      [...ALPHABET].map((key) =>
        ALPHABET.indexOf(encode(key, setRotors([1], position))),
      );
    const atA = mappingAt('A');

    for (let turn = 1; turn < 26; turn++) {
      const rotatedCopy = atA.map(
        (_, key) => (atA[(key + turn) % 26] - turn + 26) % 26,
      );
      expect(mappingAt(ALPHABET[turn])).not.toEqual(rotatedCopy);
    }
  });
});

describe('stepping', () => {
  test('the right rotor carries the middle one at its notch', () => {
    // Rotor III turns over from V to W
    expect(stepThrough([1, 2, 3], 'AAU', 2)).toEqual(['AAV', 'ABW']);
  });

  test('the middle rotor double steps', () => {
    expect(stepThrough([1, 2, 3], 'ADU', 3)).toEqual(['ADV', 'AEW', 'BFX']);
  });

  test('rotor V carries from Z to A', () => {
    // Regression: a notch at Z never triggered
    expect(stepThrough([1, 2, 5], 'AAZ', 1)).toEqual(['ABA']);
  });

  test('a full cycle of the right rotor moves the middle one once', () => {
    const positions = stepThrough([1, 2, 3], 'AAA', 26);
    expect(positions.at(-1)).toBe('ABA');
  });
});
