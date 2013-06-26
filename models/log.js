module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Log', {
		message: DataTypes.STRING,
		level: DataTypes.STRING,
		url: DataTypes.STRING
	});
}