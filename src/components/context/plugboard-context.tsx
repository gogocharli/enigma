import * as React from 'react';
import type {Connections} from 'src/types';
import {ALPHABET} from '../../utils/rotors';

type PlugboardContextType = [
  Connections,
  React.Dispatch<React.SetStateAction<Connections>>,
];
const PlugboardContext = React.createContext<PlugboardContextType | null>(null);
PlugboardContext.displayName = 'Plugboard Context';

const plugOptions = ALPHABET.split('').map((el) => [el, null]);

function PlugboardProvider(props: {children: React.ReactNode}) {
  const [state, setState] = React.useState(
    // @ts-expect-error map property nonsense
    () => new Map(plugOptions) as Connections,
  );

  return <PlugboardContext.Provider value={[state, setState]} {...props} />;
}

/**
 * @returns {}
 */
function usePlugboardContext() {
  const value = React.useContext(PlugboardContext);

  if (!value) {
    throw new Error(
      'usePlugboardContext must be used inside a StateHistoryProvider',
    );
  }

  return value;
}

export {PlugboardProvider, usePlugboardContext};
