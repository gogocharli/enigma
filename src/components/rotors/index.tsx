import * as React from 'react';
import {Reflector} from 'src/types';
import {Spindle} from './spindle';

/**
 * Original reflectors used for the machine
 * @see https://en.wikipedia.org/wiki/Enigma_rotor_details#Rotor_wiring_tables
 */
const reflectorTypes = [
  'A',
  'B',
  'B-thin',
  'Beta',
  'C',
  'C-thin',
  'ETW',
  'Gamma',
];

export function RotorBox() {
  const [reflector, setReflector] = React.useState<Reflector>('B-thin');

  return (
    <>
      <ReflectorSelect
        selected={reflector}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setReflector(e.target.value as Reflector)
        }
      />
      <Spindle reflector={reflector} />
    </>
  );
}

interface ReflectorSelectProps {
  selected: Reflector;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

/**
 * Change reflectors on the fly.
 * Note that this will reset the encoded text
 * @param {{selected: Reflector; onChange: function}}
 */
function ReflectorSelect({selected, onChange}: ReflectorSelectProps) {
  return (
    <label htmlFor="reflector">
      <p>Reflector</p>
      <select id="reflector" value={selected} onChange={onChange}>
        {reflectorTypes.map((reflector) => (
          <option key={reflector} value={reflector}>
            {reflector}
          </option>
        ))}
      </select>
    </label>
  );
}
