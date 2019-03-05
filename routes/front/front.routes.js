/*
Imports
*/
    const express = require('express');
    const frontRouter = express.Router();
    const store = require('store');
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
            frontRouter.get( ['/'], (req, res) => { res.render('index', { title: undefined }) });

            frontRouter.get( ['/register'], (req, res) => { res.render('register', { title: undefined }) });

            frontRouter.get( ['/logout'], (req, res) => { 
                store.remove('user');
                res.redirect('/') 
            });
            
            frontRouter.get( ['/potree'], (req, res) => {
                console.log(store.get('user'))
                store.get('user') ? res.render('potree', { title: undefined, user: store.get('user') }) : res.redirect('/');
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