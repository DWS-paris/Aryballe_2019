/*
Imports
*/
    // Node
    require('dotenv').config();
    const express = require('express');
    const bodyParser = require('body-parser');
    const cookieParser = require('cookie-parser');
    const path = require('path');
    const ejs = require('ejs');
    const morgan = require('morgan');

    // Inner
    const mongoDB = require('./services/db.service');
    const { mainRouter } = require('./routes/main.router');
    const winston = require('./services/winston.service');
//

/*
Server configuration
*/
    // Define server
    const port = process.env.PORT;
    const server = express();

    // Define server class
    class ServerClass {

        // Initialization fonction
        init(){
            //=> Use Path to add views
            server.engine( 'html', ejs.renderFile );
            server.set( 'view engine', 'html' );
            server.set( 'views', __dirname + '/www' );
            server.use( express.static(path.join(__dirname, 'www')) );

            //=> Use BodyParser to get user body data
            server.use(bodyParser.json({limit: '10mb'}));
            server.use(bodyParser.urlencoded({ extended: true }));

            //=> Use CookieParser to setup serverside cookies
            server.use(cookieParser(process.env.COOKIE_SECRET));

            //=> Set server main router
            server.use('/', mainRouter);

            //=> Use Morgan and Winston to save logs
            // server.use( morgan( 'dev', { stream: winston.stream } ) );

            // Start server
            this.launch();
        };

        // After init. function
        launch(){
            // Connect MongoDB
            mongoDB.initClient()
            .then( db => {
                // Launch server
                server.listen(port, () => console.log(`Server is running on port ${port}`))
            })
            .catch( mongooseError => console.log(mongooseError));
        };
    };
//



/*
Start server
*/
    new ServerClass().init();
//