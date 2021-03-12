import * as React from 'react';
import PropTypes from 'prop-types';
import {useRotorContext, useHistoryContext} from './context/index';

function Board() {
  const [rawText, setRawText] = React.useState('');
  const [state, dispatch] = useRotorContext();
  const {step, setStep, history, setHistory} = useHistoryContext();
  const {encodedText} = state;

  // Update the values in history with the new state every time it changes
  React.useEffect(() => {
    // We are not storing the new state when jumping to another
    if (state.lastAction === 'jump') return;

    const currentState = {...state};
    setStep((prevStep) => prevStep + 1);
    setHistory((prevState) => [...prevState, currentState]);
  }, [setHistory, setStep, state]);

  // Keep the raw and encoded text in sync
  React.useEffect(() => {
    if (encodedText.length === 0) {
      setRawText('');
    }
  }, [encodedText]);

  function handleInputChange(e) {
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
    if (spaceMatch?.length >= 1) {
      return;
    }

    // Check if its a letter from the alphabet
    const charMatch = text.match(/[A-Z]/gi);
    const matchedText =
      text.length > 0 ? charMatch?.join('').toUpperCase() : '';
    const lastUpdatedChar = matchedText.slice(-1);

    setRawText(text);
    dispatch({
      type: 'encode',
      payload: {plainText: text, updateChar: lastUpdatedChar},
    });
  }

  // Resets all state within the app and clears history
  function reset() {
    dispatch({type: 'reset', payload: [1, 2, 3]});
    setStep(-1);
    setHistory([]);
  }

  // Goes back to previous state
  function previous() {
    const previousStep = step - 1;
    if (previousStep >= 0) {
      // Jump to previous state, update the history pointer, and remove last character
      dispatch({type: 'jump', payload: history[previousStep]});
      setStep((prevStep) => prevStep - 1);
      setRawText((prevText) => prevText.slice(0, -1));
    }
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1em'}}>
      <TextOutput text={encodedText} />
      <Keyboard text={rawText} onChange={handleInputChange} />
      <button type="button" onClick={reset}>
        Reset
      </button>
      <button type="button" onClick={previous}>
        Undo
      </button>
    </div>
  );
}

function Keyboard({text, onChange}) {
  return (
    <textarea name="keyboard" id="keyboard" value={text} onChange={onChange} />
  );
}

Keyboard.propTypes = {
  text: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

function TextOutput({text}) {
  return <input value={text} readOnly />;
}

TextOutput.propTypes = {
  text: PropTypes.string.isRequired,
};

export {Board};
