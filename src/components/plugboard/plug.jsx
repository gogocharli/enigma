import React from 'react';
import PropTypes from 'prop-types';
import {CHECKED, INDETERMINATE, UNCHECKED} from './state';

export function Plug({letter, status, onChange}) {
  return (
    <label htmlFor={letter}>
      {letter}
      <input
        type="checkbox"
        id={letter}
        ref={(input) => {
          /*
            Ref input is called with null by React the first time
            @see https://reactjs.org/docs/refs-and-the-dom.html#caveats-with-callback-refs
           */
          if (input == null) return;

          if (status === CHECKED) input.checked = true;
          if (status === INDETERMINATE) input.indeterminate = true;

          if (status === UNCHECKED) {
            input.checked = false;
            input.indeterminate = false;
          }
        }}
        /* The key is set to explicitely ask React to re-render the input when the status changes. Otherwise it doesn't care */
        key={status}
        onChange={onChange}
      />
    </label>
  );
}

Plug.propTypes = {
  letter: PropTypes.string.isRequired,
  status: PropTypes.number.isRequired,
  onChange: PropTypes.func,
};
