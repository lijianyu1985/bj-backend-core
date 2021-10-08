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
        path: '/AccountManagement/Signin',
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
        path: '/AccountManagement/VerifyToken',
        handler: handlers.verifyToken,
        config: {
            description: 'Verify',
            tags: ['api', 'admin'],
            auth: false,
            validate: {
                payload: Joi.object().keys({
                    token: Joi.string().required()
                }).label('TokenModel')
            }
        }
    },
    {
        method: 'POST',
        path: '/AccountManagement/DefaultPassword',
        handler: handlers.defaultPassword,
        config: {
            description: '重置默认密码',
            tags: ['api', 'admin'],
            validate: {
                payload: Joi.object().keys({
                    id: jois.CommonJoi.id
                }).label('DefaultPasswordModel')
            }
        }
    },
    {
        method: 'POST',
        path: '/AccountManagement/ResetPassword',
        handler: handlers.resetPassword,
        config: {
            description: '重置密码',
            tags: ['api', 'admin'],
            validate: {
                payload: Joi.object().keys({
                    id: jois.CommonJoi.id,
                    password: jois.CommonJoi.password
                }).label('RestPasswordModel')
            }
        }
    },
    {
        method: 'POST',
        path: '/AccountManagement/ChangePassword',
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
    },
    {
        method: 'POST',
        path: '/AccountManagement/ChangeRole',
        handler: handlers.changeRole,
        config: {
            description: '更新Account角色',
            tags: ['api', 'admin'],
            validate: {
                payload: Joi.object().keys({
                    roles: Joi.string().required(),
                    id: jois.CommonJoi.id
                }).label('ChangeRoleModel')
            }
        }
    },
    {
        method: 'POST',
        path: '/AccountManagement/Archive',
        handler: handlers.archive,
        config: {
            description: '归档账户',
            tags: ['api', 'admin'],
            validate: {
                payload: Joi.object().keys({
                    ids: Joi.array().items(jois.CommonJoi.id)
                }).label('ArchiveModel')
            }
        }
    },
    {
        method: 'POST',
        path: '/AccountManagement/Unarchive',
        handler: handlers.unarchive,
        config: {
            description: '归档还原',
            tags: ['api', 'admin'],
            validate: {
                payload: Joi.object().keys({
                    ids: Joi.array().items(jois.CommonJoi.id)
                }).label('UnarchiveModel')
            }
        }
    },
    {
        method: 'POST',
        path: '/AccountManagement/Create',
        handler: handlers.create,
        config: {
            description: '创建新的Account',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    username: Joi.string().alphanum().required().trim(),
                    name: Joi.string().allow('').allow(null),
                    roles: Joi.array().items(Joi.string())
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/AccountManagement/Change',
        handler: handlers.change,
        config: {
            description: '修改Account',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    name: Joi.string().allow('').allow(null),
                    roles: Joi.array().items(Joi.string()),
                    id: jois.CommonJoi.id
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/AccountManagement/Get',
        handler: handlers.get,
        config: {
            description: '查询Account',
            tags: ['api', 'admin'],
            validate: {
                query: {
                    id: jois.CommonJoi.id
                }
            }
        }
    }
];