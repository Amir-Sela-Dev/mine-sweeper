'use strict'



const gMine = '💣'

var gLevel = {
    SIZE: 4,
    MINES: 3
}

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    markedMineCounter: 0,
    lives: 3,
    numOfHints: 3,
    isHint: false,
    isfirstClick: true,
    numOfSafeClick: 3,
    isSafeClick: true,
    isManuallyPosMines: false
}


var gBoard
var gInterval




function onInit() {
    gBoard = createBoard()
    renderBoard(gBoard)
    console.log('gBoard', gBoard)


}

console.log('gBoard', gBoard)


function createBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }

        }

    }
    return board
}


function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.isMine) cellClass += ' mine'
            if (currCell.isShown) cellClass += ' shown'


            strHTML += `\t<td class="cell ${cellClass}"  onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j});return false;" >\n`

            if (!currCell.minesAroundCount) {
                strHTML += '.'
            } else strHTML += currCell.minesAroundCount

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML
}


function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function setCountOfNegsMines(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (!cell.isMine) {
                setMinesNegsCount(i, j, board)
            }
        }
    }

}

function setMinesNegsCount(cellI, cellJ, mat) {
    var negsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            // if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) negsCount++
            if (mat[i][j].isMine) negsCount++


        }
    }
    mat[cellI][cellJ].minesAroundCount = negsCount
}


function cellClicked(elCell, i, j) {
    var clickedCell = gBoard[i][j]
    if (!gGame.isOn) return
    if (gGame.isManuallyPosMines) {
        console.log('gLevel.MINES', gLevel.MINES)
        clickedCell.isMine = true
        elCell.classList.add('manuallymines')
        gLevel.MINES++
        return
    }
    if (gGame.isHint) {
        showNegs(i, j, gBoard)
        setTimeout(() => {
            reversHint(i, j, gBoard);
        }, 1000)
        return
    }
    if (clickedCell.isMine && !clickedCell.isMarked && !clickedCell.isShown) mineStep(elCell)
    if (clickedCell.isMarked || clickedCell.isShown) return
    if (clickedCell.minesAroundCount === 0 && !clickedCell.isMine) {
        expandShown(i, j, gBoard)
    }
    elCell.classList.add('shown')
    clickedCell.isShown = true
    if (gGame.isfirstClick) firstClick()
    gGame.shownCount++
    checkGameOver()


}

function firstClick() {
    placeMinesOnBoard()
    setCountOfNegsMines(gBoard)
    renderBoard(gBoard)
    gInterval = setInterval(timer, 1000)
    gGame.isfirstClick = false
}

function expandShown(cellI, cellJ, mat) {
    var negsCount = 0
    var cell = mat[cellI][cellJ]
    if (cell.isMine ||
        cell.minesAroundCount > 0
        || cell.isShown) return


    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (!mat[i][j].isMarked) {
                if (!gBoard[i][j].isShown) gGame.shownCount++
                var elNegCell = document.querySelector(`.cell-${i}-${j}`)
                elNegCell.classList.add('shown')
                gBoard[i][j].isShown = true
                //if neighbour is a number set it as shown

                //else recursive


                // if (mat[i][j].minesAroundCount === 0 && !mat[i][j].isMine) {
                //     console.log('hi')
                //     expandShown(i, j, mat)
                // }


            }
        }
    }

}

function placeMinesOnBoard() {
    var boardLocations = getBoardLocations()
    for (let i = 0; i < gLevel.MINES; i++) {
        var rndMineLocation = drawNum(boardLocations)
        gBoard[rndMineLocation.i][rndMineLocation.j].isMine = true
    }
}

function cellMarked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (!gGame.isOn) return
    if (cell.isShown) return
    if (cell.isMarked) {
        if (cell.isMine) {
            gGame.markedMineCounter--
            cell.isMarked = false
            elCell.innerText = '.'
            return
        }
        elCell.innerText = cell.minesAroundCount
        cell.isMarked = false
        return
    }
    elCell.innerText = '📍'
    cell.isMarked = true

    if (cell.isMine) {
        gGame.markedMineCounter++
    }
    checkGameOver()

}

