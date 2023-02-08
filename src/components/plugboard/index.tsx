import React from 'react';
import {ALPHABET} from '../../utils/rotors';
import {usePlugboardContext} from '../context';
import {CHECKED, INDETERMINATE, UNCHECKED, PENDING} from './state';
import {Plug} from './plug';
import type {Connections} from 'src/types';

const plugOptions = ALPHABET.split('');
/**
 * Allows variable reconfiguration of the machine by the operator.
 * In short, each letter can be substitued by another
 * @see https://en.wikipedia.org/wiki/Enigma_machine#Plugboard
 */
export function PlugBoard() {
  const [connections, setConnections] = usePlugboardContext();

  function handleConnectionChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const currentPlug = event.target.id;
    let match: string | null | undefined = null;

    match = connections.get(currentPlug);

    // Remove the connection if it existed before
    // Remove the pending state if the current target is already pending
    if (match === PENDING || isChecked(match)) {
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

  function isChecked(match: string | null | undefined): match is string {
    return !!match && ALPHABET.includes(match);
  }

  return (
    <fieldset className="plugboard">
      <legend>Plugboard Settings</legend>
      {plugOptions.map((letter) => (
        <Plug
          letter={letter}
          status={getStatus(connections.get(letter) ?? null)}
          onChange={handleConnectionChange}
          key={letter}
        />
      ))}
    </fieldset>
  );
}

/**
 * Open a new connection by setting the plug state as PENDING
 * @param {Function} setConnections Dispatch Function
 * @param {string} plug the plug to initialize
 */
function initConnection(
  setConnections: React.Dispatch<React.SetStateAction<Connections>>,
  plug: string,
) {
  setConnections(
    createNewMap((l) => {
      if (l[0] === plug) l[1] = PENDING;
      return l;
    }),
  );
}

/**
 * Complete the latest PENDING connection state
 * @param {Function} setConnections Dispatch Function
 * @param {string} plug the plug to close the connection
 * @param {string} match the matching plug
 */
function makeConnection(
  setConnections: React.Dispatch<React.SetStateAction<Connections>>,
  plug: string,
  match: string | null,
) {
  setConnections(
    createNewMap((tuple) => {
      let [, currentMatch] = tuple;
      const [currentPlug] = tuple;

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
function removeConnection(
  setConnections: React.Dispatch<React.SetStateAction<Connections>>,
  plug: string,
  match: string | null,
) {
  setConnections(
    createNewMap((tuple) => {
      let [, currentMatch] = tuple;
      const [currentPlug] = tuple;

      if (currentPlug === plug) currentMatch = null;
      if (currentPlug === match) currentMatch = null;

      return [currentPlug, currentMatch];
    }),
  );
}

function getStatus(matchVal: string | null) {
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
function createNewMap<T>(cb: (a: [T, T | null]) => [T, T | null]) {
  return function (previousMap: Map<T, T | null>) {
    return new Map([...previousMap].map(cb));
  };
}
