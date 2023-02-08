import React from 'react';
import type {PlugState} from 'src/types';
import {CHECKED, INDETERMINATE, UNCHECKED} from './state';

/**
 * An individual plug which state is controlled by the Plugboard.
 * The checkbox input can either be:
 * - Unchecked: The plug is not connected to any other
 * - Indeterminate: The plug has been selected but no match is made
 * - Checked: The plug is connected to another one
 */
export function Plug({letter, status, onChange}: PlugState) {
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
        /* The key is set to explicitely ask React to re-render the input when the status changes.
           Otherwise it can re-render the entire component without running the callback ref
        */
        key={status}
        onChange={onChange}
      />
    </label>
  );
}
