const myCanvas = document.querySelector('#MyCanvas')
const drawer = myCanvas.getContext('2d')
const blocksDown = []
const mySlider = document.querySelector('#MySlider')

function absoluteDistance(target_A,target_B){
    let myA = target_A
    let myB = target_B
    let dx = myA[0] - myB[0]
    let dy = myA[1] - myB[1]
    return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))
}



class Block{
    constructor() {
        this.size_x = 100
        this.size_y = 100
        this.stopped = false
        this.x = myCanvas.width/2
        this.y = 0
        this.innerRad = this.size_x/2
        this.outerRad = Math.sqrt(Math.pow(this.size_x,2)+Math.pow(this.size_y,2))
        this.centre = [this.x+this.size_x/2,this.y+this.size_y/2]
        this.left = null
        this.right = null
    }
    colisions() {
       for (let blocker of blocksDown){
        if (!blocker.stopped){
            let variable1 = absoluteDistance(blocker.centre,this.centre)
            if (variable1<(this.outerRad+blocker.outerRad)) {
                if (variable1<(this.innerRad+blocker.innerRad)){
                    return [true, blocker.y]
                }
            }}
        }
       if (this.y+this.size_y >= myCanvas.height){
         return [true, myCanvas.height]
       }
       return [false, -10]
    }
    updateblock(difficulty) {
        this.y += difficulty
        this.centre = [this.x+this.size_x/2,this.y+this.size_y/2]
    }
    stableSetup() {
        for (let blocker of blocksDown){
            if (blocker.y-10<=this.y && this.y<=blocker.y+10){
                if (blocker.x-10<=this.x+100 && this.x+100<=blocker.x+10){
                    console.log('colision')
                    this.right = blocker
                    blocker.left = this
                }
                if (blocker.x-10<=this.x-100 && this.x-100<=blocker.x+10){
                    console.log('colision')
                    this.left = blocker
                    blocker.right = this
                }
            }
        }
         if (this.centre[0]-this.outerRad<=0){
            this.left = 'left'
            console.log('left')
        }
        if (this.centre[0]+this.outerRad>=myCanvas.width){
            this.right = 'right'
            console.log('right')
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
        this.y = 0
        this.x = -1000
    }
}


let makeNewBlock = [true,-10]
let started = true
let myBlock
let stopping = false


function main() {
    let actualSliderValue = parseFloat(mySlider.value)
    if (!stopping){
        drawer.clearRect(0, 0, myCanvas.width, myCanvas.height)
        if (!started){
                myBlock.updateblock(actualSliderValue)
                makeNewBlock = myBlock.colisions()
            }
        if (makeNewBlock[0]){
            if (!started){
                myBlock.y = makeNewBlock[1]-myBlock.size_y
                if (myBlock.y<50){
                    stopping = true
                    drawer.fillStyle = 'blue'
                    drawer.fillRect(0, 0, 200, 150)
                    //here will be a lose screen information
                }
                myBlock.stableSetup()
                blocksDown.push(myBlock)
            }
            myBlock = new Block
            started = false
        }
        drawer.fillStyle = 'red'
        drawer.strokeStyle = 'black'
        for (let blocky of blocksDown){
            if (!blocky.stopped){
                drawer.fillRect(blocky.x, blocky.y, blocky.size_x, blocky.size_y)
                drawer.strokeRect(blocky.x, blocky.y, blocky.size_x, myBlock.size_y)
                if (blocky.left === 'left'){
                if (blocky.checkRow()){
                    blocky.turnOffRow()
                    for (let blackers of blocksDown){
                        if (!blackers.stopped){
                            blackers.y += 100
                        }
                    }
                }
            }
            }
        }
        drawer.fillRect(myBlock.x, myBlock.y, myBlock.size_x, myBlock.size_y)
        drawer.strokeRect(myBlock.x, myBlock.y, myBlock.size_x, myBlock.size_y)
        requestAnimationFrame(main)
    }
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        if (!started){
            if (myBlock.x<=myCanvas.width-myBlock.size_x*2){
                myBlock.x += 100
            }
        }
    }
    if (event.key === 'ArrowLeft') {
        if (myBlock.x>=0+myBlock.size_x){
                myBlock.x -= 100
            }
    }
});

main()