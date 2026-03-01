const myCanvas = document.querySelector('#MyCanvas')
const drawer = myCanvas.getContext('2d')
const startBut =  document.querySelector('#MyStartButton')
let blocksDown = []
let fallingBlocks = []



let defaultBlocksList = []
let defaultColorList = []
let blockFormula = [3,3]
let rotation_angle = 90
let difficulty = 3
let defaultOrMadeBlocks = true
let sizeOfBlocks = 100
const saved = localStorage.getItem('TetrisData')
let finalSettings = null
if (saved===localStorage.getItem('TetrisData')){
    finalSettings = JSON.parse(saved)
}   
if (!(saved===localStorage.getItem('TetrisData'))){
    console.log('Nic neulozeno')
}

function setSettings(){
    //user settings (set by the user himself)
    if (saved===localStorage.getItem('TetrisData')){
        difficulty = Number(finalSettings.difficulty)
        sizeOfBlocks = Number(finalSettings.sizeOfBlock)
        defaultOrMadeBlocks = !(Boolean(finalSettings.classic))
        addDefaultColors()
        addDefaultBlocks()
    }
    //default settings
    if (!(saved===localStorage.getItem('TetrisData'))) {
        defaultBlocksList = []
        defaultColorList = []
        blockFormula = [3,3]
        rotation_angle = 90
        difficulty = 3
        defaultOrMadeBlocks = true
        sizeOfBlocks = 100
        addDefaultColors()
        addDefaultBlocks()
    }
}


setSettings()


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
    defaultColorList.push('red')
    defaultColorList.push('white')
    defaultColorList.push('yellow')
    defaultColorList.push('green')
    defaultColorList.push('blue')
    defaultColorList.push('purple')
    defaultColorList.push('orange')
    defaultColorList.push('cyan')
    defaultColorList.push('pink')
}

function roundToSizeOfBlocks(number){
    return (Math.round(number/sizeOfBlocks))*sizeOfBlocks
}

function findSmallest(inlist){
    let min = inlist[0]
    for (let inst of inlist){
        if (inst<=min){
            min = inst
        }
    }
    return min
}

function findLargest(inlist){
    let max = inlist[0]
    for (let inst of inlist){
        if (inst>=max){
            max = inst
        }
    }
    return max
}

function findCentre(blocksfindingList){
    let minX = blocksfindingList[0].x
    let minY = blocksfindingList[0].y
    let maxX = blocksfindingList[0].x
    let maxY = blocksfindingList[0].y
    for (let blockoflist of blocksfindingList){
        if (blockoflist.x>=maxX){
            maxX = blockoflist.x
        }
        if (blockoflist.y>=maxY){
            maxY = blockoflist.y
        }
        if (blockoflist.x<=minX){
            minX = blockoflist.x
        }
        if (blockoflist.y<=minY){
            minY = blockoflist.y
        }
    }
    let dx = maxX-minX+sizeOfBlocks/2
    let dy = maxY-minY+sizeOfBlocks/2
    let perfect_centre = [minX+dx/2,minY+dy/2]
    let closest_centre = blocksfindingList[0].centre
    for (let blockoflist of blocksfindingList){
        if (absoluteDistance(perfect_centre,blockoflist.centre)<=absoluteDistance(closest_centre,perfect_centre)){
            closest_centre = blockoflist.centre
        }
    }
    return closest_centre
}

function returncurrentBlocks(ourblockslist){
    let ournewList = []
    for (let elBlock of ourblockslist){
        if (elBlock.current){
            ournewList.push(elBlock)
        }
    }
    return ournewList
}


function absoluteDistance(target_A,target_B){
    let myA = target_A
    let myB = target_B
    let dx = myA[0] - myB[0]
    let dy = myA[1] - myB[1]
    return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))
}

function eliminateLostBlocks(blocksList){
    let newList = []
    for (let elBlock of blocksList){
        if (!elBlock.stopped){
            newList.push(elBlock)
        }
    }
    return newList
}

function leaveNotCurrentID(ourblockslist,id){
    let ournewList = []
    for (let elBlock of ourblockslist){
        if (!(elBlock.id === id)){
            ournewList.push(elBlock)
        }
    }
    return ournewList
}

