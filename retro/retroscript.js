const myCanvas = document.querySelector('#MyCanvas')
const drawer = myCanvas.getContext('2d')
const startBut =  document.querySelector('#MyStartButton')
const blocksAll = []


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


class BlockRetro{
    constructor({row,collum,color,current,size}){
        this.row = row
        this.collum = collum
        this.color = color
        this.current = current
        this.size = size
        this.id = ids++
    }
    updateblockdown(map, backgroundcolor, sizebyblock, listofBlocks){
        console.log(`Delka mapy: ${map.length}`)
        if (map.length>(this.row+2)){
            if (map[this.row+1][this.collum] === blockMode.unocuppied || map[this.row+1][this.collum] === blockMode.ocuppiedByCurrent){
                map[this.row][this.collum] = blockMode.unocuppied
                fillBlock(this.collum*sizebyblock,this.row*sizebyblock,this.size,backgroundcolor,backGroundGrid)
                this.row += 1
                map[this.row][this.collum] = blockMode.ocuppiedByCurrent
                fillBlock(this.collum*sizebyblock,this.row*sizebyblock,this.size,this.color,true)
            }
            else{
                this.stabilize(map,listofBlocks,true)
                // a check of the pile and if it's reached the top
                if (!(this.row===1)){
                    generateNewBlocks([1,4],'red',sizeOfBlocks)
                }
            }
        }
        else{
            this.stabilize(map,listofBlocks,true)
            if (!(this.row===1)){
                generateNewBlocks([1,4],'red',sizeOfBlocks)
            }
        }
    }
    pushblockinrow(leftOrRight, map, backgroundcolor, sizebyblock){
        if (map.length>=this.row){
            if (map[this.row].length>this.collum+(leftOrRight*2)){
                if (map[this.row][this.collum+leftOrRight] === blockMode.unocuppied || map[this.row][this.collum+leftOrRight] === blockMode.ocuppiedByCurrent){
                    map[this.row][this.collum] = blockMode.unocuppied
                    fillBlock(this.collum*sizebyblock,this.row*sizebyblock,this.size,backgroundcolor,backGroundGrid)
                    this.collum += leftOrRight
                    map[this.row][this.collum] = blockMode.ocuppiedByCurrent
                    fillBlock(this.collum*sizebyblock,this.row*sizebyblock,this.size,this.color,true)
                }
            }
        }
    }
    stabilize(map, listofBlocks, accuallyStopped){
        map[this.row][this.collum] = blockMode.ocuppiedByFallen
        this.current = false
        if (accuallyStopped){
            for (let blockloc of listofBlocks){
                if (blockloc.current){
                    blockloc.stabilize(map,[],false)
                }   
            }
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
const mapOfBlocks = generateMap(myCanvas.width,myCanvas.height,sizeOfBlocks,backGroundGrid)
generateNewBlocks([1,4],'red',sizeOfBlocks)


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

function generateNewBlocks(spawnpos,color,size){
    blocksAll.push(new BlockRetro({row:spawnpos[0],collum:spawnpos[1],color:color,current:true,size:size}))
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
    for (let oneblock of list){
        if (debug){console.log(`Id bloku s chybou: ${oneblock.id}, chyba v radku ${oneblock.row} a na sloupci ${oneblock.collum}`)}
        if (oneblock.current){
            oneblock.updateblockdown(map, backgroundcolor,size,list)
        }
    }
    mainloopupdates = regularUpdates.updated
}




function main() {
    if (mainloopupdates === regularUpdates.updated){
        mainloopupdates = regularUpdates.waitting
        setTimeout(() => mainUpdatetor(mapOfBlocks,'white',sizeOfBlocks,blocksAll), 50)
    }
    requestAnimationFrame(main)
}


window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        for (let fallingBlock of blocksAll){
            if (fallingBlock.current){
                fallingBlock.pushblockinrow(blockDirection.right,mapOfBlocks,'white',sizeOfBlocks)
            }
        }
    }
    if (event.key === 'ArrowLeft') {
        for (let fallingBlock of blocksAll){
            if (fallingBlock.current){
                fallingBlock.pushblockinrow(blockDirection.left,mapOfBlocks,'white',sizeOfBlocks)
            }
        }
    }
});

let startedOnce = false

startBut.addEventListener("click", () => {
    if (!startedOnce){
        main()
        startedOnce = true
    }
});