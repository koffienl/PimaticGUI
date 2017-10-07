var socket;
var output;
var logging;
var pages = [];

$( document ).ready(function()
{
	var SocketURL;
	
	// create nice array with every possible page
	$.each( tabs, function( key, value )
	{
		if (tabs[key]["hasSubPages"] == true)
		{
			pages.push(tabs[key]["SubPagesConfig"][0]["true"]);
			pages.push(tabs[key]["SubPagesConfig"][0]["false"]);
		}
		else
		{
			pages.push(tabs[key]["name"]);
		}
	})
	
	if (config["bgcolor"] != undefined)
	{
		document.body.style.backgroundColor=config["bgcolor"];
	}
	if (config["bgimage"] != undefined)
	{
		$('body').css('background', '#000 url('+config["bgimage"]+') no-repeat center center fixed');
		$('body').css('background-size', 'cover');		
	}
	
	$("#body-message").html("Connecting to Pimatic API");	
	$("#loading").show();
	
	if (config["pimatic_user"] == "" && config["pimatic_password"] == "")
	{
		CookieUser = readCookie("APIuser");
		CookiePassword = readCookie("APIpassword");
		if (CookieUser == null || CookiePassword == null)
		{		
			$(".modal-title1").html("Please login");
			$("#modal-body-text").html("Please enter user and password for pimatic API");
			$("#DoFunction").html("Login");
			$("#DoFunction").attr("title", "DoLogin");
			$('#modal-dialog').modal('show');
		}
		else
		{
			SocketURL = config["pimatic_protocol"] + config["pimatic_address"] + ":" + config["pimatic_port"] + "/?username=" + CookieUser + "&password=" + CookiePassword
			StartSocket();
			GetStates();
		}
	}
	else
	{
		SocketURL = config["pimatic_protocol"] + config["pimatic_address"] + ":" + config["pimatic_port"] + "/?username=" + encodeURIComponent(config["pimatic_user"]) + "&password=" + encodeURIComponent(config["pimatic_password"])
		StartSocket();
		GetStates();
	}

	function StartSocket()
	{
		console.log('Connecting to Pimatic API ...');
		socket = io.connect(SocketURL, {
		reconnection: true,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 3000,
		timeout: 20000,
		forceNew: true
		});

		socket.on('connect', function()
		{
			console.log('Connection to Pimatic API Established ...');
			$("#body-message").html("Connection to Pimatic API Established");
		});
		
		//SHOW ALL EVENTS ON CONSOLE
		socket.on('event', function(data)
		{
			console.log(data);
		});

		//MESSAGE ON CONSOLE WHEN DISCONNECTED
		socket.on('disconnect', function(data)
		{
			console.log('Connection to Pimatic API lost, reconnecting...');
		});
	}

	// Capture submitting credentials from the login-modal when the user hits ENTER
	$(function(){
	  $('.modal-content').keypress(function(e){
		if(e.which == 13) {
		  login();
		}
	  })
	})

	// Capture submitting credentials from the login-modal when the user cliks on LOGIN
	$("#DoFunction").click(function(){
		event.preventDefault();
		login();
	});
		
	// Actual login function when credentials are passed through the login-modal
	function login()
	{
		$("#modal-dialog").modal("hide");
		var linkTitle = $("#DoFunction").attr("title");
		if (linkTitle == "DoLogin")
		{
			APIuser = encodeURIComponent($("#api_username").val());
			APIpassword = encodeURIComponent($("#api_password").val());
			
			if (config["pimatic_cookies"] == true)
			{
				createCookie("APIuser",APIuser);
				createCookie("APIpassword",APIpassword);
			}
			
			SocketURL = config["pimatic_protocol"] + config["pimatic_address"] + ":" + config["pimatic_port"] + "/?username=" + APIuser + "&password=" + APIpassword
			StartSocket();
			GetStates();
		}
	}

	//***********************************************
	//**************API: DEVICES API*****************
	//*********BEGIN ON-CONNECT STATE CHECKS*********
	//***THESE FILL UP THE USER INTERFACE ON START***
	//***********************************************
	function GetStates()
	{
	socket.on('devices', function(devices)
	{
		//logging = "";
		$("#body-message").html("Parsing devices ...");
		console.log("Parsing devices ...")
		
		// Loop through all the devices to set correct display values and states
		$.each( devices, function( key, value )
		{
			logging += devices[key].id + ': ' + devices[key].attributes[0].value+'; ';
			var AlreadyParsed = 0;
						
			// NEST only
			if (devices[key].id == config["Device_RoomTemp"])
			{
				var val = devices[key].attributes[0].value
				val = parseFloat(val).toFixed(config["decimals"])
				$("#roomtemp").html("room " + val + " " + devices[key].attributes[0].unit)
				//$("#roomtemp").html("room " + devices[key].attributes[0].value +" °C")
				current = devices[key].attributes[0].value
				DrawNestDiff();
			}

			if (devices[key].id == config["Device_Heat"] && devices[key].attributes[0].value == true)
			{
				$("#fire" ).addClass("fa fa-fire");
			}

			if (devices[key].id == config["Device_Heat"] && devices[key].attributes[0].value == false)
			{
				$("#fire" ).removeClass("fa fa-fire");
			}
			
			if (devices[key].id == config["Device_Thermostat"])
			{
				setpoint = devices[key].attributes[0].value;
				CurrentSetpoint = setpoint;
				
				output=document.querySelector("div#ring div.output strong");
				output.innerHTML=devices[key].attributes[0].value.toString();
				setTemperature(devices[key].attributes[0].value)
				var marker = (360 / (MAX_TEMPERATURE-MIN_TEMPERATURE) ) * (MIN_TEMPERATURE + devices[key].attributes[0].value)
				TweenMax.set("div#ring svg#marker",{rotationZ:marker});
			}
			// NEST only
			
			// Forward every SWITCH device to the 'toggleUI' function
			if(devices[key].template == "switch")
			{
				//console.log("switch gevonden: " + devices[key].id + " state: " + devices[key]["attributes"][0].value)
				toggleUI(devices[key]["attributes"][0].value, devices[key].id)
				AlreadyParsed = 1;
			}

			// Forward every PRESENCE or CONTACT device to the 'toggleContact' function
			if((devices[key].template == "presence" || devices[key].template == "contact"))
			{
				//console.log("bolletje gevonden: " + devices[key].id + " state: " + devices[key]["attributes"][0].value)
				toggleContact(devices[key].attributes[0].value, devices[key].id)
				AlreadyParsed = 1;
			}

			// Forward every DIMMER device to the 'DimlevelUI' function
			if(devices[key].template == "dimmer")
			{
				DimlevelUI(devices[key].attributes[0].value, devices[key].id, devices[key].attributes[0].unit)
				AlreadyParsed = 1;
			}

			if (AlreadyParsed == 0)
			{
				$.each( pages, function( key2, value2 )
				{
					var FindDiv = pages[key2]
					
					// Find the device for Thermostat and display values in GUI
					if (devices[key].id == config["Device_Thermostat"])
					{
						$("#" + FindDiv).find('#setpoint').html(devices[key].attributes[0].value);
						$("#" + FindDiv).find('#setpoint\\.unit').html(devices[key].attributes[0].unit);
						$("#" + FindDiv).find('#mode').html(" [" + devices[key].attributes[2].value +"]");
					}
					
					if (devices[key].template == "timer")
					{
						if (devices[key].attributes[1].value == true)
						{
							$("#" + FindDiv).find('#' + devices[key].id + '\\.' + 'status').html("<span class='fa fa-play pull-right'></span>");
							$("#" + FindDiv).find('#' + devices[key].id).html(" " + devices[key].attributes[0].value.toString().toHHMMSS());
						}
						if (devices[key].attributes[1].value == false)
						{
							$("#" + FindDiv).find('#' + devices[key].id + '\\.' + 'status').html("<span class='fa fa-stop pull-right'></span>");
							$("#" + FindDiv).find('#' + devices[key].id).html(" " + devices[key].attributes[0].value.toString().toHHMMSS());
						}
					}

					// Any device that is not used yet, is searched for in the HTML and if needed displayed in the GUI
					// Do this only with devices that have just 1 attribute set
					//if (AlreadyParsed == 0 && devices[key].attributes.length == 1)
					if (devices[key].attributes.length == 1)
					{
						var val = devices[key].attributes[0].value
						if ($.isNumeric(val) && Math.round(val) !== val)
						{
							val = parseFloat(val).toFixed(config["decimals"])
						}
						$("#" + FindDiv).find('#' + devices[key].id).html(val);
						$("#" + FindDiv).find('#' + devices[key].id + '\\.unit').html(" " + devices[key].attributes[0].unit);
					}

					// Any device that is not used yet, is searched for in the HTML and if needed displayed in the GUI
					// Do this only with devices that have more then 1 attribute
					// There has to be a element with a ID  named like : ID_attributeName
					//if (devices[key].attributes.length > 1 && AlreadyParsed == 0)
					if (devices[key].attributes.length > 1)
					{
						for (var num in devices[key].attributes)
						{
							var val = devices[key].attributes[num].value
							if ($.isNumeric(val) && Math.round(val) !== val)
							{
								val = parseFloat(val).toFixed(config["decimals"])
							}
							$("#" + FindDiv).find('#' + devices[key].id + '\\.' + devices[key].attributes[num].name).html(val);
							$("#" + FindDiv).find('#' + devices[key].id + '\\.' + devices[key].attributes[num].name + '\\.unit').html(" " + devices[key].attributes[num].unit);
						}
					}
				})
			}
		});
		$('#log-content').append(logging + "<br>");
		//$("#loading").hide();

		// First loop through the entire object to figure out what 'Child page should be set as active
		$.each( tabs, function( key, value )
		{
			if (tabs[key]["hasSubPages"] == true)
			{
				$.each( devices, function( key2, value2 )
				{
					if (devices[key2].id == tabs[key]["SubPagesConfig"][0]["device"])
					{
						if (devices[key2]["attributes"][0].value == true)
						{
							tabs[key]["SubPagesConfig"][0]["currentSubPage"] = tabs[key]["SubPagesConfig"][0]["true"]
							
						}
						if (devices[key2]["attributes"][0].value == false)
						{
							tabs[key]["SubPagesConfig"][0]["currentSubPage"] = tabs[key]["SubPagesConfig"][0]["false"]
						}
					}
				})
			}
			
			if (tabs[key]["default"] == true)
			{
				if (config["calendar"] == true)
				{
					UpdateCalendar();
					setInterval(UpdateCalendar, 300000);
				}
				if (CurrentPage == "")
				{
					console.log("Parsing devices done, show default page (" + tabs[key]["name"] + ")")
					$("#loading").hide();
					ToggleContent(tabs[key]["name"])
				}
			}
			
		})
	});

	//***********************************************
	//***********REALTIME SOCKET CHECK***************
	//**** THESE TAKE CARE THAT THE FIELDS ARE ******
	//*************** ALWAYS UP TO DATE *************
	//***********************************************
	socket.on('deviceAttributeChanged', function(attrEvent)
	{
		// Find out if the updated device is a special switch used to change season mode
		// If the device is a season device AND the current (visible) page/tab is the parent of the season then switch the season
		$.each( tabs, function( key, value )
		{
			if (tabs[key]["hasSubPages"] == true)
			{
					if (attrEvent.deviceId == tabs[key]["SubPagesConfig"][0]["device"])
					{
						if (attrEvent.value == true)
						{
							tabs[key]["SubPagesConfig"][0]["currentSubPage"] = tabs[key]["SubPagesConfig"][0]["true"]
							
						}
						if (attrEvent.value == false)
						{
							tabs[key]["SubPagesConfig"][0]["currentSubPage"] = tabs[key]["SubPagesConfig"][0]["false"]
						}
						
						if (CurrentPage == tabs[key]["name"])
						{
							$("#" + tabs[key]["SubPagesConfig"][0]["true"]).hide();
							$("#" + tabs[key]["SubPagesConfig"][0]["false"]).hide();
							ToggleContent(tabs[key]["name"])
						}
					}
				
			}
		})		

		var AlreadyParsed = 0;
		console.log(attrEvent);
		if (CurrentPage == "Log")
		{
			var logging = '';
			for (var property in attrEvent) {
				logging += property + ': ' + attrEvent[property]+'; ';
			}
			//document.getElementById('audiotag1').play();
			$('#log-content').append(logging + "<br>");
			$("html,body").animate({ scrollTop: document.getElementById("Log").scrollHeight }, "fast");
		}
				
		// for nest
		if (attrEvent.deviceId == "thermostaat" && attrEvent.attributeName == "temperatureSetpoint")
		{
			output=document.querySelector("div#ring div.output strong");
			output.innerHTML=attrEvent.value.toString();
			setTemperature(attrEvent.value)
			var marker = (360 / (MAX_TEMPERATURE-MIN_TEMPERATURE) ) * (MIN_TEMPERATURE + attrEvent.value)
			TweenMax.set("div#ring svg#marker",{rotationZ:marker});
			setpoint = attrEvent.value
			DrawNestDiff();
		}
		
		$.each( pages, function( key, value )
		{
			if (attrEvent.deviceId == "thermostaat" && attrEvent.attributeName == "temperatureSetpoint")
			{
				$("#" + pages[key]).find('#setpoint').html(attrEvent.value)
			}
			
			if (attrEvent.deviceId == "id-woonkamer-temperatuur")
			{				
				$("#roomtemp").html("room " + attrEvent.value +" °C")
				current = attrEvent.value
				DrawNestDiff();
			}
			
			if (attrEvent.attributeName == "running")
			{
				if (attrEvent.value == true)
				{
					$("#" + pages[key]).find('#' + attrEvent.deviceId + '\\.' + 'status').html("<span class='fa fa-play pull-right'></span>");
				}
				if (attrEvent.value == false)
				{
					$("#" + pages[key]).find('#' + attrEvent.deviceId + '\\.' + 'status').html("<span class='fa fa-stop pull-right'></span>");
				}
				AlreadyParsed = 1;
			}
			
			if (attrEvent.attributeName == "time")
			{
				$("#" + pages[key]).find('#' + attrEvent.deviceId).html(attrEvent.value.toString().toHHMMSS());
				AlreadyParsed = 1;				
			}
			
			if (AlreadyParsed == 0)
			{
				var val = attrEvent.value
				if ($.isNumeric(val) && Math.round(val) !== val)
				{
					val = parseFloat(val).toFixed(config["decimals"])
				}
				$("#" + pages[key]).find('#' + attrEvent.deviceId + '\\.' + attrEvent.attributeName).html(val);
				$("#" + pages[key]).find('#' + attrEvent.deviceId).html(val);
			}
		})

		/* DONE
		if (attrEvent.deviceId == "thermostaat" && attrEvent.attributeName == "temperatureSetpoint")
		{
			$.each( tabs, function( key2, value2 )
			{
				var FindDiv = tabs[key2]["name"]
				if (tabs[key2]["hasSubPages"] == true)
				{
					FindDiv = tabs[key2]["SubPagesConfig"][0]["currentSubPage"]
				}
				$("#" + FindDiv).find('#setpoint').html(attrEvent.value)
			})
		}
		*/
		
		/* DONE
		if (attrEvent.deviceId == "id-woonkamer-temperatuur")
		{				
			$("#roomtemp").html("room " + attrEvent.value +" °C")
			current = attrEvent.value
			DrawNestDiff();
		}
		*/
			
		// END for nest

		// Forward every PRESENCE or CONTACT device to the 'toggleContact' function
		if(attrEvent.attributeName == "dimlevel")
		{
			DimlevelUI(attrEvent.value, attrEvent.deviceId, "")
			AlreadyParsed = 1;
		}
		
		if (attrEvent.attributeName == "state")
		{
			toggleUI(attrEvent.value, attrEvent.deviceId)
			AlreadyParsed = 1;
		}
  
		if (attrEvent.attributeName == "presence" || attrEvent.attributeName == "contact")
		{
			toggleContact(attrEvent.value, attrEvent.deviceId)
			AlreadyParsed = 1;
		}

		/* DONE
		if (attrEvent.attributeName == "running")
		{
			$.each( tabs, function( key2, value2 )
			{
				var FindDiv = tabs[key2]["name"]
				if (tabs[key2]["hasSubPages"] == true)
				{
					FindDiv = tabs[key2]["SubPagesConfig"][0]["currentSubPage"]
				}
				if (attrEvent.value == true)
				{
					$("#" + FindDiv).find('#' + attrEvent.deviceId + '\\.' + 'status').html("<span class='fa fa-play pull-right'></span>");
				}
				if (attrEvent.value == false)
				{
					$("#" + FindDiv).find('#' + attrEvent.deviceId + '\\.' + 'status').html("<span class='fa fa-stop pull-right'></span>");
				}
			})
			AlreadyParsed = 1;				
		}
		*/

		/* DONE
		if (attrEvent.attributeName == "time")
		{
			$.each( tabs, function( key2, value2 )
			{
				var FindDiv = tabs[key2]["name"]
				if (tabs[key2]["hasSubPages"] == true)
				{
					FindDiv = tabs[key2]["SubPagesConfig"][0]["currentSubPage"]
				}
				$("#" + FindDiv).find('#' + attrEvent.deviceId).html(attrEvent.value.toString().toHHMMSS());
			})
			AlreadyParsed = 1;				
		}
		*/
		


		/* DONE
		if (AlreadyParsed == 0)
		{
			$.each( tabs, function( key, value)
			{
				var FindDiv = tabs[key]["name"]
				if (tabs[key]["hasSubPages"] == true)
				{
					FindDiv = tabs[key]["SubPagesConfig"][0]["currentSubPage"]
				}
				var val = attrEvent.value
				if ($.isNumeric(val) && Math.round(val) !== val)
				{
					val = parseFloat(val).toFixed(config["decimals"])
				}
				$("#" + FindDiv).find('#' + attrEvent.deviceId + '\\.' + attrEvent.attributeName).html(val);
				$("#" + FindDiv).find('#' + attrEvent.deviceId).html(val);
			})
		}
		*/
	});
	}
});

