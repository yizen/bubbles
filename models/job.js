module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Job', {
		type: DataTypes.STRING,
		status: DataTypes.STRING, 
	});
}