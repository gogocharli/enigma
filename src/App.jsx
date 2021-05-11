import React from 'react';
import {RotorProvider, StateHistoryProvider} from './components/context/index';
import {RotorBox} from './components/rotors/index';
import {PlugBoard} from './components/plugboard/index';
import {Board} from './components/board';

import './App.css';

function App() {
  return (
    <div className="App">
      <RotorProvider>
        <StateHistoryProvider>
          <RotorBox />
          <Board />
          <PlugBoard />
        </StateHistoryProvider>
      </RotorProvider>
    </div>
  );
}

export default App;
