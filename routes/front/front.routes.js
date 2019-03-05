/*
Imports
*/
    const express = require('express');
    const frontRouter = express.Router();
//

/*
Routes definition
*/
    class FrontRouterClass {

        // Inject Passport to secure routes
        constructor({ passport }) {
            this.passport = passport;
        }
        
        // Set route fonctions
        routes(){
            // GET '/*': for all requests send 'index' file
            frontRouter.get( '/me', this.passport.authenticate('jwt', { session: false }), (req, res) => {
                res.render('index')
            });

            frontRouter.get( '/*', (req, res) => {
                res.render('index')
            });
        };

        // POST api/auth/login
        init(){
            // Get route fonctions
            this.routes();

            // Sendback router
            return frontRouter;
        };
    };
//

/*
Export
*/
    module.exports = FrontRouterClass;
//