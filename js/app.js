import { loadJson, loadRaw } from "./loadData.js";
import { appState } from './appState.js';
import { WebGLApp } from './webglApp.js';
import { TF } from './TF.js'
import {TFColor} from './TFColor.js'

import Input from "./input.js"


let webglapp = new WebGLApp()
webglapp.runWebglApp();
let tf = new TF(webglapp), tfc = new TFColor(webglapp)

tfc.createColorCanvas()


document.getElementById("openfileActionInput").addEventListener('change', async function(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        try {
            const jsonData = await loadJson(file); // Use the JSON loader
            console.log("Loaded JSON:", jsonData);

            // Update the app state using the AppState object
            appState.setJsonFile(file, jsonData);

            const rawFileName = jsonData.name;
            if (rawFileName) {
                await loadRaw(jsonData);
            } else {
                console.error("JSON does not specify a rawFileName.");
            }

            const currentState = appState.getState();
            console.log("Current App State:", currentState);
            webglapp.createVol()

        } catch (error) {
            console.error("Error loading JSON file:", error);
        }
    } else {
        console.log("No file selected.");
    }
    
});

document.getElementById("shadows").addEventListener("change", function(event) {
    webglapp.setShadows(event.target.checked)
});

document.getElementById("dark").addEventListener("change", function(event) {
    webglapp.setDark(event.target.checked)
});

document.getElementById("svgOverlay").addEventListener("mouseup", function (event) {
    tf.stopDrag(tf.select,event)
    tfc.stopDrag(tf.select,event)
});

document.getElementById('gradStart').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const newVal = parseFloat(document.getElementById('gradStart').value);
        tfc.updateColorCanvas(newVal)
        webglapp.volume.updateColormap()
    }
})

document.getElementById('gradMid').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const newVal = parseFloat(document.getElementById('gradMid').value);
        tfc.updateColorCanvas(tfc.start, newVal, tfc.end)
        webglapp.volume.updateColormap()
    }
})

document.getElementById('gradEnd').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const newVal = parseFloat(document.getElementById('gradEnd').value);
        tfc.updateColorCanvas(tfc.start, tfc.mid, newVal)
        webglapp.volume.updateColormap()
    }
})
    