function checkGameOver() {
    if (!gGame.lives) return
    if (gGame.markedMineCounter === gLevel.MINES &&
        gGame.shownCount === (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES) {
        document.querySelector('.smiley').innerText = '😎'
        document.querySelector('.lives').innerText = '🥳VICTORY!!!🥳'
        document.querySelector('.lives').style.color = 'red'
        clearInterval(gInterval)
        gGame.isOn = false
    }
}


function mineStep(elCell) {
    if (gGame.isOn === false) return
    gGame.lives--
    var elLives = document.querySelector('.lives')
    if (gGame.lives === 2) {
        elLives.innerText = '💖💖'
        elCell.innerText = gMine
        elCell.style.backgroundColor = 'red'
    }
    if (gGame.lives === 1) {
        elLives.innerText = '💖'
        elCell.innerText = gMine
        elCell.style.backgroundColor = 'red'
    }
    gLevel.MINES--
    if (!gGame.lives) youLose()

}

function youLose() {
    var elLives = document.querySelector('.lives')
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '🤯'
    elLives.innerText = '❌❌❌ GAME OVER! ❌❌❌'
    elLives.style.backgroundColor = 'red'
    elLives.style.color = 'white'
    elLives.style.fontSize = '30px'
    showAllMines()
    clearInterval(gInterval)
    gGame.isOn = false



}

function showAllMines() {
    var elMines = document.querySelectorAll('.mine')
    for (var i = 0; i < elMines.length; i++) {
        var elMine = elMines[i]
        elMine.innerText = gMine
        elMine.style.backgroundColor = 'red'
        elMine.classList.add('shown')
    }
}

function chooseDifficult(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    console.log('gLevel', gLevel)
    restart()
}

function restart() {
    clearInterval(gInterval)
    gGame.isOn = true
    gGame.markedMineCounter = 0
    gGame.shownCount = 0
    gGame.isfirstClick = true
    gGame.numOfSafeClick = 3
    gGame.numOfHints = 3
    gGame.lives = 3
    if (gGame.isManuallyPosMines) gLevel.MINES = 1
    var elSafe = document.querySelector('.safe')
    elSafe.innerText = 'safe click: 3'
    elSafe.style.backgroundColor = ' rgb(21, 92, 124)'
    document.querySelector('.min').innerText = '00'
    document.querySelector('.sec').innerText = '00'
    document.querySelector('.lives').innerText = '💖💖💖'
    document.querySelector('.lives').style.backgroundColor = ''
    document.querySelector('.smiley').innerText = '😀'
    document.querySelector('.hint').innerText = '💡💡💡'
    document.querySelector('.hint').style.backgroundColor = 'rgb(21, 92, 124)'
    onInit()
}

function giveHint(elHint) {
    if (!gGame.numOfHints) return
    gGame.isHint = true
    elHint.style.backgroundColor = 'antiquewhite'
}

function showNegs(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (!mat[i][j].isShown) {
                var elNegCell = document.querySelector(`.cell-${i}-${j}`)
                if (mat[i][j].isMine) elNegCell.innerText = gMine
                elNegCell.classList.add('negshint')
                var elCell = document.querySelector(`.cell-${cellI}-${cellJ}`)
                elCell.classList.add('negshint')
                if (mat[cellI][cellJ].isMine) elCell.innerText = gMine
            }
        }
    }
}

function reversHint(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (!mat[i][j].isShown) {
                var elNegCell = document.querySelector(`.cell-${i}-${j}`)
                if (mat[i][j].isMine) elNegCell.innerText = '.'
                elNegCell.classList.remove('negshint')
                var elCell = document.querySelector(`.cell-${cellI}-${cellJ}`)
                elCell.classList.remove('negshint')
                if (mat[cellI][cellJ].isMine) elCell.innerText = '.'
            }
        }
    }
    var elHint = document.querySelector('.hint')
    elHint.style.backgroundColor = '  rgb(21, 92, 124)'
    if (gGame.numOfHints === 3) {
        elHint.innerText = '💡💡'
    }
    if (gGame.numOfHints === 2) {
        elHint.innerText = '💡'
    }
    if (gGame.numOfHints === 1) {
        elHint.innerText = '❌❌❌'
        elHint.style.backgroundColor = 'antiquewhite'
    }
    gGame.numOfHints--
    gGame.isHint = false
}


function safeClick() {
    // if (!gGame.isSafeClick) return
    var emptyBoardLocations = getSafeLocations()
    var rndMineLocation = drawNum(emptyBoardLocations)
    var elSafeCell = document.querySelector(`.cell-${rndMineLocation.i}-${rndMineLocation.j}`)
    elSafeCell.classList.add('quickshown')
    setTimeout(() => {
        elSafeCell.classList.remove('quickshown')
    }, 3000)
    gGame.numOfSafeClick--
    var elSafe = document.querySelector('.safe')

    if (gGame.numOfSafeClick === 2) {
        elSafe.innerText = 'safe click: 2'
    }
    if (gGame.numOfSafeClick === 1) {
        elSafe.innerText = 'safe click: 1'
    }
    if (gGame.numOfSafeClick === 0) {
        elSafe.innerText = '❌❌❌'
        elSafe.style.backgroundColor = 'antiquewhite'
        gGame.isSafeClick = false
    }

}


function getSafeLocations() {
    var emptyBoardLocations = []
    var emptyBoardLocation = { i: null, j: null }
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = gBoard[i][j]
            if (!cell.isMine && !cell.isShown && !cell.isMarked) {
                emptyBoardLocation = { i: i, j: j }
                emptyBoardLocations.push(emptyBoardLocation)
            }
        }
    }
    console.log('emptyBoardLocations', emptyBoardLocations)
    return emptyBoardLocations

}


function manuallyPosMines(elButton) {
    if (!gGame.isManuallyPosMines) {
        gGame.isManuallyPosMines = true
        elButton.style.backgroundColor = 'antiquewhite'
        restart()
    } else {
        var elCells = document.querySelectorAll('.cell')
        for (var i = 0; i < elCells.length; i++) {
            var elCell = elCells[i]
            elCell.classList.remove('manuallymines')
        }
        elButton.style.backgroundColor = 'rgb(21, 92, 124)'
        gGame.isManuallyPosMines = false
    }
}



// function saveMemento() {
//     mementos.push(value)
// }

// function undo() {
//     const lastMemento = mementos.pop()

//     input.value = lastMemento ? lastMemento : input.value
// }
