var transportationFees 	= require('../lib/transportationFees');
var sizes 				= require('../lib/sizes');

var ejs 			= require('elastic.js'),
    nc 				= require('elastic.js/elastic-node-client');  	

var _  				= require('underscore');
	_.str 			= require('underscore.string');
	_.mixin(_.str.exports());
	_.str.include('Underscore.string', 'string');

module.exports = function(app){
	app.get('/search', function(req, res){
	
		//Connect to Elasticsearch
		ejs.client = nc.NodeClient('localhost', '9200');
		  
		var maxResults = 35; 
		  
		var q 		= req.query.q;
		var qty 	= req.query.qty || 1;

		var minSize =  req.query.minSize || 1;
		var maxSize =  req.query.maxSize || 20;
		
		var minPrice =  req.query.minPrice || 0;
		var maxPrice =  req.query.maxPrice || 5000;
		
		var color = req.query.color;
		
		if (!color || color=="whiteAndPink") colors = ['white', 'pink'];
		if (color == "White") colors = ['white'];
		if (color == "Pink")  colors = ['pink'];

		if (maxPrice >= 500) maxPrice = 5000;
		
		res.cookie('query', { q: q, qty: qty, minSize: minSize, maxSize:maxSize, minPrice:minPrice, maxPrice:maxPrice, color:color }, {signed: true});

		var wines = new Array();
		
		var index 	= 'bubbles';
		var type 	= 'winereference';
		var request 	= ejs.Request({indices: index, types: type});
		
		var highlight 	= ejs.Highlight(['producer', 'name']);
		var sort 		= ejs.Sort('price');
		
		var filter 	 	= ejs.AndFilter([
		
										ejs.AndFilter([
											ejs.RangeFilter('price').from(parseFloat(minPrice)).to(parseFloat(maxPrice)),
											ejs.RangeFilter('size').from(parseFloat(minSize)).to(parseFloat(maxSize))
										]),
										
										ejs.AndFilter([
											ejs.TermsFilter('color', colors)
										])

										]);
										
		var sort 		= ejs.Sort('price');
		
		var query1 = new Object;
		if ( q!= '')
			query1  = ejs.MatchQuery('producer', q.toString()).operator('and');
		else
			query1	= ejs.MatchAllQuery();
			
		var query2 = new Object;
		if ( q!= '')
			query2  = ejs.MatchQuery('name', q.toString()).operator('and');
		else
			query2	= ejs.MatchAllQuery();
			
			
		var hits = null;		
		
		request.query(query1).filter(filter).sort(sort).highlight(highlight).size(maxResults).doSearch(function(results){
			if (!results.hits) {
				console.log('Error executing search');
				return;
			}
			
			hits = results.hits;

			if (hits && hits.total > 0) {
				renderSearchResults(hits);	
			} else {
			
				request.query(query2).filter(filter).highlight(highlight).size(maxResults).doSearch(function(results){
			
					if (!results.hits) {
						console.log('Error executing search');
						return;
					}
					
					hits = results.hits;
			
					if (hits && hits.total > 0) {
						renderSearchResults(hits);	
					} else {
						res.render('noresults' );
					}
				});
			}
		});
		
		var renderSearchResults = function (hits) {
			hits.hits.forEach(function(item) { 
				var wine = new Object;
				
				/* handle highlighting if present */
				if (item.highlight && item.highlight.producer) {
					wine.producer = item.highlight.producer;
				} else {
					wine.producer = item._source.producer;
				}
				
				if (item.highlight && item.highlight.name) {
					wine.name = item.highlight.name;
				} else {
					wine.name = item._source.name;
				}
				
				wine.size =  _.capitalize(sizes.sizeNumToText(item._source.size));				
				wine.color= _.capitalize(item._source.color);

				wine.qty = qty;

				if (item._source.bestWinePrice) {
					wine.euro = formatEuro(item._source.bestWinePrice);
					/*wine.totalNoEuro = item._source.price + transportationFees.transportationFees(qty, item._source.website);
					wine.total = formatEuro(wine.totalNoEuro);*/
					wine.qtyNoEuro = (qty*item._source.bestWinePrice) + transportationFees.transportationFees(qty, item._source.bestWineWebsiteName, (qty*item._source.bestWinePrice));
					wine.qtyFormatted = formatEuro(wine.qtyNoEuro);
					
					wine.url = '/out/'+item._source.bestWineId;
					wine.website = item._source.bestWineWebsiteName;
				} else {
					wine.euro = "";
					wine.qtyFormatted = "";
				}
				
								
				wine.photoFrom = 0;
				wine.photo = '/images/no-image.png';
				
				/* Loop through all wines */
				var otherWines = new Array();
				
				for (var key in item._source.wines) {
					var subwine = item._source.wines[key];
					
					//TODO : better selection of photo based on websites quality.
					if (wine.photoFrom == 0 && subwine.photo) {
						wine.photoFrom = subwine.websiteId;
						wine.photo = getPhotoPath(subwine.photo, req);
					}
					
					//Skip the best priced wine.
					if (item._source.bestWineId != subwine.id) {
						subwine.photo = getPhotoPath(subwine.photo, req);
						subwine.euro = formatEuro(subwine.price);
						subwine.url = '/out/'+subwine.id;
						otherWines.push(subwine);
					}
				}
				
				otherWines.sort(function(a, b){
					return a.price-b.price;
				});
				
				wine.otherWines = otherWines;
													
				wines.push(wine);	
			});
			
			wines.resultsCount = hits.total;
			
			res.render('results', { wines : wines });
		}
	});	

	var formatEuro = function  (number) {
		return _.numberFormat(number, 2, ',', ' ')+' &euro;'; 
	}
	
	var getPhotoPath = function (photoSource, req) {
		var photo = '/photos/'+photoSource;
		var fullURL = req.protocol + "://" + req.get('host') + photo;

		var base64photo = new Buffer(fullURL).toString('base64');
		
		return('/thumbs/small/images/'+base64photo+".jpg");
	}
};