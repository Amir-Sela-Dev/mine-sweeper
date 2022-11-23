'use strict'



const gMine = '💣'

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gBoard
var gMarkedMineCounter = 0
var gShownCellsCounter = 0
var gInterval
var firstClick = 0

function onInit() {
    gBoard = createBoard()
    placeMinesOnBoard()
    setCountOfNegsMines(gBoard)
    //Set count of neighbour mines
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


            strHTML += `\t<td class="cell ${cellClass}"  onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j});return false;" >\n`

            if (currCell.isMine) {
                // strHTML += gMine
            } else if (!currCell.minesAroundCount) {
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
    if (!firstClick) gInterval = setInterval(timer, 1000)
    if (!firstClick) firstClick++
    if (clickedCell.isMine && !clickedCell.isMarked) youLose()
    if (clickedCell.isMarked || clickedCell.isShown) return
    if (clickedCell.minesAroundCount === 0 && clickedCell.isMine === false) {
        showNegs(i, j, gBoard)
    }
    clickedCell.isShown = true
    elCell.classList.add('shown')
    gShownCellsCounter++
    checkGameOver()


}

function showNegs(cellI, cellJ, mat) {
    var negsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            // if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) negsCount++
            if (!mat[i][j].isMine) {
                var elNegCell = document.querySelector(`.cell-${i}-${j}`)
                elNegCell.classList.add('shown')
                if (!gBoard[i][j].isShown) gShownCellsCounter++
                gBoard[i][j].isShown = true
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
    if (cell.isShown) return
    if (cell.isMarked) {
        if (cell.isMine) {
            gMarkedMineCounter--
            cell.isMarked = false
            elCell.innerText = gMine
            return
        }
        elCell.innerText = cell.minesAroundCount
        cell.isMarked = false
        return
    }
    elCell.innerText = '📍'
    cell.isMarked = true

    if (cell.isMine) {
        gMarkedMineCounter++
        console.log('gMarkedMineCounter', gMarkedMineCounter)
    }
    checkGameOver()

}



function checkGameOver() {
    console.log('gShownCells', gShownCellsCounter)
    console.log('gMarkedMineCounter', gMarkedMineCounter)
    if (gMarkedMineCounter === gLevel.MINES && gShownCellsCounter === (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES) {
        alert('victory!!')
        clearInterval(gInterval)
    }
}


function youLose() {
    showAllMines()
    clearInterval(gInterval)
    alert('you lose!')
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
    gMarkedMineCounter = 0
    gShownCellsCounter = 0
    firstClick = 0
    clearInterval(gInterval)
    document.querySelector('.min').innerText = '00'
    document.querySelector('.sec').innerText = '00'
    onInit()
}