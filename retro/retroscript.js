const myCanvas = document.querySelector('#MyCanvas')
const drawer = myCanvas.getContext('2d')
const startBut =  document.querySelector('#MyStartButton')
const blocksAll = []
const fallenblocks = []


//Enum

const blockMode = {
    unocuppied: 0,
    ocuppiedByCurrent: 1,
    ocuppiedByFallen: 2
}

const blockDirection = {
    left: -1,
    right: 1
}

const regularUpdates = {
    updated: 1,
    waitting: 2
}

const stateOfBlock = {
    collision: 1,
    falling: 2,
    currentUnder: 3
}

const stateOfList = {
    fallen: 1,
    allBlocks: 2
}

const gameState = {
    playing: 1,
    lost: 2
}


class blocksShape{
    constructor(){
        this.blocks = []
        this.moving = true
    }
    stabilizeMyBlocks(map, sizeByBlocks, blockTypeList, myBlockerFormula){
        let canGenNew = true
        this.moving = false
        for (let fallingBlock of this.blocks){
            if (this.row===1){
                canGenNew = false
            } 
            fallingBlock.stabilize(map)
        }
        if (canGenNew && currentGamestate === gameState.playing){
                generateNewBlocks('red',sizeByBlocks, blockTypeList, getRandomInt(0,blockTypeList.length-1), myBlockerFormula)
            }
        if (!canGenNew){
            currentGamestate = gameState.lost
        }
        blocksAll.splice(blocksAll.indexOf(this),1)
    }
    waitersFallDown(map,backgroundcolor, sizebyblock){
        let waitingNum = false
        for (let fallingBlock of this.blocks){
            if (fallingBlock.movable && fallingBlock.waiting){
                if (fallingBlock.updateblockdowncheck(map) === stateOfBlock.currentUnder){
                    fallingBlock.waiting = true
                    waitingNum = true
                }
                else{
                    fallingBlock.updateblockdown(map,backgroundcolor, sizebyblock)
                    fallingBlock.waiting = false
                }
            }
        }
        if (waitingNum){
            this.waitersFallDown(map,backgroundcolor, sizebyblock)
        }
    }
    updateMyBlocks(map, backgroundcolor, sizebyblock){
        let yesnumber = 0
        for (let fallingBlock of this.blocks){
            if (fallingBlock.movable){
                if (fallingBlock.updateblockdowncheck(map) === stateOfBlock.falling || fallingBlock.updateblockdowncheck(map) === stateOfBlock.currentUnder){
                    yesnumber += 1
                }
                else{
                    this.stabilizeMyBlocks(map,sizeOfBlocks,defaultBlocksList, blockFormula)
                }
            }
        }
        if (yesnumber>=this.blocks.length){
            let waitingNum = false
            for (let fallingBlock of this.blocks){
                if (fallingBlock.movable){
                    if (fallingBlock.updateblockdowncheck(map) === stateOfBlock.currentUnder){
                        fallingBlock.waiting = true
                        waitingNum = true
                    }
                    else{
                        fallingBlock.updateblockdown(map,backgroundcolor, sizebyblock)
                    }
                }
            }
            if (waitingNum){
                    this.waitersFallDown(map,backgroundcolor, sizebyblock)
            }
        }
    }
    pushToSideMyBlocks(leftOrRight,map, backgroundcolor, sizebyblock){
        let yesnumber = 0
        console.log('jedu do strany')
        for (let fallingBlock of this.blocks){
            if (fallingBlock.movable){
                if (fallingBlock.pushblockinrowcheck(leftOrRight,map,backgroundcolor,sizebyblock)){
                    yesnumber += 1
                }
            }
        }
        if (yesnumber>=this.blocks.length){
            for (let fallingBlock of this.blocks){
                if (fallingBlock.movable){
                    fallingBlock.pushblockinrow(leftOrRight,map,backgroundcolor,sizebyblock)
                }
            }
        }
    }
    rotateMyBlocks(){
    }
}


