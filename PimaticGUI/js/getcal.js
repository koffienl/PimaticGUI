$( document ).ready(function()
{
	//UpdateCalendar();
	//setInterval(UpdateCalendar, 300000);
});

function UpdateCalendar(){
	var html = "";
	var html2 = "";
	var today = Date.today();
	var tommorow = Date.today().add(1).days();
		$.ajax
		({
			type: "GET",
			url: "/basic.ics",
			data: "",
			cache: false,
			success: function(ics_data)
			{
				var ical = $.icalendar.parse(ics_data);								
				$.each( ical["vevent"], function( key, value )
				{				
					if (typeof value["dtstart"]["_value"] != 'undefined' )
					{
						var ical_date = Date.parse(value["dtstart"]["_value"].getDate() + "-" + (value["dtstart"]["_value"].getMonth() + 1) + "-" + value["dtstart"]["_value"].getFullYear());

						if (Date.compare(ical_date, today) == 0)
						{
							//html = html + "<b>" + value["summary"] + "</b> Hele dag<br>";
							html = html + '<div class="clearfix"><h4 class="tile-text"><span style="clear: both;"></span><span class="pull-left"><b>' + value["summary"] + '</b></span><span class="pull-right">Hele dag</span></h4></div>'
						}
						
						if (Date.compare(ical_date, tommorow) == 0)
						{
							//html2 = html2 + "<b>" + value["summary"] + "</b> Hele dag<br>";
							html2 = html2 + '<div class="clearfix"><h4 class="tile-text"><span style="clear: both;"></span><span class="pull-left"><b>' + value["summary"] + '</b></span><span class="pull-right">Hele dag</span></h4></div>'
						}
					}

					else if (typeof value["summary"] != 'undefined')
					{
						var ical_date = Date.parse(value["dtstart"].getDate() + "-" + (value["dtstart"].getMonth() + 1) + "-" + value["dtstart"].getFullYear());
						if (Date.compare(ical_date, today) == 0)
						{
							var StartHours = value["dtstart"].getHours();
							var StartMinutes = value["dtstart"].getMinutes();						
							if (StartHours < 10 )
							{
								StartHours = "0" + StartHours;
							}
							if (StartMinutes < 10 )
							{
								StartMinutes = "0" + StartMinutes;
							}
							
							var EndHours = value["dtend"].getHours();
							var EndMinutes = value["dtend"].getMinutes();						
							if (EndHours < 10 )
							{
								EndHours = "0" + EndHours;
							}
							if (EndMinutes < 10 )
							{
								EndMinutes = "0" + EndMinutes;
							}
							html = html + '<div class="clearfix"><h4 class="tile-text"><span style="clear: both;"></span><span class="pull-left"><b>' + value["summary"] + '</b></span><span class="pull-right">' + StartHours + ":" + StartMinutes + " - " + EndHours + ":" + EndMinutes + "</span></h4></div>"
						}
												
						if (Date.compare(ical_date, tommorow) == 0)
						{
							var StartHours = value["dtstart"].getHours();
							var StartMinutes = value["dtstart"].getMinutes();						
							if (StartHours < 10 )
							{
								StartHours = "0" + StartHours;
							}
							if (StartMinutes < 10 )
							{
								StartMinutes = "0" + StartMinutes;
							}
							
							var EndHours = value["dtend"].getHours();
							var EndMinutes = value["dtend"].getMinutes();						
							if (EndHours < 10 )
							{
								EndHours = "0" + EndHours;
							}
							if (EndMinutes < 10 )
							{
								EndMinutes = "0" + EndMinutes;
							}
							html2 = html2 + '<div class="clearfix"><h4 class="tile-text"><span style="clear: both;"></span><span class="pull-left"><b>' + value["summary"] + '</b></span><span class="pull-right">' + StartHours + ":" + StartMinutes + " - " + EndHours + ":" + EndMinutes + "</span></h4></div>"
						}
					}
					
				})

				$.each( pages, function( key, value )
				{
					if (html == "")
					{
						$("#" + pages[key]).find('#calendar-today').html('<div class="clearfix"><h4 class="tile-text"><span style="clear: both;"></span><span class="pull-left">No appointments</span></h4></div>');
					}
					else
					{
						$("#" + pages[key]).find('#calendar-today').html(html);
					}
					if (html2 == "")
					{
						$("#" + pages[key]).find('#calendar-tommorow').html('<div class="clearfix"><h4 class="tile-text"><span style="clear: both;"></span><span class="pull-left">No appointments</span></h4></div>');
					}
					else
					{
						$("#" + pages[key]).find('#calendar-tommorow').html(html2);
					}
				})
			},
			error: function(XMLHttpRequest, textStatus, errorThrown)
			{
				$.each( tabs, function( key, value )
				{
					if (tabs[key]["hasSubPages"] == true)
					{
						tt = tabs[key]["SubPagesConfig"][0]["currentSubPage"]
						$("#" + tt).find('#calendar-today').html("ERROR with ics file!");

					}
					else
					{
						$("#" + tabs[key]["name"]).find('#calendar-today').html("ERROR with ics file!");
					}
				})
			}
		});
}