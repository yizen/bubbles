var transportationFees = function (qty, website) {
	var website = website.toUpperCase();
	
	switch (website) {
		case "PLUS DE BULLES":
			if (qty == 1) 				return 7.99;
			if (qty >= 2 && qty <= 6) 	return 9.99;
			if (qty >= 7 && qty <= 10) 	return 10.99;
			if (qty >= 11)	return 12.99;
			// si commande superieure à 300 € frais de ports offerts.
		break;
		
		case "CHAMPMARKET":
			return 21.00;
		break;
		
		case "DE BULLE EN BULLES":
			return 0;
		break;	
		
		case "CAVE SPIRITUELLE":
			return 15.00;
			// France métropolitaine à partir de 400 € de commande: Livraison offerte
		break;
		
		case "LE REPAIRE DE BACCHUS":
			return 15.00;
		break;
		
		case "VINATIS":
			return 10.00;
		break;
		
		case "CAVAGOGO":
			if (qty <= 6) return 12.00;
			if (qty <= 12) return 16.00;
			if (qty <= 18) return 19.00;
			
			return 20;
		break;
		
		case "CHAMPAGNE EN DIRECT":
			if (qty <= 2) return 8.90;
			return 0;
		break;
		
		case "NICOLAS":
			if (qty <= 3) 				return 12.00;
			return (12 + 3*(Math.floor(qty/3))); 
		break;
		
		case "CHAMPAGNE PAS CHER":
			return 9.95;
			//gratuits au delà de 300 euros.
		break;
		
		case "LAVINIA": 
			return (9.90 + (qty-1)*0,5);
		break;
		
		case "POPBULLES": 
			if (qty < 6) return 12.00;
			if (qty < 12) return 15.00;
			if (qty < 18) return 21.00;
			return 0;
		break;
		
		default :
			return 0;
		break;
	}
}

module.exports.transportationFees = transportationFees;