import * as React from 'react';
import type {Connections} from '../../types';

type PlugboardContextType = [
  Connections,
  React.Dispatch<React.SetStateAction<Connections>>,
];
const PlugboardContext = React.createContext<PlugboardContextType | null>(null);
PlugboardContext.displayName = 'Plugboard Context';

function PlugboardProvider({
  initialConnections,
  children,
}: {
  initialConnections: Connections;
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState(initialConnections);

  return (
    <PlugboardContext.Provider value={[state, setState]}>
      {children}
    </PlugboardContext.Provider>
  );
}

/**
 * Provides the plugboard connections and their setter
 */
function usePlugboardContext() {
  const value = React.useContext(PlugboardContext);

  if (!value) {
    throw new Error(
      'usePlugboardContext must be used inside a PlugboardProvider',
    );
  }

  return value;
}

export {PlugboardProvider, usePlugboardContext};