function ChangeSetpoint(type){
	socket.emit('call', {
        id: 'executeAction-1',
        action: 'executeAction',
        params: {
            actionString: 'press ' + type
        }
    });
}

function ChangeSetpointNest(setpoint)
{
	socket.emit('call', {
	  id: 'update-variable-call1',
	  action: 'updateVariable',
	  params: {
		name: config["Nest_Setpoint_var"],
		type: 'value',
		valueOrExpression: setpoint
	  }
	});
}

function toggleDevice(device)
{
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
	$.each( pages, function( key, value )
	{
		if (state == true)
		{
			$("#" + pages[key]).find('#' + device).addClass('active');
		}
		if (state == false)
		{
			$("#" + pages[key]).find('#' + device).removeClass('active');
		}		
	})
	/*
	if (state == true)
	{
		$.each( tabs, function( key, value )
		{
			if (tabs[key]["hasSubPages"] == true)
			{
				$("#" + tabs[key]["SubPagesConfig"][0]["true"]).find('#' + device).addClass('active');
				$("#" + tabs[key]["SubPagesConfig"][0]["false"]).find('#' + device).addClass('active');
			}
			else
			{
				$("#" + tabs[key]["name"]).find('#' + device).addClass('active');
			}
		})
	}
	
	if (state == false)
	{
		$.each( tabs, function( key, value )
		{
			if (tabs[key]["hasSubPages"] == true)
			{
				$("#" + tabs[key]["SubPagesConfig"][0]["true"]).find('#' + device).removeClass('active');
				$("#" + tabs[key]["SubPagesConfig"][0]["false"]).find('#' + device).removeClass('active');
			}
			else
			{
				$("#" + tabs[key]["name"]).find('#' + device).removeClass('active');	
			}
		})		
	}
	*/
}

