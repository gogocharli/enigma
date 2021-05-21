import './App.css';
import {AppProviders} from './components/context/index';
import {RotorBox} from './components/rotors/index';
import {PlugBoard} from './components/plugboard/index';
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
