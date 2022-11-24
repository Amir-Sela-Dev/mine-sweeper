'use strict'



const gMine = '💣'

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    markedMineCounter: 0,
    lives: 3
}


var gBoard
var gInterval
var isfirstClick = true
var isHint = false




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
    if (isHint) {

    }
    if (clickedCell.isMine && !clickedCell.isMarked) mineStep(elCell)
    if (clickedCell.isMarked || clickedCell.isShown && !isfirstClick) return
    if (clickedCell.minesAroundCount === 0 && !clickedCell.isMine) {
        expandShown(i, j, gBoard)
    }
    elCell.classList.add('shown')
    clickedCell.isShown = true
    if (isfirstClick) firstClick()
    gGame.shownCount++
    checkGameOver()


}

function firstClick() {
    placeMinesOnBoard()
    setCountOfNegsMines(gBoard)
    renderBoard(gBoard)
    gInterval = setInterval(timer, 1000)
    isfirstClick = false
}

function expandShown(cellI, cellJ, mat) {
    var negsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (!mat[i][j].isMarked) {
                var elNegCell = document.querySelector(`.cell-${i}-${j}`)
                elNegCell.classList.add('shown')
                if (!gBoard[i][j].isShown) {
                    gGame.shownCount++
                    gBoard[i][j].isShown = true
                }

                if (mat[i][j].minesAroundCount === 0 && mat[i][j].isMine === false) {
                }

            }
        }
    }

}

function placeMinesOnBoard() {
    var boardLocations = getBoardLocations()
    console.log('boardLocations', boardLocations)
    for (let i = 0; i < gLevel.MINES; i++) {
        var rndMineLocation = drawNum(boardLocations)
        console.log('rndBombLocation', rndMineLocation)
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
        console.log(' gGame.markedMineCounter', gGame.markedMineCounter)
    }
    checkGameOver()

}



function checkGameOver() {
    console.log('gShownCells', gGame.shownCount)
    console.log('gMarkedMineCounter', gGame.markedMineCounter)
    if (gGame.markedMineCounter === gLevel.MINES &&
        gGame.shownCount === (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES) {
        document.querySelector('.smiley').innerText = '😎'
        alert('victory!!')
        clearInterval(gInterval)
        gGame.isOn = false
    }
}


function mineStep(elCell) {
    console.log('mine')
    if (gGame.isOn === false) return
    gGame.lives--
    var elLives = document.querySelector('.lives')
    if (gGame.lives === 2) {
        elLives.innerText = '💖💖'
        elCell.innerText = gMine
        elCell.style.backgroundColor = 'red'
        alert('mine step!')
    }
    if (gGame.lives === 1) {
        elLives.innerText = '💖'
        elCell.innerText = gMine
        elCell.style.backgroundColor = 'red'
        alert('mine step!')
    }
    if (!gGame.lives) youLose()

}

function youLose() {
    var elLives = document.querySelector('.lives')
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '🤯'
    elLives.innerText = 'GAME OVER! ❌❌❌'
    elLives.style.fontSize = '30px'
    showAllMines()
    clearInterval(gInterval)
    alert('you lose!')
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
    gGame.isOn = true
    gGame.markedMineCounter = 0
    gGame.shownCount = 0
    isfirstClick = true
    clearInterval(gInterval)
    document.querySelector('.min').innerText = '00'
    document.querySelector('.sec').innerText = '00'
    document.querySelector('.lives').innerText = '💖💖💖'
    document.querySelector('.smiley').innerText = '😀'
    gGame.lives = 3

    onInit()
}


function giveHint(elHint) {
    isHint = true
    elHint.style.backgroundColor = 'antiquewhite'
}

// showNegs(cellI, cellJ, mat){
//     for (var i = cellI - 1; i <= cellI + 1; i++) {
//         if (i < 0 || i >= mat.length) continue
//         for (var j = cellJ - 1; j <= cellJ + 1; j++) {
//             if (i === cellI && j === cellJ) continue
//             if (j < 0 || j >= mat[i].length) continue
//             if (!mat[i][j].isShown) {
//                 var elNegCell = document.querySelector(`.cell-${i}-${j}`)
//                 elNegCell.classList.add('shown')
//                 if(mat[i][j].isMine) elNegCell.innerText = gMine
//             }
//         }
//     }
// }

