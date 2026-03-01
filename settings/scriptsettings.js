const settingSlider = document.getElementById('MySlider')
const classicMode = document.getElementById('MyClassicMode')
const colorsMode = document.getElementById('MyColorMode')
const blockAdder = document.getElementById('BlocksAdder')
const blockSize = document.getElementById('MySizeOfBlocks')
const exiter = document.getElementById('Save')
const colorAdder = document.getElementById('ColorsAdder')

let canvases = []
let brushes = []
let colors = []
let deletersOfColors = []
canvases.push(document.getElementById('SettingsCanvas0'))
brushes.push(canvases[0].getContext('2d'))
let canvasId = 1
let colorId = 0
let defaultBlocksList = []
let defaultColorList = []
let first = true
setSettings()


function addDefaultBlocks(){
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

function setSetting(theset){
    settingSlider.value = theset.difficulty
    classicMode.checked = theset.classic
    blockSize.value = theset.sizeOfBlock
    colorsMode.checked = theset.colorMode
    for (let color of defaultColorList){
        addColor(color)
    }
}

function setSettings(){
    const saved = sessionStorage.getItem('TetrisData')
    if (saved){
        let finalSettings = JSON.parse(saved)
        settingSlider.value = finalSettings.difficulty
        classicMode.checked = finalSettings.classic
        blockSize.value = finalSettings.sizeOfBlock
        colorsMode.checked = finalSettings.colorMode
        for (let color of finalSettings.color){
            addColor(color)
    }
    }
    if (!saved){
        addDefaultColors()
        addDefaultBlocks()
        let finalSettings = {
            sizeOfBlock: blockSize.value,
            colorMode: colorsMode.checked,
            difficulty: settingSlider.value,
            classic: classicMode.checked
        }
        setSetting(finalSettings)
}}

function deleteFromListByIndex(myId,myList){
    let newlist = []
    let indexer = 0
    for (let myinst of myList){
        if (!(indexer === myId)){
            newlist.push(myinst)
        }
        indexer += 1
    }
    return newlist
}

function deleteColor(loccolorId){
    console.log('mazu')
    colors = deleteFromListByIndex(loccolorId,colors)
    deletersOfColors = deleteFromListByIndex(loccolorId,deletersOfColors)
    colorId -= 1
    document.getElementById(`SettingsColor${loccolorId}`).remove()
    document.getElementById(`deletecolor${loccolorId}`).remove()
    console.log(colors.length)
    console.log(colorId)
}

function addColor(colorOfColor){
    let newHtml = `<p><input type="color" id="SettingsColor${colorId}" value='${colorOfColor}'><button id='deletecolor${colorId}'>&#128465; Smazat</button></p>`
    document.getElementById('colors').insertAdjacentHTML("beforeend",newHtml)
    colors.push(document.getElementById(`SettingsColor${colorId}`))
    deletersOfColors.push(document.getElementById(`deletecolor${colorId++}`))
    deletersOfColors[colorId-1].addEventListener("click",deleteColor.bind(null,colorId-1))
}

function getColors(){ 
    let returnlist = []
    for (let oneColor of colors){
        if (oneColor===null){
            returnlist.push('#030ff0')
        }
        else {
            returnlist.push(oneColor.value)
        }
    }
    return returnlist
}


exiter.addEventListener("click", () => {
    const data = {
        sizeOfBlock: blockSize.value,
        colorMode: colorsMode.checked,
        difficulty: settingSlider.value,
        classic: classicMode.checked,
        color: getColors()
    }
    sessionStorage.setItem('TetrisData',JSON.stringify(data))
});

colorAdder.addEventListener("click", () => {
    addColor('#000000')
});

blockAdder.addEventListener("click", () => {
    let newHtml = `<p><canvas id="SettingsCanvas${canvasId++}" width="${Number(blockSize.value) * 3}" height="${Number(blockSize.value) * 3}" style="border: 2px black solid;"></canvas></p>`
    document.getElementById('canvases').insertAdjacentHTML("beforeend",newHtml)
    canvases.push(document.getElementById(`SettingsCanvas${canvasId-1}`))
    brushes.push(canvases[canvasId-1].getContext('2d'))
});


function strokeSquareGrid(drawer){
    for (let i=0;i<3;i+=1){
            for (let j=0;j<3;j+=1){
                drawer.strokeStyle = 'black'
                drawer.strokeRect(i*Number(blockSize.value),j*Number(blockSize.value),Number(blockSize.value),Number(blockSize.value))
            }
        }
}

function fillRectangle(x,y,color){
    for (let drawers of brushes){
        drawers.fillStyle = color
        drawers.fillRectangle(x,y,Number(blockSize.value),Number(blockSize.value))
    }
}

function mainUpdate(){
    for (let i=0;i<canvasId;i+=1){
        brushes[i].clearRect(0, 0, canvases[i].width, canvases[i].height)
        canvases[i].height = Number(blockSize.value) * 3
        canvases[i].width = Number(blockSize.value) * 3
    }
    for (let drawers of brushes){
        strokeSquareGrid(drawers)
    }
    requestAnimationFrame(mainUpdate)
}

mainUpdate()