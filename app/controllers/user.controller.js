const { validationResult } = require('express-validator');
const db = require('../models/connectDb');
const tableName = 'tbl_user';
const User = require('../models/user.model');
const { existsSync, mkdirSync } = require('node:fs');
const bcrypt = require('bcrypt');
const userService = require('../services/user.service');
const constantNotify = require('../config/constants');
const sharp = require('sharp');
const { unlink } = require('node:fs/promises');

//getall
exports.getall = async (req, res) => {
    try {
        // const keySearch = req.query;
        userService.getall((err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: [err],
                });
            }

            res.send({
                result: true,
                data: res_,
            });
        });
    } catch (error) {
        res.send({
            result: false,
            error: [{ msg: error }],
        });
    }
};

//getbyid
exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        userService.getById(id, (err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: [err],
                });
            }

            res.send({
                result: true,
                data: res_,
            });
        });
    } catch (error) {
        res.send({
            result: false,
            error: [{ msg: error }],
        });
    }
};

//register
exports.register = async (req, res) => {
    try {
        // Validate Request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ result: false, error: errors.array() });
        }
        const { name, account, password, phone, address, web_page, active, role_id, email, parent_id } = req.body;
        const regex = /^[a-z0-9]+$/;
        if (!regex.test(account)) {
            return res.send({
                result: false,
                error: [{ msg: 'Tài khoản chỉ chứa kí tự thường và số' }],
            });
        }
        const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

        if (!regexPass.test(password)) {
            return res.send({
                result: false,
                error: [{ msg: 'Mật khẩu bao gồm ít nhất 1 kí tự in hoa, chữ, số và không chứa kí tự đặc biệt' }],
            });
        }
        //check email
        db.getConnection((err, conn) => {
            if (err) {
                console.log('connect db fail');
                return res.send({
                    result: false,
                    error: [{ msg: constantNotify.ERROR }],
                });
            }
            conn.query(`SELECT account FROM ${tableName} WHERE account = ? `, account, async (err, dataRes_) => {
                if (err) {
                    // console.log(err);
                    return res.send({
                        result: false,
                        error: [{ msg: constantNotify.ERROR }],
                    });
                }

                if (dataRes_.length !== 0) {
                    await res.send({
                        result: false,
                        error: [{ msg: 'Account đã tồn tại' }],
                    });
                    return;
                }

                conn.query(`SELECT email FROM ${tableName} WHERE email = ? `, email, async (err, dataRes) => {
                    if (err) {
                        // console.log(err);
                        return res.send({
                            result: false,
                            error: [{ msg: constantNotify.ERROR }],
                        });
                    }

                    if (dataRes.length !== 0) {
                        await res.send({
                            result: false,
                            error: [{ msg: 'Email đã tồn tại' }],
                        });
                        return;
                    }
                    //hash password
                    const salt = await bcrypt.genSalt(12);
                    const hashPass = await bcrypt.hash(password, salt);
                    // data insert
                    const user = new User({
                        parent_id: !parent_id ? 0 : parent_id,
                        name: name,
                        role_id: role_id,
                        email: email,
                        account: account,
                        password: hashPass,
                        phone: phone,
                        address: address,
                        web_page: web_page ? web_page : null,
                        refresh_token: 0,
                        active: !active ? false : true,
                        avatar: null,
                        thumb: null,
                        created_at: Date.now(),
                    });
                    delete user.updated_at;
                    // console.log(admins);

                    userService.register(user, async (err, res_) => {
                        if (err) {
                            res.send({ result: false, error: [err] });
                        } else {
                            conn.query(`SELECT name FROM tbl_role WHERE id = ? `, role_id, (err, dataRes) => {
                                if (err) {
                                    return res.send({
                                        result: false,
                                        error: [{ msg: constantNotify.ERROR }],
                                    });
                                }
                                user.id = res_;
                                user.name_role = dataRes[0]?.name;
                                user.updated_at = 0;
                                delete user.password;
                                delete user.role_id;
                                delete user.refresh_token;
                                res.send({
                                    result: true,
                                    data: {
                                        msg: constantNotify.ADD_DATA_SUCCESS,
                                        insertId: res_,
                                        newData: user,
                                    },
                                });
                            });
                        }
                    });
                });
            });
            conn.release();
        });
    } catch (error) {
        res.send({
            result: false,
            error: [{ msg: error }],
        });
    }
};

