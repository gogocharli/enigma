import * as React from 'react';
import './App.css';
import {AppProviders} from './components/context';
import {ConfigNotice} from './components/config-notice';
import {Machine} from './components/machine';
import {readSetupFromLocation} from './utils/config';

function App() {
  // A shared link can carry the machine's settings; they're checked once
  const [{setup, errors}] = React.useState(() =>
    readSetupFromLocation(window.location.search),
  );

  return (
    <div className="App">
      <header className="intro">
        <h1>Enigma</h1>
        <p>
          Press a key and follow the current: through the plugboard, the three
          rotors and the reflector, then back to a lamp. The right rotor steps
          on every key press, so the same letter takes a new path each time.
        </p>
      </header>
      {errors.length > 0 && <ConfigNotice errors={errors} />}
      <AppProviders setup={setup}>
        <Machine />
      </AppProviders>
    </div>
  );
}

export default App;
