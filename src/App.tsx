import Game from "./components/Game";

import "./styles/App.css";

function App() {
  const GameMode = localStorage.getItem("mode");
  if (!GameMode) localStorage.setItem("mode", "easy");
  if (!["easy", "medium", "hard", "random"].includes(GameMode!)) localStorage.setItem("mode", "easy");

  return (
    <>
      <Game />
    </>
  )
}

export default App;