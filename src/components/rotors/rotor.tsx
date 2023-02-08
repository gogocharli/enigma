import * as React from 'react';
import {ALPHABET} from '../../utils/rotors';
import {useRotorContext} from '../context/index';

const rotorTypes = ['I', 'II', 'III', 'IV', 'V'];

/**
 * Displays the internal position and type of the rotor
 */

interface RotorProps {
  type: number;
  position: number;
  onChange: (s: number) => React.ChangeEventHandler<HTMLSelectElement>;
}
export function Rotor({type: currentType, position, onChange}: RotorProps) {
  const [, dispatch] = useRotorContext();

  function handlePositionChange(e: React.ChangeEvent<HTMLInputElement>) {
    const currentPosition = Number(e.target.value);
    dispatch({
      type: 'position',
      payload: {type: currentType, position: currentPosition},
    });
  }

  return (
    <fieldset
      id={`rotor-${currentType}`}
      className="rotor"
      aria-label={`Settings Rotor ${currentType}`}
    >
      <RotorSelect selected={currentType} onChange={onChange} />
      <p>Position: {ALPHABET[position]}</p>
      <input
        type="range"
        id={`range${currentType}`}
        min="0"
        max="25"
        step="1"
        value={position}
        onChange={handlePositionChange}
      />
    </fieldset>
  );
}

/**
 * Handle selection of a new rotor type
 */

interface RotorSelectProps {
  selected: number;
  onChange: (s: number) => React.ChangeEventHandler<HTMLSelectElement>;
}
function RotorSelect({selected, onChange}: RotorSelectProps) {
  return (
    <select value={selected} onChange={onChange(selected)}>
      {rotorTypes.map((rotorType) => (
        <option key={rotorType} value={rotorTypes.indexOf(rotorType) + 1}>
          {rotorType}
        </option>
      ))}
    </select>
  );
}
