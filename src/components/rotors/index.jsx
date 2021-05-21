// Number of rotors
// Reflector used
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
function ReflectorSelect({selected, onChange}) {
  return (
    <select value={selected} onChange={onChange}>
      {reflectorTypes.map((reflector) => (
        <option key={reflector} value={reflector}>
          {reflector}
        </option>
      ))}
    </select>
  );
}

ReflectorSelect.propTypes = {
  selected: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};
