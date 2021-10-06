import errors from '../utils/errors';
import crypto from 'crypto';
import commonService from '../services/common';
import {
    signWxJwt,
    decodeToken,
    signJwt,
    code2Session,
    verifyToken as verifyTokenUtil
} from '../utils/auth/auth';
// import {code2Session} from '../utils/auth/wx';

async function signin(request, h) {
    const {
        username,
        // eslint-disable-next-line no-unused-vars
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
        account
    };
}

async function wxCheckToken(request, h) {
    const {
        token
    } = request.payload;
    const decoded = await decodeToken(token);
    const client = await commonService.getById(
        request.mongo.models.Client,
        decoded.id
    );
    if (!client || client.wxSessionKey !== decoded.wxSessionKey) {
        return {
            error: errors.client.tokenInvalid
        };
    }
    if (client) {
        return {
            success: true,
            token,
            client: {
                userId: client._id,
                wxOpenId: client.wxOpenId
            }
        };
    }
    return {
        error: errors.client.tokenInvalid
    };
}

async function wxLogin(request, h) {
    //call 腾讯接口login
    const {
        code,
        nickName,
        avatarUrl
    } = request.payload;
    const result = await code2Session(code);
    if (result.errorcode && result.errorcode !== 0) {
        return Object.assign({
            success: false,
            code: -1
        },
        errors.client.wxLoginFail,
        result
        );
    }
    let client;
    const existingClient = await commonService.getByQuery(
        request.mongo.models.Client, {
            wxOpenId: result.openid
        }
    );
    if (existingClient) {
        client = await commonService.updateById(
            request.mongo.models.Client,
            existingClient._id, {
                wxNickName: nickName,
                wxAvatarUrl: avatarUrl,
                wxSessionKey: result.session_key
            }
        );
    }
    else {
        client = await commonService.insert(request.mongo.models.Client, {
            wxOpenId: result.openid,
            wxNickName: nickName,
            wxAvatarUrl: avatarUrl,
            wxSessionKey: result.session_key
        });
    }
    const token = await signWxJwt(client);
    return {
        success: true,
        code: 0,
        data: {
            session_key: result.session_key,
            openid: result.openid,
            token,
            uid: client._id
        }
    };
}

async function wxBasic(request, h) {
    const userId =
        request.auth && request.auth.credentials && request.auth.credentials.id;
    const Address = request.mongo.models.Address;
    const addressList = await Address.find({
        userId
    });
    return {
        success: true,
        code: 0,
        data: {
            addressList
        }
    };
}

function wxRegisterComplex(request, h) {
    const {
        code,
        encryptedData,
        iv,
        referrer
    } = request.payload;
    return {
        success: true,
        code: 0,
        sessionId: 'sessionId',
        data: {
            code,
            encryptedData,
            iv,
            referrer
        }
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
    const id =
        request.auth && request.auth.credentials && request.auth.credentials.id;
    const account = await commonService.getById(request.mongo.models.Account, id);
    if (
        crypto
            .createHash('md5')
            .update(oldPassword)
            .digest('hex') !== account.hashedPassword
    ) {
        return {
            error: errors.account.currentPasswordNotMatch
        };
    }
    await commonService.updateById(request.mongo.models.Account, id, {
        hashedPassword: crypto
            .createHash('md5')
            .update(newPassword)
            .digest('hex')
    });
    const updatedAccount = await commonService.updateById(
        request.mongo.models.Account,
        id, {
            $inc: {
                fingerPrint: 1
            }
        }
    );
    return {
        success: true,
        data: updatedAccount
    };
}

async function defaultAddress(request, h) {
    const userId =
        request.auth && request.auth.credentials && request.auth.credentials.id;
    const Address = request.mongo.models.Address;
    const address = await Address.find({
        userId,
        default: true
    });
    if (address && address.length) {
        return {
            success: true,
            address: address[0]
        };
    }
    const addressByUser = await Address.find({
        userId
    });
    if (addressByUser && addressByUser.length) {
        return {
            success: true,
            address: addressByUser[0]
        };
    }
    return {
        success: true,
        address: null
    };


}

export default {
    signin,
    verifyToken,
    changePassword,
    wxCheckToken,
    wxRegisterComplex,
    wxLogin,
    wxBasic,
    defaultAddress
};
