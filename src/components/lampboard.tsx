import * as React from 'react';

/** The machine's own QWERTZ layout */
const ROWS = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];

interface LampboardProps {
  lamp?: string;
  /** Changes on every key press so the lamp lights up again */
  pressId: string;
}

/**
 * The lamp of the encoded letter lights up. Lamps are decorative; the lit
 * letter is announced in words.
 */
export function Lampboard({lamp, pressId}: LampboardProps) {
  return (
    <section className="lampboard" aria-label="Lampboard">
      <div className="lamps" aria-hidden="true">
        {ROWS.map((row) => (
          <div key={row} className="lamp-row">
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
    </section>
  );
}
