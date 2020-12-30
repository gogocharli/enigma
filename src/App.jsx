import React, { useState, useEffect, useRef } from 'react';
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

// const ciphers = cipherStrings.map((c) => c.split(''));

function useCipher(type) {
  const cipher = ciphers[type];

  return cipher;
}

function useRotor({ type, plainText, sequence }) {
  // TODO create the encripted text from the settings
  const cipher = useCipher(type);

  return '';
}

function Rotor({ start = 0, type, plainText }) {
  const [sequence, setSequence] = useState(start);
  const encriptedText = useRotor({ type, plainText, sequence });

  function handleSequenceChange(e) {
    const currentValue = +e.target.value;
    setSequence(currentValue);
  }

  return (
    <>
      <p>{`I am a type ${type} cypher`}</p>
      <label for={`range${type}`}>Indicator Setting (Grundstellung)</label>
      <p>{ALPHABET[sequence]}</p>
      <input
        type="range"
        id={`range${type}`}
        min="0"
        max="25"
        step="1"
        value={sequence}
        onChange={handleSequenceChange}
      />
    </>
  );
}

function App() {
  const [plainText, setPlainText] = useState('');
  const [encodedText, setEncodedText] = useState('');

  // Make sure to limit characters to alphabetical characters
  function handleInputChange(e) {
    e.preventDefault();
    const text = e.target.value;
    const match = text.match(/[A-Z]/gi);
    const matchedText = Boolean(text.length)
      ? match?.join('').toUpperCase()
      : '';

    setPlainText(text);
    setEncodedText(matchedText);
  }

  function reset() {
    setPlainText('');
    setEncodedText('');
  }

  return (
    <div className="App">
      <Rotor type={2} plainText={plainText} />
      <input value={encodedText} readOnly />
      <textarea
        name="keyboard"
        id="keyboard"
        value={plainText}
        onChange={handleInputChange}
      />
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default App;
