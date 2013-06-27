module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Wine', {
  		name:DataTypes.STRING,
		wine: DataTypes.STRING,
		producer: DataTypes.STRING,
		url: DataTypes.STRING,
		price: DataTypes.FLOAT,
		size: DataTypes.FLOAT,
		options: DataTypes.STRING,
		color: { type: DataTypes.STRING, defaultValue: 'White' },
		minQuantity: DataTypes.INTEGER,		
		photo: DataTypes.STRING,
		lastPriceModified:DataTypes.DATE,
		active: DataTypes.BOOLEAN
	});
}