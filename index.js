const bodyParser = require('body-parser')
const express = require('express')

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, () => console.log(`Battlesnake Server listening at http://127.0.0.1:${PORT}`))


function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'arimame',
    color: '#fa4239',
    head: 'fang',
    tail: 'curled'
  }
  response.status(200).json(battlesnakeInfo)
}

function handleStart(request, response) {
  var gameData = request.body

  console.log('START')
  response.status(200).send('ok')
}

function checkY(newPosition, head, position, snakes) {
  let snakesIndex = 0;
  //loops through own body to see if moving to the target postion will cause a collision
  for(const square of position) {
    // if the current snake part is the tail, don't check for collisions
    if((position.length - 1) !== snakesIndex) {
      if((square.x === head.x) && 
      ((square.y === newPosition.target) || 
      (square.y === newPosition.dangerZoneAcross) ||
      (square.y === newPosition.dangerZoneAcross + 1))) {
        return true;
      }
    }
    snakesIndex ++;
  }

  //loop through each snake
  for(const snake of snakes) {
    //if my snake is shorter than the current state, avoid collisions
    if(position.length <= snake.body.length) {
      const otherSnakeHead = snake.head;
      if((otherSnakeHead.x === head.x) && (otherSnakeHead.y === newPosition.dangerZoneAcross)) {
        return true;
      }
      if(((otherSnakeHead.x === newPosition.dangerZoneRight) || (otherSnakeHead.x === newPosition.dangerZoneLeft)) && (otherSnakeHead.y === newPosition.target)) {
        return true;
      }
    }
    for(const square of snake.body) {
      if(square.x === head.x && square.y === newPosition.target) {
        return true;
      }
    }
  }
  return false
}

function checkX(newPosition, head, position, snakes) {
  let snakesIndex = 0;

  //loops through own body to see if moving to the target postion will cause a collision
  for(const square of position) {
    if((position.length - 1) !== snakesIndex) {
      if((square.y === head.y) && 
      ((square.x === newPosition.target) || 
      (square.x === newPosition.dangerZoneAcross) ||
      (square.x === newPosition.dangerZoneAcross + 1))) {
        return true;
      }
    }
    snakesIndex++;
  }

  //loop through each snake
  for(const snake of snakes) {
    if(position.length <= snake.body.length) {
     const otherSnakeHead = snake.head;
      if((otherSnakeHead.y === head.y) && (otherSnakeHead.x === newPosition.dangerZoneAcross)) {
        return true;
      }
      if(((otherSnakeHead.y === newPosition.dangerZoneUp) || (otherSnakeHead.y === newPosition.dangerZoneDown)) && (otherSnakeHead.x === newPosition.target)) {
        return true;
      }
    }
    for(const square of snake.body) {
      if(square.x === newPosition.target && square.y === head.y) {
        return true;
      }
    } 
  }
  return false;
}

function findAvailableMoves(head, position, height, width, snakes) {
  let freeSpaces = [];

  //possible moves from current spot
  const up = {
    target: (head.y + 1),
    dangerZoneAcross: (head.y + 2),
    dangerZoneRight: (head.x + 1),
    dangerZoneLeft:  (head.x - 1),
  };
 const down =   {
    target: (head.y - 1),
    dangerZoneAcross: (head.y - 2),
    dangerZoneRight: (head.x + 1),
    dangerZoneLeft:  (head.x - 1),
  };
  const right =  {
    target: (head.x + 1),
    dangerZoneAcross: (head.x + 2),
    dangerZoneUp: (head.y + 1),
    dangerZoneDown:  (head.y - 1),
  };
  const left = {
    target: (head.x - 1),
    dangerZoneAcross: (head.x - 2),
    dangerZoneUp: (head.y + 1),
    dangerZoneDown: (head.y - 1),
  };

  if(!checkY(up, head, position, snakes)) {
    //checks if moving up would result in being out of bounds
    if(head.y !== (height - 1)) {
      // if not push up to the free spaces array
      freeSpaces.push("up");
    }
  }

  if(!checkY(down, head, position, snakes)) {
    if(head.y !== 0) {
      freeSpaces.push("down");
    }
  }

  if(!checkX(right, head, position, snakes)) {
    if(head.x !== (width - 1)) {
      freeSpaces.push("right");
    }
  }

  if(!checkX(left, head, position, snakes)) {
    if(head.x !== 0) {
      freeSpaces.push("left");
    }
  }
  console.log(freeSpaces);
  return freeSpaces;
}

function findNearestFood(head, food) {
  let nearestFood;
  let shortestDistance;

  for(const item of food) {
    const distance = Math.sqrt(Math.pow((head.x-item.x), 2) + Math.pow((head.y - item.y), 2));
    if(distance < shortestDistance || shortestDistance === undefined) {
      shortestDistance = distance;
      nearestFood = item;
    }
  }
  return nearestFood;
}

function goToFood(moves, food, position) {
  directionOfFood = [];
  if(position.x > food.x) {
    directionOfFood.push("left");
  }
  if(position.x < food.x) {
    directionOfFood.push("right");
  }
  if(position.y < food.y) {
    directionOfFood.push("up");
  }
   if(position.y > food.y) {
    directionOfFood.push("down");
  }
  
  const bestMoves = moves.filter(element => directionOfFood.includes(element));
  return bestMoves;
}

function handleMove(request, response) {
  const gameData = request.body

  const head = gameData.you.head;
  const position = gameData.you.body;
  const length = gameData.you.body.length;
  const height = gameData.board.height;
  const width = gameData.board.width;
  const food = gameData.board.food;
  const snakes = gameData.board.snakes;
  const health = gameData.you.health;

  const possibleMoves = findAvailableMoves(head, position, height, width, snakes);
  const targetFood = findNearestFood(head, food);
  const bestMoves = goToFood(possibleMoves, targetFood, head);

  const move = (bestMoves.length !== 0) ? bestMoves[Math.floor(Math.random() * bestMoves.length)] : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  });
}

function handleEnd(request, response) {
  var gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}
