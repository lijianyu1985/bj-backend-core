// hapi-swagger guide
// https://github.com/glennjones/hapi-swagger/blob/master/usageguide.md

// joi guide
// https://github.com/hapijs/joi/blob/v14.3.0/API.md
import handlers from '../handlers/account';
import jois from '../utils/jois';
import Joi from 'joi';

export default [
    {
        method: 'POST',
        path: '/AccountAuth/Signin',
        handler: handlers.signin,
        config: {
            description: '登录',
            tags: ['api', 'admin'],
            auth: false,
            validate: {
                payload: Joi.object().keys({
                    username: Joi.string().required().trim(),
                    password: jois.CommonJoi.password
                }).label('SigninModel')
            }
        }
    },
    {
        method: 'POST',
        path: '/AccountAuth/VerifyToken',
        handler: handlers.verifyToken,
        config: {
            description: 'Verify',
            tags: ['api','admin'],
            auth: false,
            validate: {
                payload: Joi.object().keys({
                    token: Joi.string().required()
                }).label('TokenModel')
            }
        }
    }
];
