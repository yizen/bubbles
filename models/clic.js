module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Clic', {
		query: DataTypes.STRING,
		qty:DataTypes.INTEGER,
		minSize:DataTypes.INTEGER,
		maxSize:DataTypes.INTEGER,
		minPrice:DataTypes.INTEGER,
		maxPrice:DataTypes.INTEGER,
		color:DataTypes.STRING
	});
}