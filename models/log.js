module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Log', {
  		job: DataTypes.STRING,
		message: DataTypes.STRING,
		level: DataTypes.STRING,
		url: DataTypes.STRING
	});
}