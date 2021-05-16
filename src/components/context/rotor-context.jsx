import * as React from 'react';
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

/**
 * Broadcasts the state of the rotor elements throughout the app
 * @returns {[RotorState, React.DispatchWithoutAction]}
 */
function useRotorContext() {
  const value = React.useContext(RotorContext);

  if (!value) {
    throw new Error('useRotorContext must be used inside a RotorProvider');
  }

  return value;
}

export {RotorProvider, useRotorContext};
