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

function useCipher(type, position) {
  let cipher = ciphers[type - 1];

  // Make sure its within the bounds of the alphabet
  const current = position % 26;
  cipher = cipher.slice(current) + cipher.slice(0, current);
  return cipher;
}

function useRotor({ type, position, plainText }) {
  // TODO create the encripted text from the settings
  const cipher = useCipher(type, position);

  return cipher[ALPHABET.indexOf('E')];
}

function Rotor({ start = 0, type, plainText }) {
  const [position, setPosition] = useState(start);
  const encriptedText = useRotor({ type, position, plainText });

  function handlePositionChange(e) {
    const currentValue = +e.target.value;
    setPosition(currentValue);
  }

  return (
    <>
      <p>{`I am a type ${type} cypher`}</p>
      <label for={`range${type}`}>Indicator Setting (Grundstellung)</label>
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
      <Rotor type={3} start={6} plainText={plainText} />
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
