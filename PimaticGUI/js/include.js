var guimode = "";
var CurrentPage = "";

// Hide the 'hamburgermenu' when clicking on a tab
$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') ) {
        $(this).collapse('hide');
    }
});

// Display the correct tab
function ToggleContent(page)
{
	var CurrentCSS;
	$.each( tabs, function( key, value )
		{
			if (tabs[key]["name"] == page)
			{
				$("#tab-" + tabs[key]["name"] ).addClass('active');
				
				if (tabs[key]["css"] != undefined)
				{
					$("head").append($("<link rel='stylesheet' href='" + tabs[key]["css"] + "' type='text/css' media='screen' />"));
					CurrentCSS = tabs[key]["css"];
				}
				
				if (tabs[key]["bgcolor"] != undefined)
				{
					$('body').css('background-image', 'none');
					document.body.style.backgroundColor=tabs[key]["bgcolor"];
				}
				if (tabs[key]["bgimage"] != undefined)
				{
					$('body').css('background', '#000 url('+tabs[key]["bgimage"]+') no-repeat center center fixed');
					$('body').css('background-size', 'cover');		
				}
				
				if (tabs[key]["hasSubPages"] == true)
				{
					tt = tabs[key]["SubPagesConfig"][0]["currentSubPage"]
					if (tabs[key]["onShow"] != undefined)
					{
						$("#" + tabs[key]["SubPagesConfig"][0]["currentSubPage"] ).show(0, eval(tabs[key]["onShow"]));
					}
					else
					{
						$("#" + tabs[key]["SubPagesConfig"][0]["currentSubPage"] ).show();
					}

					if (tabs[key]["SubPages"][0][tt][0]["bgcolor"] != undefined)
					{
						$('body').css('background-image', 'none');
						document.body.style.backgroundColor=tabs[key]["SubPages"][0][tt][0]["bgcolor"];
					}
					if (tabs[key]["SubPages"][0][tt][0]["bgimage"] != undefined)
					{
						$('body').css('background', '#000 url('+tabs[key]["SubPages"][0][tt][0]["bgimage"]+') no-repeat center center fixed');
						$('body').css('background-size', 'cover');
					}
					
				}
				else
				{
					if (tabs[key]["onShow"] != undefined)
					{
						$("#" + tabs[key]["name"] ).show(0, eval(tabs[key]["onShow"]));
					}
					else
					{
						$("#" + tabs[key]["name"] ).show();
					}
				}
				$("html,body").animate({ scrollTop: 0 }, "fast");
				CurrentPage = page
			}
			else
			{
				// unload previous CSS if needed
				if (tabs[key]["css"] != undefined && tabs[key]["css"] != CurrentCSS)
				{
					$("link[href='" + tabs[key]["css"] + "']").remove();
				}
	
				if (tabs[key]["hasSubPages"] == true)
				{
					$("#" + tabs[key]["SubPagesConfig"][0]["true"] ).hide();
					$("#" + tabs[key]["SubPagesConfig"][0]["false"] ).hide();
				}
				else
				{
					$("#" + tabs[key]["name"] ).hide();	
				}
				
				$("#tab-" + tabs[key]["name"] ).removeClass('active');
			}
		}
	)
}