//update
exports.update = async (req, res) => {
    try {
        // Validate Request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ result: false, error: errors.array() });
        }
        const id = req.params.id;
        const { name, account, phone, address, web_page, active, role_id, email, parent_id } = req.body;
        const regex = /^[a-z0-9]+$/;
        if (!regex.test(account)) {
            return res.send({
                result: false,
                error: [{ msg: 'Tài khoản chỉ chứa kí tự thường và số' }],
            });
        }

        db.getConnection((err, conn) => {
            if (err) {
                console.log('connect db fail');
                return res.send({
                    result: false,
                    error: [{ msg: constantNotify.ERROR }],
                });
            }
            conn.query(`SELECT account,id FROM ${tableName} WHERE account = ? `, account, async (err, dataRes) => {
                if (err) {
                    // console.log(err);
                    return res.send({
                        result: false,
                        error: [{ msg: constantNotify.ERROR }],
                    });
                }
                // console.log(typeof dataRes[0].id);
                // console.log(typeof id);
                if (dataRes.length !== 0 && dataRes[0]?.id !== parseInt(id)) {
                    await res.send({
                        result: false,
                        error: [{ msg: 'Account đã được tài khoản khác sử dụng' }],
                    });
                    return;
                }
                conn.query(`SELECT email,id FROM ${tableName} WHERE email = ? `, email, async (err, dataRes) => {
                    if (err) {
                        // console.log(err);
                        return res.send({
                            result: false,
                            error: [{ msg: constantNotify.ERROR }],
                        });
                    }
                    // console.log(typeof dataRes[0].id);
                    // console.log(typeof id);
                    if (dataRes.length !== 0 && dataRes[0]?.id !== parseInt(id)) {
                        await res.send({
                            result: false,
                            error: [{ msg: 'Email đã được tài khoản khác sử dụng' }],
                        });
                        return;
                    }
                    const user = new User({
                        parent_id: !parent_id ? 0 : parent_id,
                        name: name,
                        role_id: role_id,
                        email: email,
                        account: account,
                        phone: phone,
                        address: address,
                        web_page: web_page ? web_page : null,
                        active: !active ? false : true,
                        updated_at: Date.now(),
                    });
                    delete user.created_at;
                    // console.log(admins);

                    userService.update(id, user, async (err, res_) => {
                        if (err) {
                            res.send({ result: false, error: [err] });
                        } else {
                            conn.query(`SELECT name FROM tbl_role WHERE id = ? `, role_id, (err, dataRes) => {
                                if (err) {
                                    return res.send({
                                        result: false,
                                        error: [{ msg: constantNotify.ERROR }],
                                    });
                                }
                                user.id = id;
                                user.name_role = dataRes[0]?.name;
                                user.created_at = 0;
                                delete user.password;
                                delete user.role_id;
                                delete user.refresh_token;
                                res.send({
                                    result: true,
                                    data: {
                                        msg: constantNotify.UPDATE_DATA_SUCCESS,
                                        id,
                                        newData: user,
                                    },
                                });
                            });
                        }
                    });
                });
            });
            conn.release();
        });
    } catch (error) {
        res.send({
            result: false,
            error: [{ msg: error }],
        });
    }
};

//delete
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        userService.delete(id, (err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: [err],
                });
            }

            res.send({
                result: true,
                data: { msg: constantNotify.DELETE_DATA_SUCCESS },
            });
        });
    } catch (error) {
        res.send({
            result: false,
            error: [{ msg: error }],
        });
    }
};