function toggleContact(state, device)
{
	$.each( pages, function( key, value )
	{
		var className = $("#" + pages[key]).find('#' + device).attr('class');
		if (state == true)
		{
			if (className != undefined && className.indexOf("circle") >= 0)
			{
				$("#" + pages[key]).find('#' + device).html("<span class='fa fa-circle pull-right'></span>");
			}
		}
		if (state == false)
		{
			if (className != undefined && className.indexOf("circle") >= 0)
			{
				$("#" + pages[key]).find('#' + device).html("<span class='fa fa-circle-o pull-right'></span>");
			}
		}		
	})
	/*
	if (state == true)
	{
		$.each( tabs, function( key, value )
		{
			var className = $("#" + tabs[key]["name"]).find('#' + device).attr('class');
			if (tabs[key]["hasSubPages"] == true)
			{
				tt = tabs[key]["SubPagesConfig"][0]["currentSubPage"]
				var className = $("#" + tt).find('#' + device).attr('class');
				if (className != undefined && className.indexOf("circle") >= 0)
				{
					$("#" + tabs[key]["SubPagesConfig"][0]["true"]).find('#' + device).html("<span class='fa fa-circle pull-right'></span>");
					$("#" + tabs[key]["SubPagesConfig"][0]["false"]).find('#' + device).html("<span class='fa fa-circle pull-right'></span>");
				}
			}
			else
			{
				if (className != undefined && className.indexOf("circle") >= 0)
				{
					$("#" + tabs[key]["name"]).find('#' + device).html("<span class='fa fa-circle pull-right'></span>");
				}
			}
		})
	}			
	if (state == false)
	{
		$.each( tabs, function( key, value )
		{
			var className = $("#" + tabs[key]["name"]).find('#' + device).attr('class');
			if (tabs[key]["hasSubPages"] == true)
			{
				tt = tabs[key]["SubPagesConfig"][0]["currentSubPage"]
				var className = $("#" + tt).find('#' + device).attr('class');
				if (className != undefined && className.indexOf("circle") >= 0)
				{
					$("#" + tabs[key]["SubPagesConfig"][0]["true"]).find('#' + device).html("<span class='fa fa-circle-o pull-right'></span>");
					$("#" + tabs[key]["SubPagesConfig"][0]["false"]).find('#' + device).html("<span class='fa fa-circle-o pull-right'></span>");
				}
			}
			else
			{
				if (className != undefined && className.indexOf("circle") >= 0)
				{
					$("#" + tabs[key]["name"]).find('#' + device).html("<span class='fa fa-circle-o pull-right'></span>");
				}
			}
		})
	}
	*/
}

