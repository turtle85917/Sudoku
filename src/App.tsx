import Game from "./components/Game";

import "./styles/App.css";
import "./styles/footer.css";

function App() {
  const GameMode = localStorage.getItem("mode");
  if (!GameMode) localStorage.setItem("mode", "easy");
  if (!["easy", "medium", "hard", "random"].includes(GameMode!)) localStorage.setItem("mode", "easy");

  return (
    <>
      <Game />
      <footer>
        소스 코드 : <a className="desc" target={"_blank"} href="https://github.com/turtle85917/Sudoku">여기!</a>
        <br />
        제작자 : <a className="desc" target={"_blank"} href="https://github.com/turtle85917">플토</a>
        <br />
        타임어택 모드는 "<a className="level-hard">어려움</a>"입니다.
      </footer>
    </>
  )
}

export default App;