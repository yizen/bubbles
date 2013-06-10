module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Price', {
		price: DataTypes.FLOAT,
		date: DataTypes.DATE
	});
}