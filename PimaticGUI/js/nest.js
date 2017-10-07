var MIN_TEMPERATURE=10;
var MAX_TEMPERATURE=30;
var DEF_TEMPERATURE=10;
var CurrentSetpoint = "";

$( document ).ready(function()
{
	var n=new Nest("div#ring", MIN_TEMPERATURE, MAX_TEMPERATURE,"TEMP °C",setTemperature);
})

function nestbgcolor()
{
	 var hue=60-(CurrentSetpoint-MIN_TEMPERATURE)/(MAX_TEMPERATURE-MIN_TEMPERATURE)*60;
	 var css="hsl("+hue.toString()+",100%,40%)";
	 bgcolor = css;
	 document.body.style.backgroundColor=css;

}

function DrawNestDiff()
{
	var selector = "div#ring"
	
	// clear first
	for (i=0;i<181;i++)
	{
		var lineSelector=selector+" svg#ring-lines line:nth-child("+i+")";
		TweenMax.to(lineSelector, .3, {css:{stroke:'rgba(255, 255, 255, .5)'}});
	}
	var marker = (180 / (MAX_TEMPERATURE-MIN_TEMPERATURE) ) * (current - MIN_TEMPERATURE)
	var marker2 = (180 / (MAX_TEMPERATURE-MIN_TEMPERATURE) ) * (setpoint - MIN_TEMPERATURE)

	if (marker != marker2)
	{
		if (marker > marker2)	
		{
			for (i=marker2;i<marker;i++)
			{
				var lineSelector=selector+" svg#ring-lines line:nth-child("+(180-parseInt(i)).toString()+")";
				TweenMax.to(lineSelector, .3, {css:{stroke:'rgba(255, 0, 0, 1)'}});
			}
		}
		if (marker < marker2)	
		{
			for (i=marker;i<marker2;i++)
			{
				var lineSelector=selector+" svg#ring-lines line:nth-child("+(180-parseInt(i)).toString()+")";
				TweenMax.to(lineSelector, .3, {css:{stroke:'rgba(0, 255, 0, 1)'}});
			}
		}
	}	
}

 function setTemperature(value){
	 CurrentSetpoint = value;
	 var temperature="";
	 if(value<18)
		 temperature="cold";
	 else if(value<=19)
		 temperature="cool";
	 else if(value<22)
		 temperature="warm";
	 else if(value<24)
		 temperature="hot";
	 else if(value<=30)
		 temperature="are you nuts?!";
 
	 var temperatureOutput=document.querySelector("div.temperature");
	 temperatureOutput.innerHTML=temperature;
 
	 var hue=60-(value-MIN_TEMPERATURE)/(MAX_TEMPERATURE-MIN_TEMPERATURE)*60;
	 var css="hsl("+hue.toString()+",100%,40%)";
	 
	if (CurrentPage == "Nest")
	{
		 bgcolor = css;
		 document.body.style.backgroundColor=css;
	}
 }

//Nest Class
Nest = function(selector, from, to, label, onValueChanged) {

	//OPTIONS
	var defaultOptions={from:from||0, to:to||180,label:label||"",onValueChanged:onValueChanged||null};
	//var customOptions=options||{};

    //DOM ELEMENTS
	var dragger,output;

	//VARIABLES
	var ratio, numLines;
	var dragStartX, dragStartY;
	var currentTheta=0;
	var currentValue=0;
	
	function initialize(){


		//_.extend(defaultOptions,customOptions);

		currentValue=defaultOptions.from;

		
		var label=document.querySelector(selector+" div.output small");
		label.innerHTML=defaultOptions.label;

		//output=document.querySelector(selector+" div.output strong");
		//output.innerHTML=currentValue.toString();

		numLines=document.querySelectorAll(selector+" svg#ring-lines line").length;
		ratio=Math.round(360/numLines);
		dragger=document.querySelector(selector+" svg#marker polygon");

		dragger.addEventListener('mousedown', startDragging);
		dragger.addEventListener('touchstart', startDragging);
		

	}

	function startDragging(e){
		window.addEventListener('mousemove', performDragging);
		window.addEventListener('mouseup', stopDragging);
		document.body.addEventListener('touchmove', performDragging);
		document.body.addEventListener('touchend', stopDragging);
		e.preventDefault();
	}

	function stopDragging(e){
		window.removeEventListener('mousemove', performDragging);
		window.removeEventListener('mouseup', stopDragging);
		document.body.removeEventListener('touchmove', performDragging);
		document.body.removeEventListener('touchend', stopDragging);
		
		output=document.querySelector("div#ring div.output strong");
		var tt = output.innerHTML
		ChangeSetpointNest(parseFloat(tt))
		e.preventDefault();
	}

	function highlightLine(index){
		var lineSelector=selector+" svg#ring-lines line:nth-child("+(180-index).toString()+")";
		TweenMax.to(lineSelector, .3, {css:{stroke:'rgba(255, 255, 255, 1)'}});
	    TweenMax.to(lineSelector, .8, {delay:.3, css:{stroke:'rgba(255, 255, 255, .5)'}});
		//console.log("Lineselector: " + lineSelector)
	}


	function performDragging(e){
		var x=(e.clientX||e.touches[0].pageX)-(ring.offsetLeft+ring.offsetWidth/2);
		var y=(e.clientY||e.touches[0].pageY)-(ring.offsetTop+ring.offsetHeight/2);

		var theta=Math.atan2(y,x)*(180/Math.PI); //[-180,180]
		theta=(theta+360+90)%360;
		TweenMax.set(selector+" svg#marker",{rotationZ:theta});

		var roundedTheta=Math.round(theta);
		if(roundedTheta!=currentTheta){
			var diff=(roundedTheta-currentTheta)*(Math.PI/180);
			var shortestRotation=Math.atan2(Math.sin(diff),Math.cos(diff));
			var shortestRotationInDegrees=shortestRotation*(180/Math.PI);
			var direction=shortestRotationInDegrees>0?"CW":"CCW";
			var from=Math.round(currentTheta/ratio);
			var to=Math.round(roundedTheta/ratio);

			switch(direction){
				case "CW":
					 if(to>from){				 	  
				          for (var i=from; i<to; i++) {
				            highlightLine(i);
				          };
				     }
				     else if(to<from){
				          for (var i=from; i<numLines; i++) {
				            highlightLine(i);
				          };
				          for (var i=0; i<to; i++) {
				            highlightLine(i);
				          };
	        		 }
				break;

				case "CCW":
				 	if(to<from){
			          for (var i=from; i>=to;i--) {
			            highlightLine(i);
			          };
			        }
			        else if(to>from){
			         for (var i=from; i>=0; i--) {
				        highlightLine(i);
				      };
				      for (var i=numLines; i>=to; i--) {
				        highlightLine(i);
				      };
			        }
				break;
			}

			
			currentTheta=roundedTheta;

			//var newValue=Math.round((defaultOptions.to-defaultOptions.from)*(currentTheta/360) + defaultOptions.from);
			var newValue=round((defaultOptions.to-defaultOptions.from)*(currentTheta/360) + defaultOptions.from, 0.5);			
			
			if(newValue!=currentValue){
				currentValue=newValue;
				//console.log(currentValue)
				//output.innerHTML=currentValue.toString();
				$("#setpointnest").html(currentValue)

				if (defaultOptions.onValueChanged)
                    defaultOptions.onValueChanged.call(this, currentValue)
			}

			


		}
		e.preventDefault();
	}

function round(value, step) {
    step || (step = 1.0);
    var inv = 1.0 / step;
    return Math.round(value * inv) / inv;
}
	
	initialize();
}