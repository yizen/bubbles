module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Website', {
		name: DataTypes.STRING,
		url: DataTypes.STRING,
		crawlStatus: DataTypes.STRING,
		lastCrawlStart: DataTypes.DATE,
		lastCrawlEnd: DataTypes.DATE,
		refreshStatus: DataTypes.STRING,
		lastRefreshStart: DataTypes.DATE,
		lastRefreshEnd: DataTypes.DATE,
		active: DataTypes.BOOLEAN	
	});
}