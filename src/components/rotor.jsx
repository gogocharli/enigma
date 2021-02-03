import * as React from 'react';
import PropTypes from 'prop-types';
import {ALPHABET} from '../utils/rotors';
import {useRotorContext} from './context/index';

function RotorBox({setup}) {
  const [{rotors}, dispatch] = useRotorContext();

  React.useEffect(() => {
    dispatch({type: 'setup', payload: setup});
  }, [dispatch, setup]);

  return rotors.map(({rotorType, position, key}) => (
    <Rotor key={key} type={rotorType} position={position} />
  ));
}

function Rotor({type, position}) {
  const [, dispatch] = useRotorContext();

  function handlePositionChange(e) {
    const currentPosition = +e.target.value;
    dispatch({type: 'position', payload: {type, position: currentPosition}});
  }

  return (
    <div id={`rotor-${type}`} className="rotor">
      <p>{`I am a type ${type} rotor`}</p>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor={`range${type}`}>Indicator Setting (Grundstellung)</label>
      <p>Position: {ALPHABET[position]}</p>
      <input
        type="range"
        id={`range${type}`}
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

export {RotorBox};
