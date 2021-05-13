import React from 'react';
import {AppProviders} from './components/context/index';
import {RotorBox} from './components/rotors/index';
import {PlugBoard} from './components/plugboard/index';
import {Board} from './components/board';

import './App.css';

function App() {
  return (
    <div className="App">
      <AppProviders>
        <RotorBox />
        <Board />
        <PlugBoard />
      </AppProviders>
    </div>
  );
}

export default App;
