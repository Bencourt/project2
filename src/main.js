/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as audio from './audio.js';
import * as utils from './utils.js';
import * as canvas from './canvas.js';

const drawParams = {
    showGradient : true,
    showBars : true,
    showCircles : true,
    showNoise : false,
    showInvert : false,
    showEmboss : false,
    showBW: false
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1  :  "media/My Chemical Romance - Teenagers.mp3"
});

function init(){
    audio.setupWebaudio(DEFAULTS.sound1);
	console.log("init called");
	console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	setupUI(canvasElement);
    canvas.setupCanvas(canvasElement,audio.analyserNode);
    loop();
}

function setupUI(canvasElement){
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#fsButton");
	
  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };
    
    // B
    playButton.onclick = e => {
        console.log(`audioCtx.state before = ${audio.audioCtx.state}`);
        
        if(audio.audioCtx.state == "suspended"){
            audio.audioCtx.resume();
        }
        console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
        if (e.target.dataset.playing == "no"){
            audio.playCurrentSound();
            e.target.dataset.playing = "yes";
        }
        else{
            audio.pauseCurrentSound();
            e.target.dataset.playing = "no";
        }
    };
    
    //C - hookup volume slider & label
    let volumeSlider = document.querySelector("#volumeSlider");
    let volumeLabel = document.querySelector("#volumeLabel");
    
    let bassSlider = document.querySelector("#bassSlider");
    let bassLabel = document.querySelector("#bassLabel");
    
    let trebleSlider = document.querySelector("#trebleSlider");
    let trebleLabel = document.querySelector("#trebleLabel");
    
    //add .oninput event to slider
    volumeSlider.oninput = e =>{
        //set the gain
        audio.setVolume(e.target.value);
        //update value label
        volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
    };
    
    
    
	//set value of label to match initial value of slider
    volumeSlider.dispatchEvent(new Event("input"));
    
    bassSlider.oninput = e =>{
        //set the gain
        audio.setBass(e.target.value);
        //update value label
        bassLabel.innerHTML = Math.round((e.target.value/15 * 100));
    };
    
    
    
	//set value of label to match initial value of slider
    bassSlider.dispatchEvent(new Event("input"));
    
    trebleSlider.oninput = e =>{
        //set the gain
        audio.setHigh(e.target.value);
        //update value label
        trebleLabel.innerHTML = Math.round((e.target.value/15 * 100));
    };
    
    
    
	//set value of label to match initial value of slider
    trebleSlider.dispatchEvent(new Event("input"));
    
    //D - hookup track <select>
    let trackSelect = document.querySelector("#trackSelect");
    //add .onchange event to <select>
    trackSelect.onchange = e => {
        audio.loadSoundFile(e.target.value);
        // pause the current track if it is playing
        document.querySelector("#time").innerHTML = "0:00";
        audio.audioCtx.currentTime = 0;
        if(playButton.dataset.playing == "yes"){
            playButton.dispatchEvent(new MouseEvent("click"));
        };
    };
    
    //set up checkboxes
    let gradientCB = document.querySelector("#gradientCB");
    let barsCB = document.querySelector("#barsRb");
    let wavesCB = document.querySelector("#wavesRb");
    let circlesCB = document.querySelector("#circlesCB");
    let noiseCB = document.querySelector("#noiseCB");
    let invertCB = document.querySelector("#invertCB");
    let radioButtons = document.getElementsByName("bars");
    let bwCB = document.querySelector("#bwCB");
    
    gradientCB.checked = true;
    barsCB.checked = true;
    circlesCB.checked = true;
    noiseCB.checked = false;
    invertCB.checked = false;
    bwCB.checked = false;

    
    gradientCB.onchange = e => {
        if(gradientCB.checked){
            drawParams.showGradient = true;
        }
        else{
            drawParams.showGradient = false;
        }
    }
    
    barsCB.onchange = e => {
        if(barsCB.checked){
            drawParams.showBars = true;
        }
        else{
            drawParams.showBars = false;
        }
    }
    
    wavesCB.onchange = e => {
        if(wavesCB.checked){
            drawParams.showBars = false;
        }
        else{
            drawParams.showBars = true;
        }
    }
    
    
    circlesCB.onchange = e => {
        if(circlesCB.checked){
            drawParams.showCircles = true;
        }
        else{
            drawParams.showCircles = false;
        }
    }
    
    noiseCB.onchange = e => {
        if(noiseCB.checked){
            drawParams.showNoise = true;
        }
        else{
            drawParams.showNoise = false;
        }
    }
    
    invertCB.onchange = e => {
        if(invertCB.checked){
            drawParams.showInvert = true;
        }
        else{
            drawParams.showInvert = false;
        }
    }
    
    bwCB.onchange = e => {
        if(bwCB.checked){
            drawParams.showBW = true;
        }
        else{
            drawParams.showBW = false;
        }
    }

} // end setupUI

function loop(){
	requestAnimationFrame(loop);
    
    let audioTime = document.querySelector("#time");
    if(playButton.dataset.playing == "yes")
        {
        let seconds = Math.floor(audio.audioCtx.currentTime);
        let minutes = 0;
        if(seconds > 60)
            {
                minutes = Math.floor(seconds/60);
            }
            if((seconds - (minutes *60)) < 10)
                audioTime.innerHTML = minutes + ":0" + (seconds - (minutes *60));
            else
                audioTime.innerHTML = minutes + ":" + (seconds - (minutes *60));
        }
    
	canvas.draw(drawParams);
}

export {init};