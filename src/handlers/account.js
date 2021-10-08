import errors from '../utils/errors';
import crypto from 'crypto';
import commonService from '../services/common';
import {
    signJwt,
    decodeToken,
    verifyToken as verifyTokenUtil
} from '../utils/auth/auth';

async function currentUser(request, h) {
    const id = request.auth && request.auth.credentials && request.auth.credentials.id;
    const account = await commonService.getById(request.mongo.models.Account, id, '_id username name roles');
    if (!account) {
        return {
            error: errors.account.accountDoesntExists
        };
    }
    if (account.archived) {
        return {
            error: errors.account.accountArchived
        };
    }
    return {
        success: true,
        account
    };
}

async function signin(request, h) {
    // eslint-disable-next-line no-unused-vars
    const {
        username,
        password
    } = request.payload;
    const account = await commonService.getByQuery(request.mongo.models.Account, {
        username
    });
    if (!account) {
        return {
            error: errors.account.accountDoesntExists
        };
    }
    if (account.archived) {
        return {
            error: errors.account.accountArchived
        };
    }
    /* if (crypto.createHash('md5').update(password).digest('hex') !== account.hashedPassword) {
        return {
            error: errors.account.passwordNotMatch
        };
    } */
    const token = await signJwt(account);
    return {
        success: true,
        token,
        currentAuthority: account.roles
    };
}

async function verifyToken(request) {
    const {
        token
    } = request.payload;
    const verified = await verifyTokenUtil(token, request);
    if (!verified) {
        return {
            error: errors.account.tokenInvalid
        };
    }
    const decoded = await decodeToken(token);
    const {
        Account
    } = request.mongo.models;
    const account = await commonService.getById(Account, decoded.id);
    if (!account) {
        return {
            error: errors.account.tokenInvalid
        };
    }
    if (account) {
        return {
            success: true,
            token,
            account: {
                id: account._id,
                username: account.username,
                roles: account.roles
            }
        };
    }
    return {
        error: errors.account.tokenInvalid
    };
}

async function changeRole(request, h) {
    const {
        roles
    } = request.payload;
    const {
        id
    } = request.query;
    const currentAccount = await commonService.getById(request.mongo.models.Account, id);
    let updatedAccount = await commonService.updateById(request.mongo.models.Account, id, {
        roles
    });
    if (currentAccount.roles !== updatedAccount.roles) {
        updatedAccount = await commonService.updateById(request.mongo.models.Account, id, {
            $inc: {
                fingerPrint: 1
            }
        });
    }
    return updatedAccount;
}

async function resetPassword(request, h) {
    const {
        password
    } = request.payload;
    const {
        id
    } = request.query;
    await commonService.updateById(request.mongo.models.Account, id, {
        hashedPassword: crypto.createHash('md5').update(password).digest('hex')
    });
    const updateAccount = await commonService.updateById(request.mongo.models.Account, id, {
        $inc: {
            fingerPrint: 1
        }
    });
    if (!updateAccount) {
        return {
            error: errors.account.accountDoesntExists
        };
    }
    return updateAccount;
}

async function defaultPassword(request, h) {
    const {
        id
    } = request.payload;
    await commonService.updateById(request.mongo.models.Account, id, {
        hashedPassword: crypto.createHash('md5').update('12345678').digest('hex')
    });
    const updateAccount = await commonService.updateById(request.mongo.models.Account, id, {
        $inc: {
            fingerPrint: 1
        }
    });
    if (!updateAccount) {
        return {
            error: errors.account.accountDoesntExists
        };
    }
    return {
        success: true,
        data: updateAccount
    };
}

async function changePassword(request, h) {
    const {
        oldPassword,
        newPassword
    } = request.payload;
    if (oldPassword === newPassword) {
        return {
            error: errors.account.oldPasswordAndNewPasswordShouldNtSame
        };
    }
    const id = request.auth && request.auth.credentials && request.auth.credentials.id;
    const account = await commonService.getById(request.mongo.models.Account, id);
    if (crypto.createHash('md5').update(oldPassword).digest('hex') !== account.hashedPassword) {
        return {
            error: errors.account.currentPasswordNotMatch
        };
    }
    await commonService.updateById(request.mongo.models.Account, id, {
        hashedPassword: crypto.createHash('md5').update(newPassword).digest('hex')
    });
    const updatedAccount = await commonService.updateById(request.mongo.models.Account, id, {
        $inc: {
            fingerPrint: 1
        }
    });
    return {
        success: true,
        data: updatedAccount
    };
}

async function archive(request, h) {
    const {
        ids
    } = request.payload;
    await commonService.updateByQuery(request.mongo.models.Account, {
        _id: {
            $in: ids
        },
        archived: false
    }, {
        $inc: {
            fingerPrint: 1
        }
    });
    return {
        success: true,
        data: await commonService.toggleArchive(request.mongo.models.Account, ids, true)
    };
}

async function unarchive(request, h) {
    const {
        ids
    } = request.payload;
    await commonService.updateByQuery(request.mongo.models.Account, {
        _id: {
            $in: ids
        },
        archived: true
    }, {
        $inc: {
            fingerPrint: 1
        }
    });
    return {
        success: true,
        data: await commonService.toggleArchive(request.mongo.models.Account, ids, false)
    };
}

async function create(request, h) {
    const {
        username,
        password = '12345678',
        roles = ['admin'],
        name
    } = request.payload;
    const account = await commonService.getByQuery(request.mongo.models.Account, {
        username
    });
    if (account) {
        return {
            error: errors.account.accountAlreadyExists
        };
    }
    const updatedAccount = await commonService.insert(request.mongo.models.Account, {
        username,
        hashedPassword: crypto.createHash('md5').update(password).digest('hex'),
        roles,
        name
    });
    return {
        success: true,
        data: updatedAccount
    };
}

async function change(request, h) {
    const {id, name, roles} = request.payload;
    const account = await commonService.updateById(request.mongo.models.Account, id, {name, roles});
    return {
        success: true,
        data: account
    };
}

async function changeProfile(request, h) {
    const accountId = request.auth && request.auth.credentials && request.auth.credentials.id;
    const {phone, name} = request.payload;
    const account = await commonService.updateById(request.mongo.models.Account, accountId, {name, phone});
    return {
        success: true,
        data: account
    };
}

async function get(request, h) {
    const id = request.auth && request.auth.credentials && request.auth.credentials.id;
    const account = await commonService.getById(request.mongo.models.Account, id);
    return {
        success: true,
        data: account
    };
}


export default {
    signin,
    currentUser,
    verifyToken,
    changeRole,
    resetPassword,
    defaultPassword,
    changePassword,
    archive,
    unarchive,
    create,
    change,
    changeProfile,
    get
};