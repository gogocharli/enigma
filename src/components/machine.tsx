import * as React from 'react';
import {ALPHABET, traceChar} from '../utils/rotors';
import {
  createConnections,
  encodeThroughPlugboard,
  getPendingPlug,
  swapThroughPlugboard,
  toggleSocket,
} from '../utils/plugboard';
import {fromMachine, serializeConfig} from '../utils/config';
import {
  useRotorContext,
  useHistoryContext,
  usePlugboardContext,
} from './context/index';
import {RotorBox} from './rotors';
import {PlugBoard} from './plugboard';
import {SignalDiagram} from './diagram/signal-diagram';
import {Lampboard} from './lampboard';

const TYPING_TARGETS = ['INPUT', 'TEXTAREA', 'SELECT'];

/**
 * Ties the parts together. Both ways of typing (the physical keyboard and
 * the input field) go through pressKey.
 */
export function Machine() {
  const [state, dispatch] = useRotorContext();
  const {step, setStep, history, setHistory} = useHistoryContext();
  const [connections, setConnections] = usePlugboardContext();
  const [slow, setSlow] = React.useState(false);
  const [shareStatus, setShareStatus] = React.useState('');

  // Update the values in history with the new state every time it changes
  React.useEffect(() => {
    // When undoing, simply return to the previous version of the history
    if (state.lastAction === 'jump') return;

    const currentState = {...state};

    // Clean previous state in the board when reinitializing
    if (state.lastAction === 'setup') {
      setStep(0);
      setHistory([currentState]);
      return;
    }
    setStep((prevStep) => prevStep + 1);
    setHistory((prevState) => [...prevState, currentState]);
  }, [setHistory, setStep, state]);

  const isConnectionPending = getPendingPlug(connections) !== undefined;
  const lastKey = state.plainText.at(-1);
  const trace = lastKey
    ? traceChar(lastKey, state.rotors, state.reflector, connections)
    : [];
  const lamp = trace.length > 0 ? ALPHABET[trace.at(-1)!.output] : undefined;
  const encodedText = encodeThroughPlugboard(connections, state.encodedText);
  const pressId = `${state.plainText.length}-${state.rotors
    .map(({position}) => position)
    .join('.')}`;

  // The rotor positions the current message started from
  const messageStart =
    state.plainText === ''
      ? state
      : (history.findLast((entry) => entry.plainText === '') ?? state);

  function pressKey(letter: string) {
    if (isConnectionPending || !ALPHABET.includes(letter)) return;
    dispatch({
      type: 'encode',
      payload: {
        key: letter,
        updateChar: swapThroughPlugboard(connections, letter),
      },
    });
  }

  // Goes back to previous state
  function undo() {
    const previousStep = step - 1;
    if (previousStep >= 0) {
      dispatch({type: 'jump', payload: history[previousStep]});
      setStep((prevStep) => prevStep - 1);
      setHistory((prevState) => prevState.slice(0, -1));
    }
  }

  // Back to the default machine: rotors I, II, III at A, reflector B, no cables
  function reset() {
    dispatch({type: 'reset', payload: {types: [1, 2, 3]}});
    setConnections(createConnections());
    setShareStatus('');
  }

  function togglePlug(letter: string) {
    setConnections(toggleSocket(connections, letter));
    // Cables change the cipher, so the message starts over from the same
    // rotor positions rather than mixing two plugboard settings
    dispatch({type: 'rewind', payload: {rotors: messageStart.rotors}});
  }

  async function copyLink() {
    const config = fromMachine(
      messageStart.rotors,
      state.reflector,
      connections,
    );
    const {origin, pathname} = window.location;
    const url = `${origin}${pathname}?${serializeConfig(config)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus(
        'Link copied. It opens this machine with the same settings.',
      );
    } catch {
      setShareStatus(`Copy this link: ${url}`);
    }
  }

  function handleTapeChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value.toUpperCase();

    // Deleting a letter rewinds the machine by one key press
    if (text.length < state.plainText.length) {
      undo();
      return;
    }

    // Only a single letter typed at the end moves the machine
    if (
      text.length === state.plainText.length + 1 &&
      text.startsWith(state.plainText)
    ) {
      pressKey(text.at(-1)!);
    }
  }

  // Typing anywhere on the page presses the machine's keys
  const handleKeyDown = React.useEffectEvent((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (
      event.defaultPrevented ||
      event.repeat ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      TYPING_TARGETS.includes(target.tagName) ||
      target.isContentEditable
    ) {
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      undo();
      return;
    }

    const letter = event.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
      event.preventDefault();
      pressKey(letter);
    }
  });

  React.useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  return (
    <div
      className="machine"
      style={{'--draw': slow ? '1600ms' : '450ms'} as React.CSSProperties}
    >
      <div className="console">
        <section className="tape" aria-label="Message">
          <label htmlFor="keyboard" className="input">
            <span className="control-label">Input</span>
            <textarea
              name="keyboard"
              id="keyboard"
              rows={3}
              spellCheck={false}
              placeholder="Type here, or anywhere on the page"
              value={state.plainText}
              onChange={handleTapeChange}
              disabled={isConnectionPending}
            />
          </label>
          <label htmlFor="output" className="output">
            <span className="control-label">Output</span>
            <textarea id="output" rows={3} value={encodedText} readOnly />
          </label>
          {isConnectionPending && (
            <p className="hint">
              Finish or cancel the open plugboard cable to keep typing.
            </p>
          )}
        </section>

        <section className="controls" aria-label="Machine settings">
          <RotorBox />
          <div className="actions">
            <button type="button" onClick={undo} disabled={step <= 0}>
              Undo
            </button>
            <button type="button" onClick={reset}>
              Reset
            </button>
            <button type="button" onClick={copyLink}>
              Copy link
            </button>
            <label className="toggle">
              <input
                type="checkbox"
                checked={slow}
                onChange={(e) => setSlow(e.target.checked)}
              />
              Slow motion
            </label>
          </div>
          <p className="share-status" role="status">
            {shareStatus}
          </p>
        </section>
      </div>

      <SignalDiagram
        rotors={state.rotors}
        reflector={state.reflector}
        connections={connections}
        trace={trace}
        pressId={pressId}
      />

      <Lampboard lamp={lamp} pressId={pressId} />

      <PlugBoard onToggle={togglePlug} />
    </div>
  );
}