function currentBlocksLenght(ourblockslist){
    let ourNum = 0
    for (let elBlock of ourblockslist){
        if (elBlock.current){
            ourNum += 1
        }
    }
    return ourNum
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Number(Math.floor(Math.random() * (max - min + 1)) + min)
}

function listToBlocks(ordefaultNum){
    // goes in collums then rowes - example: [true,true,true, true,false,false, true,false,false] - result (with # as a block and x as space):
    // #xx
    // #xx
    // ###
    let posinlist = 0
    let colorOfBlock = defaultColorList[getRandomInt(0,defaultColorList.length-1)]
    for (let row=0;row<blockFormula[0];row+=1){
        for (let collum=0;collum<blockFormula[1];collum+=1){
            //console.log(`Sloupec: ${collum} a radek ${row}`)
            if (defaultBlocksList[ordefaultNum][posinlist++]){
                fallingBlocks.push(new Block({currentblock: true, x: myCanvas.width/2+(collum*sizeOfBlocks),y: row*-sizeOfBlocks,id: ids++,color:colorOfBlock}))
            }
            
        }
    }
}



class Block{
    constructor({currentblock,x,y,id,color}) {
        this.id = id
        this.size_x = sizeOfBlocks
        this.size_y = this.size_x
        this.stopped = false
        this.x = x
        this.y = y
        this.innerRad = this.size_x/2
        this.outerRad = Math.sqrt(Math.pow(this.size_x,2)+Math.pow(this.size_y,2))
        this.centre = [this.x+this.size_x/2,this.y+this.size_y/2]
        this.left = null
        this.right = null
        this.current = currentblock
        this.makeNewBlocklocc = [true,-10]
        this.color = color
    }
    rotating(centreOfRotation,agleOfRotation){
        let copyOfCentre = [this.x+this.size_x/2,this.y+this.size_y/2]
        let dx = copyOfCentre[0] - centreOfRotation[0]
        let dy = copyOfCentre[1] - centreOfRotation[1]
        let absdis = absoluteDistance(copyOfCentre,centreOfRotation)
        let absang = Math.atan2(dy,dx)+(agleOfRotation*(Math.PI/180))
        let x2 = roundToSizeOfBlocks(Math.cos(absang)*absdis)
        let y2 = roundToSizeOfBlocks(Math.sin(absang)*absdis)
        return [centreOfRotation[0] + x2 - this.size_x/2, centreOfRotation[1] + y2 - this.size_y/2]
    }
    colisions() {
       for (let blocker of blocksDown){
        if (!blocker.stopped){
            let locAbsDis = absoluteDistance(blocker.centre,this.centre)
            if (locAbsDis<(this.outerRad+blocker.outerRad)) {
                //console.log(`Blok ID: ${this.id} kolize s ${blocker.id}`)
                if (locAbsDis<(this.innerRad+blocker.innerRad)){
                    return [true, blocker.y]
                }
                if (blocker.x<this.x && this.x<blocker.x+blocker.size_x){
                    if (blocker.y<this.y && this.y<blocker.y+blocker.size_y){
                        return [true, blocker.y]
                    }
                    if (blocker.y<this.y+this.size_y && this.y+this.size_y<blocker.y+blocker.size_y){
                        return [true, blocker.y]
                    }
                }
                if (blocker.x<this.x+this.size_x && this.x+this.size_x<blocker.x+blocker.size_x){
                    if (blocker.y<=this.y && this.y<=blocker.y+blocker.size_y){
                        return [true, blocker.y]
                    }
                    if (blocker.y<this.y+this.size_y && this.y+this.size_y<blocker.y+blocker.size_y){
                        return [true, blocker.y]
                    }
                }
            }}
        }
       if (this.y+this.size_y >= myCanvas.height){
         //console.log(`Blok ID: ${this.id} kolize s zemi`)
         return [true, myCanvas.height]
       }
       return [false, -10]
    }
    collision_expept(change_x,change_y){
        let local_centre = [this.x+this.size_x/2,this.y+this.size_y/2]
        local_centre[0] += change_x
        local_centre[1] += change_y
        let local_x = this.x + change_x
        let local_y = this.y + change_y
        for (let blocker of blocksDown){
        if (!blocker.stopped){
            let locAbsDis = absoluteDistance(blocker.centre,local_centre)
            if (locAbsDis<(this.outerRad+blocker.outerRad)) {
                if (locAbsDis<=(this.innerRad+blocker.innerRad)){
                    return true
                }
                if (blocker.x<local_x && local_x<blocker.x+blocker.size_x){
                    if (blocker.y<local_y && local_y<blocker.y+blocker.size_y){
                        return true
                    }
                    if (blocker.y<local_y+this.size_y && local_y+this.size_y<blocker.y+blocker.size_y){
                        return true
                    }
                }
                if (blocker.x<=local_x+this.size_x && local_x+this.size_x<=blocker.x+blocker.size_x){
                    if (blocker.y<local_y && local_y<blocker.y+blocker.size_y){
                        return true
                    }
                    if (blocker.y<local_y+this.size_y && local_y+this.size_y<blocker.y+blocker.size_y){
                        return true
                    }
                }
            }}
        }
       if (local_y+this.size_y >= myCanvas.height){
         return true
       }
       return false
    }
    updateblock(difficulty) {
        this.y += difficulty
        this.centre = [this.x+this.size_x/2,this.y+this.size_y/2]
    }
    finalCheck(){
       for (let blocker of blocksDown){
            //one final check
            if (!(this.id===blocker.id)){
                if (absoluteDistance(blocker.centre,this.centre)<=(this.innerRad)){
                    this.y -= blocker.size_y
                    this.centre = [this.x+this.size_x/2,this.y+this.size_y/2]
                    this.finalCheck()
                }
            }   
        } 
    }
    stableSetup() {
        this.finalCheck()
        for (let blocker of blocksDown){
            //one final check
            if (!(this.id===blocker.id)){
                if (absoluteDistance(blocker.centre,this.centre)<=(this.innerRad)){
                    this.y -= blocker.size_y
                    this.centre = [this.x+this.size_x/2,this.y+this.size_y/2]
                }
            }   
        }
        for (let blocker of blocksDown){
            if (blocker.centre[1]-blocker.innerRad<=this.centre[1] && blocker.centre[1]+blocker.innerRad>=this.centre[1]){
                if (blocker.centre[0]-blocker.innerRad<=this.centre[0]+this.outerRad && blocker.centre[0]+blocker.innerRad>=this.centre[0]+this.outerRad){
                    this.right = blocker
                    blocker.left = this
                }
                if (blocker.centre[0]-blocker.innerRad<=this.centre[0]-this.outerRad && blocker.centre[0]+blocker.innerRad>=this.centre[0]-this.outerRad){
                    this.left = blocker
                    blocker.right = this
                }
            }
        }
         if (this.centre[0]-this.outerRad<=0){
            this.left = 'left'
        }
        if (this.centre[0]+this.outerRad>=myCanvas.width){
            this.right = 'right'
        }
    }
    checkRow(){
        let returnable = false
        if (!(this.right === null)){
            if (!(this.right === 'right')){
                returnable = this.right.checkRow()
            }
        }
        if (this.right === 'right') {
            returnable = true
        }
        return returnable
    }
    turnOffRow(){
         if (!(this.right==='right')){
            if (!(this.right===null)){
                this.right.turnOffRow()
            }
        }
        this.stopped = true
        this.y = -50
        this.x = -1000
    }
    updatemyself(){
        this.updateblock(difficulty)
        this.makeNewBlocklocc = this.colisions()
            
        if (this.makeNewBlocklocc[0]){
            this.y = this.makeNewBlocklocc[1]-this.size_y
            if (this.y<50){
                stopping = true
                drawer.fillStyle = 'blue'
                drawer.fillRect(0, 0, 200, 150)
                //here will be a lose screen information
            }
            this.stableSetup()
            blocksDown.push(this)
            if (this.current){
                startnewGen -= 1
            }
            this.current = false
            fallingBlocks = leaveNotCurrentID(fallingBlocks,this.id)
            if (startnewGen <= 0){
                listToBlocks(getRandomInt(0,defaultBlocksList.length-1))
                startnewGen = currentBlocksLenght(fallingBlocks)
            
        }
        }
    }
}

