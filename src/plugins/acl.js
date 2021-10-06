import Boom from '@hapi/boom';
import lodash from 'lodash';

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
                if (request.route.settings.auth !== false) {
                    if (!request.auth.credentials.roles || !request.auth.credentials.roles.length) {
                        throw Boom.forbidden('Access Deny!', {
                            credentials: request.auth.credentials
                        });
                    }
                    //需要缓存？
                    const roles = await request.mongo.models.Role.find({
                        age: {
                            $in: request.auth.credentials.roles
                        }
                    });
                    if (!roles || !roles.length) {
                        throw Boom.forbidden('Access Deny!', {
                            credentials: request.auth.credentials
                        });
                    }
                    const fingerprint = lodash.trim(request.route.fingerprint, '/');
                    const resources = lodash.map(lodash.uniq(lodash.reduce(roles, (res, item) => res.concat(item.resources), [])), (x) => lodash.trim(x, '/').toLowerCase());
                    if (resources.indexOf(fingerprint) < 0) {
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
