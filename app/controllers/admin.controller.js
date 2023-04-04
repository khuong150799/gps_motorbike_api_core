const { validationResult } = require('express-validator');
const db = require('../models/connectDb');
const tableName = 'tbl_admin';
const Admin = require('../models/admin.model');
const bcrypt = require('bcrypt');
const adminService = require('../services/admin.service');
const constantNotify = require('../config/constants');

//getall
exports.getall = async (req, res) => {
    try {
        // const keySearch = req.query;
        adminService.getall((err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: err,
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
        adminService.getById(id, (err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: err,
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
        const { name, account, password, phone, address, active, role_id, email } = req.body;
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
                return;
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
                    const admin = new Admin({
                        name: name,
                        role_id: role_id,
                        email: email,
                        account: account,
                        password: hashPass,
                        phone: phone,
                        address: address,
                        refresh_token: 0,
                        active: !active ? false : true,
                        created_at: Date.now(),
                    });
                    delete admin.updated_at;
                    // console.log(admins);

                    adminService.register(admin, async (err, res_) => {
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
                                admin.id = res_;
                                admin.name_role = dataRes[0]?.name;
                                admin.updated_at = 0;
                                delete admin.password;
                                delete admin.role_id;
                                delete admin.refresh_token;
                                res.send({
                                    result: true,
                                    data: {
                                        msg: constantNotify.ADD_DATA_SUCCESS,
                                        insertId: res_,
                                        newData: admin,
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
        const { name, account, phone, address, active, role_id, email } = req.body;
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
                return;
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
                    const admin = new Admin({
                        name: name,
                        role_id: role_id,
                        email: email,
                        account: account,
                        phone: phone,
                        address: address,
                        active: !active ? false : true,
                        updated_at: Date.now(),
                    });
                    delete admin.created_at;
                    // console.log(admins);

                    adminService.update(id, admin, async (err, res_) => {
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
                                admin.id = id;
                                admin.name_role = dataRes[0]?.name;
                                admin.created_at = 0;
                                delete admin.password;
                                delete admin.role_id;
                                delete admin.refresh_token;
                                res.send({
                                    result: true,
                                    data: {
                                        msg: constantNotify.UPDATE_DATA_SUCCESS,
                                        id,
                                        newData: admin,
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
        adminService.delete(id, (err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: err,
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
        adminService.updateActive(id, active, (err, res_) => {
            if (err) {
                return res.send({
                    result: false,
                    error: err,
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
            errors: 'Tài khoản chỉ chứa kí tự thường và số',
        });
    }
    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regexPass.test(password)) {
        return res.send({
            result: false,
            errors: 'Mật khẩu bao gồm ít nhất 1 kí tự in hoa, chữ, số và không chứa kí tự đặc biệt',
        });
    }
    adminService.login(account, password, (err, res_) => {
        if (err) {
            return res.send({
                result: false,
                error: err,
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
        adminService.refreshToken(userId, refreshToken, (err, res_) => {
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
        adminService.forgotPassword(email, (err, res_) => {
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
        adminService.changePassword(userId, password, passwordNew, (err, res_) => {
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
