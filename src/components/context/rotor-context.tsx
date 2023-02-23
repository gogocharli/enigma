import * as React from 'react';
import type {RotorState, Action} from 'src/types';
import {rotorReducer, initRotors} from './reducer';

type RotorContextType = [RotorState, React.Dispatch<Action>];

const RotorContext = React.createContext<RotorContextType | null>(null);
RotorContext.displayName = 'Rotor Context';

function RotorProvider(props: {children: React.ReactNode}) {
  const [state, dispatch] = React.useReducer(
    rotorReducer,
    [1, 2, 3],
    initRotors,
  );
  return <RotorContext.Provider value={[state, dispatch]} {...props} />;
}

/**
 * Broadcasts the state of the rotor elements throughout the app
 */
function useRotorContext() {
  const value = React.useContext(RotorContext);

  if (!value) {
    throw new Error('useRotorContext must be used inside a RotorProvider');
  }

  return value;
}

export {RotorProvider, useRotorContext};
