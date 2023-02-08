import * as React from 'react';
import type {Connections} from 'src/types';
import {ALPHABET} from '../utils/rotors';
import {PENDING} from './plugboard/state';
import {
  useRotorContext,
  useHistoryContext,
  usePlugboardContext,
} from './context/index';

function Board() {
  const [rawText, setRawText] = React.useState('');
  const [state, dispatch] = useRotorContext();
  const {step, setStep, history, setHistory} = useHistoryContext();
  const [connections] = usePlugboardContext();

  // Swap the letter with its associated match if it exists
  const encodedText = state.encodedText
    ? encodeThroughPlugboard(connections, state.encodedText)
    : '';

  // Update the values in history with the new state every time it changes
  React.useEffect(() => {
    // When undoing, simply return to the previous version of the h
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

  // Keep the raw and encoded text in sync
  React.useEffect(() => {
    if (encodedText.length === 0) {
      setRawText('');
    }
  }, [encodedText]);

  React.useEffect(() => {
    // Update with the current rotors and reflectors
    const currentRotors = state.rotors.map((rotor) => rotor.rotorType);
    dispatch({
      type: 'reset',
      payload: {types: currentRotors, reflector: state.reflector},
    });
    setStep(-1);
    setHistory([]);
  }, [connections, dispatch, setHistory, setStep]);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    const text = e.target.value;

    // Have the backspace key restore the rotors state
    // There's also the delete key however
    if (text.length < rawText.length) {
      previous();
      return;
    }

    // Disabling for now because of wonky state
    const spaceMatch = text.match(/\s$/g);
    if (spaceMatch && spaceMatch.length >= 1) {
      return;
    }

    // Check if its a letter from the alphabet
    const charMatch = text.match(/[A-Z]/gi);
    const matchedText =
      text.length > 0 ? charMatch?.join('').toUpperCase() : '';
    const lastUpdatedChar = matchedText?.slice(-1) || '';

    setRawText(text);
    dispatch({
      type: 'encode',
      payload: {
        plainText: text.toUpperCase(),
        updateChar: encodeThroughPlugboard(connections, lastUpdatedChar),
      },
    });
  }

  // Resets all state within the app and clears history
  function reset() {
    dispatch({type: 'reset', payload: {types: [1, 2, 3]}});
    setStep(-1);
    setHistory([]);
  }

  // Goes back to previous state
  function previous() {
    const previousStep = step - 1;
    if (previousStep >= 0) {
      // Jump to previous state, update the history pointer, and remove last character
      dispatch({type: 'jump', payload: history[previousStep]});

      setRawText((prevText) => prevText.slice(0, -1));

      setStep((prevStep) => prevStep - 1);
      setHistory((prevState) => prevState.slice(0, -1));
    }
  }

  const isConnectionPending = Array.from(connections).some(
    ([, status]) => status === PENDING,
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1em'}}>
      <TextOutput text={encodedText} />
      <Keyboard
        text={rawText}
        onChange={handleInputChange}
        disabled={isConnectionPending}
      />
      <button type="button" onClick={reset}>
        Reset
      </button>
      <button type="button" onClick={previous}>
        Undo
      </button>
    </div>
  );
}

interface KeyboardProps {
  text: string;
  onChange: React.ChangeEventHandler;
  disabled: boolean;
}

function Keyboard({text, onChange, disabled = false}: KeyboardProps) {
  return (
    <label htmlFor="keyboard">
      <p className="sr-only">Input</p>
      <textarea
        name="keyboard"
        id="keyboard"
        value={text}
        onChange={onChange}
        disabled={disabled}
      />
      {disabled && <p>Please make sure to close your plugboard connections</p>}
    </label>
  );
}

interface TextOutputProps {
  text: string;
}

function TextOutput({text}: TextOutputProps) {
  return (
    <label htmlFor="output">
      <p className="sr-only">Output</p>
      <input id="output" value={text} readOnly />
    </label>
  );
}

/**
 * Replace a letter with its current plugboard match
 */
function encodeThroughPlugboard(
  connections: Connections,
  text: string,
): string {
  if (text.length === 0) return '';

  const matchedLetters = [...connections]
    .filter(([, match]) => match && ALPHABET.includes(match))
    .reduce<Record<string, string | null>>((acc, [plug, match]) => {
      acc[plug] = match;
      return acc;
    }, {});

  const newText = text
    .split('')
    .map((letter) => matchedLetters[letter] ?? letter)
    .join('');

  return newText;
}

export {Board};
