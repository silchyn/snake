const canvas = document.getElementById('canvas'),
      context = canvas.getContext('2d'), INITIAL_DIRECTION = 'right',
      INITIAL_LENGTH = 3, INITIAL_TIMEOUT = 250, GRID_SIZE = 15,
      TIMEOUT_ACCELERATION = 25, MIN_TIMEOUT = 100, CELL_SIZE =
          Math.trunc(Math.min(innerWidth, innerHeight) * 0.75 / GRID_SIZE);
canvas.width = canvas.height = GRID_SIZE * CELL_SIZE;
function getRandomInteger(min, max) {
  return Math.trunc(Math.random() * (max - min)) + min;
}
class Block {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.validatePosition();
  }
  validatePosition() {
    this.x %= GRID_SIZE;
    if (this.x < 0)
      this.x += GRID_SIZE;
    this.y %= GRID_SIZE;
    if (this.y < 0)
      this.y += GRID_SIZE;
  }
  updatePosition(delta) {
    this.x += delta.deltaX;
    this.y += delta.deltaY;
    this.validatePosition();
  }
  draw() {
    context.fillRect(this.x * CELL_SIZE,
        this.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
}
class Boost {
  constructor(snake) {
    this.x = snake.head.x;
    this.y = snake.head.y;
    this.snake = snake;
    this.changePosition();
  }
  changePosition() {
    while (this.snake.blocks.some(block =>
        block.x === this.x && block.y === this.y)) {
      this.x = getRandomInteger(0, GRID_SIZE);
      this.y = getRandomInteger(0, GRID_SIZE);
    }
  }
  draw() {
    context.fillStyle = 'white';
    context.beginPath();
    context.arc((this.x + 0.5) * CELL_SIZE, (this.y + 0.5) * CELL_SIZE,
        CELL_SIZE / 2, 0, 2 * Math.PI);
    context.fill();
  }
}
class Snake {
  constructor(headX, headY, direction, length) {
    this.head = new Block(headX, headY, direction);
    this.blocks = [this.head];
    this.addBlocks(length - 1);
  }
  static processDirection(direction) {
    switch (direction) {
      case 'left':
        return { deltaX: -1, deltaY: 0 };
      case 'right':
        return { deltaX: 1, deltaY: 0 };
      case 'down':
        return { deltaX: 0, deltaY: 1 };
      case 'up':
        return { deltaX: 0, deltaY: -1 };
    }
  }
  turn(direction) {
    const currentDelta = Snake.processDirection(this.head.direction),
        requestDelta = Snake.processDirection(direction);
    if (requestDelta.deltaX * -1 !== currentDelta.deltaX ||
        requestDelta.deltaY * -1 !== currentDelta.deltaY)
      this.head.direction = direction;
  }
  addBlocks(number) {
    const tail = this.blocks[0],
        delta = Snake.processDirection(tail.direction);
    let x = tail.x, y = tail.y;
    while (number--) {
      x -= delta.deltaX;
      y -= delta.deltaY;
      this.blocks.unshift(new Block(x, y, tail.direction));
    }
  }
  update(boost) {
    this.blocks.forEach((block, i) => {
      block.updatePosition(Snake.processDirection(block.direction));
      if (block !== this.head)
        block.direction = this.blocks[i + 1].direction;
    });
    let boosted = false;
    if (this.head.x === boost.x && this.head.y === boost.y) {
      boost.changePosition();
      this.addBlocks(1);
      boosted = true;
    }
    if (!this.blocks.some(block => block !== this.head &&
        block.x === this.head.x && block.y === this.head.y)) {
      if (boosted)
        return 1;
      return 0;
    }
    return -1;
  }
  draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    this.blocks.forEach(block => block.draw());
  }
}
function processKey(event) {
  switch (event.key) {
    case 'a':
    case 'ArrowLeft':
      return 'left';
    case 'd':
    case 'ArrowRight':
      return 'right';
    case 's':
    case 'ArrowDown':
      return 'down';
    case 'w':
    case 'ArrowUp':
      return 'up';
  }
}
const snake = new Snake(Math.trunc(GRID_SIZE / 2),
    Math.trunc(GRID_SIZE / 2), INITIAL_DIRECTION, INITIAL_LENGTH),
    boost = new Boost(snake);
let pendingDirection, timeout = INITIAL_TIMEOUT;
document.addEventListener('keydown', ev => pendingDirection = processKey(ev));
function play() {
  if (pendingDirection)
    snake.turn(pendingDirection);
  const status = snake.update(boost);
  if (status === -1)
    return;
  snake.draw();
  boost.draw();
  if (status && timeout >= MIN_TIMEOUT + TIMEOUT_ACCELERATION)
    timeout -= TIMEOUT_ACCELERATION;
  setTimeout(play, timeout);
}
play();
