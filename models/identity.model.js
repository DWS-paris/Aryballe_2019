/*
Import
*/
    const mongoose = require('mongoose')
    const { Schema } = mongoose;
    const jwt = require('jsonwebtoken');
//

/*
Definition
*/
    const identitySchema = new Schema({
        email: String,
        password: String,
        isValidated: Boolean,
        creationDate: String,
        lastConnection: String
    })
//

/*
Methode
*/
    identitySchema.methods.generateJwt = function  generateJwt(){
        // set expiration
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 59);

        // JWT creation
        return jwt.sign({
            _id: this._id,
            isValidated: this.password,
            creationDate: this.creationDate,
            lastConnection: this.lastConnection,
            expireIn: '10s',
            exp: parseInt(expiry.getTime() / 100, 10)
        }, process.env.JWT_SECRET )
    }
//

/*
Export
*/
    const IdentityModel = mongoose.model('identity', identitySchema);
    module.exports = IdentityModel;
//