import { Component } from "react";

import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faQuestion, faClock, faGraduationCap, faArrowRotateRight, faFaceSadCry, faShieldHalved, faBan, faToggleOn, faBarsStaggered } from "@fortawesome/free-solid-svg-icons";

import "../styles/Game.component.css";

import { toast } from "react-toastify";

import Particles from "react-particles";
import { loadFull } from "tsparticles";

import ProgressBar from "@ramonak/react-progress-bar";

const difficulty = { easy: "쉬움", medium: "보통", hard: "어려움", random: "무작위" };

type difficulty = "easy" | "medium" | "hard" | "random";

interface S {
  gameStart: boolean;
  board: number[][];
  hint: number;
  hintCooldown: number;
  time: { m: number; s: number; };
  tryCount: number;
  overReason: string;
  difficulty: difficulty;
  wrongRate: number;
  fireworksEffect: boolean;
  timeattack: boolean;
};

interface sugokuBoard {
  board: number[][];
};

interface sugokuSolve {
  difficulty: difficulty;
  solution: number[][];
  status: string;
}

const wrongClear = (board: number[][]) => {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const inputElement: HTMLInputElement = document.querySelector(`div.board > input.row${y}.col${x}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.setAttribute("class", `row${y} col${x}`);
      }
    }
  }
}

const wrongColums = (board: number[][]) => {
  for (let y = 0; y < board.length; y++) {
    const colums: HTMLInputElement[] = [];
    for (let x = 0; x < board[y].length; x++) {
      const inputElement = document.querySelector(`div.board > input.row${y}.col${x}`);
      if (inputElement) {
        colums.push(inputElement as HTMLInputElement);
      }
    }

    const wrongs: HTMLInputElement[] = colums.filter((col, idx) => colums.map(c => c.value || "0").indexOf(col.value) !== idx);
    for (const wrong of wrongs) {
      if (!wrong.getAttribute("class")?.includes("wrong")) wrong.setAttribute("class", `${wrong.getAttribute("class")} wrong`);
    }
  }
}

const wrongRows = (board: number[][]) => {
  for (let x = 0; x < board[0].length; x++) {
    const rows: HTMLInputElement[] = [];
    for (let y = 0; y < board.length; y++) {
      const inputElement = document.querySelector(`div.board > input.row${y}.col${x}`);
      if (inputElement) {
        rows.push(inputElement as HTMLInputElement);
      }
    }

    const wrongs: HTMLInputElement[] = rows.filter((row, idx) => rows.map(c => c.value || "0").indexOf(row.value) !== idx);
    for (const wrong of wrongs) {
      if (!wrong.getAttribute("class")?.includes("wrong")) wrong.setAttribute("class", `${wrong.getAttribute("class")} wrong`);
    }
  }
}

const loadBoard = (board: number[][], gameStart: boolean): JSX.Element[] => {
  const nodes: JSX.Element[] = [];
  let idx: number = 0;

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      nodes.push(
        <input
          key={idx.toString()}
          type={"number"}
          className={`row${y} col${x}`}
          style={board[y][x] !== 0 ? { "opacity": ".8", "fontWeight": "bold" } : gameStart ? {} : { "opacity": 1 }}
          onChange={(event) => {
            if (event.currentTarget.value !== board[y][x].toString() && board[y][x] > 0) {
              event.currentTarget.value = board[y][x].toString();
            }
            if (event.currentTarget.value.length > 1 && event.currentTarget.value) {
              let newValue: string = event.currentTarget.value.split("").at(-1) as string;
              event.currentTarget.value = newValue;
            }
            if (event.currentTarget.value === "0") {
              event.currentTarget.value = "";
            }

            wrongClear(board);
            if (gameStart) {
              wrongColums(board);
              wrongRows(board);
            }
          }}
          />
      );
      idx++;
    }
    idx++;
  }

  return nodes;
}

export default class Game extends Component<{}, S> {
  public timerStart: boolean;
  public interval: number;

  constructor(props: {}) {
    super(props);

    this.timerStart = false;
    this.interval = 0;
  }

  async componentDidMount() {
    const GameMode = localStorage.getItem("mode")!;
    const timeattack: boolean = window.location.pathname.slice(1) === "timeattack";

    this.setState({
      board: ((await axios.get(`https://sugoku.herokuapp.com/board?difficulty=${timeattack ? "hard" : GameMode}`)).data as sugokuBoard).board,
      gameStart: true, tryCount: 0, overReason: "none",
      hint: timeattack ? 2 : 5, hintCooldown: 0, time: { m: timeattack ? 6 : 0, s: 0 }, 
      fireworksEffect: true, timeattack
    }, async () => {
      const params = new URLSearchParams();
      params.append("board", JSON.stringify(this.state.board));

      const result: sugokuSolve = (await axios.post("https://sugoku.herokuapp.com/solve", params)).data;
      
      this.setState({
        difficulty: result.difficulty
      });
    });
  }

  render() {
    if (this.state?.board) {
      if (!this.timerStart && this.state?.gameStart) {
        this.timerStart = true;
        this.interval = setInterval(() => {
          if (!this.state.gameStart) {
            clearInterval(this.interval);
            return;
          }
          if (!this.state?.timeattack) {
            this.setState({
              time: { m: this.state.time.m, s: this.state.time.s + 1 }
            }, () => {
              if (this.state.time.s > 59) {
                this.setState({
                  time: {
                    m: this.state.time.m + 1,
                    s: Math.floor(this.state.time.s % 60)
                  }
                })
              }
            });
          } else {
            this.setState({
              time: { m: this.state.time.m, s: this.state.time.s - 1 }
            }, async () => {
              if (this.state.time.s < 0) {
                this.setState({
                  time: {
                    m: this.state.time.m - 1,
                    s: 59
                  }
                });
              }

              if ((this.state.time.m as number) === 1 && this.state.time.s === 0) {
                toast.info("60초 남았어요!");
              }
              if (this.state.time.m === 0) {
                if (this.state.time.s === 30) {
                  toast.info("30초 남았어요! 아직 시간 있어요.");
                }
                if (this.state.time.s < 11 && this.state.time.s > 0) {
                  toast.info(`${this.state.time.s}초!`, { autoClose: 2200 });
                }
                if (this.state.time.s === 0 && this.state.gameStart) {
                  toast.info("시간 초과!", { autoClose: 2200 });
                  this.setState({ gameStart: false, overReason: "pass" });

                  const params = new URLSearchParams();
                  params.append("board", JSON.stringify(this.state.board));

                  const result: sugokuSolve = (await axios.post("https://sugoku.herokuapp.com/solve", params)).data;
                  let wrongCount: number = 0;

                  for (let y = 0; y < 9; y++) {
                    for (let x = 0; x < 9; x++) {
                      const inputElement: HTMLInputElement = document.querySelector(`div.board > input.row${y}.col${x}`) as HTMLInputElement;
                      if (inputElement) {
                        if (inputElement.value !== result.solution[y][x].toString()) {
                          inputElement.style.background = "rgba(233, 188, 188, .5)";
                          wrongCount++;
                        }
                        if (inputElement.value === result.solution[y][x].toString() && !this.state.board[y][x]) {
                          inputElement.style.background = "rgba(122, 197, 116, .5)";
                        }
                        inputElement.disabled = true;
                        inputElement.value = result.solution[y][x].toString();
                      }
                    }
                  }

                  this.setState({ wrongRate: (wrongCount / (this.state.board.flat(Infinity) as number[]).filter(c=>!c).length) * 100 });
                }
              }
            });
          }
        }, 1000);
      }

      this.state.board.map((cells, y) => {
        cells.map((cell, x) => {
          const inputElement = (document.querySelector(`div.board > input.row${y}.col${x}`) as HTMLInputElement);

          if (inputElement && cell !== 0) {
            (document.querySelector(`div.board > input.row${y}.col${x}`) as HTMLInputElement).value = cell.toString();
          }
        });
      });

      wrongClear(this.state.board);
      if (this.state?.gameStart) {
        wrongColums(this.state.board);
        wrongRows(this.state.board);
      }
    }

    return (
      <>
        {
          this.state?.board
          ? (<>
            <div className="board">{loadBoard(this.state.board, this.state?.gameStart)}</div>
            <div className="components">
              {
                this.state?.overReason !== "none"
                ? (<section>
                  <div className="desc line-1">게임이 끝났어요.</div>
                  <div className="desc line-2">
                    <span className="difficulty">
                      난이도는 "
                      <span className={["level", `level-${this.state?.difficulty}`].join(" ")}>{difficulty[this.state?.difficulty!]}</span>
                      "이였어요.
                    </span>
                  </div>
                  <div className="desc line-3">
                    <span className="timer">
                      {this.state?.timeattack
                      ? (<>
                        {(4 - (this.state?.time.m || 4)).toString().padStart(2, "0")}분&nbsp;
                        {(60 - (this.state?.time.s || 60)).toString().padStart(2, "0")}
                        초 동안 푸셨어요!
                      </>)
                      : (<>
                        {this.state?.time.m.toString().padStart(2, "0")}분&nbsp;
                        {this.state?.time.s.toString().padStart(2, "0")}
                        {this.state?.overReason === "givingUp" ? "초 동안 푸시다가 포기하셨어요." : "초만의 깨셨어요."}
                      </>)}
                      
                    </span>
                  </div>
                  <div className="desc line-4">
                    <ProgressBar
                      completed={this.state?.wrongRate || 0}
                      customLabel={`오답률 (${Math.floor(this.state?.wrongRate)}%)`}
                      bgColor={"#cf5050"}
                      width={"30em"}
                      animateOnRender={true} />
                  </div>
                </section>)
                : (<></>)
              }
              {
                this.state?.timeattack
                ? (<></>)
                : (<section className="mode difficulty">
                <div className="body">
                  <div className="parts-right">
                    <FontAwesomeIcon icon={faGraduationCap} /> 난이도
                  </div>
                  {Object.entries(difficulty).map(([k, v], idx) => (
                    <div
                      key={k}
                      className={[Object.keys(difficulty).length - 1 === idx ? "parts-left" : "parts-middle", "level", localStorage.getItem("mode") === k ? "active" : "", `level-${k}`].filter(d=>d).join(" ")}
                      onClick={() => {
                        if (localStorage.getItem("mode") !== k) {
                          localStorage.setItem("mode", k);
                          window.location.href = "/";
                        }
                      }} >{v}</div>
                  ))}
                  </div>
                </section>)
              }
              <section className="mode timer">
                <div className="body">
                  <div className="parts-right">
                    <FontAwesomeIcon icon={faClock} />
                    &nbsp;
                    {this.state?.time.m.toString().padStart(2, "0")}:{this.state?.time.s.toString().padStart(2, "0")}
                  </div>
                  {
                    this.state?.gameStart
                    ? (<div
                      className="parts-middle"
                      onClick={() => {
                        window.location.href = `/${this.state?.timeattack ? "timeattack" : ""}`;
                      }} >
                      <FontAwesomeIcon icon={faArrowRotateRight} className="icon" />
                      재시작
                    </div>)
                    : (<></>)
                  }
                  {
                    this.state?.overReason === "clear"
                    ? (<div
                      className="parts-middle"
                      onClick={() => {
                        this.setState({ fireworksEffect: !this.state?.fireworksEffect });
                      }} >
                      <FontAwesomeIcon icon={this.state?.fireworksEffect ? faBan : faToggleOn} className="icon" />
                      폭죽&nbsp;
                      {this.state?.fireworksEffect ? "끄기" : "켜기"}
                    </div>)
                    : (<></>)
                  }
                  <div
                    className={["parts-left", this.state?.timeattack ? "attack" : ""].join(" ").trim()}
                    onClick={() => {
                      if (this.state?.timeattack) {
                        window.location.href = "/";
                      } else {
                        window.location.href = "/timeattack";
                      }
                    }} >
                    {
                      this.state?.timeattack
                      ? (<><FontAwesomeIcon icon={faBarsStaggered} className="icon"/>일반</>)
                      : (<><FontAwesomeIcon icon={faShieldHalved} className="icon" />타임 어택</>)
                    }
                  </div>
                </div>
              </section>
              <section>
                <button
                  className="hint"
                  onClick={async () => {
                    if (!this.state?.gameStart) {
                      toast.error("종료된 게임이에요.");
                      return;
                    }
                    if (this.state?.hintCooldown && Date.now() - this.state?.hintCooldown < 10000) {
                      toast.error("다시 사용하려면 조금 기다려야 할 것 같아요.");
                      return;
                    }
                    if (this.state.hint < 1) {
                      toast.error("더 이상 도움을 받을 수 없어요.");
                      return;
                    }

                    this.setState({ hint: this.state.hint - 1, hintCooldown: Date.now() });

                    const checkBoard: number[][] = [];

                    for (let y = 0; y < 9; y++) {
                      const row: number[] = [];
                      for (let x = 0; x < 9; x++) {
                        const inputElement: HTMLInputElement = document.querySelector(`div.board > input.row${y}.col${x}`) as HTMLInputElement;
                        if (inputElement) {
                          row.push(+inputElement.value);
                        }
                      }
                      checkBoard.push(row);
                    }
                    
                    const params = new URLSearchParams();
                    params.append("board", JSON.stringify(this.state.board));

                    const result: sugokuSolve = (await axios.post("https://sugoku.herokuapp.com/solve", params)).data;

                    let getHint: boolean = true;
                    let select = { x: 0, y: 0 };
                    
                    while (getHint) {
                      const y = Math.floor(Math.random() * 9);
                      const x = Math.floor(Math.random() * 9);

                      if (!checkBoard[y][x] && !this.state?.board[y][x]) {
                        select = { x, y };
                        getHint = false;
                      }
                    }

                    const inputElement: HTMLInputElement = document.querySelector(`div.board > input.row${select.y}.col${select.x}`) as HTMLInputElement;
                    if (inputElement) {
                      inputElement.value = result.solution[select.y][select.x].toString();
                      inputElement.style.opacity = ".8";
                      inputElement.style.fontWeight = "bold";
                      inputElement.style.background = "rgba(236, 239, 7, .4)";
                      inputElement.disabled = true;

                      toast.info(`새 힌트 : ${inputElement.value}`);
                    }
                  }}>
                    <FontAwesomeIcon icon={faLightbulb} className="icon" />
                    도움 받기 (× {this.state.hint})
                </button>
                {
                  this.state?.gameStart
                  ? (<button
                    className="answer"
                    onClick={async () => {
                      const checkBoard: number[][] = [];

                      for (let y = 0; y < 9; y++) {
                        const row: number[] = [];
                        for (let x = 0; x < 9; x++) {
                          const inputElement: HTMLInputElement = document.querySelector(`div.board > input.row${y}.col${x}`) as HTMLInputElement;
                        if (inputElement) {
                          row.push(+inputElement.value);
                        }
                        }
                        checkBoard.push(row);
                      }

                      const params = new URLSearchParams();
                      params.append("board", JSON.stringify(this.state.board));

                      const result: sugokuSolve = (await axios.post("https://sugoku.herokuapp.com/solve", params)).data;

                      if (result.status === "broken") {
                        toast.error("스토쿠 게임판이 망가졌어요...");
                      }
                      if (result.status === "solved") {
                        if (JSON.stringify(checkBoard) !== JSON.stringify(result.solution)) {
                          toast.info("틀렸어요. ㅠㅠ");
                          this.setState({
                            tryCount: this.state?.tryCount + 1
                          });
                        } else {
                          toast.success(`${this.state.time.m}분 ${this.state.time.s}초 만의 깨셨어요!`);
                          this.setState({ gameStart: false, overReason: "clear" });

                          let wrongCount: number = 0;

                          for (let y = 0; y < 9; y++) {
                            for (let x = 0; x < 9; x++) {
                              const inputElement: HTMLInputElement = document.querySelector(`div.board > input.row${y}.col${x}`) as HTMLInputElement;
                              if (inputElement) {
                                if (inputElement.value !== result.solution[y][x].toString()) {
                                  wrongCount++;
                                }

                                inputElement.removeAttribute("class");
                                inputElement.removeAttribute("style");
                                inputElement.setAttribute("class", `row${y} col${x}`);
                                inputElement.style.opacity = "1";
                                inputElement.disabled = true;
                              }
                            }
                          }

                          this.setState({ wrongRate: (wrongCount / (this.state.board.flat(Infinity) as number[]).filter(c=>!c).length) * 100 });
                        }
                      }
                    }}>
                      <FontAwesomeIcon icon={faQuestion} className="icon" />
                      정답 확인하기
                    </button>)
                  : (<button
                    className="regame"
                    onClick={() => {
                      window.location.href = ["/", this.state?.timeattack ? "timeattack" : ""].join(" ").trim();
                    }} >
                    <FontAwesomeIcon icon={faArrowRotateRight} className="icon" />
                    다시 하기
                  </button>)
                }
              </section>
              {
                this.state?.tryCount && this.state?.gameStart
                ? (<section>
                  <button
                  className="pass"
                  onClick={async () => {
                    const yes = confirm("정말로 포기하실건가요?");
                    if (yes) {
                      this.setState({ gameStart: false, overReason: "givingUp" });

                      const params = new URLSearchParams();
                      params.append("board", JSON.stringify(this.state.board));

                      const result: sugokuSolve = (await axios.post("https://sugoku.herokuapp.com/solve", params)).data;
                      let wrongCount: number = 0;

                      for (let y = 0; y < 9; y++) {
                        for (let x = 0; x < 9; x++) {
                          const inputElement: HTMLInputElement = document.querySelector(`div.board > input.row${y}.col${x}`) as HTMLInputElement;
                          if (inputElement) {
                            if (inputElement.value !== result.solution[y][x].toString()) {
                              inputElement.style.background = "rgba(233, 188, 188, .5)";
                              wrongCount++;
                            }
                            if (inputElement.value === result.solution[y][x].toString() && !this.state.board[y][x]) {
                              inputElement.style.background = "rgba(122, 197, 116, .5)";
                            }
                            inputElement.disabled = true;
                            inputElement.value = result.solution[y][x].toString();
                          }
                        }
                      }

                      this.setState({ wrongRate: (wrongCount / (this.state.board.flat(Infinity) as number[]).filter(c=>!c).length) * 100 });
                    }
                  }} >
                    <FontAwesomeIcon icon={faFaceSadCry} className="icon" />
                      깔끔하게 포기하기
                    </button>
                </section>)
                : (<></>)
              }
            </div>
          </>)
          : (<div className="loading">퍼즐을 불러오는 중...</div>)
        }
        {
          this.state?.gameStart === false
          && this.state?.overReason !== "pass"
          && this.state?.overReason !== "givingUp"
          && this.state?.fireworksEffect
          ? (<Particles
            init={async (main) => {
              await loadFull(main);
            }}
            loaded={async (container) => {}}
            url="/src/assets/fireworks1.json" />)
          : (<></>)
        }
      </>
    );
  };
};