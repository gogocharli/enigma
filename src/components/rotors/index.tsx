import * as React from 'react';
import type {Reflector} from '../../types';
import {REFLECTOR_TYPES} from '../../utils/rotors';
import {useRotorContext} from '../context/index';
import {Spindle} from './spindle';

/**
 * Chooses the reflector and the rotors. The reducer's state is the single
 * source of truth for both.
 */
export function RotorBox() {
  const [{rotors, reflector}, dispatch] = useRotorContext();

  function handleReflectorChange(e: React.ChangeEvent<HTMLSelectElement>) {
    dispatch({
      type: 'setup',
      payload: {
        types: rotors.map(({rotorType}) => rotorType),
        reflector: e.target.value as Reflector,
      },
    });
  }

  return (
    <div className="rotor-box">
      <ReflectorSelect selected={reflector} onChange={handleReflectorChange} />
      <div>
        {/* Each rotor is already named; this heading is only visual */}
        <span className="control-label" aria-hidden="true">
          Rotors
        </span>
        <Spindle />
      </div>
    </div>
  );
}

interface ReflectorSelectProps {
  selected: Reflector;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

/**
 * Change reflectors on the fly.
 * Note that this will reset the encoded text
 */
function ReflectorSelect({selected, onChange}: ReflectorSelectProps) {
  return (
    <label className="reflector" htmlFor="reflector">
      <span className="control-label">Reflector</span>
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
