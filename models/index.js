if (!global.hasOwnProperty('db')) {
  var Sequelize = require('sequelize')
    , sequelize = null

  if (process.env.HEROKU_POSTGRESQL_BRONZE_URL) {
    // the application is executed on Heroku ... use the postgres database
    var match = process.env.HEROKU_POSTGRESQL_BRONZE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)

    sequelize = new Sequelize(match[5], match[1], match[2], {
      dialect:  'postgres',
      protocol: 'postgres',
      port:     match[4],
      host:     match[3],
      logging:  false
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
    Price:     sequelize.import(__dirname + '/price')
  }

  /*
    Associations can be defined here.  */
    global.db.Website.hasMany(global.db.Wine);
	global.db.Wine.belongsTo(global.db.Website);
	
	global.db.Wine.hasMany(global.db.Price);
	global.db.Price.belongsTo(global.db.Wine);
}

module.exports = global.db;