class Game {
  constructor(context, width, height) {
    this.cell = [];
    this.context = context;
    this.resolution = 15;
    this.scale = 1;
    this.cellWidth = Math.floor(width / this.resolution);
    this.cellHeight = Math.floor(height / this.resolution);
    this.grid = new Array(Math.floor(width / this.resolution))
      .fill(null)
      .map(() =>
        new Array(Math.floor(height / this.resolution)).fill(null).map(() => {
          return { state: Math.floor(Math.random() * 2) };
        })
      );
    this.lastCalledTime = Date.now();
    this.fps = 0;
  }

  calculateFPS() {
    const delta = (Date.now() - this.lastCalledTime) / 1000;
    this.lastCalledTime = Date.now();
    this.fps = 1 / delta;
    return this.fps;
  }

  mouseDown(event) {
    this.cell = [];
    const { x, y } = event;
    const row = Math.floor(y / this.resolution);
    const col = Math.floor(x / this.resolution);
    this.grid[col][row].state = this.grid[col][row].state === 1 ? 0 : 1;
    this.cell.push(this.grid[col][row]);
    this.isMouseDown = true;
  }

  mouseUp() {
    this.isMouseDown = false;
  }

  mouseMove(event) {
    if (!this.isMouseDown) return;
    const { x, y } = event;
    const row = Math.floor(y / this.resolution);
    const col = Math.floor(x / this.resolution);
    if (!this.cell.includes(this.grid[col][row])) {
      this.grid[col][row].state = this.grid[col][row].state === 1 ? 0 : 1;
      this.cell.push(this.grid[col][row]);
    }
  }

  keyDown(event) {
    const { code: key } = event;
    switch (key) {
      case "Space":
        this.togglePause();
        break;
      case "Escape":
        this.toggleEscape();
        this.escape ? this.gridWhite() : this.gridBlack();
        break;
    }
  }

  gridWhite() {
    this.grid = this.grid.map((col) =>
      col.map((cell) => {
        cell.state = 0;
        return cell;
      })
    );
  }

  gridBlack() {
    this.grid = this.grid.map((col) =>
      col.map((cell) => {
        cell.state = 1;
        return cell;
      })
    );
  }

  toggleEscape() {
    this.escape = !this.escape;
  }

  togglePause() {
    this.paused = !this.paused;
  }

  render() {
    for (let col = 0; col < this.grid.length; col++) {
      for (let row = 0; row < this.grid[col].length; row++) {
        const cell = this.grid[col][row];
        this.context.beginPath();
        this.context.rect(
          col * this.resolution * this.scale,
          row * this.resolution * this.scale,
          this.resolution,
          this.resolution
        );
        this.context.fillStyle = cell.state ? "#a366ff" : "#00001a";
        this.context.fill();
      }
    }
  }

  calculateNeighbour(x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        const col = (x + i + this.cellWidth) % this.cellWidth;
        const row = (y + j + this.cellHeight) % this.cellHeight;
        sum += this.grid[col][row].state;
      }
    }
    sum -= this.grid[x][y].state;
    return sum;
  }

  update() {
    if (this.paused) return;
    const nextGrid = this.grid.map((arr) =>
      arr.map((arr2) => {
        return { ...arr2 };
      })
    );
    for (let col = 0; col < this.grid.length; col++) {
      for (let row = 0; row < this.grid[col].length; row++) {
        const cell = this.grid[col][row];
        const sumOfNeighbour = this.calculateNeighbour(col, row);
        if (cell.state == 0 && sumOfNeighbour == 3) {
          nextGrid[col][row].state = 1;
        } else if (
          cell.state == 1 &&
          (sumOfNeighbour < 2 || sumOfNeighbour > 3)
        ) {
          nextGrid[col][row].state = 0;
        } else {
          nextGrid[col][row].state = this.grid[col][row].state;
        }
      }
    }
    this.grid = nextGrid;
  }
}

let game = null;

(() => {
  const canvas = document.getElementById("game-canvas");
  const context = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  game = new Game(context, window.innerWidth, window.innerHeight);
  let start;
  let windowWasResized = true;
  let startResolution = {
    w: window.innerWidth,
    h: window.innerHeight,
  };
  function step(timestamp) {
    if (windowWasResized) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const scale = Math.max(
        window.innerWidth / startResolution.w,
        window.innerHeight / startResolution.h
      );
      game.scale = scale;
      windowWasResized = false;
    }
    if (start === undefined) start = timestamp;
    const elapsed = timestamp - start;
    if (elapsed > 250) {
      game.render();
      game.update();
      start = timestamp;
    }
    window.requestAnimationFrame(step);
  }

  game.render();
  game.update();
  window.requestAnimationFrame(step);

  window.addEventListener("resize", (event) => {
    windowWasResized = true;
  });
  document.addEventListener("pointerdown", (event) => {
    game.mouseDown(event);
  });
  document.addEventListener("pointerup", (event) => {
    game.mouseUp(event);
  });
  document.addEventListener("keydown", (event) => {
    game.keyDown(event);
  });
  document.addEventListener("pointermove", (event) => {
    game.mouseMove(event);
  });
})();
