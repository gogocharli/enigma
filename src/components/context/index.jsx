import * as React from 'react';
import {useSessionStorage} from '../../utils/hooks';
import {getRotors, updateRotorsPositions, encodeChar} from '../../utils/rotors';

const RotorContext = React.createContext();
RotorContext.displayName = 'Rotor Context';

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
      return {
        plainText: '',
        encodedText: '',
        rotors: getRotors(rotorTypes),
        lastAction: 'setup',
      };
    }
    case 'position': {
      // Set position of a rotor
      const {type, position: newPosition} = action.payload;
      const {rotors: previousRotors} = state;
      const rotor = previousRotors.find(({rotorType}) => rotorType === type);
      const rotorIndex = previousRotors.indexOf(rotor);

      const rotorToUpdate = {...previousRotors[rotorIndex]};
      rotorToUpdate.position = newPosition;
      const updatedRotors = [...previousRotors];
      updatedRotors[rotorIndex] = rotorToUpdate;

      return {
        ...state,
        rotors: updatedRotors,
        lastAction: 'position',
      };
    }
    case 'encode': {
      // Transform plainText into encodedText
      const {rotors: previousRotors, encodedText} = state;

      // When a key is pressed, the rotor moves position before encoding
      const updatedRotors = updateRotorsPositions(previousRotors);

      // Get the corresponding character from the cypher
      const {plainText, updateChar} = action.payload;
      const newCipherChar = encodeChar(updateChar, updatedRotors);
      return {
        rotors: updatedRotors,
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

export {
  RotorProvider,
  StateHistoryProvider,
  useRotorContext,
  useHistoryContext,
};
