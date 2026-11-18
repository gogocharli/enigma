import * as React from 'react';
import type {Reflector} from '../../types';
import {DEFAULT_REFLECTOR, REFLECTOR_TYPES} from '../../utils/rotors';
import {Spindle} from './spindle';

export function RotorBox() {
  const [reflector, setReflector] =
    React.useState<Reflector>(DEFAULT_REFLECTOR);

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
        {REFLECTOR_TYPES.map((reflector) => (
          <option key={reflector} value={reflector}>
            {reflector}
          </option>
        ))}
      </select>
    </label>
  );
}
