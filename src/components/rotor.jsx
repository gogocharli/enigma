import * as React from 'react';
import PropTypes from 'prop-types';
import {ALPHABET} from '../utils/rotors';
import {useRotorContext} from './context/index';

const rotorTypes = ['I', 'II', 'III', 'IV', 'V'];

function RotorBox() {
  const [{rotors}, dispatch] = useRotorContext();
  const [types, setTypes] = React.useState([1, 2, 3]);

  React.useEffect(() => {
    dispatch({type: 'setup', payload: types});
  }, [dispatch, types]);

  return rotors.map(({rotorType, position, key}) => (
    <Rotor key={key} type={rotorType} position={position} />
  ));
}

function Rotor({type: currentType, position}) {
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
      <RotorSelect selected={currentType} />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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
};

function RotorSelect({selected}) {
  return (
    <select value={selected}>
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
};

export {RotorBox};