//updateActive
exports.updateActive = async (req, res) => {
    try {
        const id = req.params.id;
        const active = !req.body.active ? 0 : 1;
        userService.updateActive(id, active, (err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: [err],
                });
            }

            res.send({
                result: true,
                data: { msg: constantNotify.UPDATE_DATA_SUCCESS },
            });
        });
    } catch (error) {
        res.send({
            result: false,
            error: [{ msg: error }],
        });
    }
};

//login
exports.login = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ result: false, errors: errors.array() });
    }
    const { account, password } = req.body;
    const regex = /^[a-z0-9]+$/;
    if (!regex.test(account)) {
        return res.send({
            result: false,
            errors: [{ msg: 'Tài khoản chỉ chứa kí tự thường và số' }],
        });
    }
    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regexPass.test(password)) {
        return res.send({
            result: false,
            errors: [{ msg: 'Mật khẩu bao gồm ít nhất 1 kí tự in hoa, chữ, số và không chứa kí tự đặc biệt' }],
        });
    }
    // console.log(username);
    userService.login(account, password, (err, res_) => {
        if (err) {
            return res.send({
                result: false,
                error: [err],
            });
        }

        res.send({
            result: true,
            data: res_,
        });
    });
};

//refreshToken
exports.refreshToken = async (req, res) => {
    try {
        const userId = req.body.userId;
        const refreshToken = req.body.refreshToken;
        // console.log('userId', userId);
        // console.log('refreshToken', refreshToken);
        if (!refreshToken)
            return res.send({
                result: false,
                error: [{ msg: 'Refresh token không tồn tại' }],
            });
        userService.refreshToken(userId, refreshToken, (err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: [err],
                });
            }
            res.send({
                result: true,
                data: [res_],
            });
        });
    } catch (error) {
        res.send({ result: false, error: [{ msg: error }] });
    }
};

//forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ result: false, error: errors.array() });
        }
        const { email } = req.body;
        userService.forgotPassword(email, (err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: [err],
                });
            }
            res.send({
                result: true,
                data: res_,
            });
        });
    } catch (error) {
        res.send({ result: false, error: [{ msg: error }] });
    }
};

//change password
exports.changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ result: false, error: errors.array() });
        }
        const { password, passwordNew } = req.body;
        const userId = req.params.id;
        userService.changePassword(userId, password, passwordNew, (err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: [err],
                });
            }
            res.send({
                result: true,
                data: res_,
            });
        });
    } catch (error) {
        res.send({ result: false, error: [{ msg: error }] });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        const dir = 'uploads/user/image';
        const thumb = 'uploads/user/thumb';
        if (!existsSync(thumb)) {
            mkdirSync(thumb, { recursive: true });
        }
        db.query(`SELECT avatar, thumb FROM ${tableName} WHERE id = ?`, req.params.id, async (err, dataRes_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: [{ msg: constantNotify.ERROR }],
                });
            }
            // console.log('dataRes_', dataRes_);
            if (existsSync(`${dir}/${dataRes_[0]?.thumb}`) && existsSync(`${thumb}/${dataRes_[0]?.thumb}`)) {
                try {
                    await unlink(`${dir}/${dataRes_[0]?.thumb}`);
                    await unlink(`${thumb}/${dataRes_[0]?.thumb}`);
                } catch (error) {
                    return res.send({ result: false, error: [{ msg: error }] });
                }
            }
            sharp(req?.file?.path)
                .resize(120, 120)
                .toFile(`${thumb}/${req?.file?.filename}`, (err) => {
                    console.log('err', err);
                    if (err) {
                        return res.send({ result: false, error: [{ msg: err }] });
                    }
                });
            const data = {
                id: req.params.id,
                avatar: req?.file?.originalname,
                thumb: req?.file?.filename,
            };
            userService.uploadImage(data, (err, res_) => {
                if (err) {
                    return res.send({
                        result: false,
                        error: [err],
                    });
                }
                return res.send({
                    result: true,
                    data: {
                        msg: constantNotify.UPDATE_DATA_SUCCESS,
                        id: res_,
                        dataNew: data,
                    },
                });
            });
        });
    } catch (error) {
        res.send({ result: false, error: [{ msg: error }] });
    }
};