class BlockRetro{
    constructor({row,collum,color,current,size, blockShapeOwnerindex}){
        this.row = row
        this.collum = collum
        this.color = color
        this.current = current
        this.size = size
        this.id = ids++
        this.movable = true
        this.blockShapeOwnerindex = blockShapeOwnerindex
        this.insiderList = stateOfList.allBlocks
        this.moved = false
        this.waiting = false
    }
    updateDraw(sizebyblock){
        fillBlock(this.collum*sizebyblock,this.row*sizebyblock,this.size,this.color,true)
    }
    updateblockdown(map, backgroundcolor, sizebyblock){
        if (map.length>(this.row+2)){
            map[this.row][this.collum] = blockMode.unocuppied
            fillBlock(this.collum*sizebyblock,this.row*sizebyblock,this.size,backgroundcolor,backGroundGrid)
            this.row += 1
            map[this.row][this.collum] = blockMode.ocuppiedByCurrent
            fillBlock(this.collum*sizebyblock,this.row*sizebyblock,this.size,this.color,true)
            this.moved = true
        }
    }
    updateblockdowncheck(map){
        if (map.length>(this.row+2)){
            if (map[this.row+1][this.collum] === blockMode.unocuppied){
                return stateOfBlock.falling
            }
            if (map[this.row+1][this.collum] === blockMode.ocuppiedByCurrent){
                return stateOfBlock.currentUnder
            }
            if (map[this.row+1][this.collum] === blockMode.ocuppiedByFallen){
                return stateOfBlock.collision
            }
        }
        else{
            return stateOfBlock.collision
        }
    }
    pushblockinrow(leftOrRight, map, backgroundcolor, sizebyblock){
        if (map.length>=this.row){
            if (map[this.row].length>this.collum+(leftOrRight*2)){
                map[this.row][this.collum] = blockMode.unocuppied
                fillBlock(this.collum*sizebyblock,this.row*sizebyblock,this.size,backgroundcolor,backGroundGrid)
                this.collum += leftOrRight
                map[this.row][this.collum] = blockMode.ocuppiedByCurrent
                fillBlock(this.collum*sizebyblock,this.row*sizebyblock,this.size,this.color,true)
            }
        }
    }
    pushblockinrowcheck(leftOrRight, map){
        if (map.length>=this.row){
            if (map[this.row].length>this.collum+(leftOrRight*2)){
                if (map[this.row][this.collum+leftOrRight] === blockMode.unocuppied || map[this.row][this.collum+leftOrRight] === blockMode.ocuppiedByCurrent){
                    return true
                }
            }
        }
        return false
    }
    stabilize(map){
        map[this.row][this.collum] = blockMode.ocuppiedByFallen
        this.current = false
        this.movable = false
        if (this.insiderList === stateOfList.allBlocks){
            this.stateOfList = stateOfList.fallen
            fallenblocks.push(this)
            //blocksAll[this.blockShapeOwnerindex].splice(blocksAll[this.blockShapeOwnerindex].blocks.indexOf(this), 1)
        }
    }
    fallAgain(map){
        if (!(this.current) && map[this.row][this.collum]===blockMode.ocuppiedByCurrent && (!(this.movable))){
            this.current = true
        }
    }
}


let ids = 0
let defaultBlocksList = []
let defaultColorList = []
let blockFormula = [3,3]
let rotation_angle = 90
let difficulty = 3
let defaultOrMadeBlocks = true
let mainloopupdates = regularUpdates.updated
let sizeOfBlocks = 75
const saved = sessionStorage.getItem('TetrisData')
const debug = false
const backGroundGrid = true
let currentGamestate = gameState.playing
let finalSettings = {
    sizeOfBlock: 75,
    colorMode: false,
    difficulty: 3,
    classic: false,
    color: []
}

if (saved){
    finalSettings = JSON.parse(saved)
}   
if (!(saved)){
    console.log('Nic neulozeno')
}

function setSettings(){
    //user settings (set by the user himself)
    if (saved){
        difficulty = Number(finalSettings.difficulty)
        sizeOfBlocks = Number(finalSettings.sizeOfBlock)
        defaultOrMadeBlocks = Boolean(finalSettings.classic)
        defaultColorList = finalSettings.color
        addDefaultBlocks()
    }
    //default settings
    if (!(saved)) {
        defaultBlocksList = []
        defaultColorList = []
        blockFormula = [3,3]
        rotation_angle = 90
        difficulty = 3
        defaultOrMadeBlocks = false
        sizeOfBlocks = 100
        addDefaultColors()
        addDefaultBlocks()
    }
}


setSettings()
myCanvas.width = roundToSizeOfBlocks(myCanvas.width)
myCanvas.height = roundToSizeOfBlocks(myCanvas.height)
let turnMoveBlock = null
const mapOfBlocks = generateMap(myCanvas.width,myCanvas.height,sizeOfBlocks,backGroundGrid)
generateNewBlocks('red',sizeOfBlocks, defaultBlocksList, getRandomInt(0,defaultBlocksList.length-1), blockFormula)


function addDefaultBlocks(){
    //first 3 is for first row, second three is for second row and so on
    defaultBlocksList.push([true,true,true, false,false,true, false,false,true])
    defaultBlocksList.push([true,true,true, false,false,true, false,false,false])
    defaultBlocksList.push([false,true,true, false,false,true, false,false,true])
    defaultBlocksList.push([false,false,true, false,true,true, false,true,false])
    defaultBlocksList.push([true,true,true, false,true,false, false,false,false])
    defaultBlocksList.push([true,true,false, false,true,true, false,false,false])
    defaultBlocksList.push([true,true,false, true,true,false, false,false,false])
    defaultBlocksList.push([true,false,false, true,false,false, true,false,false])
}

function addDefaultColors(){
    defaultColorList.push('#ff0000')
    defaultColorList.push('#ffffff')
    defaultColorList.push('#ffff00')
    defaultColorList.push('#008000')
    defaultColorList.push('#0000ff')
    defaultColorList.push('#800080')
    defaultColorList.push('#ffa500')
    defaultColorList.push('#00ffff')
    defaultColorList.push('#ffc0cb')
}

