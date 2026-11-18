import * as React from 'react';
import {usePlugboardContext} from '../context';
import {getPairs, getPendingPlug, isConnected} from '../../utils/plugboard';

/** The plugboard follows the keyboard's QWERTZ layout, like the original */
const ROWS = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];
const PITCH = 36;
const ROW_HEIGHT = 46;
const SOCKET = 30;
const WIDTH = ROWS[0].length * PITCH;
const HEIGHT = ROWS.length * ROW_HEIGHT;

const CABLE_COLORS = ['--cable-1', '--cable-2', '--cable-3', '--cable-4'];

/** Centre of each socket, shared by the buttons and the cables */
const SOCKETS = new Map(
  ROWS.flatMap((row, rowIndex) =>
    [...row].map((letter, column) => {
      const offset = rowIndex === 1 ? PITCH / 2 : 0;
      return [
        letter,
        {
          x: offset + column * PITCH + PITCH / 2,
          y: rowIndex * ROW_HEIGHT + SOCKET / 2 + 4,
        },
      ] as const;
    }),
  ),
);

function cablePath(plug: string, match: string) {
  const from = SOCKETS.get(plug)!;
  const to = SOCKETS.get(match)!;
  const sag = Math.max(from.y, to.y) + 18 + Math.abs(from.x - to.x) / 8;
  const middle = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} Q ${middle} ${sag} ${to.x} ${to.y}`;
}

/**
 * Allows variable reconfiguration of the machine by the operator.
 * In short, each letter can be substitued by another
 * @see https://en.wikipedia.org/wiki/Enigma_machine#Plugboard
 */
export function PlugBoard({onToggle}: {onToggle: (letter: string) => void}) {
  const [connections] = usePlugboardContext();
  const pending = getPendingPlug(connections);
  const pairs = getPairs(connections);

  function describe(letter: string) {
    const match = connections.get(letter);
    if (letter === pending) return `Plug ${letter}, waiting for a partner`;
    if (isConnected(match)) return `Plug ${letter}, connected to ${match}`;
    return `Plug ${letter}`;
  }

  return (
    <fieldset className="plugboard">
      <legend>Plugboard</legend>
      <div className="plugboard-grid" style={{width: WIDTH, height: HEIGHT}}>
        <svg
          className="cables"
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          aria-hidden="true"
        >
          {pairs.map(([plug, match], index) => (
            <path
              key={`${plug}${match}`}
              d={cablePath(plug, match)}
              style={{
                stroke: `var(${CABLE_COLORS[index % CABLE_COLORS.length]})`,
              }}
            />
          ))}
        </svg>
        {[...SOCKETS].map(([letter, {x, y}]) => (
          <button
            key={letter}
            type="button"
            className="socket"
            data-connected={isConnected(connections.get(letter)) || undefined}
            aria-pressed={letter === pending}
            aria-label={describe(letter)}
            style={{left: x - SOCKET / 2, top: y - SOCKET / 2}}
            onClick={() => onToggle(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <p className="hint" aria-live="polite">
        {pending
          ? `Pick a letter to connect to ${pending}, or ${pending} again to cancel.`
          : 'Click two letters to cable them together. Click a cabled letter to unplug it. Changing cables starts a new message.'}
      </p>
    </fieldset>
  );
}
