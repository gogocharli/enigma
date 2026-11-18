import {describe, expect, test} from 'vitest';
import fc from 'fast-check';
import {ALPHABET, REFLECTOR_TYPES} from './rotors';
import {
  ROTOR_NAMES,
  parseConfig,
  readSetupFromLocation,
  serializeConfig,
  type ConfigErrorCode,
  type MachineConfig,
} from './config';

const validConfig: fc.Arbitrary<MachineConfig> = fc
  .record({
    rotors: fc.shuffledSubarray(ROTOR_NAMES, {minLength: 3, maxLength: 3}),
    positions: fc
      .array(fc.constantFrom(...ALPHABET), {minLength: 3, maxLength: 3})
      .map((letters) => letters.join('')),
    reflector: fc.constantFrom(...REFLECTOR_TYPES),
    plugLetters: fc.shuffledSubarray([...ALPHABET]),
  })
  .map(({plugLetters, rotors, ...config}) => {
    const plugs: string[] = [];
    for (let i = 0; i + 1 < plugLetters.length; i += 2) {
      plugs.push(plugLetters[i] + plugLetters[i + 1]);
    }
    return {...config, rotors: rotors as MachineConfig['rotors'], plugs};
  });

const fromQuery = (query: string) =>
  parseConfig(Object.fromEntries(new URLSearchParams(query)));

function codesFor(input: unknown): ConfigErrorCode[] {
  const result = parseConfig(input);
  return result.ok ? [] : result.errors.map(({code}) => code);
}

describe('parseConfig', () => {
  test('reads back every configuration it serializes', () => {
    fc.assert(
      fc.property(validConfig, (config) => {
        expect(fromQuery(serializeConfig(config))).toEqual({ok: true, config});
      }),
    );
  });

  test('fills missing fields with the default machine', () => {
    expect(parseConfig({})).toEqual({
      ok: true,
      config: {
        rotors: ['I', 'II', 'III'],
        positions: 'AAA',
        reflector: 'B',
        plugs: [],
      },
    });
  });

  test('accepts lowercase input', () => {
    const result = parseConfig({
      rotors: 'ii,iv,i',
      pos: 'eqv',
      reflector: 'b-thin',
      plugs: 'ak',
    });
    expect(result).toEqual({
      ok: true,
      config: {
        rotors: ['II', 'IV', 'I'],
        positions: 'EQV',
        reflector: 'B-thin',
        plugs: ['AK'],
      },
    });
  });

  test.each<[string, unknown, ConfigErrorCode]>([
    ['not an object', 'rotors=I,II,III', 'not-an-object'],
    ['a field that is not text', {rotors: ['I', 'II', 'III']}, 'not-text'],
    ['two rotors', {rotors: 'I,II'}, 'wrong-rotor-count'],
    ['a rotor that does not exist', {rotors: 'I,II,VI'}, 'unknown-rotor'],
    ['the same rotor twice', {rotors: 'I,I,II'}, 'duplicate-rotor'],
    ['a position that is not a letter', {pos: 'A1A'}, 'bad-position'],
    ['too few positions', {pos: 'AA'}, 'bad-position'],
    ['the entry wheel as a reflector', {reflector: 'ETW'}, 'unknown-reflector'],
    ['a thin rotor as a reflector', {reflector: 'Beta'}, 'unknown-reflector'],
    ['a cable with one end', {plugs: 'A'}, 'bad-pair'],
    ['a letter plugged into itself', {plugs: 'AA'}, 'plug-self'],
    ['a letter with two cables', {plugs: 'AB,BC'}, 'plug-reused'],
  ])('rejects %s', (_, input, code) => {
    expect(codesFor(input)).toContain(code);
  });

  test('names what went wrong so it can be fixed', () => {
    const result = parseConfig({reflector: 'ETW'});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].message).toBe(
        'Unknown reflector "ETW". Use one of A, B, C, B-thin, C-thin.',
      );
    }
  });

  test('never throws, whatever it is given', () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        expect(() => parseConfig(input)).not.toThrow();
      }),
    );
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.constantFrom('rotors', 'pos', 'reflector', 'plugs'),
          fc.string(),
        ),
        (input) => {
          const result = parseConfig(input);
          expect(typeof result.ok).toBe('boolean');
        },
      ),
    );
  });
});

describe('readSetupFromLocation', () => {
  test('falls back to the default machine and reports the errors', () => {
    const {setup, errors} = readSetupFromLocation('?rotors=I,I,II');
    expect(setup.types).toEqual([1, 2, 3]);
    expect(errors.map(({code}) => code)).toEqual(['duplicate-rotor']);
  });

  test('ignores links without machine settings', () => {
    expect(readSetupFromLocation('?utm_source=newsletter').errors).toEqual([]);
  });
});
