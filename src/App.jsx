import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {RotorProvider, StateHistoryProvider} from './components/context/index';
import {RotorBox} from './components/rotors/index';
import {Board} from './components/board';
import {ALPHABET} from './utils/rotors';

import './App.css';

function App() {
  return (
    <div className="App">
      <RotorProvider>
        <StateHistoryProvider>
          <RotorBox />
          <Board />
          <PlugBoard />
        </StateHistoryProvider>
      </RotorProvider>
    </div>
  );
}

const UNCHECKED = -1;
const INDETERMINATE = 0;
const CHECKED = 1;
const PENDING = 'PENDING';

const plugOptions = ALPHABET.split('');
/**
 * Allows variable reconfiguration of the machine by the operator.
 * In short, each letter can be substitued by another
 * @see https://en.wikipedia.org/wiki/Enigma_machine#Plugboard
 */
function PlugBoard() {
  const [connections, setConnections] = useState(
    () => new Map(plugOptions.map((el) => [el, ''])),
  );

  useEffect(() => {
    console.log(connections);
  }, [connections]);

  function handleConnectionChange(e) {
    e.preventDefault();
    const letter = e.target.id;
    let sibling = null;

    // Remove the connection if it existed before
    sibling = connections.get(letter);
    const isChecked = Boolean(sibling) && ALPHABET.includes(sibling);
    if (isChecked) {
      setConnections(
        (c) =>
          new Map(
            [...c].map((letterMatch) => {
              let [currentLetter, currentMatch] = letterMatch;

              // Remove the two letters as siblings
              if (currentLetter === letter) currentMatch = '';
              if (currentLetter === sibling) currentMatch = '';

              return [currentLetter, currentMatch];
            }),
          ),
      );
      return;
    }

    // Check if any other connection is pending
    [sibling] =
      Array.from(connections).find(([, status]) => status === PENDING) ?? [];

    if (sibling) {
      setConnections(
        (c) =>
          new Map(
            [...c].map((letterMatch) => {
              let [currentLetter, currentMatch] = letterMatch;

              // Assing the two letters as each other siblings
              if (currentLetter === letter) currentMatch = sibling;
              if (currentLetter === sibling) currentMatch = letter;

              return [currentLetter, currentMatch];
            }),
          ),
      );
      return;
    }

    // If no pending state, assing the current one to pending
    setConnections(
      (c) =>
        new Map(
          [...c].map((l) => {
            if (l[0] === letter) l[1] = PENDING;
            return l;
          }),
        ),
    );
  }

  return (
    <div className="plugboard">
      {plugOptions.map((letter) => (
        <Plug
          letter={letter}
          status={getStatus(connections.get(letter))}
          onChange={handleConnectionChange}
          key={letter}
        />
      ))}
    </div>
  );
}

function Plug({letter, status, onChange}) {
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

function getStatus(siblingVal) {
  switch (siblingVal) {
    case '':
      // Empty string, the input is unchecked
      return UNCHECKED;
    case PENDING:
      // Pending state, waiting for a match
      return INDETERMINATE;
    default:
      // Has a value
      return CHECKED;
  }
}
export default App;
