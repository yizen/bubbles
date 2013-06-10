module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Website', {
		name: DataTypes.STRING,
		url: DataTypes.TEXT,
		lastRunStart: DataTypes.DATE,
		lastRunEnd: DataTypes.DATE,
		active: DataTypes.BOOLEAN
	});
}