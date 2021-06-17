import * as React from 'react';
import PropTypes from 'prop-types';
import {Spindle} from './spindle';

export function RotorBox() {
  const [reflector, setReflector] = React.useState('B-thin');

  return (
    <>
      <ReflectorSelect
        selected={reflector}
        onChange={(e) => setReflector(e.target.value)}
      />
      <Spindle reflector={reflector} />
    </>
  );
}

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

/**
 * Change reflectors on the fly.
 * Note that this will reset the encoded text
 * @param {{selected: Reflector; onChange: function}}
 */
function ReflectorSelect({selected, onChange}) {
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

ReflectorSelect.propTypes = {
  selected: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};
