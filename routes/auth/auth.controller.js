/*
Import
*/
    const IdentityModel = require('../../models/identity.model')
    const bcrypt = require('bcryptjs');
    const store = require('store');
//

/*
Methods
*/
    const register = (body, res) => {
        return new Promise( (resolve, reject) => {
            // Search user by email
            IdentityModel.findOne( { email: body.email }, (error, user) => {
                if(error) return reject(error) // Mongo Error
                else if(user) return res.render('register', { title: 'Identity already exist' })
                else{
                    // Encrypt user password
                    bcrypt.hash( body.password, 10 )
                    .then( hashedPassword => {
                        // Replace pasword
                        const clearPassword = body.password;
                        body.password = hashedPassword;

                        // Set creation and connection date
                        body.creationDate = new Date();
                        body.lastConnection = null;
                        body.isValidated = true;

                        // Register new user
                        IdentityModel.create(body)
                        .then( mongoResponse => res.render('register', { title: 'You can now login!' }) )
                        .catch( mongoResponse => res.render('register', { title: apiErr }) )
                    })
                    .catch( hashError => reject(hashError) );
                };
            });
            
        });
    };

    const login = (body, res) => {
        return new Promise( (resolve, reject) => {
            // Search user by email
            IdentityModel.findOne( { email: body.email }, (error, user) => {
                if(error) reject(error)
                else if(!user) reject('Unknow identity')
                else{
                    if( !user.isValidated ){
                        return reject('Account is not validated')
                    }
                    else{
                        // Check password
                        const validPassword = bcrypt.compareSync(body.password, user.password);
                        if( !validPassword ) reject('Password is not valid')
                        else {
                            // Set cookie
                            const userToken = user.generateJwt();
                            res.cookie(process.env.COOKIE_NAME, userToken, { httpOnly: true });

                            // Store user data
                            store.set('user', { token: userToken, info: user })                            

                            // Set user new connection
                            user.lastConnection = new Date();

                            // Save new connection
                            user.save( (error, user) => {
                                if(error) return reject(error)
                                else{
                                    return res.redirect('/potree')
                                };
                            });
                        };
                    };
                };
            });
        });
    };

    const setPassword = (body, authUser, res) => {
        return new Promise( (resolve, reject) => {
            // Search user by email
            IdentityModel.findById( authUser._id, (error, user) => {
                
                if(error) reject(error)
                else if(!user) reject('Unknow identity')
                else{
                    
                    // Check password
                    const validPassword = bcrypt.compareSync(body.password, user.password);
                    if( !validPassword ) return reject('Password not valid')
                    else {
                        
                        // Encrypt user password
                        bcrypt.hash( body.newPassword, 10 )
                        .then( hashedPassword => {
                            // Set new password
                            user.password = hashedPassword;
                            
                            // Set cookie
                            res.cookie(process.env.COOKIE_NAME, user.generateJwt(), { httpOnly: true });

                            // Save new password
                            user.save( (error, user) => {
                                if(error) return reject(error)
                                else{
                                    return resolve({ _id: user._id, creationDate: user.creationDate, lastConnection: user.lastConnection });
                                };
                            });
                        })
                        .catch( hashError => reject(hashError) );
                    };
                };
            });
        });
    };

/*
Export
*/
    module.exports = {
        register,
        login,
        setPassword
    }
//