import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useContext,
} from 'react';
import './App.css';

const ALPHABET = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

const rotorsModels = [
  {
    type: 'I',
    cipher: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    turnover: 'Q',
  },
  {
    type: 'II',
    cipher: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    turnover: 'E',
  },
  {
    type: 'III',
    cipher: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    turnover: 'V',
  },
  {
    type: 'IV',
    cipher: 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
    turnover: 'J',
  },
  {
    type: 'V',
    cipher: 'VZBRGITYUPSDNHLXAWMJQOFECK',
    turnover: 'Z',
  },
];

/**
 * Encodes an alphabetical character to the matching cipher caracter
 * @param {number} type The current rotor's type
 * @param {number} position The current rotor's position
 */
function encodeChar(type, position) {
  let { cipher } = rotorsModels[type - 1];

  // Make sure its within the bounds of the alphabet
  const current = position % 26;
  cipher = cipher.slice(current) + cipher.slice(0, current);
  return cipher;
}

function initRotor(initialType) {
  return {
    type: initialType,
    position: 0,
    plainText: '',
    encodedText: '',
    lastAction: 'init',
  };
}

function rotorReducer(state, action) {
  switch (action.type) {
    case 'position':
      return {
        ...state,
        position: action.payload % 26,
        lastAction: 'position',
      };
    case 'encode':
      // Transform plainText into encodedText
      let { type, position, encodedText } = state;

      // When a key is pressed, the rotor moves position before encoding
      position++;
      position %= 26;

      // Get the corresponding character from the cypher
      const cipher = encodeChar(type, position);
      const { plainText, updateChar } = action.payload;
      return {
        ...state,
        position,
        plainText,
        encodedText: encodedText + cipher[ALPHABET.indexOf(updateChar)],
        lastAction: 'encode',
      };
    case 'jump':
      // Go back to a previous state
      return {
        ...action.payload,
        lastAction: 'jump',
      };
    case 'reset':
      return initRotor(action.payload);
    default:
      throw new Error(`Invalid action type "${action.type}" in rotorReducer`);
  }
}

const RotorContext = React.createContext();
RotorContext.displayName = 'Rotor Context';

function RotorProvider(props) {
  const [state, dispatch] = useReducer(rotorReducer, 3, initRotor);
  return <RotorContext.Provider value={[state, dispatch]} {...props} />;
}

const HistoryContext = React.createContext();
HistoryContext.displayName = 'History Context';

function StateHistoryProvider(props) {
  const [state] = React.useContext(RotorContext);
  const [step, setStep] = useLocalStorage('__enigma-step__', -1, false);
  const [history, setHistory] = useLocalStorage(
    '__enigma-history__',
    [],
    false,
  );

  return (
    <HistoryContext.Provider
      value={{ step, setStep, history, setHistory }}
      {...props}
    />
  );
}

function RotorDisplay() {
  const [{ position, type, plainText }, dispatch] = useContext(RotorContext);

  function handlePositionChange(e) {
    const currentValue = +e.target.value;
    dispatch({ type: 'position', payload: currentValue });
  }

  return (
    <div id={`rotor-${type}`} className="rotor">
      <p>{`I am a type ${type} rotor`}</p>
      <label htmlFor={`range${type}`}>Indicator Setting (Grundstellung)</label>
      <p>Position: {ALPHABET[position]}</p>
      <input
        type="range"
        id={`range${type}`}
        min="0"
        max="25"
        step="1"
        value={position}
        onChange={handlePositionChange}
      />
    </div>
  );
}

function Board() {
  const [rawText, setRawText] = useState('');
  const [state, dispatch] = useContext(RotorContext);
  const { step, setStep, history, setHistory } = useContext(HistoryContext);
  const { encodedText } = state;

  // Update the values in history with the new state every time it changes
  React.useEffect(() => {
    // We are not storing the new state when jumping to another
    if (state.lastAction === 'jump') return;

    const currentState = { ...state };
    setStep((prevStep) => prevStep + 1);
    setHistory((prevState) => {
      return [...prevState, currentState];
    });
  }, [state]);

  function handleInputChange(e) {
    e.preventDefault();
    const text = e.target.value;

    // Have the backspace key restore the rotors state
    // There's also the delete key however
    if (text.length < rawText.length) {
      previous();
      return;
    }

    // TODO Support whitespace character — (it's actually pretty hard)
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
      payload: { plainText: text, updateChar: lastUpdatedChar },
    });
  }

  // Resets all state within the app and clears history
  function reset() {
    dispatch({ type: 'reset', payload: 3 });
    setStep(-1);
    setHistory([]);
    setRawText('');
  }

  // Goes back to previous state
  function previous() {
    const previousStep = step - 1;
    if (previousStep >= 0) {
      // Jump to previous state, update the history pointer, and remove last character
      dispatch({ type: 'jump', payload: history[previousStep] });
      setStep((prevStep) => prevStep - 1);
      setRawText((prevText) => prevText.slice(0, -1));
    }
  }

  return (
    <div>
      <input value={encodedText} readOnly />
      <Keyboard text={rawText} onChange={handleInputChange} />
      <button onClick={reset}>Reset</button>
      <button onClick={previous}>Go Back</button>
    </div>
  );
}

function Keyboard({ text, onChange }) {
  return (
    <textarea name="keyboard" id="keyboard" value={text} onChange={onChange} />
  );
}

function App() {
  return (
    <div className="App">
      <RotorProvider>
        <StateHistoryProvider>
          <RotorDisplay />
          <Board />
        </StateHistoryProvider>
      </RotorProvider>
    </div>
  );
}

export default App;

function useLocalStorage(
  key,
  initalValue = '',
  persistValue = true,
  { serialize = JSON.stringify, deserialize = JSON.parse } = {},
) {
  const [state, setState] = React.useState(() => {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue && persistValue) {
      return deserialize(storedValue);
    }
    return typeof initalValue == 'function' ? initalValue() : initalValue;
  });

  const prevKeyRef = React.useRef(key);
  React.useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey);
      prevKeyRef.current = key;
    }

    window.localStorage.setItem(key, serialize(state));
    prevKeyRef.current = key;
  }, [key, serialize, state]);

  return [state, setState];
}
