import * as React from 'react';
import {useRotorContext} from '../context/index';
import {Rotor} from './rotor';

/**
 * Renders and handle swapping out the rotors.
 * Passing the reflector to conserve its type when
 * changing the setup
 * @param {{reflector: Reflector}}
 */
export function Spindle({reflector = 'B'}) {
  const [{rotors}, dispatch] = useRotorContext();
  const [types, setTypes] = React.useState([1, 2, 3]);

  function handleSelectionCHange(currentType) {
    return function changeTypes(e) {
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

      setTypes(newTypes);
    };
  }

  React.useEffect(() => {
    const payload = {types, reflector};
    dispatch({type: 'setup', payload});
  }, [dispatch, types, reflector]);

  return rotors.map(({rotorType, position, key}) => (
    <Rotor
      key={key}
      type={rotorType}
      position={position}
      onChange={handleSelectionCHange}
    />
  ));
}
