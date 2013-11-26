/*
 * Utility to handle bottle size. Units are relative to 1 bottle
 */

var sizeNumToText = function(value) {
	var sizes = sizesArray();
	return sizes[value.toString()];
}

var sizeTextToNum = function (name) {
	if (name.match(/demi-bouteille/i)) return 0.5;
	if (name.match(/demi bouteille/i)) return 0.5;
	if (name.match(/1\/2 b/i)) return 0.5;

	if (name.match(/magnum/i)) return 2;

	if (name.match(/jéroboam/i)) return 4;
	if (name.match(/jeroboam/i)) return 4;
	
	if (name.match(/mathusalem/i)) return 8;
	
	if (name.match(/salmanazar/i)) return 12;
	
	if (name.match(/balthazar/i)) return 16;
	
	if (name.match(/nabuchodosor/i)) return 20;
	
	if (name.match(/salomon/i)) return 24;
	
	if (name.match(/primat/i)) return 36;
	
	if (name.match(/melchisédech/i)) return 40;
	if (name.match(/melchisedech/i)) return 40;
}

var sizesArray = function () {
	var sizes = new Object();
	sizes["0.5"] = 'demi-bouteille';
	sizes["1"] = '75cl';
	sizes["2"] = 'magnum';
	sizes["4"] =  'j&eacute;roboam';
	sizes["8"] =  'mathusalem';
	sizes["12"] = 'salmanazar';
	sizes["16"] = 'balthazar';
	sizes["20"] = 'nabuchodosor';
	sizes["24"] = 'salomon';
	sizes["36"] = 'primat';
	sizes["40"] = 'melchisedech';
		
	return sizes;
}

var getAllSizes = function () {
	var sizes = new Array();
	sizes.push("0.5");
	sizes.push("1");
	sizes.push("2");
	sizes.push("4");
	sizes.push("8");
	sizes.push("12");
	sizes.push("16");
	sizes.push("20");	
	sizes.push("24");			
	sizes.push("36");			
	sizes.push("40");
	
	return sizes;
}

module.exports.sizeNumToText = sizeNumToText;
module.exports.sizeTextToNum = sizeTextToNum;
module.exports.sizesArray = sizesArray;
module.exports.getAllSizes = getAllSizes;