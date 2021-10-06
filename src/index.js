import Config from 'getconfig';
import Pack from './../package';
import Hapi from '@hapi/hapi';
import Boom from '@hapi/boom';
import AccountAuth from './routes/accountAuth';
import AccountManagement from './routes/accountManagement';
import AccountProfile from './routes/accountProfile';
import File from './routes/file';
import Common from './routes/common';
import Joi from 'joi';
import {
    configAuth
} from './utils/auth/auth';
import https from 'https';
import fs from 'fs';
import Path from 'path';
import startup from './utils/startup';

startup.startAll();

const connectionConfig = Config.connectConfig;

connectionConfig.routes.validate = {
    failAction: (request, h, err) => {
        if (process.env.NODE_ENV === 'production') {
            // In prod, log a limited error message and throw the default Bad Request error.
            console.error('ValidationError:', err.message);
            throw Boom.badRequest(`Invalid request payload input`);
        }
        else {
            // During development, log and respond with the full error.
            console.error(err);
            throw err;
        }
    }
};

let server;
if (connectionConfig.tls) {
    const listener = https.createServer({
        key: fs.readFileSync(Path.join(__dirname, '../cert', 'www.iwzwz.com.key')),
        cert: fs.readFileSync(Path.join(__dirname, '../cert', 'www.iwzwz.com.pem'))
    });

    if (!listener.address) {
        listener.address = function () {
            return this._server.address();
        };
    }
    server = new Hapi.Server(Object.assign({}, {
        listener
    }, connectionConfig));
}
else {
    server = new Hapi.Server(connectionConfig);
}

server.validator(Joi);

const init = async () => {
    await server.register([
        require('@hapi/inert'),
        require('@hapi/vision'),
        require('blipp'),
        // {
        //   plugin: require("hapi-require-https"),
        //   options: {},
        // },
        {
            plugin: require('hapi-swagger'),
            options: {
                info: {
                    title: 'API Documentation',
                    version: Pack.version
                },
                schemes: [Config.swaggerSchemes || 'http'],
                grouping: 'tags',
                securityDefinitions: {
                    jwt: {
                        type: 'apiKey',
                        name: 'Authorization',
                        in: 'header'
                    }
                }
            }
        },
        {
            plugin: require('@hapi/good'),
            options: Config.goodConfig
        },
        {
            plugin: require('hapi-mongoose2'),
            options: Config.mongoConfig
        },
        require('./plugins/route-error-handler'),
        {
            plugin: require('./plugins/pre-handler-rule'),
            options: {
                rules: require('./handlers/rules').default
            }
        },
        require('./plugins/acl')
    ]);

    await configAuth(server);

    server.route(AccountAuth);
    server.route(AccountManagement);
    server.route(AccountProfile);
    server.route(File);
    server.route(Common);

    server.route({
        method: 'GET',
        path: '/resources/{param*}',
        handler: {
            directory: {
                path: './public/resources'
            }
        }
    });

    try {
        await server.start();
        console.log('Server running at:', server.info.uri);
    }
    catch (err) {
        console.log(err);
    }
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

export default server;
