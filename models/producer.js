module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Producer', {
		name: DataTypes.STRING,
		image:DataTypes.STRING,
		website:DataTypes.STRING,
		email:DataTypes.STRING,
		phone:DataTypes.STRING,
		company:DataTypes.STRING,		
		adress:DataTypes.STRING,
		zip:DataTypes.STRING,
		city:DataTypes.STRING,
		longitude: DataTypes.FLOAT,
		latitude: DataTypes.FLOAT
	});
}