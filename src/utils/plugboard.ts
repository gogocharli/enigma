/*
|--------------------------------------------------------------------------
| Plugboard connections
|--------------------------------------------------------------------------
|
| Each letter maps to its partner, to PENDING while a cable is half plugged,
| or to null when it's free.
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

export {
  PENDING,
  createConnections,
  isConnected,
  swapThroughPlugboard,
  encodeThroughPlugboard,
};
