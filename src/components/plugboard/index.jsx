import React, {useState} from 'react';
import {ALPHABET} from '../../utils/rotors';
import {CHECKED, INDETERMINATE, UNCHECKED, PENDING} from './state';
import {Plug} from './plug';

const plugOptions = ALPHABET.split('');
/**
 * Allows variable reconfiguration of the machine by the operator.
 * In short, each letter can be substitued by another
 * @see https://en.wikipedia.org/wiki/Enigma_machine#Plugboard
 */
export function PlugBoard() {
  const [connections, setConnections] = useState(
    () => new Map(plugOptions.map((el) => [el, null])),
  );

  function handleConnectionChange(e) {
    e.preventDefault();
    const letter = e.target.id;
    let sibling = null;

    // Remove the connection if it existed before
    sibling = connections.get(letter);
    const isChecked = Boolean(sibling) && ALPHABET.includes(sibling);
    if (isChecked) {
      setConnections(
        createNewMap((letterMatch) => {
          let [currentLetter, currentMatch] = letterMatch;

          // Remove the two letters as siblings
          if (currentLetter === letter) currentMatch = null;
          if (currentLetter === sibling) currentMatch = null;

          return [currentLetter, currentMatch];
        }),
      );
      return;
    }

    // Check if any other connection is pending
    [sibling] =
      Array.from(connections).find(([, status]) => status === PENDING) ?? [];

    // Close the connection if another pending state exists
    if (sibling) {
      setConnections(
        createNewMap((letterMatch) => {
          let [currentLetter, currentMatch] = letterMatch;

          // Assing the two letters as each other siblings
          if (currentLetter === letter) currentMatch = sibling;
          if (currentLetter === sibling) currentMatch = letter;

          return [currentLetter, currentMatch];
        }),
      );
      return;
    }

    // If no pending state, assing the current one to pending
    setConnections(
      createNewMap((l) => {
        if (l[0] === letter) l[1] = PENDING;
        return l;
      }),
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

/**
 * Creates a new
 * @param {string} siblingVal
 */
function getStatus(siblingVal) {
  switch (siblingVal) {
    case null:
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

/** Apply callback function to each element of 
the previous map and returns a new one */
const createNewMap = (callbackFn) => (previousMap) =>
  new Map([...previousMap].map(callbackFn));
