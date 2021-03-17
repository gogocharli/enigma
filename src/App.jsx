import * as React from 'react';
import {RotorProvider, StateHistoryProvider} from './components/context/index';
import {RotorBox} from './components/rotors/index';
import {Board} from './components/board';

import './App.css';

function App() {
  return (
    <div className="App">
      <RotorProvider>
        <StateHistoryProvider>
          <RotorBox />
          <Board />
        </StateHistoryProvider>
      </RotorProvider>
    </div>
  );
}

export default App;
