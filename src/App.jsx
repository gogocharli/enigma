import * as React from 'react';
import {RotorProvider, StateHistoryProvider} from './components/context/index';
import {RotorBox} from './components/rotor';
import {Board} from './components/board';

import './App.css';

function App() {
  return (
    <div className="App">
      <RotorProvider>
        <StateHistoryProvider>
          <RotorBox setup={[4, 5, 1]} />
          <Board />
        </StateHistoryProvider>
      </RotorProvider>
    </div>
  );
}

export default App;
