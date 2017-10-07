var config =
{
	"Device_RoomTemp": "id-woonkamer-temperatuur",
	"Device_Thermostat": "thermostaat",
	"Device_Heat": "pelletkachel-power",
	"calendar": true,
	"Nest_Setpoint_var": "setpoint",
	"SetpointPlus_button": "setpoint-plus",
	"SetpointMin_button": "setpoint-min",
	"showNavbar": true,
	"decimals": 2,
	"bgimage": "images/home-slider-back01.jpg",
	"pimatic_protocol": "http://",
	"pimatic_address": "",
	"pimatic_port": "80",
	"pimatic_user": "",
	"pimatic_password": "",
	"pimatic_cookies": false
}

var tabs = 
[
	{
		"name": "Parent", 
		"default": true,
		"disabled": false,
		"hasSubPages": true,
		"SubPagesConfig":
		[
			{
				"device": "gui-mode",
				"true": "Child2",
				"false": "Child1",
				"currentSubPage": ""
			}
		],
		"SubPages":
		[
			{
				"Child1":
				[
					{
						"bgimage": "images/42.jpg"
					}
				],
				"Child2":
				[
					{
						"bgimage": "images/46.jpg",
					}
				]
			}
		]
	},
	{
		"name": "Metro",
		"default": false,
		"disabled": false,
		"bgcolor": "#091A46",
		"css": "css/metro-bootstrap.css",
		"hasSubPages": false
	},
	{
		"name": "Nest",
		"default": false,
		"disabled": false,
		"bgcolor": "#000000",
		"hasSubPages": false,
		"onShow": "nestbgcolor"
	},
	{
		"name": "Log",
		"default": false,
		"disabled": false,
		"bgcolor": "black",
		"hasSubPages": false
	}
];
