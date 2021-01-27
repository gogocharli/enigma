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

const ciphers = [
  'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
  'AJDKSIRUXBLHWTMCQGZNPYFVOE',
  'BDFHJLCPRTXVZNYEIWGAKMUSQO',
  'ESOVPZJAYQUIRHXLNFTGKDCMWB',
  'VZBRGITYUPSDNHLXAWMJQOFECK',
];

function useCipher(type, position) {
  let cipher = ciphers[type - 1];

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
  };
}

function rotorReducer(state, action) {
  switch (action.type) {
    case 'position':
      return {
        ...state,
        position: action.payload,
      };
    case 'encode':
      // Transform plainText into encodedText
      let { type, position, encodedText } = state;
      position++;
      const cipher = useCipher(type, position);
      return {
        ...state,
        position,
        encodedText: encodedText + cipher[ALPHABET.indexOf(action.payload)],
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
  const value = useReducer(rotorReducer, 3, initRotor);
  return <RotorContext.Provider value={value} {...props} />;
}

function useRotor({ type, position, plainText }) {
  const cipher = useCipher(type, position);
  return cipher[ALPHABET.indexOf(plainText)];
}

function RotorDisplay() {
  const [{ position, type, plainText }, dispatch] = useContext(RotorContext);
  const encriptedText = useRotor({ type, position, plainText });

  function handlePositionChange(e) {
    const currentValue = +e.target.value;
    dispatch({ type: 'position', payload: currentValue });
  }

  return (
    <div id={`rotor-${type}`} className="rotor">
      <p>{`I am a type ${type} rotor`}</p>
      <label htmlFor={`range${type}`}>Indicator Setting (Grundstellung)</label>
      <p>Position: {ALPHABET[position]}</p>
      <p>Cipher: {encriptedText}</p>
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
  const [{ plainText, encodedText }, dispatch] = useContext(RotorContext);

  function handleInputChange(e) {
    e.preventDefault();
    const text = e.target.value;

    // Make sure there is no deletion as it would break decription
    if (text.length < rawText.length) return;

    // Don't pass a whitespace character to the enigma system
    const spaceMatch = text.match(/\s$/g);
    if (spaceMatch?.length >= 1) {
      setRawText(text);
      return;
    }

    // Check if its a letter from the alphabet
    const charMatch = text.match(/[A-Z]/gi);
    const matchedText =
      text.length > 0 ? charMatch?.join('').toUpperCase() : '';
    const lastUpdatedChar = matchedText.slice(-1);

    setRawText(text);
    dispatch({ type: 'encode', payload: lastUpdatedChar });
  }

  function reset() {
    dispatch({ type: 'reset', payload: 3 });
    setRawText('');
  }

  return (
    <div>
      <input value={encodedText} readOnly />
      <Keyboard text={rawText} onChange={handleInputChange} />
      <button onClick={reset}>Reset</button>
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
        <RotorDisplay />
        <Board />
      </RotorProvider>
    </div>
  );
}

export default App;
