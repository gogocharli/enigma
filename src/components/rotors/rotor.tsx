import * as React from 'react';
import {ALPHABET, ROTORS} from '../../utils/rotors';
import {useRotorContext} from '../context/index';

// Vertical drag distance that turns the rotor by one letter
const STEP_PX = 24;

const wrap = (index: number) => (index + 26) % 26;

interface RotorProps {
  type: number;
  position: number;
  onChange: (s: number) => React.ChangeEventHandler<HTMLSelectElement>;
}

/**
 * Displays the rotor's type and the letter showing in its window.
 * The visually hidden range input stays the source of truth (keyboard,
 * screen readers); dragging the window and the buttons drive the same value.
 */
export function Rotor({type: currentType, position, onChange}: RotorProps) {
  const [, dispatch] = useRotorContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const drag = React.useRef<{startY: number; startPosition: number} | null>(
    null,
  );
  const name = ROTORS[currentType - 1].type;

  function setPosition(next: number) {
    dispatch({
      type: 'position',
      payload: {type: currentType, position: wrap(next)},
    });
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Stops the follow-up mousedown from moving focus away from the input
    // (and from selecting text while dragging)
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {startY: e.clientY, startPosition: position};
    inputRef.current?.focus({preventScroll: true});
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    // Dragging up pulls the next letter into the window
    const steps = Math.round((drag.current.startY - e.clientY) / STEP_PX);
    const next = wrap(drag.current.startPosition + steps);
    if (next !== position) setPosition(next);
  }

  function handlePointerEnd() {
    drag.current = null;
  }

  return (
    <fieldset
      id={`rotor-${currentType}`}
      className="rotor"
      aria-label={`Settings Rotor ${name}`}
    >
      <label className="rotor-type">
        <span className="sr-only">Rotor type</span>
        <select value={currentType} onChange={onChange(currentType)}>
          {ROTORS.map((rotor, index) => (
            <option key={rotor.type} value={index + 1}>
              {rotor.type}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="rotor-turn"
        aria-label={`Turn rotor ${name} back`}
        onClick={() => setPosition(position - 1)}
      >
        ▲
      </button>
      <div
        className="rotor-window"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <span className="rotor-letter" aria-hidden="true">
          {ALPHABET[wrap(position - 1)]}
        </span>
        <span
          key={position}
          className="rotor-letter current"
          aria-hidden="true"
        >
          {ALPHABET[position]}
        </span>
        <span className="rotor-letter" aria-hidden="true">
          {ALPHABET[wrap(position + 1)]}
        </span>
        <input
          ref={inputRef}
          className="sr-only"
          type="range"
          aria-label={`Rotor ${name} position`}
          aria-valuetext={ALPHABET[position]}
          min="0"
          max="25"
          step="1"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
        />
      </div>
      <button
        type="button"
        className="rotor-turn"
        aria-label={`Turn rotor ${name} forward`}
        onClick={() => setPosition(position + 1)}
      >
        ▼
      </button>
    </fieldset>
  );
}
