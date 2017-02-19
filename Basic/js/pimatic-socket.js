//Kitsunen's quick and dirty socket.io API connection for own uses.

    $("#body-message").html("Connecting to Pimatic API");	
    $("#loading").show();

//DEFINE THE CONNECTION
var socket = io.connect('http://pimatic_ip/?username=admin&password=admin', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 3000,
  timeout: 20000,
  forceNew: true
});
//MESSAGE ON CONSOLE WHEN CONNECTED
socket.on('connect', function() {
  console.log('Connection to Pimatic API Established');
  $("#body-message").html("Connection to Pimatic API Established");	
});
//SHOW ALL EVENTS ON CONSOLE
socket.on('event', function(data) {
  console.log(data);
});
//MESSAGE ON CONSOLE WHEN DISCONNECTED
socket.on('disconnect', function(data) {
  console.log('Connection to Pimatic API lost, reconnecting...');
});


$( document ).ready(function() {
	GetStates();
});



//***********************************************
//**************API: DEVICES API*****************
//*********BEGIN ON-CONNECT STATE CHECKS*********
//***THESE FILL UP THE USER INTERFACE ON START***
//***********************************************

function GetStates()
{
	socket.on('devices', function(devices)
	{
		console.log(devices);
		
		$.each( devices, function( key, value )
		{
			// Find every switch that's also in the html and set correct button state
			if(devices[key].template == "switch" && $("#gui").find("#" + devices[key].id).length > 0)
			{
				toggleUI(devices[key]["attributes"][0].value, devices[key].id)
			}

			// Find every presence device that's also in the html and set correct state
			if((devices[key].template == "presence" || devices[key].template == "contact") && $("#gui").find("#" + devices[key].id).length > 0)
			{
				toggleCircle(devices[key].attributes[0].value, devices[key].id)
			}
			
			if (devices[key].id == "id-woonkamer-temperatuur")
			{				
				$("#gui").find('#WoonkamerTemperature').html("Woonkamer " + devices[key].attributes[0].value +" °C")
			}
			
			if (devices[key].id == "weer")
			{
				$("#gui").find('#BuitenTemperature').html("Lelystad " + devices[key].attributes[0].value +" °C");
			}

			if (devices[key].id == "thermostaat")
			{
				$("#gui").find('#setpoint').html("Setpoint " + devices[key].attributes[0].value +" °C");
				$("#gui").find('#mode').html(" [" + devices[key].attributes[2].value +"]");
			}
		});
		
		$("#loading").hide();
		$("#gui").show();
	});
}
   
//***********************************************
//***********REALTIME SOCKET CHECK***************
//**** THESE TAKE CARE THAT THE FIELDS ARE ******
//*************** ALWAYS UP TO DATE *************
//***********************************************

socket.on('deviceAttributeChanged', function(attrEvent) {
  console.log(attrEvent);
	if($("#gui").find("#" + attrEvent.deviceId).length > 0)
	{
		//alert("incoming event bestaat in html: " + attrEvent.deviceId)
		if ($("#gui").find("#" + attrEvent.deviceId).hasClass("uibutton"))
		{
			//alert("toggle button")
			toggleUI(attrEvent.value, attrEvent.deviceId)
		}
		
		if ($("#gui").find("#" + attrEvent.deviceId).hasClass("circle"))
		{
			//alert(attrEvent.value + attrEvent.deviceId)
			toggleCircle(attrEvent.value, attrEvent.deviceId)
		}
	}
      
   if (attrEvent.deviceId == "id-woonkamer-temperatuur")
   {
		$("#gui").find('#WoonkamerTemperature').html("Woonkamer " + attrEvent.value +" °C");
   }

   if (attrEvent.deviceId == "thermostaat" && attrEvent.attributeName == "temperatureSetpoint")
   {
	   $("#gui").find('#setpoint').html("Setpoint " + attrEvent.value +" °C");
   }

   if (attrEvent.deviceId == "thermostaat" && attrEvent.attributeName == "mode")
   {
	   $("#gui").find('#mode').html(" [" + attrEvent.value + "]");
   }
   
   	if (attrEvent.deviceId == "anybody-home")
	{
		toggleCircle(attrEvent.value.toString(), "anybodyhome")
	}
	
	if (attrEvent.deviceId == "telefoon-richard")
	{
		toggleCircle(attrEvent.value.toString(), "telefoon-richard")
	}

	if (attrEvent.deviceId == "telefoon-simone")
	{
		toggleCircle(attrEvent.value.toString(), "telefoon-simone")
	}
	
	if (attrEvent.deviceId == "telefoon-elise")
	{
		toggleCircle(attrEvent.value.toString(), "telefoon-elise")
	}


});
//***********************************************
//END OF SOCKET IO RECEIVING PARTS***************
//START OF SOCKET IO SENDING PARTS***************
//DIRTY SOLUTION TO BIND BUTTONS TO ACTIONS******
//***********************************************

function ChangeSetpoint(type){
	socket.emit('call', {
        id: 'executeAction-1',
        action: 'executeAction',
        params: {
            actionString: 'press ' + type
        }
    });

}

function toggleDevice(device){
	socket.emit('call', {
        id: 'executeAction-1',
        action: 'executeAction',
        params: {
            actionString: 'toggle ' + device
        }
    });
}

function toggleUI(state, device)
{
	if (state == true)
	{
		$("#gui").find('#' + device).addClass('active');
	}
	else
	{
		$("#gui").find('#' + device).removeClass('active');
	}
}

function toggleCircle(state, device)
{
	if (state == true)
	{
		$("#gui").find("#" + device).html("<span class='fa fa-circle pull-right'></span>");
	}			
	if (state == false)
	{
		$("#gui").find("#" + device).html("<span class='fa fa-circle-o pull-right'></span>");
	}
}
