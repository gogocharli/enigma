import * as React from 'react';
import PropTypes from 'prop-types';
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

const ROTORS = [
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
 * @param {string} char
 * @param {{rotorType: number, position: number, turnover: number}[]} rotors
 */
function encodeChar(char, rotors) {
  // The encoding is done from last to first
  const reverseRotors = [...rotors].reverse();

  // Get the current cipher for each rotor
  const currentCiphers = reverseRotors.map(function extractCipher({
    rotorType,
    position,
  }) {
    let {cipher} = ROTORS[rotorType - 1];
    cipher = cipher.slice(position) + cipher.slice(0, position);
    return cipher;
  });

  // Encode the character through each one of them
  const cipherText = currentCiphers.reduce(function encode(
    currentChar,
    cipher,
  ) {
    const newChar = cipher[ALPHABET.indexOf(currentChar)];

    return newChar;
  },
  char);

  return cipherText;
}

function getTurnoverIndex(rotorType) {
  const {turnover} = ROTORS[rotorType - 1];
  const turnoverIndex = ALPHABET.indexOf(turnover);
  return turnoverIndex;
}

function getRotors(rotorTypes) {
  const rotors = rotorTypes.map((rotorType) => ({
    key: ROTORS[rotorType - 1].type,
    rotorType,
    position: 0,
    turnover: getTurnoverIndex(rotorType),
  }));

  return rotors;
}

function updateTurnover(rotor, index, rotorList) {
  // Always increment the last rotor's position
  // Increment a rotor if the previous just incremented past their turnover position
  const previousRotor = rotorList[index - 1];
  if (index === 0 || previousRotor.position === previousRotor.turnover + 1) {
    rotor.position += 1;
    rotor.position %= 26;
  }
  return rotor;
}

function updateRotorsPositions(rotors) {
  // Reversing the array here is the fastest way to update them
  const newRotorState = [...rotors].reverse().map(updateTurnover);
  return newRotorState.reverse();
}

function initRotors(initialTypes) {
  const rotors = getRotors(initialTypes);
  return {
    rotors,
    plainText: '',
    encodedText: '',
    lastAction: 'init',
  };
}

function rotorReducer(state, action) {
  switch (action.type) {
    case 'setup': {
      // Choose rotors
      const {payload: rotorTypes} = action;
      const rotors = getRotors(rotorTypes);
      return {
        ...state,
        rotors,
        lastAction: 'setup',
      };
    }
    case 'position': {
      // Set position of a rotor
      const {type, position: newPosition} = action.payload;
      const {rotors} = state;
      const rotor = rotors.find(({rotorType}) => rotorType === type);
      const rotorIndex = rotors.indexOf(rotor);
      rotors[rotorIndex].position = newPosition;

      return {
        ...state,
        rotors,
        lastAction: 'position',
      };
    }
    case 'encode': {
      // Transform plainText into encodedText
      let {rotors, encodedText} = state;

      // When a key is pressed, the rotor moves position before encoding
      rotors = updateRotorsPositions(rotors);

      // Get the corresponding character from the cypher
      const {plainText, updateChar} = action.payload;
      const newCipherChar = encodeChar(updateChar, rotors);
      return {
        rotors,
        plainText,
        encodedText: encodedText + newCipherChar,
        lastAction: 'encode',
      };
    }
    case 'jump': {
      // Go back to a previous state
      return {
        ...action.payload,
        lastAction: 'jump',
      };
    }
    case 'reset':
      return initRotors(action.payload);
    default:
      throw new Error(`Invalid action type "${action.type}" in rotorReducer`);
  }
}

const RotorContext = React.createContext();
RotorContext.displayName = 'Rotor Context';

function RotorProvider(props) {
  const [state, dispatch] = React.useReducer(
    rotorReducer,
    [1, 2, 3],
    initRotors,
  );
  return <RotorContext.Provider value={[state, dispatch]} {...props} />;
}

function useRotorContext() {
  const value = React.useContext(RotorContext);

  if (!value) {
    throw new Error('useRotorContext must be used inside a RotorProvider');
  }

  return value;
}

const HistoryContext = React.createContext();
HistoryContext.displayName = 'History Context';

function StateHistoryProvider(props) {
  const [step, setStep] = useSessionStorage('__enigma-step__', -1, false);
  const [history, setHistory] = useSessionStorage(
    '__enigma-history__',
    [],
    false,
  );

  return (
    <HistoryContext.Provider
      value={{step, setStep, history, setHistory}}
      {...props}
    />
  );
}

function useHistoryContext() {
  const value = React.useContext(HistoryContext);

  if (!value) {
    throw new Error(
      'useHistoryContext must be used inside a StateHistoryProvider',
    );
  }

  return value;
}

function RotorBox({setup}) {
  const [{rotors}, dispatch] = useRotorContext();

  React.useEffect(() => {
    dispatch({type: 'setup', payload: setup});
  }, [dispatch, setup]);

  return rotors.map(({rotorType, position, key}) => (
    <Rotor key={key} type={rotorType} position={position} />
  ));
}

function Rotor({type, position}) {
  const [, dispatch] = useRotorContext();

  function handlePositionChange(e) {
    const currentPosition = +e.target.value;
    dispatch({type: 'position', payload: {type, position: currentPosition}});
  }

  return (
    <div id={`rotor-${type}`} className="rotor">
      <p>{`I am a type ${type} rotor`}</p>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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

Rotor.propTypes = {
  type: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired,
};

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
      payload: {plainText: text, updateChar: lastUpdatedChar},
    });
  }

  // Resets all state within the app and clears history
  function reset() {
    dispatch({type: 'reset', payload: [1, 2, 3]});
    setStep(-1);
    setHistory([]);
    setRawText('');
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
      <input value={encodedText} readOnly />
      <Keyboard text={rawText} onChange={handleInputChange} />
      <button type="button" onClick={reset}>
        Reset
      </button>
      <button type="button" onClick={previous}>
        Go Back
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

function App() {
  return (
    <div className="App">
      <RotorProvider>
        <StateHistoryProvider>
          <RotorBox setup={[4, 5, 1]} />
          <Board />
        </StateHistoryProvider>
      </RotorProvider>
    </div>
  );
}

export default App;

function useSessionStorage(
  key,
  initalValue = '',
  {serialize = JSON.stringify, deserialize = JSON.parse} = {},
) {
  const [state, setState] = React.useState(() => {
    const storedValue = window.sessionStorage.getItem(key);
    if (storedValue) {
      return deserialize(storedValue);
    }
    return typeof initalValue === 'function' ? initalValue() : initalValue;
  });

  const prevKeyRef = React.useRef(key);
  React.useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.sessionStorage.removeItem(prevKey);
      prevKeyRef.current = key;
    }

    window.sessionStorage.setItem(key, serialize(state));
    prevKeyRef.current = key;
  }, [key, serialize, state]);

  return [state, setState];
}
