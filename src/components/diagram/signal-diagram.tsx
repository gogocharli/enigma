import * as React from 'react';
import type {Connections, Reflector, Rotor, TraceStage} from '../../types';
import {ALPHABET, REFLECTORS, ROTORS, throughRotor} from '../../utils/rotors';
import {swapThroughPlugboard} from '../../utils/plugboard';

/*
|--------------------------------------------------------------------------
| Geometry
|--------------------------------------------------------------------------
|
| Every part is a column with 26 contacts. The signal enters from the keys
| on the right, travels left to the reflector, and comes back to a lamp.
| Contacts are housing positions, so the same row means the same contact
| on both sides of a gap.
|
*/

const ROW = 18;
const TOP = 48;
const WIDTH = 720;
const HEIGHT = TOP + 26 * ROW + 8;

interface Column {
  left: number;
  right: number;
}

const REFLECTOR_COLUMN: Column = {left: 28, right: 76};
const ROTOR_COLUMNS: Column[] = [
  {left: 116, right: 216},
  {left: 256, right: 356},
  {left: 396, right: 496},
];
const PLUGBOARD_COLUMN: Column = {left: 536, right: 616};
const KEYS_X = 672;

const y = (contact: number) => TOP + contact * ROW + ROW / 2;
const middle = ({left, right}: Column) => (left + right) / 2;

/** Curve linking two reflector contacts, deeper for distant letters */
function reflectorArc(from: number, to: number) {
  const depth = Math.min(
    6 + Math.abs(to - from) * 1.6,
    REFLECTOR_COLUMN.right - REFLECTOR_COLUMN.left - 4,
  );
  const x = REFLECTOR_COLUMN.right;
  return `C ${x - depth} ${y(from)}, ${x - depth} ${y(to)}, ${x} ${y(to)}`;
}

function columnFor(stage: TraceStage) {
  if (stage.part === 'plugboard') return PLUGBOARD_COLUMN;
  if (stage.part === 'reflector') return REFLECTOR_COLUMN;
  return ROTOR_COLUMNS[stage.rotorIndex ?? 0];
}

/**
 * Turns the trace into two SVG paths: towards the reflector, and back.
 * Each stage crosses its column from the edge the signal enters by to the
 * edge it leaves by; the straight runs in between are the gaps.
 */
function tracePaths(stages: TraceStage[]) {
  const forward: string[] = [];
  const back: string[] = [];

  for (const stage of stages) {
    const column = columnFor(stage);
    if (stage.part === 'reflector') {
      // The forward path crosses the last gap; the return starts with the turn
      forward.push(`L ${column.right} ${y(stage.input)}`);
      back.push(
        `M ${column.right} ${y(stage.input)}`,
        reflectorArc(stage.input, stage.output),
      );
    } else if (stage.direction === 'forward') {
      if (forward.length === 0) {
        forward.push(`M ${KEYS_X - 12} ${y(stage.input)}`);
      }
      forward.push(
        `L ${column.right} ${y(stage.input)}`,
        `L ${column.left} ${y(stage.output)}`,
      );
    } else {
      back.push(
        `L ${column.left} ${y(stage.input)}`,
        `L ${column.right} ${y(stage.output)}`,
      );
    }
  }

  const lamp = stages.at(-1)?.output;
  if (lamp !== undefined) back.push(`L ${KEYS_X - 12} ${y(lamp)}`);

  return {forward: forward.join(' '), back: back.join(' ')};
}

/**
 * The letter carried across each gap, placed halfway along it
 */
function gapLabels(stages: TraceStage[]) {
  const gapAfter = (stage: TraceStage) => {
    const column = columnFor(stage);
    // Forward signals leave by the left edge, returning ones by the right
    const exitsLeft = stage.direction === 'forward';
    const columns = [
      REFLECTOR_COLUMN,
      ...ROTOR_COLUMNS,
      PLUGBOARD_COLUMN,
      {left: KEYS_X - 12, right: KEYS_X - 12},
    ];
    const index = columns.indexOf(column);
    const neighbour = columns[exitsLeft ? index - 1 : index + 1];
    const edge = exitsLeft ? column.left : column.right;
    const across = exitsLeft ? neighbour.right : neighbour.left;
    return (edge + across) / 2;
  };

  return stages.map((stage, index) => ({
    key: index,
    x: gapAfter(stage),
    y: y(stage.output),
    letter: ALPHABET[stage.output],
    direction: stage.direction,
  }));
}

interface SignalDiagramProps {
  rotors: Rotor[];
  reflector: Reflector;
  connections: Connections;
  trace: TraceStage[];
  /** Changes on every key press so the path draws again */
  pressId: string;
}

