import * as React from 'react';
import PropTypes from 'prop-types';
import {ALPHABET} from '../../utils/rotors';
import {useRotorContext} from '../context/index';

const rotorTypes = ['I', 'II', 'III', 'IV', 'V'];

export function Rotor({type: currentType, position, onChange}) {
  const [, dispatch] = useRotorContext();

  function handlePositionChange(e) {
    const currentPosition = +e.target.value;
    dispatch({
      type: 'position',
      payload: {type: currentType, position: currentPosition},
    });
  }

  return (
    <div id={`rotor-${currentType}`} className="rotor">
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
    </div>
  );
}

Rotor.propTypes = {
  type: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired,
  onChange: PropTypes.func,
};

function RotorSelect({selected, onChange}) {
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

RotorSelect.propTypes = {
  selected: PropTypes.number.isRequired,
  onChange: PropTypes.func,
};
