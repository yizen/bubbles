 var width = 940,
 	height = 600,
 	layout_gravity = -0.01,
 	damper = 0.1,
 	nodes = [],
 	color = d3.scale.category20c(),
 	vis, force, circles, radius_scale;

 var center = {
 	x: width / 2,
 	y: height / 2
 };

 var year_centers = {
 	"2008": {
 		x: width / 3,
 		y: height / 2
 	},
 	"2009": {
 		x: width / 2,
 		y: height / 2
 	},
 	"2010": {
 		x: 2 * width / 3,
 		y: height / 2
 	}
 };

 function custom_chart(data) {
 	var max_amount = d3.max(data, function (d) {
 		return parseInt(d.value, 10);
 	});

 	radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 50]);

 	//create node objects from original data
 	//that will serve as the data behind each
 	//bubble in the vis, then add each node
 	//to nodes to be used later
 	data.forEach(function (d) {
 		var node = {
 			id: d.id,
 			radius: radius_scale(parseInt(d.value, 10)),
 			value: d.value,
 			name: d.producer,
 			x: Math.random() * 900,
 			y: Math.random() * 800
 		};

 		if (d.producer && d.value > 5) nodes.push(node); // FIXME : should do this with a filter in D3
 	});

 	nodes.sort(function (a, b) {
 		return b.value - a.value;
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
 			return color(d.value);
 		})
 		.attr("stroke-width", 2)
 		.attr("stroke", function (d) {
 			return d3.rgb(color(d.value)).darker();
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
 	force.gravity(layout_gravity)
 		.charge(charge)
 		.friction(0.9)
 		.on("tick", function (e) {
 			circles.each(move_towards_center(e.alpha))
 				.attr("transform", function (d) {
 					return "translate(" + d.x + "," + d.y + ")"
 				});
 		});
 	force.start();
 	//hide_years();
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
 		return d3.rgb(color(d.value)).darker();
 	});
 	var content = "<span class=\"name\">Title:</span><span class=\"value\"> " + data.name + "</span><br/>";
 	content += "<span class=\"name\">Amount:</span><span class=\"value\"> $" + addCommas(data.value) + "</span><br/>";
 	tooltip.showTooltip(content, d3.event);
 }

 function hide_details(data, i, element) {
 	d3.select(element).attr("fill", function (d) {
 		return d3.rgb(color(d.value));
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

 d3.json("/bigdata/mostFrequentProducers/", function (data) {
 	init(data);
 	toggle_view('all');

 });