 var width = 1024,
 	height = 600,
 	layout_gravity = -0.01,
 	tooltip = CustomTooltip("gates_tooltip", 240),
 	damper = 0.1,
 	nodes = [],
 	color = d3.scale.category20b(),
 	vis, force, circles, radius_scale;

 var center = {
 	x: width / 2,
 	y: height / 2
 };

 var fill_color = d3.scale.linear().domain([2, 100]).range(['white', 'orange']);

 var price_centers = {
 	"20": {
 		x: width / 3,
 		y: height / 2
 	},
 	"40": {
 		x: width / 2,
 		y: height / 2
 	},
 	"90": {
 		x: 2 * width / 3,
 		y: height / 2
 	}
 };

 function custom_chart(data) {
 	var max_amount = d3.max(data, function (d) {
 		return parseInt(d.volume, 10);
 	});

 	radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 50]);

 	//create node objects from original data
 	//that will serve as the data behind each
 	//bubble in the vis, then add each node
 	//to nodes to be used later
 	data.forEach(function (d) {
 		var node = {
 			id: d.id,
 			radius: radius_scale(parseInt(d.volume, 10)),
 			volume: d.volume,
 			price: d.price,
 			name: d.producer,
 			x: Math.random() * 900,
 			y: Math.random() * 800
 		};

 		if (d.producer && d.volume > 5) nodes.push(node); // FIXME : should do this with a filter in D3
 	});

 	nodes.sort(function (a, b) {
 		return b.volume - a.volume;
 	});

 	vis = d3.select("#chart1 div.svg").append("svg")
 		.attr("width", width)
 		.attr("height", height)
 		.attr("id", "svg_vis");

 	circles = vis.selectAll("circle")
 		.data(nodes, function (d) {
 			return d.id;
 		});

 	var elem = circles.enter().append("g");

 	var circle = elem.append("circle")
 		.attr("r", 0)
 		.attr("fill", function (d) {
 			return fill_color(d.volume);
 		})
 		.attr("stroke-width", 2)
 		.attr("stroke", function (d) {
 			return d3.rgb(fill_color(d.volume)).darker();
 		})
 		.attr("id", function (d) {
 			return "bubble_" + d.id;
 		})
 		.on("mouseover", function (d, i) {
 			show_details(d, i, this);
 		})
 		.on("mouseout", function (d, i) {
 			hide_details(d, i, this);
 		});

 	var text = elem.append("text")
 		.attr("dy", ".3em")
 		.style("text-anchor", "middle")
 		.text(function (d) {
 			return d.name.substring(0, d.radius / 3);
 		});

 	circle.transition().duration(1000).attr("r", function (d) {
 		return d.radius;
 	});
 }

 function charge(d) {
 	return -Math.pow(d.radius, 2.0) / 6;
 }

 function start() {
 	force = d3.layout.force()
 		.nodes(nodes)
 		.size([width, height]);
 }

 function display_group_all() {
 	var forceLayout = force.gravity(layout_gravity)
 		.charge(charge)
 		.friction(0.8);

 	forceLayout.on("tick", function (e) {
 		circles.each(move_towards_center(e.alpha))
 			.attr("transform", function (d) {
 				return "translate(" + d.x + "," + d.y + ")"
 			});
 	});
 	force.start();
 }

 function move_towards_center(alpha) {
 	return function (d) {
 		d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
 		d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
 	};
 }

 function display_by_year() {
 	force.gravity(layout_gravity)
 		.charge(charge)
 		.friction(0.9)
 		.on("tick", function (e) {
 			circles.each(move_towards_year(e.alpha))
 				.attr("cx", function (d) {
 					return d.x;
 				})
 				.attr("cy", function (d) {
 					return d.y;
 				});
 		});
 	force.start();
 	//display_years();
 }

 function move_towards_year(alpha) {
 	return function (d) {
 		var target = year_centers[d.year];
 		d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
 		d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
 	};
 }


 function display_years() {
 	var years_x = {
 		"2008": 160,
 		"2009": width / 2,
 		"2010": width - 160
 	};

 	var years_data = d3.keys(years_x);
 	var years = vis.selectAll(".years")
 		.data(years_data);

 	years.enter().append("text")
 		.attr("class", "years")
 		.attr("x", function (d) {
 			return years_x[d];
 		})
 		.attr("y", 40)
 		.attr("text-anchor", "middle")
 		.text(function (d) {
 			return d;
 		});

 }

 function hide_years() {
 	var years = vis.selectAll(".years").remove();
 }


 function show_details(data, i, element) {
 	d3.select(element).attr("fill", function (d) {
 		return d3.rgb(fill_color(d.volume)).darker();
 	});

 	var si = d3.format(',.2f');
 	var price = si(data.price);

 	var content = "<span class=\"name\">Producteur :</span><span class=\"value\"> " + data.name + "</span><br/>";
 	content += "<span class=\"name\">Nombre de r&eacute;f&eacute;rences vendues : </span><span class=\"value\">" + data.volume + "</span><br/>";
 	content += "<span class=\"name\">Prix moyen de vente : </span><span class=\"value\">" + price + "</span><br/>";

 	tooltip.showTooltip(content, d3.event);
 }

 function hide_details(data, i, element) {
 	d3.select(element).attr("fill", function (d) {
 		return d3.rgb(fill_color(d.volume));
 	});
 	tooltip.hideTooltip();
 }


 init = function (_data) {
 	custom_chart(_data);
 	start();
 };

 display_all = display_group_all;
 display_year = display_by_year;

 toggle_view = function (view_type) {
 	if (view_type == 'year') {
 		display_by_year();
 	} else {
 		display_group_all();
 	}
 };

 function CustomTooltip(tooltipId, width) {
 	var tooltipId = tooltipId;
 	$("body").append("<div class='tooltip' id='" + tooltipId + "'></div>");

 	if (width) {
 		$("#" + tooltipId).css("width", width);
 	}

 	hideTooltip();

 	function showTooltip(content, event) {
 		$("#" + tooltipId).html(content);
 		$("#" + tooltipId).show();

 		updatePosition(event);
 	}

 	function hideTooltip() {
 		$("#" + tooltipId).hide();
 	}

 	function updatePosition(event) {
 		var ttid = "#" + tooltipId;
 		var xOffset = 20;
 		var yOffset = 10;

 		var ttw = $(ttid).width();
 		var tth = $(ttid).height();
 		var wscrY = $(window).scrollTop();
 		var wscrX = $(window).scrollLeft();
 		var curX = (document.all) ? event.clientX + wscrX : event.pageX;
 		var curY = (document.all) ? event.clientY + wscrY : event.pageY;
 		var ttleft = ((curX - wscrX + xOffset * 2 + ttw) > $(window).width()) ? curX - ttw - xOffset * 2 : curX + xOffset;
 		if (ttleft < wscrX + xOffset) {
 			ttleft = wscrX + xOffset;
 		}
 		var tttop = ((curY - wscrY + yOffset * 2 + tth) > $(window).height()) ? curY - tth - yOffset * 2 : curY + yOffset;
 		if (tttop < wscrY + yOffset) {
 			tttop = curY + yOffset;
 		}
 		$(ttid).css('top', tttop + 'px').css('left', ttleft + 'px');
 	}

 	return {
 		showTooltip: showTooltip,
 		hideTooltip: hideTooltip,
 		updatePosition: updatePosition
 	}
 }
 
 
 
 d3.json("/bigdata/mostFrequentProducers/", function (data) {
 	init(data);
 	toggle_view('all');

 });