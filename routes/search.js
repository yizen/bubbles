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
		var type 	= 'wine';
		var request 	= ejs.Request({indices: index, types: type});
		
		var highlight 	= ejs.Highlight(['producer', 'wine']);
		var sort 		= ejs.Sort('price');
		
		var filter 	 	= ejs.AndFilter([
		
										ejs.AndFilter([
											ejs.RangeFilter('price').from(parseFloat(minPrice)).to(parseFloat(maxPrice)),
											ejs.RangeFilter('size').from(parseFloat(minSize)).to(parseFloat(maxSize))
										]),
										
										ejs.AndFilter([
											ejs.TermsFilter('color', colors),
											ejs.TermFilter('active', true)
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
			query2  = ejs.MatchQuery('wine', q.toString()).operator('and');
		else
			query2	= ejs.MatchAllQuery();
			
		var query3 = new Object;
		if ( q!= '')
			query3  = ejs.FuzzyQuery('name', q.toString()).minSimilarity(0.7);
		else
			query3	= ejs.MatchAllQuery();
			
		var hits = null;		
		
		request.query(query1).filter(filter).sort(sort).highlight(highlight).size(100).doSearch(function(results){
			if (!results.hits) {
				console.log('Error executing search');
				console.log(request.toString());
				return;
			}
			
			hits = results.hits;
			
			if (hits && hits.total > 0) {
				renderSearchResults(hits);	
			} else {
			
				request.query(query2).filter(filter).highlight(highlight).size(100).doSearch(function(results){
			
					if (!results.hits) {
						console.log('Error executing search');
						return;
					}
					
					hits = results.hits;
			
					if (hits && hits.total > 0) {
						renderSearchResults(hits);	
					} else {
						request.query(query3).filter(filter).highlight(highlight).size(100).doSearch(function(results){
					
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
			}
		});
		
		var renderSearchResults = function (hits) {
			hits.hits.forEach(function(item) { 
				var wine = new Object;
				wine.wine = item._source.wine;
	
				if (item.highlight && item.highlight.producer) {
					wine.producer = item.highlight.producer;
				} else {
					wine.producer = item._source.producer;
				}
				
				if (item.highlight && item.highlight.wine) {
					wine.wine = item.highlight.wine;
				} else {
					wine.wine = item._source.wine;
				}
				
				wine.size =  _.capitalize(sizes.sizeNumToText(item._source.size));
	
				wine.website = item._source.website;						
				wine.options = _.capitalize(item._source.options);

				wine.url = '/out/'+item._source.id;
				
				if (item._source.photo) {
					//wine.photo = '/photos/'+item._source.photo;
					var photo = '/photos/'+item._source.photo;
					var fullURL = req.protocol + "://" + req.get('host') + photo;

					var base64photo = new Buffer(fullURL).toString('base64')
					wine.photo = '/thumbs/small/images/'+base64photo+".jpg";
				} else {
					wine.photo = '/images/no-image.png';
				}
				
				if (item._source.price) {
					wine.euro = formatEuro(item._source.price);
					/*wine.totalNoEuro = item._source.price + transportationFees.transportationFees(qty, item._source.website);
					wine.total = formatEuro(wine.totalNoEuro);*/
					wine.sixNoEuro = (6*item._source.price) + transportationFees.transportationFees(6, item._source.website, (6*item._source.price));
					wine.six = formatEuro(wine.sixNoEuro);
				} else {
					wine.totalNoEuro = 100000; //push it to the end of the result list;
					wine.euro = "Prix sur demande";
					wine.six = "-";
				}
				
				wines.push(wine);	
			});
			
			/*wines.sort(function(a, b){
				return a.totalNoEuro-b.totalNoEuro;
			});*/
			
			res.render('results', { wines : wines });
		}
	});	

	var formatEuro = function  (number) {
		return _.numberFormat(number, 2, ',', ' ')+' &euro;'; 
	}
};
