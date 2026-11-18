/*
|--------------------------------------------------------------------------
| Plugboard connections
|--------------------------------------------------------------------------
|
| Each letter maps to its partner, to PENDING while a cable is half plugged,
| or to null when it's free. Every helper returns a new map so the state can
| be used directly with React's setState.
*/

import type {Connections} from '../types';

const PENDING = 'PENDING';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Builds the connections from cable pairs, e.g. ['AK', 'QZ']
 */
function createConnections(pairs: string[] = []): Connections {
  const connections: Connections = new Map(LETTERS.map((l) => [l, null]));
  for (const [plug, match] of pairs) {
    connections.set(plug, match);
    connections.set(match, plug);
  }
  return connections;
}

/**
 * Lists every completed cable once, e.g. ['AK', 'QZ']
 */
function getPairs(connections: Connections) {
  return [...connections]
    .filter(([plug, match]) => isConnected(match) && plug < match)
    .map(([plug, match]) => `${plug}${match}`);
}

type ConnectionsUpdate = (previous: Connections) => Connections;

/**
 * Apply callback function to each element of the previous map and returns a new one
 */
function createNewMap(
  cb: (entry: [string, string | null]) => [string, string | null],
): ConnectionsUpdate {
  return (previousMap) => new Map([...previousMap].map(cb));
}

/**
 * Whether the plug is cabled to another letter
 */
function isConnected(match: string | null | undefined): match is string {
  return !!match && match !== PENDING;
}

/**
 * Replace a letter with its current plugboard match
 */
function swapThroughPlugboard(connections: Connections, letter: string) {
  const match = connections.get(letter);
  return isConnected(match) ? match : letter;
}

/**
 * Replace every letter of the text with its current plugboard match
 */
function encodeThroughPlugboard(connections: Connections, text: string) {
  return text
    .split('')
    .map((letter) => swapThroughPlugboard(connections, letter))
    .join('');
}

/**
 * The plug still waiting for its other end, if any
 */
function getPendingPlug(connections: Connections) {
  const [plug] = [...connections].find(([, match]) => match === PENDING) ?? [];
  return plug;
}

/**
 * Open a new connection by setting the plug state as PENDING
 */
function initConnection(plug: string): ConnectionsUpdate {
  return createNewMap(([letter, match]) => [
    letter,
    letter === plug ? PENDING : match,
  ]);
}

/**
 * Complete the pending connection between the two plugs
 */
function makeConnection(plug: string, match: string): ConnectionsUpdate {
  return createNewMap(([letter, current]) => {
    if (letter === plug) return [letter, match];
    if (letter === match) return [letter, plug];
    return [letter, current];
  });
}

/**
 * Remove the connection between the plug and its match,
 * or the pending state if it has no match
 */
function removeConnection(
  plug: string,
  match: string | null | undefined,
): ConnectionsUpdate {
  return createNewMap(([letter, current]) => [
    letter,
    letter === plug || letter === match ? null : current,
  ]);
}

/**
 * Plug a socket in: clicking a connected or pending socket unplugs it,
 * otherwise it either completes the pending cable or starts a new one.
 * A socket that's already in use can never receive a second cable.
 */
function toggleSocket(connections: Connections, plug: string) {
  const match = connections.get(plug);
  if (match === PENDING || isConnected(match)) {
    return removeConnection(plug, match);
  }
  const pending = getPendingPlug(connections);
  return pending ? makeConnection(plug, pending) : initConnection(plug);
}

export {
  PENDING,
  createConnections,
  getPairs,
  isConnected,
  swapThroughPlugboard,
  encodeThroughPlugboard,
  getPendingPlug,
  toggleSocket,
};