let ids = 0
let stopping = false
listToBlocks(getRandomInt(0,defaultBlocksList.length-1))
startnewGen = currentBlocksLenght(fallingBlocks)
let startedOnce = false


function main() {
    drawer.strokeStyle = 'black'
    if (!stopping){
        drawer.clearRect(0, 0, myCanvas.width, myCanvas.height)
        for (let fallers of fallingBlocks){
            fallers.updatemyself()
            drawer.fillStyle = fallers.color
            drawer.fillRect(fallers.x, fallers.y, fallers.size_x, fallers.size_y)
            drawer.strokeRect(fallers.x, fallers.y, fallers.size_x, fallers.size_y)
        }
        for (let blocky of blocksDown){
            if (!blocky.stopped){
                drawer.fillStyle = blocky.color
                drawer.fillRect(blocky.x, blocky.y, blocky.size_x, blocky.size_y)
                drawer.strokeRect(blocky.x, blocky.y, blocky.size_x, blocky.size_y)
                if (blocky.left === 'left'){
                if (blocky.checkRow()){
                    blocky.turnOffRow()
                    blocksDown = eliminateLostBlocks(blocksDown)
                    fallingBlocks = fallingBlocks.concat(blocksDown)
                    blocksDown = []
                }
            }
            }
        }
    }
    requestAnimationFrame(main)
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'r'){
        let smallCurrentList = returncurrentBlocks(fallingBlocks)
        let absCentre = findCentre(smallCurrentList)
        let canFallNum = 0
        for (let bloka of smallCurrentList){
            let rotated_xy = bloka.rotating(absCentre,rotation_angle)
            let dx = bloka.x - rotated_xy[0]
            let dy = bloka.y - rotated_xy[1]
            if (!(bloka.collision_expept(dx,dy)) && rotated_xy[0]<=myCanvas.width-bloka.size_x*2 && rotated_xy[0]>=0){
                canFallNum += 1
            }
        }
        if (canFallNum>=smallCurrentList.length){
            for (let bloka of smallCurrentList){
                let rotated_xy = bloka.rotating(absCentre,rotation_angle)
                bloka.x = rotated_xy[0]
                bloka.y = rotated_xy[1]
                bloka.centre = [bloka.x+bloka.size_x/2,bloka.y+bloka.size_y/2]
            }
            canFallNum = 0
        }
        //console.log(`mame: ${canFallNum}`)
        //console.log(`potrebujeme ${smallCurrentList.length}`)
    }
    if (event.key === 'ArrowRight') {
        let fallNum = 0
        for (let fallers of fallingBlocks){
            if (fallers.x<=myCanvas.width-fallers.size_x*2 && !(fallers.collision_expept(fallers.size_x,0)) && fallers.current){
                fallNum += 1
            }
        }
        if (fallNum>=currentBlocksLenght(fallingBlocks)){
            for (let fallers of fallingBlocks){
                if (fallers.x<=myCanvas.width-fallers.size_x*2 && !(fallers.collision_expept(fallers.size_x,0)) && fallers.current){
                    fallers.x += fallers.size_x
                    fallers.centre[0] += fallers.size_x
                }
            }
            fallNum = 0
        }
    }
    if (event.key === 'ArrowLeft') {
        let fallNum = 0
        for (let fallers of fallingBlocks){
            if (fallers.x>=fallers.size_x && !(fallers.collision_expept(-fallers.size_x,0)) && fallers.current){
                fallNum += 1
            }
        }
        if (fallNum>=currentBlocksLenght(fallingBlocks)){
            for (let fallers of fallingBlocks){
                if (fallers.x>=fallers.size_x && !(fallers.collision_expept(-fallers.size_x,0)) && fallers.current){
                    fallers.x -= fallers.size_x
                    fallers.centre[0] -= fallers.size_x
                }
            }
            fallNum = 0
        }
}
});


startBut.addEventListener("click", () => {
    if (!startedOnce){
        main()
        startedOnce = true
    }
});