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
  
  var move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]

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
