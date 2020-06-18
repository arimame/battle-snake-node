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

function findAvailableMoves(head, position, height, width, snakes) {
  var freeSpaces = [];

  function checkUp() {
    var match = false;
    //loops through own body to see if moving up will cause a collision
    for(var square of position) {
      //one is added to the head.y because that would be new positon of head if the snake moved up
      if(square.x === head.x && square.y === (head.y + 1)) {
        match = true;
      }
    }
    //loop through each snake
    for(var snake of snakes) {
      //loop through each snakes position
      for(var square of snake.body) {
        if(square.x === head.x && square.y === (head.y + 1)) {
          match = true;
        }
      }
    }
     
    return match;
  }

  function checkDown() {
    var match = false;
    for(var square of position) {
      if(square.x === head.x && square.y === (head.y - 1)) {
        match = true;
      }
    }

    for(var snake of snakes) {
      for(var square of snake.body) {
        if(square.x === head.x && square.y === (head.y - 1)) {
          match = true;
        }
      }
    }
    
    return match;
  }

  function checkRight() {
    var match = false;
    for(var square of position) {
      if(square.x === (head.x + 1) && square.y === head.y) {
        match = true;
      }
    }
    for(var snake of snakes) {
      for(var square of snake.body) {
        if(square.x === (head.x + 1) && square.y === head.y) {
          match = true;
        }
      } 
    }
    return match;
  }

  function checkLeft() {
    var match = false;
    for(var square of position) {
      if(square.x === (head.x - 1) && square.y === head.y) {
        match = true;
      }
    }
    for (var snake of snakes) {
      for(var square of snake.body) {
        if(square.x === (head.x - 1) && square.y === head.y) {
          match = true;
        }
      }
    }
    
    return match;
  }

  if(!checkUp()) {
    //checks if moving up would result in being out of bounds
    if(head.y !== (height - 1)) {
      // if not push up to the free spaces array
      freeSpaces.push("up");
    }
  }

  if(!checkDown()) {
    if(head.y !== 0) {
      freeSpaces.push("down");
    }
  }

  if(!checkRight()) {
    if(head.x !== (width - 1)) {
      freeSpaces.push("right");
    }
  }

  if(!checkLeft()) {
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
