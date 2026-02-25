const myCanvas = document.querySelector('#MyCanvas')
const drawer = myCanvas.getContext('2d')
const mySlider = document.querySelector('#MySlider')
let blocksDown = []
let fallingBlocks = []

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

function CurrentBlocksLenght(ourblockslist){
    let ourNum = 0
    for (let elBlock of ourblockslist){
        if (elBlock.current){
            ourNum += 1
        }
    }
    return ourNum
}



class Block{
    constructor(currentblock,x,y,id) {
        this.id = id
        this.size_x = 100
        this.size_y = 100
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
    }
    colisions() {
       for (let blocker of blocksDown){
        if (!blocker.stopped){
            if (absoluteDistance(blocker.centre,this.centre)<(this.innerRad+blocker.innerRad)) {
                //console.log(`Blok ID: ${this.id} kolize s ${blocker.id}`)
                return [true, blocker.y]
            }}
        }
       if (this.y+this.size_y >= myCanvas.height){
         //console.log(`Blok ID: ${this.id} kolize s zemi`)
         return [true, myCanvas.height]
       }
       return [false, -10]
    }
    collision_expept(change_x){
        let local_centre = this.centre
        local_centre[0] += change_x
        for (let blocker of blocksDown){
        if (!blocker.stopped){
            if (absoluteDistance(blocker.centre,local_centre)<(this.innerRad+blocker.innerRad)) {
                return true
            }}
        }
       if (this.y+this.size_y >= myCanvas.height){
         return true
       }
       return false
    }
    updateblock(difficulty) {
        this.y += difficulty
        this.centre = [this.x+this.size_x/2,this.y+this.size_y/2]
    }
    stableSetup() {
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
        if (this.right === 'right') {
            return true
        }
        if (this.right === null) {
            return false
        }
        return this.right.checkRow()
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
        let actualSliderValue = parseFloat(mySlider.value)
        this.updateblock(actualSliderValue)
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
                fallingBlocks.push(new Block(true,myCanvas.width/2,0,ids++))
                fallingBlocks.push(new Block(true,myCanvas.width/2+100,0,ids++))
                //fallingBlocks.push(new Block(true,myCanvas.width/2-100,0,ids++))
                //fallingBlocks.push(new Block(true,myCanvas.width/2+200,0,ids++))
                startnewGen = CurrentBlocksLenght(fallingBlocks)
            
        }
        }
    }
}

let ids = 0
let stopping = false
fallingBlocks.push(new Block(true,myCanvas.width/2,0,ids++))
let startnewGen = CurrentBlocksLenght(fallingBlocks)


function main() {
    drawer.fillStyle = 'red'
    drawer.strokeStyle = 'black'
    if (!stopping){
        drawer.clearRect(0, 0, myCanvas.width, myCanvas.height)
        for (let fallers of fallingBlocks){
            fallers.updatemyself()
            drawer.fillRect(fallers.x, fallers.y, fallers.size_x, fallers.size_y)
            drawer.strokeRect(fallers.x, fallers.y, fallers.size_x, fallers.size_y)
        }
        for (let blocky of blocksDown){
            if (!blocky.stopped){
                drawer.fillRect(blocky.x, blocky.y, blocky.size_x, blocky.size_y)
                drawer.strokeRect(blocky.x, blocky.y, blocky.size_x, blocky.size_y)
                if (blocky.left === 'left'){
                if (blocky.checkRow()){
                    blocky.turnOffRow()
                    blocksDown = eliminateLostBlocks(blocksDown)
                    fallingBlocks = fallingBlocks.concat(blocksDown)
                    blocksDown = []
                    for (let blackers of blocksDown){
                        if (!blackers.stopped){
                            blackers.updateblock(100)
                        }
                    }
                }
            }
            }
        }
    }
    requestAnimationFrame(main)
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        let fallNum = 0
        for (let fallers of fallingBlocks){
            if (fallers.x<=myCanvas.width-fallers.size_x*2 && !fallers.collision_expept(100) && fallers.current){
                fallNum += 1
            }
        }
        console.log(CurrentBlocksLenght(fallingBlocks))
        console.log(fallNum)
        if (fallNum>=CurrentBlocksLenght(fallingBlocks)){
            for (let fallers of fallingBlocks){
                if (fallers.x<=myCanvas.width-fallers.size_x*2 && !fallers.collision_expept(100) && fallers.current){
                    fallers.x += 100
                }
            }
            fallNum = 0
        }
    }
    if (event.key === 'ArrowLeft') {
        let fallNum = 0
        for (let fallers of fallingBlocks){
            if (fallers.x>=fallers.size_x && !fallers.collision_expept(-100) && fallers.current){
                fallNum += 1
            }
        }
        console.log(CurrentBlocksLenght(fallingBlocks))
        console.log(fallNum)
        if (fallNum>=CurrentBlocksLenght(fallingBlocks)){
            for (let fallers of fallingBlocks){
                if (fallers.x>=fallers.size_x && !fallers.collision_expept(100) && fallers.current){
                    fallers.x -= 100
                }
            }
            fallNum = 0
        }
}
});

main()