export function SignalDiagram({
  rotors,
  reflector,
  connections,
  trace,
  pressId,
}: SignalDiagramProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const key = trace[0] ? ALPHABET[trace[0].input] : undefined;
  const lamp = trace.at(-1) ? ALPHABET[trace.at(-1)!.output] : undefined;
  const paths = tracePaths(trace);
  const reflectorWiring = REFLECTORS.get(reflector) ?? '';

  return (
    <figure className="signal">
      <div className="signal-scroll">
        <svg
          className="signal-diagram"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
        >
          <title id={titleId}>
            {key ? `Signal path for key ${key}` : 'Wiring of the machine'}
          </title>
          <desc id={descriptionId}>
            {key
              ? `Pressing ${key} sends current through the plugboard, the three rotors and reflector ${reflector}, then back to lamp ${lamp}.`
              : 'Press a key to send current through the machine.'}
          </desc>

          <ColumnHeader
            column={REFLECTOR_COLUMN}
            label="Reflector"
            value={reflector}
          />
          {rotors.map((rotor, index) => (
            <ColumnHeader
              key={rotor.key}
              column={ROTOR_COLUMNS[index]}
              label={`Rotor ${ROTORS[rotor.rotorType - 1].type}`}
              value={ALPHABET[rotor.position]}
              valueKey={rotor.position}
            />
          ))}
          <ColumnHeader column={PLUGBOARD_COLUMN} label="Plugboard" />
          <text className="column-label" x={KEYS_X} y={20} textAnchor="middle">
            Keys
          </text>

          {/* Housings */}
          {[REFLECTOR_COLUMN, ...ROTOR_COLUMNS, PLUGBOARD_COLUMN].map(
            (column) => (
              <rect
                key={column.left}
                className="housing"
                x={column.left}
                y={TOP - 4}
                width={column.right - column.left}
                height={26 * ROW + 8}
                rx={6}
              />
            ),
          )}

          {/* Reflector pairs */}
          <g className="wiring">
            {[...reflectorWiring].map((letter, contact) => {
              const partner = ALPHABET.indexOf(letter);
              if (partner < contact) return null;
              return (
                <path
                  key={contact}
                  d={`M ${REFLECTOR_COLUMN.right} ${y(contact)} ${reflectorArc(contact, partner)}`}
                />
              );
            })}
          </g>

          {/* Rotor wiring, redrawn for the current position */}
          {rotors.map((rotor, index) => {
            const column = ROTOR_COLUMNS[index];
            return (
              <g
                key={`${rotor.key}-${rotor.position}`}
                className="wiring rotor-wiring"
              >
                {ALPHABET.split('').map((_, contact) => (
                  <line
                    key={contact}
                    x1={column.right}
                    y1={y(contact)}
                    x2={column.left}
                    y2={y(throughRotor(rotor, contact, 'forward'))}
                  />
                ))}
              </g>
            );
          })}

          {/* Plugboard swaps */}
          <g className="wiring">
            {ALPHABET.split('').map((letter, contact) => (
              <line
                key={letter}
                x1={PLUGBOARD_COLUMN.right}
                y1={y(contact)}
                x2={PLUGBOARD_COLUMN.left}
                y2={y(
                  ALPHABET.indexOf(swapThroughPlugboard(connections, letter)),
                )}
              />
            ))}
          </g>

          {/* Keys and lamps */}
          {ALPHABET.split('').map((letter, contact) => (
            <text
              key={letter}
              className="contact-letter"
              data-key={letter === key || undefined}
              data-lamp={letter === lamp || undefined}
              x={KEYS_X}
              y={y(contact)}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {letter}
            </text>
          ))}

          {trace.length > 0 && (
            <g key={pressId} className="trace">
              <path
                className="trace-path forward"
                d={paths.forward}
                pathLength={1}
              />
              <path
                className="trace-path return"
                d={paths.back}
                pathLength={1}
              />
              {gapLabels(trace).map((label) => (
                <g
                  key={label.key}
                  className={`gap-label ${label.direction}`}
                  style={{'--order': label.key} as React.CSSProperties}
                >
                  <circle cx={label.x} cy={label.y} r={7.5} />
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {label.letter}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
      <figcaption>
        <TraceCaption trace={trace} rotors={rotors} reflector={reflector} />
      </figcaption>
    </figure>
  );
}

function ColumnHeader({
  column,
  label,
  value,
  valueKey,
}: {
  column: Column;
  label: string;
  value?: string;
  valueKey?: number;
}) {
  return (
    <g>
      <text
        className="column-label"
        x={middle(column)}
        y={20}
        textAnchor="middle"
      >
        {label}
      </text>
      {value && (
        <text
          key={valueKey}
          className="column-value"
          x={middle(column)}
          y={38}
          textAnchor="middle"
        >
          {value}
        </text>
      )}
    </g>
  );
}

/**
 * The same path in words, for every reader
 */
function TraceCaption({
  trace,
  rotors,
  reflector,
}: {
  trace: TraceStage[];
  rotors: Rotor[];
  reflector: Reflector;
}) {
  if (trace.length === 0) {
    return (
      <p className="caption-empty">
        Press a key to send current through the machine.
      </p>
    );
  }

  const nameOf = (stage: TraceStage) => {
    if (stage.part === 'plugboard') return 'plugboard';
    if (stage.part === 'reflector') return `reflector ${reflector}`;
    const rotor = rotors[stage.rotorIndex ?? 0];
    return `rotor ${ROTORS[rotor.rotorType - 1].type}`;
  };

  return (
    <ol className="trace-caption" aria-label="Signal path">
      <li>
        <span className="stage">key</span> <b>{ALPHABET[trace[0].input]}</b>
      </li>
      {trace.map((stage, index) => (
        <li key={index} className={stage.direction}>
          <span className="stage">{nameOf(stage)}</span>{' '}
          <b>{ALPHABET[stage.output]}</b>
        </li>
      ))}
      <li className="lamp-step">
        <span className="stage">lamp</span>{' '}
        <b>{ALPHABET[trace.at(-1)!.output]}</b>
      </li>
    </ol>
  );
}
