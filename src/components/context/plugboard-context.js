import * as React from 'react';
import {ALPHABET} from '../../utils/rotors';

const PlugboardContext = React.createContext();
PlugboardContext.displayName = 'Plugboard Context';

const plugOptions = ALPHABET.split('').map((el) => [el, null]);
function PlugboardProvider(props) {
  const [state, setState] = React.useState(() => new Map(plugOptions));

  return <PlugboardContext.Provider value={[state, setState]} {...props} />;
}

/**
 * @returns {[Connections, React.Dispatch<React.SetStateAction<Connections>>]}
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
