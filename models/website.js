module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Website', {
		name: DataTypes.STRING,
		url: DataTypes.TEXT,
		lastCrawlStart: DataTypes.DATE,
		lastCrawlEnd: DataTypes.DATE,
		lastRefreshStart: DataTypes.DATE,
		lastRefreshEnd: DataTypes.DATE,
		active: DataTypes.BOOLEAN
	});
}