/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,analyserNodeWaveform,audioData;


function setupCanvas(canvasElement,analyserNodeRef){
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"#000"},{percent:.5,color:"#da6d00"},{percent:1,color:"#000"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
    analyserNodeWaveform = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);
}

function draw(params={}){
  // 1 - populate the audioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
    if(params.showBars)
	   analyserNode.getByteFrequencyData(audioData);
	else
	   analyserNodeWaveform.getByteTimeDomainData(audioData); // waveform data
	
	// 2 - draw background
	ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();
		
	// 3 - draw gradient
	if(params.showGradient){
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = .3;
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        ctx.restore();
    }
    // 5 - draw circles
		if(params.showCircles){
            let maxRadius = canvasHeight/4;
            ctx.save();
            ctx.globalAlpha = .5;
            for(let i=0; i<audioData.length; i++){
                let percent = audioData[i] / 255;
                
                let circleRadius = percent * maxRadius;
                ctx.beginPath();
                ctx.fillStyle = utils.makeColor(111, 111, 111, .5 - percent/3.0);
                ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.closePath();
                
                ctx.beginPath();
                ctx.fillStyle = utils.makeColor(222, 222, 222,.1 - percent/10.0);
                ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius * 1.5, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.closePath();
                
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = utils.makeColor(0, 0, 0, .5 - percent/5.0);
                ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius * .5, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            }
            ctx.restore();
        }
    
	// 4 - draw bars
	if(params.showBars){
        let barSpacing = 7;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / (2*audioData.length);
        let barHeight = 200;
        let topSpacing = 0;
        
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.strokeStyle = 'rgba(255,255,255,1)';
        ctx.translate(canvasWidth/2, canvasHeight/2);
        for(let i = 0; i < audioData.length; i++){
            ctx.rotate(-(180/audioData.length) * Math.PI/180);
            ctx.fillRect(0,0-(audioData[i]*1.5),barWidth,audioData[i]/1.5);
        }
        ctx.rotate((360) * Math.PI/180);
        for(let i = 0; i < audioData.length; i++){
            ctx.rotate(-(180/audioData.length) * Math.PI/180);
            ctx.fillRect(0,0-(audioData[i]*1.5),barWidth,audioData[i]/1.5);
        }
        ctx.restore();
    }
    //show waveform data
    else{
        for(let i=0; i<audioData.length; i++){
            if(i%5 == 0){
                ctx.save();
                ctx.strokeStyle = 'rgba(255,255,255,1)';
                ctx.beginPath();
                ctx.moveTo(canvasWidth*.4,canvasHeight*.5);
                ctx.bezierCurveTo(canvasWidth*.41, audioData[i] - 20, canvasWidth*.59, audioData[i]-20, canvasWidth*.6, canvasHeight*.5);
                ctx.stroke();
                ctx.restore();

                ctx.save();
                ctx.strokeStyle = 'rgba(255,255,255,1)';
                ctx.beginPath();
                ctx.moveTo(canvasWidth*.4,canvasHeight*.5);
                ctx.bezierCurveTo(canvasWidth*.41, audioData[i] + 560, canvasWidth*.59, audioData[i]+560, canvasWidth*.6, canvasHeight*.5);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
	
    // 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
	// the variable `data` below is a reference to that array 
	let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width;
    
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for(let i = 0; i < length; i +=4)
        {
            // C) randomly change every 20th pixel to red
            if(params.showNoise && Math.random() < .05)
                {
			     // data[i] is the red channel
			     // data[i+1] is the green channel
			     // data[i+2] is the blue channel
			     // data[i+3] is the alpha channel
			     // zero out the red and green and blue channels
                    data[i] = data[i+1] = data [i+2] = 0;
			     // make the red channel 100% red
                    data[i] = 100;
                    data[i+2] = 100;
            }// end if
            
            if(params.showInvert)
                {
                    let red = data[i], green = data[i+1], blue = data[i+2];
                    data[i] = 255 - red;
                    data[i+1] = 255 - green;
                    data[i+2] = 255 - blue;
                }
            
            if(params.showBW)
                {
                    let avg = (data[i] + data[i+1] + data[i+2])/3;
                    data[i] = avg;
                    data[i+1] = avg;
                    data[i+2] = avg;
                }
        } // end for
	       
	// D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
}

export {setupCanvas,draw};