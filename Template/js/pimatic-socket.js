//Kitsunen's quick and dirty socket.io API connection for own uses.

// Show the 'loading' screen first when we try to connect to Pimatic
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

// When the connection is established, get all the Pimatic info and 'build' our GUI site
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
		
		// Loop through all the devices we get from Pimatic
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
				$("#gui").find('#LivingRoomTemperature').html("LivingRoomTemperature " + devices[key].attributes[0].value +" °C")
			}
			if (devices[key].id == "weer")
			{
				$("#gui").find('#WeatherTemperature').html("Lelystad " + devices[key].attributes[0].value +" °C");
			}

			if (devices[key].id == "thermostaat")
			{
				$("#gui").find('#setpoint').html("Setpoint " + devices[key].attributes[0].value +" °C");
				$("#gui").find('#mode').html(" [" + devices[key].attributes[2].value +"]");
			}			
			
			});


		
		// Now that we have all the info, and set all the buttons/presence/text we can show the GUI
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

   if (attrEvent.deviceId == "id-woonkamer-temperatuur")
   {
		$("#gui").find('#LivingRoomTemperature').html("LivingRoomTemperature " + attrEvent.value +" °C");
   }

   if (attrEvent.deviceId == "weer")
   {
		$("#gui").find('#WeatherTemperature').html("Lelystad " + attrEvent.value +" °C");
   }
   
   if (attrEvent.deviceId == "thermostaat" && attrEvent.attributeName == "temperatureSetpoint")
   {
	   $("#gui").find('#setpoint').html("Setpoint " + attrEvent.value +" °C");
   }

   if (attrEvent.deviceId == "thermostaat" && attrEvent.attributeName == "mode")
   {
	   $("#gui").find('#mode').html(" [" + attrEvent.value + "]");
   }
   
	// Find out if he update we got from Pimatic is also in our HTML
	if($("#gui").find("#" + attrEvent.deviceId).length > 0)
	{
		// If we have this device and our HTML class is 'uibutton' then treat it as a button (ON/OFF) device
		if ($("#gui").find("#" + attrEvent.deviceId).hasClass("uibutton"))
		{
			toggleUI(attrEvent.value, attrEvent.deviceId)
		}
		
		// If we have this device and our HTML class is 'circle' then treat it as a presence (absent/present) device
		if ($("#gui").find("#" + attrEvent.deviceId).hasClass("circle"))
		{
			toggleCircle(attrEvent.value, attrEvent.deviceId)
		}
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
