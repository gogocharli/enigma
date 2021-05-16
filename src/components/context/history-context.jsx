import * as React from 'react';
import {useSessionStorage} from '../../utils/hooks';

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

/**
 * Provides the rotor's stete history stored in session storage
 * @returns {RotorStateCache}
 */
function useHistoryContext() {
  const value = React.useContext(HistoryContext);

  if (!value) {
    throw new Error(
      'useHistoryContext must be used inside a StateHistoryProvider',
    );
  }

  return value;
}

export {StateHistoryProvider, useHistoryContext};
