import * as React from 'react';
import type {RotorState, Action, MachineSetup} from '../../types';
import {rotorReducer, initRotors} from './reducer';

type RotorContextType = [RotorState, React.Dispatch<Action>];

const RotorContext = React.createContext<RotorContextType | null>(null);
RotorContext.displayName = 'Rotor Context';

function RotorProvider({
  setup,
  children,
}: {
  setup: MachineSetup;
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(rotorReducer, setup, (initial) =>
    initRotors(initial.types, {
      reflector: initial.reflector,
      positions: initial.positions,
    }),
  );
  return (
    <RotorContext.Provider value={[state, dispatch]}>
      {children}
    </RotorContext.Provider>
  );
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
