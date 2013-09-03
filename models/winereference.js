module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Winereference', {
		name: DataTypes.STRING,
		photo : DataTypes.STRING
	});
}