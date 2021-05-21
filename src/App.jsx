import React from 'react';
import './App.css';
import {AppProviders} from './components/context';
import {RotorBox} from './components/rotors';
import {PlugBoard} from './components/plugboard';
import {Board} from './components/board';

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
