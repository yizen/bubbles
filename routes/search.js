var transportationFees 	= require('../lib/transportationFees');
var sizes 				= require('../lib/sizes');

var ejs 			= require('elastic.js'),
    nc 				= require('elastic.js/elastic-node-client'); 
    
var extend 			= require('util')._extend;

var _  				= require('underscore');
	_.str 			= require('underscore.string');
	_.mixin(_.str.exports());
	_.str.include('Underscore.string', 'string');

module.exports = function(app){
	
	app.get('/maison/:producer?', function(req, res) {
	    
	    var queryParams = new Object;
	    
		if (req.params.producer) {
	    	queryParams.producer = _.capitalize(req.params.producer);
	    }
		
		setCookie (res, queryParams, 'producer');
		executeSearch(req, res, queryParams, 'search');
	});
	
	app.get('/cuvee/:wine?', function(req, res) {
	    
	    var queryParams = new Object;
	    
		if (req.params.wine) {
	    	queryParams.name = _.capitalize(req.params.wine);
	    }
		
		setCookie (res, queryParams, 'wine');
		executeSearch(req, res, queryParams, 'search');
	});
	
	/* this get called inline by AJAX request */
	app.get('/search', function(req, res){
		
		var queryParams = extend({}, req.query);
		setCookie (res, queryParams, 'search');
		executeSearch(req, res, queryParams, 'results');
	});
	
	var buildQuery = function(query, sort, maxResults) {
		var qty 	= query.qty || 1;

		var minSize =  query.minSize || 1;
		var maxSize =  query.maxSize || 20;
		
		var minPrice =  query.minPrice || 0;
		var maxPrice =  query.maxPrice || 5000;

		if (!query.color || query.color=="whiteAndPink") colors = ['white', 'pink'];
		if (query.color == "White") colors = ['white'];
		if (query.color == "Pink")  colors = ['pink'];		
		
		//maxResults
		var maxResults = maxResults || 35; 

		ejs.client = nc.NodeClient('localhost', '9200');
		
		//highlights
		var highlightsArray = new Array;
		if (query.producer) highlightsArray.push('producer');
		if (query.name) 	highlightsArray.push('name');		
		
		var highlight 	= ejs.Highlight(highlightsArray);
		
		//sort
		var sort 		= ejs.Sort('price');
		
		//filter
		var filter 	 	= ejs.AndFilter([
		
										ejs.AndFilter([
											ejs.RangeFilter('price').from(parseFloat(minPrice)).to(parseFloat(maxPrice)),
											ejs.RangeFilter('size').from(parseFloat(minSize)).to(parseFloat(maxSize))
										]),
										
										ejs.AndFilter([
											ejs.TermsFilter('color', colors)
										])

										]);
										
		//query
		var constructedQuery = new Object;

		//if q : query both producer and wines		
		if ( query.q && query.q != '') {
			var termQuery1 = ejs.MatchQuery('name', query.q).operator('and'),
				termQuery2 = ejs.MatchQuery('producer', query.q).operator('and');
		
			constructedQuery  = ejs.BoolQuery().should([termQuery1, termQuery2]);
			
		} else if (query.producer && query.producer != '') {
			constructedQuery  = ejs.MatchQuery('producer', query.producer.toString()).operator('and');
			
		} else if (query.name && query.name != '') {
			constructedQuery  = ejs.MatchQuery('name', query.name.toString()).operator('and');
			
		} else {
			constructedQuery = ejs.MatchAllQuery();
		}
		
		return({query:constructedQuery, filter:filter, sort:sort, highlight:highlight, maxResults:maxResults});
	}
	
	var executeSearch = function(req, res, queryParams, template) {
		var query = buildQuery(queryParams);

		//Connect to Elasticsearch
		ejs.client 	= nc.NodeClient('localhost', '9200');
		var index 	= 'bubbles';
		var type 	= 'winereference';
		var request = ejs.Request({indices: index, types: type});
		
		request.query(query.query).filter(query.filter).sort(query.sort).highlight(query.highlight).size(query.maxResults).doSearch(
			function success(results){
				if (!results.hits) {
					console.log('executeSearch : Error executing search '+query.toString());
					wines = new Array;
					wines.totalHits = 0;
				} else {
					wines = renderSearch(results.hits, req, res);
					wines.totalHits = results.hits.total;
				}
				
				res.render(template, { wines : wines, queryParams : queryParams});
			},
			function error(error){
				console.error('executeSearch : Error executing search '+error.toString());
				
				wines = new Array;
				wines.totalHits = 0;
				res.render(template, { wines : wines, queryParams : queryParams});

			});
	}
			
	var renderSearch = function (hits, req, res) {
		var qty 	= req.query.qty || 1;
		var wines   = new Array;

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
				wine.total = formatEuro(wine.totalNoEuro);
				*/
				
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
					
					subwine.qtyNoEuro = (qty*subwine.price) + transportationFees.transportationFees(qty, subwine.website, (qty*subwine.price));
					subwine.qtyFormatted = formatEuro(subwine.qtyNoEuro);
					
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
		wines.qty = qty;
		
		return wines;
	}

	var formatEuro = function  (number) {
		return _.numberFormat(number, 2, ',', ' ')+' &euro;'; 
	}
	
	var getPhotoPath = function (photoSource, req) {
		var photo = '/photos/'+photoSource;
		var fullURL = req.protocol + "://" + req.get('host') + photo;

		var base64photo = new Buffer(fullURL).toString('base64');
		
		return('/thumbs/small/images/'+base64photo+".jpg");
	}
	
	var setCookie = function(res, query, from) {
		res.cookie('query', { from: from, q: query.q, wine:query.name, producer: query.producer, qty: query.qty, minSize: query.minSize, maxSize:query.maxSize, minPrice:query.minPrice, maxPrice:query.maxPrice, color:query.color }, {signed: true});
	}
};