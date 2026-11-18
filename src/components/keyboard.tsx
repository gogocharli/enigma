import * as React from 'react';

/** The machine's own QWERTZ layout, shared by the lamps and the keys */
const ROWS = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];

interface KeyboardProps {
  lamp?: string;
  /** Changes on every key press so the lamp lights up again */
  pressId: string;
  disabled: boolean;
  onPress: (letter: string) => void;
}

/**
 * The lampboard above the keyboard. Lamps are decorative; the lit letter
 * is announced in words.
 */
export function Keyboard({lamp, pressId, disabled, onPress}: KeyboardProps) {
  return (
    <section className="keyboard" aria-label="Keyboard">
      <div className="lampboard" aria-hidden="true">
        {ROWS.map((row) => (
          <div key={row} className="key-row">
            {[...row].map((letter) => (
              <span
                key={letter === lamp ? `${letter}-${pressId}` : letter}
                className="lamp"
                data-lit={letter === lamp || undefined}
              >
                {letter}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {lamp ? `Lamp ${lamp} is lit` : ''}
      </p>
      <div className="keys">
        {ROWS.map((row) => (
          <div key={row} className="key-row">
            {[...row].map((letter) => (
              <button
                key={letter}
                type="button"
                className="key"
                disabled={disabled}
                onClick={() => onPress(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