function DimlevelUI(dimlevel, device, unit)
{
	$.each( pages, function( key, value )
	{
		var className = $("#" + pages[key]).find('#' + device).attr('class');
		if (dimlevel > 1)
		{
			$("#" + pages[key]).find('#' + device + '\\.dimlevel').html(dimlevel);
			$("#" + pages[key]).find('#' + device).addClass('active');
			if (unit != "")
			{
				$("#" + pages[key]).find('#' + device + '\\.unit').html(unit);
			}
		}
		if (dimlevel == 0)
		{
				$("#" + pages[key]).find('#' + device).removeClass('active');
				$("#" + pages[key]).find('#' + device + '\\.dimlevel').html(dimlevel);
				if (unit != "")
				{
					$("#" + pages[key]).find('#' + device + '\\.unit').html(unit);
				}
		}		
	})
	/*
	if (dimlevel > 1)
	{
		$.each( tabs, function( key, value )
		{
			if (tabs[key]["hasSubPages"] == true)
			{
				tt = tabs[key]["SubPagesConfig"][0]["currentSubPage"]
				$("#" + tabs[key]["SubPagesConfig"][0]["true"]).find('#' + device).addClass('active');	
				$("#" + tabs[key]["SubPagesConfig"][0]["false"]).find('#' + device).addClass('active');	
				$("#" + tabs[key]["SubPagesConfig"][0]["true"]).find('#' + device + '\\.dimlevel').html(dimlevel);
				$("#" + tabs[key]["SubPagesConfig"][0]["false"]).find('#' + device + '\\.dimlevel').html(dimlevel);
				if (unit != "")
				{
					$("#" + tabs[key]["SubPagesConfig"][0]["true"]).find('#' + device + '\\.unit').html(unit);
					$("#" + tabs[key]["SubPagesConfig"][0]["false"]).find('#' + device + '\\.unit').html(unit);
				}
			}
			else
			{
				$("#" + tabs[key]["name"]).find('#' + device + '\\.dimlevel').html(dimlevel);
				$("#" + tabs[key]["name"]).find('#' + device).addClass('active');
				if (unit != "")
				{
					$("#" + tabs[key]["name"]).find('#' + device + '\\.unit').html(unit);
				}
			}
		})
	}
	
	if (dimlevel == 0)
	{
		$.each( tabs, function( key, value )
		{
			if (tabs[key]["hasSubPages"] == true)
			{
				tt = tabs[key]["SubPagesConfig"][0]["currentSubPage"]
				$("#" + tabs[key]["SubPagesConfig"][0]["true"]).find('#' + device).removeClass('active');
				$("#" + tabs[key]["SubPagesConfig"][0]["false"]).find('#' + device).removeClass('active');
				$("#" + tabs[key]["SubPagesConfig"][0]["true"]).find('#' + device + '\\.dimlevel').html(dimlevel);
				$("#" + tabs[key]["SubPagesConfig"][0]["false"]).find('#' + device + '\\.dimlevel').html(dimlevel);
				if (unit != "")
				{
					$("#" + tabs[key]["SubPagesConfig"][0]["true"]).find('#' + device + '\\.unit').html(unit);
					$("#" + tabs[key]["SubPagesConfig"][0]["false"]).find('#' + device + '\\.unit').html(unit);
				}
			}
			else
			{
				$("#" + tabs[key]["name"]).find('#' + device).removeClass('active');
				$("#" + tabs[key]["name"]).find('#' + device + '\\.dimlevel').html(dimlevel);
				if (unit != "")
				{
					$("#" + tabs[key]["name"]).find('#' + device + '\\.unit').html(unit);
				}
			}
		})		
	}
	*/
}

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
	
    return hours+':'+minutes+':'+seconds;
}

function ConvertTimeformat(format, str) {
    var time = $("#starttime").val();
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/\s(.*)$/)[1];
    if (AMPM == "PM" && hours < 12) hours = hours + 12;
    if (AMPM == "AM" && hours == 12) hours = hours - 12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if (hours < 10) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;
    alert(sHours + ":" + sMinutes);
}