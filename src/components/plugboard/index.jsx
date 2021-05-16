import React from 'react';
import {ALPHABET} from '../../utils/rotors';
import {usePlugboardContext} from '../context/index';
import {CHECKED, INDETERMINATE, UNCHECKED, PENDING} from './state';
import {Plug} from './plug';

const plugOptions = ALPHABET.split('');
/**
 * Allows variable reconfiguration of the machine by the operator.
 * In short, each letter can be substitued by another
 * @see https://en.wikipedia.org/wiki/Enigma_machine#Plugboard
 */
export function PlugBoard() {
  const [connections, setConnections] = usePlugboardContext();

  /**
   * @param {InputEvent} event
   */
  function handleConnectionChange(event) {
    event.preventDefault();
    const currentPlug = event.target.id;
    let match = null;

    match = connections.get(currentPlug);
    const isChecked = Boolean(match) && ALPHABET.includes(match);

    // Remove the connection if it existed before
    // Remove the pending state if the current target is already pending
    if (match === PENDING || isChecked) {
      removeConnection(setConnections, currentPlug, match);
      return;
    }

    // Check if any other connection is pending
    [match] =
      Array.from(connections).find(([, status]) => status === PENDING) ?? [];

    // Make the connection if another pending state exists
    if (match) {
      makeConnection(setConnections, currentPlug, match);
      return;
    }

    // If no pending state, assing the current one to pending
    initConnection(setConnections, currentPlug);
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
 * Open a new connection by setting the plug state as PENDING
 * @param {Function} setConnections Dispatch Function
 * @param {string} plug the plug to initialize
 */
function initConnection(setConnections, plug) {
  setConnections(
    createNewMap((l) => {
      if (l[0] === plug) l[1] = PENDING;
      return l;
    }),
  );
}

/**
 * Close the previous open connection from its PENDING state
 * @param {Function} setConnections Dispatch Function
 * @param {string} plug the plug to close the connection
 * @param {string} match the matching plug
 */
function makeConnection(setConnections, plug, match) {
  setConnections(
    createNewMap((tuple) => {
      let [currentPlug, currentMatch] = tuple;

      if (currentPlug === plug) currentMatch = match;
      if (currentPlug === match) currentMatch = plug;

      return [currentPlug, currentMatch];
    }),
  );
}

/**
 * Remove the connection between the plug and its match
 * or the current PENDING state if no match
 * @param {Function} setConnections Dispatch Function
 * @param {string} plug
 * @param {string | null} match
 */
function removeConnection(setConnections, plug, match) {
  setConnections(
    createNewMap((tuple) => {
      let [currentPlug, currentMatch] = tuple;

      if (currentPlug === plug) currentMatch = null;
      if (currentPlug === match) currentMatch = null;

      return [currentPlug, currentMatch];
    }),
  );
}

/**
 * Creates a new
 * @param {string | null} matchVal
 */
function getStatus(matchVal) {
  switch (matchVal) {
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