function roundToSizeOfBlocks(number){
    return (Math.round(number/sizeOfBlocks))*sizeOfBlocks
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Number(Math.floor(Math.random() * (max - min + 1)) + min)
}



function generateMap(width,height,sizeBlock, Grid){
    let returnmap = []
    width = roundToSizeOfBlocks(width)
    height = roundToSizeOfBlocks(height)
    for (let i=0;i<=height/sizeBlock;i+=1){
        returnmap.push([])
        for (let j=0;j<=width/sizeBlock;j+=1){
            //false as in there isn't a block there
            returnmap[i].push(blockMode.unocuppied)
            if (Grid){
                drawer.strokeStyle = 'black'
                drawer.strokeRect(j*sizeBlock, i*sizeBlock, (j+1)*sizeBlock, (i+1)*sizeBlock)
            }
        }
    }
    return returnmap
}

function generateNewBlocks(color,size, blockTypeList, blockTypeNumber, blockerFormula){
    let posinlist = 0
    blocksAll.push(new blocksShape())
    for (let rows=0;rows<blockerFormula[0];rows+=1){
        for (let collums=0;collums<blockerFormula[1];collums+=1){
            //console.log(`Sloupec: ${collums} a radek ${rows}`)
            if (blockTypeList[blockTypeNumber][posinlist++]){
                blocksAll[blocksAll.length-1].blocks.push(new BlockRetro({row:rows,collum:collums+5,color:color,current:true,size:size, blockShapeOwnerindex:blocksAll.length-1}))
            }
        }
    }
}

function moveRows(impactRow,map,blocklist){
    let i = 0
    for (let row of map){
        if (i++<impactRow){
            let colI = 0
            for (let collum of row){
                if (collum===blockMode.ocuppiedByFallen){
                    map[i-1][colI] = blockMode.ocuppiedByCurrent
                }
                colI += 1
            }
        }
    }
    for (let block of blocklist){
        block.fallAgain(map)
    }
}

function checkRows(map,checking,backgroundcolor,sizebyblock){
    let rowindex = 0
    for (let row of map){
        let numberofChecked = 0
        for (let collum of row){
            if (collum===checking){
                numberofChecked += 1
            }
        }
        if (numberofChecked>=row.length-1){
            deleteRow(row,map,sizebyblock,backgroundcolor,rowindex)
        }
        rowindex += 1
    }
}

function deleteRow(row,list,sizebyblock,backgroundcolor,rower){
    for (let i=0;i<row.length;i+=1){
        list[rower][i] = blockMode.unocuppied
        fillBlock(i*sizebyblock,rower*sizebyblock,sizebyblock,backgroundcolor,backGroundGrid)
    }
    moveRows(rower,list,fallenblocks)
}




function fillBlock(x,y,size,color,surounds){
    drawer.fillStyle = color
    drawer.fillRect(x, y, size, size)
    if (surounds){
        drawer.strokeStyle = 'black'
        drawer.strokeRect(x, y, size, size)
    }
}

function mainUpdatetor(map,backgroundcolor,size,list){
    drawer.clearRect(0, 0, myCanvas.width, myCanvas.height)
    generateMap(myCanvas.width,myCanvas.height,sizeOfBlocks,backGroundGrid)
    checkRows(mapOfBlocks,blockMode.ocuppiedByFallen,backgroundcolor,size)
    for (let oneblock of list){
        if (debug){console.log(`Id bloku s chybou: ${oneblock.id}, chyba v radku ${oneblock.row} a na sloupci ${oneblock.collum}`)}
        oneblock.updateDraw(size)
        if (oneblock.current){
            oneblock.updateblockdown(map, backgroundcolor, size)
        }
    }
    for (let blocksShapesFalling of blocksAll){
        //console.log(`update padajicich: ${blocksAll}`)
        if (blocksShapesFalling.moving){
            blocksShapesFalling.updateMyBlocks(map,backgroundcolor,size,defaultBlocksList,blockFormula)
            if (turnMoveBlock){
                blocksAll[0].pushToSideMyBlocks(turnMoveBlock, mapOfBlocks)
                turnMoveBlock = null
        }
        }
    }
    mainloopupdates = regularUpdates.updated
}




function main() {
    if (mainloopupdates === regularUpdates.updated && currentGamestate === gameState.playing){
        mainloopupdates = regularUpdates.waitting
        setTimeout(() => mainUpdatetor(mapOfBlocks,'white',sizeOfBlocks,fallenblocks), 150)
    }
    requestAnimationFrame(main)
}


window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        turnMoveBlock = blockDirection.right
    }
    if (event.key === 'ArrowLeft') {
        console.log(`delka: ${blocksAll.length}`)
        turnMoveBlock = blockDirection.left
    }
});

let startedOnce = false

startBut.addEventListener("click", () => {
    if (!startedOnce){
        main()
        startedOnce = true
    }
});