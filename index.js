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
  var match = false;

  //loops through own body to see if moving up will cause a collision
  for(var square of position) {
    if(square.x === head.x && square.y === newPosition.target) {
      match = true;
      return match;
    }
  }

  //loop through each snake
  for(var snake of snakes) {
    for(var square of snake.body) {
      if(square.x === head.x && square.y === newPosition.target) {
        match = true;
        return match;
      }
    }
  }
  return match;
}

function checkX(newPosition, head, position, snakes) {
  var match = false;
  for(var square of position) {
    if(square.x === newPosition.target && square.y === head.y) {
      match = true;
      return match
    }
  }
  for(var snake of snakes) {
    for(var square of snake.body) {
      if(square.x === newPosition.target && square.y === head.y) {
        match = true;
        return match;
      }
    } 
  }
  return match;
}

function findAvailableMoves(head, position, height, width, snakes) {
  var freeSpaces = [];

  //possible moves from current spot
  var up = {
    target: (head.y + 1),
    dangerZoneAcross:(head.y + 2),
    dangerZoneRight: (head.x + 1),
    dangerZoneLeft:  (head.x - 1),
  };
  var down =   {
    target: (head.y - 1),
    dangerZoneAcross:(head.y - 2),
    dangerZoneRight: (head.x + 1),
    dangerZoneLeft:  (head.x - 1),
  };
  var right =  {
    target: (head.x + 1),
    dangerZoneAcross:(head.x + 2),
    dangerZoneUp: (head.y + 1),
    dangerZoneDown:  (head.y - 1),
  };
  var left = {
    target: (head.x - 1),
    dangerZoneAcross:(head.x - 2),
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
  var nearestFood;
  var shortestDistance;

  for(var item of food) {
    var distance = Math.sqrt(Math.pow((head.x-item.x), 2) + Math.pow((head.y - item.y), 2));
    if(distance < shortestDistance || shortestDistance === undefined) {
      shortestDistance = distance;
      nearestFood = item;
    }
  }
  return  nearestFood
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
  var gameData = request.body

  var head = gameData.you.head;
  var position = gameData.you.body;
  var length = gameData.you.body.length;
  var height = gameData.board.height;
  var width = gameData.board.width;
  var food = gameData.board.food;
  var snakes = gameData.board.snakes;
  var health = gameData.you.health;

  var possibleMoves = findAvailableMoves(head, position, height, width, snakes);
  var targetFood = findNearestFood(head, food);
  var bestMoves = goToFood(possibleMoves, targetFood, head);
  var move = "";

  if(bestMoves.length !== 0) {
    move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  } else {
    move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }
  
  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
}

function handleEnd(request, response) {
  var gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}
