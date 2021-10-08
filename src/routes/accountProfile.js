// hapi-swagger guide
// https://github.com/glennjones/hapi-swagger/blob/master/usageguide.md

// joi guide
// https://github.com/hapijs/joi/blob/v14.3.0/API.md
import handlers from '../handlers/account';
import jois from '../utils/jois';
import Joi from 'joi';

export default [
    {
        method: 'GET',
        path: '/AccountProfile/CurrentUser',
        handler: handlers.currentUser,
        config: {
            description: '获取登录人信息',
            tags: ['api', 'admin']
        }
    },
    {
        method: 'GET',
        path: '/AccountProfile/Get',
        handler: handlers.get,
        config: {
            description: '个人信息',
            tags: ['api', 'admin']
        }
    },
    {
        method: 'POST',
        path: '/AccountProfile/Change',
        handler: handlers.changeProfile,
        config: {
            description: '修改个人信息',
            tags: ['api', 'admin'],
            validate: {
                payload: Joi.object().keys({
                    name: Joi.string().allow('').allow(null),
                    phone: Joi.string().allow('').allow(null)
                }).label('changeProfile')
            }
        }
    },
    {
        method: 'POST',
        path: '/AccountProfile/ChangePassword',
        handler: handlers.changePassword,
        config: {
            description: '修改密码',
            tags: ['api', 'admin'],
            validate: {
                payload: Joi.object().keys({
                    oldPassword: jois.CommonJoi.password,
                    newPassword: jois.CommonJoi.password
                }).label('ChangePasswordModel')
            }
        }
    }
];
