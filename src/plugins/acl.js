import Boom from '@hapi/boom';
import lodash from 'lodash';
import Config from 'getconfig';
import commonService from '../services/common';


exports.plugin = {
    pkg: {
        name: 'acl',
        version: '1.0.0'
    },
    register: function (server, options) {
        server.ext({
            type: 'onPostAuth',
            method: async function (request, h) {
                //是不是有resource的权限
                const authConfig = Config.authConfig;
                if (!authConfig.enabled) {
                    return h.continue;
                }

                if (request.route.settings.auth !== false) {
                    if (!request.auth.credentials.roles || !request.auth.credentials.roles.length) {
                        throw Boom.forbidden('Access Deny!', {
                            credentials: request.auth.credentials
                        });
                    }
                    //需要缓存？
                    const roles = await request.mongo.models.Role.find({
                        name: {
                            $in: request.auth.credentials.roles
                        }
                    });
                    if (!roles || !roles.length) {
                        throw Boom.forbidden('Access Deny!', {
                            credentials: request.auth.credentials
                        });
                    }
                    //如果是common接口，则要替换common为 modelname
                    let fingerprint = lodash.trim(request.route.fingerprint, '/');
                    if (request.query && request.query.modelName && fingerprint.indexOf('common/') === 0) {
                        fingerprint = fingerprint.replace('common/', request.query.modelName.toLowerCase() + '/');
                    }

                    const resourceIds = lodash.uniq(lodash.reduce(roles, (res, item) => res.concat(item.resources), []));

                    const resources = (await commonService.find(request.mongo.models.Resource, {
                        _id: {
                            $in: resourceIds
                        },
                        type: 'API'
                    }, 'path'));

                    const resourcePathes = lodash.map(resources, (x) => lodash.trim(x.path, '/').toLowerCase());
                    if (resourcePathes.indexOf(fingerprint) < 0) {
                        throw Boom.forbidden('Access Deny!', {
                            credentials: request.auth.credentials
                        });
                    }
                }

                return h.continue;
            }
        });
    }
};