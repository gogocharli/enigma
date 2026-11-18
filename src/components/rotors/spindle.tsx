import * as React from 'react';
import {useRotorContext} from '../context/index';
import {Rotor} from './rotor';

/**
 * Renders and handle swapping out the rotors.
 * Choosing a rotor that's already in the box swaps the two, so the same
 * rotor can never be placed twice.
 */
export function Spindle() {
  const [{rotors, reflector}, dispatch] = useRotorContext();
  const types = rotors.map(({rotorType}) => rotorType);

  function handleSelectionChange(currentType: number) {
    return function changeTypes(e: React.ChangeEvent<HTMLSelectElement>) {
      const selected = Number(e.target.value);
      const targetIndex = types.indexOf(currentType);
      const newTypes = [...types];

      if (types.includes(selected)) {
        // When the rotor is already there swap their position
        const selectedIndex = types.indexOf(selected);

        newTypes.splice(targetIndex, 1, selected);
        newTypes.splice(selectedIndex, 1, currentType);
      } else {
        newTypes.splice(targetIndex, 1, selected);
      }

      dispatch({type: 'setup', payload: {types: newTypes, reflector}});
    };
  }

  return (
    <div className="spindle">
      {rotors.map(({rotorType, position, key}) => (
        <Rotor
          key={key}
          type={rotorType}
          position={position}
          onChange={handleSelectionChange}
        />
      ))}
    </div>
  );
}
