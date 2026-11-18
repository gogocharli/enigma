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
import type {MachineSetup} from '../../types';

import {RotorProvider} from './rotor-context';
import {StateHistoryProvider} from './history-context';
import {PlugboardProvider} from './plugboard-context';

/**
 * Unique provider dispatching all context providers from the app
 */
function AppProviders({
  setup,
  children,
}: {
  setup: MachineSetup;
  children: React.ReactNode;
}) {
  return (
    <RotorProvider setup={setup}>
      <StateHistoryProvider>
        <PlugboardProvider initialConnections={setup.connections}>
          {children}
        </PlugboardProvider>
      </StateHistoryProvider>
    </RotorProvider>
  );
}

export {AppProviders};
export {useRotorContext} from './rotor-context';
export {useHistoryContext} from './history-context';
export {usePlugboardContext} from './plugboard-context';
