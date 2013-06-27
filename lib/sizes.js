var sizeNumToText = function(value) {
	switch (value) {
		case 0.5:
			return 'demi-bouteille';
		break;	
		case 1:
			return 'bouteille';
		break;	
		
		case 2:
			return 'magnum';
		break;	
		
		case 4:
			return 'j&eacute;roboam';
		break;	
				
		case 8:
			return 'mathusalem';
		break;	
				
		case 12:
			return 'salmanazar';
		break;	
				
		case 16:
			return 'balthazar';
		break;	
				
		case 20:
			return 'nabuchodosor';
		break;	
						
		case 24:
			return 'salomon';
		break;	
						
		case 36:
			return 'primat';
		break;	
						
		case 40:
			return 'melchisedech';
		break;	
		
		default:
			return 'bouteille';
		break;
		
		}
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

module.exports.sizeNumToText = sizeNumToText;
module.exports.sizeTextToNum = sizeTextToNum;