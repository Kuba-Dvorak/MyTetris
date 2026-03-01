const settingSlider = document.getElementById('MySlider')
const classicMode = document.getElementById('MyClassicMode')
const colorsMode = document.getElementById('MyColorMode')
const blockAdder = document.getElementById('BlocksAdder')
const blockSize = document.getElementById('MySizeOfBlocks')
const exiter = document.getElementById('Save')
let oldBlockSize = Number(blockSize.value)

let canvases = []
let brushes = []
canvases.push(document.getElementById('SettingsCanvas0'))
brushes.push(canvases[0].getContext('2d'))
let canvasId = 1
const saved = localStorage.getItem('TetrisData')
let finalSettings = null
if (saved===localStorage.getItem('TetrisData')){
    finalSettings = JSON.parse(saved)
    setSetting()
}   
if (!(saved===localStorage.getItem('TetrisData'))){
    console.log('Nic neulozeno')
}

function setSetting(){
    settingSlider.value = finalSettings.difficulty
    classicMode.checked = finalSettings.classic
    blockSize.value = finalSettings.sizeOfBlock
    colorsMode.checked = finalSettings.colorMode
}


exiter.addEventListener("click", () => {
    const data = {
        sizeOfBlock: blockSize.value,
        colorMode: colorsMode.checked,
        difficulty: settingSlider.value,
        classic: classicMode.checked
    }
    localStorage.setItem('TetrisData',JSON.stringify(data))
});

blockAdder.addEventListener("click", () => {
    document.getElementById('canvases').innerHTML += `<p><canvas id="SettingsCanvas${canvasId++}" width="300" height="300" style="border: 2px black solid;"></canvas></p>`
    canvases = []
    brushes = []
    for (let i=0;i<canvasId;i+=1){
        canvases.push(document.getElementById(`SettingsCanvas${i}`))
        brushes.push(canvases[i].getContext('2d'))
    }
});

function strokeSquareGrid(drawer){
    for (let i=0;i<3;i+=1){
            for (let j=0;j<3;j+=1){
                drawer.strokeStyle = 'black'
                drawer.strokeRect(i*Number(blockSize.value),j*Number(blockSize.value),Number(blockSize.value),Number(blockSize.value))
            }
        }
}



function mainUpdate(){
    for (let i=0;i<canvasId;i+=1){
        if (!(oldBlockSize===Number(blockSize.value))){
            brushes[i].clearRect(0, 0, canvases[i].width, canvases[i].height)
            canvases[i].height = Number(blockSize.value) * 3
            canvases[i].width = Number(blockSize.value) * 3
        }
    }
    for (let drawers of brushes){
        strokeSquareGrid(drawers)
    }
    requestAnimationFrame(mainUpdate)
}

mainUpdate()