import * as React from 'react';
import type {RotorState} from 'src/types';
import {useSessionStorage} from '../../utils/hooks';

interface HistoryContextType {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<HistoryContextType['step']>>;
  history: RotorState[];
  setHistory: React.Dispatch<
    React.SetStateAction<HistoryContextType['history']>
  >;
}

const HistoryContext = React.createContext<HistoryContextType | null>(null);
HistoryContext.displayName = 'History Context';

/**
 * Storing information in session storage for persistence while
 * the page is open.
 */
function StateHistoryProvider(props: any) {
  const [step, setStep] = useSessionStorage('__enigma-step__', -1);
  const [history, setHistory] = useSessionStorage('__enigma-history__', []);

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
