/*
Imports
*/
    // Node
    const express = require('express');
    const authRouter = express.Router();

    // Inner
    const { sendBodyError, sendFieldsError, sendApiSuccessResponse, sendApiErrorResponse } = require('../../services/response.service');
    const { checkFields } = require('../../services/request.service');
    const { register, confirmIdentity, login, setPassword } = require('./auth.controller');
//

/*
Routes definition
*/
    class AuthRouterClass {

        // Inject Passport to secure routes
        constructor({ passport }) {
            this.passport = passport;
        }
        
        // Set route fonctions
        routes(){

            // POST 'api/auth/register': send data to register new user
            authRouter.post( '/register', (req, res) => {
                // Check request body
                if (typeof req.body === 'undefined' || req.body === null) { sendBodyError(res, 'No body data provided') };

                // Check fields in the body
                const { miss, extra, ok } = checkFields(['email', 'password'], req.body);
                //=> Error: bad fields provided
                if (!ok) { sendFieldsError(res, 'Bad fields provided', miss, extra) }
                else{
                    //=> Request is valid: use controller
                    register(req.body, res)
                    .then( apiResponse => sendApiSuccessResponse(res, 'Request succeed', apiResponse) )
                    .catch( apiResponse => sendApiErrorResponse(res, 'Request failed', apiResponse))
                };
            });

            // POST 'api/auth/identity-validation': send data to validate user identity
            authRouter.post( '/identity-validation', (req, res) => {
                // Check request body
                if (typeof req.body === 'undefined' || req.body === null) { sendBodyError(res, 'No body data provided') };

                console.log(req.body)

                // Check fields in the body
                const { miss, extra, ok } = checkFields( ['_id', 'password'], req.body );
                //=> Error: bad fields provided
                if (!ok) { sendFieldsError(res, 'Bad fields provided', miss, extra) }
                else{
                    //=> Request is valid: use controller
                    confirmIdentity(req.body)
                    .then( apiResponse => sendApiSuccessResponse(res, 'Request succeed', apiResponse) )
                    .catch( apiResponse => sendApiErrorResponse(res, 'Request failed', apiResponse) );
                };
            });

            // POST 'api/auth/login': send data to log user
            authRouter.post( '/login', (req, res) => {
                // Check request body
                if (typeof req.body === 'undefined' || req.body === null) { sendBodyError(res, 'No body data provided') };

                // Check fields in the body
                const { miss, extra, ok } = checkFields( ['email', 'password'], req.body );
                //=> Error: bad fields provided
                if (!ok) { sendFieldsError(res, 'Bad fields provided', miss, extra) }
                else{
                    //=> Request is valid: use controller
                    login(req.body, res)
                    .then( apiResponse => sendApiSuccessResponse(res, 'Request succeed', apiResponse) )
                    .catch( apiResponse => sendApiErrorResponse(res, 'Request failed', apiResponse) );
                };
            });

            // POST 'api/auth/password': send data to save new password
            authRouter.post( '/password', this.passport.authenticate('jwt', { session: false }), (req, res) => {
                // Check request body
                if (typeof req.body === 'undefined' || req.body === null) { sendBodyError(res, 'No body data provided') };

                // Check fields in the body
                const { miss, extra, ok } = checkFields( ['password', 'newPassword'], req.body );
                //=> Error: bad fields provided
                if (!ok) { sendFieldsError(res, 'Bad fields provided', miss, extra) }
                else{
                    //=> Request is valid: use controller
                    setPassword(req.body, req.user, res)
                    .then( apiResponse => sendApiSuccessResponse(res, 'Request succeed', apiResponse) )
                    .catch( apiResponse => sendApiErrorResponse(res, 'Request failed', apiResponse) );
                };
            });
        };

        // Start router
        init(){
            // Get route fonctions
            this.routes();

            // Sendback router
            return authRouter;
        };
    };
//

/*
Export
*/
    module.exports = AuthRouterClass;
//