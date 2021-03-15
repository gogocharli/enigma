/*
|--------------------------------------------------------------------------
| Track the context values for the current application state and it's history
|--------------------------------------------------------------------------
|
| The Rotor Provider is responsible for storing and passing data from the
| logic concerning the rotors to the rest of the components.
|
| The History Provider acts as a middleman between other providers to track
| changes made to the state over time. This allows us to do undo and redo
| operations. A feat not possible with the original Enigma machine.
*/

import * as React from 'react';
import {useSessionStorage} from '../../utils/hooks';
import {rotorReducer, initRotors} from './reducer';

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

export {
  RotorProvider,
  StateHistoryProvider,
  useRotorContext,
  useHistoryContext,
};
