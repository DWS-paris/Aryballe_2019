/*
Import
*/
    const IdentityModel = require('../../models/identity.model')
    const bcrypt = require('bcryptjs');
    const { sendEmail } = require('../../services/mailer.service');
//

/*
Methods
*/
    const register = (body, res) => {
        return new Promise( (resolve, reject) => {
            // Search user by email
            IdentityModel.findOne( { email: body.email }, (error, user) => {
                if(error) return reject(error) // Mongo Error
                else if(user) return reject('Identity already exist')
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
                        body.isValidated = false;

                        // Register new user
                        IdentityModel.create(body)
                        .then( mongoResponse => {
                            sendEmail(mongoResponse, clearPassword)
                            .then( mailerResponse => {
                                resolve({ _id: mongoResponse._id, creationDate: mongoResponse.creationDate })
                            })
                            .catch( mailerResponse => {
                                reject(mailerResponse)
                            })
                            
                        })
                        .catch( mongoResponse => reject(mongoResponse) )
                    })
                    .catch( hashError => reject(hashError) );
                };
            });
            
        });
    };

    const confirmIdentity = body => {
        return new Promise( (resolve, reject) => {
            // Search user by email
            IdentityModel.findById( body._id, (error, user) => {
                if(error) return reject(error)
                else if(!user) return reject('Unknow identity')
                else{
                    // Check password
                    const validPassword = bcrypt.compareSync(body.password, user.password);
                    if( !validPassword ) return reject('Password not valid')
                    else {
                        // Change identity state
                        user.isValidated = true;

                        // Save identuty state
                        user.save()
                        .then( mongoResponse => resolve(mongoResponse) )
                        .catch( mongoResponse => reject(mongoResponse) )
                    };
                }
            } )
        })
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
                            res.cookie(process.env.COOKIE_NAME, user.generateJwt(), { httpOnly: true });
                            
                            // Define user last connection
                            const lastConnection = user.lastConnection;

                            // Set user new connection
                            user.lastConnection = new Date();

                            // Save new connection
                            user.save( (error, user) => {
                                if(error) return reject(error)
                                else{
                                    return resolve({ _id: user._id, creationDate: user.creationDate, lastConnection: lastConnection });
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
        confirmIdentity,
        login,
        setPassword
    }
//