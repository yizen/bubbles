module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Wine', {
  		name:DataTypes.STRING,
		wine: DataTypes.STRING,
		producer: DataTypes.STRING,
		url: DataTypes.STRING,
		price: DataTypes.FLOAT,
		size: DataTypes.STRING
	});
}