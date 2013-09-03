if (!global.hasOwnProperty('db')) {
  var Sequelize = require('sequelize')
    , sequelize = null

  if (process.env.NODE_ENV == 'production') {
    sequelize = new Sequelize('node', 'node', 'iUcdibPJ7fTN7l', {
	    logging: false,
	    port: 5123
    })
  } else {
    // the application is executed on the local machine ... use mysql
    sequelize = new Sequelize('node', 'node', 'node', {
	    logging: false
    })
  }

  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    Website:   sequelize.import(__dirname + '/website'),
    Wine:      sequelize.import(__dirname + '/wine'),
    Price:     sequelize.import(__dirname + '/price'),
    Job:       sequelize.import(__dirname + '/job'),    
    Log:       sequelize.import(__dirname + '/log'),
    Clic:      sequelize.import(__dirname + '/clic') ,  
    Producer:  sequelize.import(__dirname + '/producer') ,        
    Winereference:      sequelize.import(__dirname + '/winereference')
  }

  /*
    Associations can be defined here.  */
    global.db.Website.hasMany(global.db.Wine);
	global.db.Wine.belongsTo(global.db.Website);
	
	global.db.Wine.hasMany(global.db.Price);
	global.db.Price.belongsTo(global.db.Wine);
	
	global.db.Website.hasMany(global.db.Job);
	global.db.Job.belongsTo(global.db.Website);
	
	global.db.Job.hasMany(global.db.Log);
	global.db.Log.belongsTo(global.db.Job);
	
	global.db.Wine.hasMany(global.db.Clic);
	global.db.Clic.belongsTo(global.db.Wine);
	
	global.db.Winereference.hasMany(global.db.Wine);
	global.db.Wine.belongsTo(global.db.Winereference); 
	
	global.db.Producer.hasMany(global.db.Winereference);
	global.db.Winereference.belongsTo(global.db.Producer); 
}

module.exports = global.db;