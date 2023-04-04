const db = require('../models/connectDb');
const tableName = 'tbl_admin';
const constantNotify = require('../config/constants');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwts = require('../helper/auth.helper');

//getall
exports.getall = async (result) => {
    try {
        const query = `SELECT ${tableName}.id,${tableName}.name,tbl_role.name as name_role,${tableName}.account,${tableName}.email,${tableName}.phone,${tableName}.parent_id,${tableName}.address,${tableName}.web_page,${tableName}.active,${tableName}.created_at,${tableName}.updated_at FROM tbl_role INNER JOIN ${tableName} ON tbl_role.id = ${tableName}.role_id  ORDER BY ${tableName}.id DESC`;

        db.query(query, (err, dataRes) => {
            if (err) {
                console.log(err);
                return result({ msg: constantNotify.ERROR }, null);
            }
            result(null, dataRes);
        });
    } catch (error) {
        result({ msg: error }, null);
    }
};

//getByID
exports.getById = async (id, result) => {
    try {
        const query = `SELECT * FROM ${tableName} WHERE ${tableName}.id =?`;

        db.query(query, id, (err, dataRes) => {
            if (err) {
                return result({ msg: constantNotify.ERROR }, null);
            }
            result(null, dataRes);
        });
    } catch (error) {
        result({ msg: error }, null);
    }
};

//register
exports.register = async (data, result) => {
    try {
        const query = `INSERT INTO ${tableName} SET ?`;
        db.query(query, data, (err, dataRes) => {
            if (err) {
                return result({ msg: constantNotify.ERROR }, null);
            }
            result(null, dataRes.insertId);
        });
    } catch (error) {
        result({ msg: error }, null);
    }
};

//update
exports.update = async (id, data, result) => {
    try {
        const query = `UPDATE ${tableName} SET name =?, role_id = ?,email=?,account=?,phone=?,address=?,active =?,updated_at=? WHERE id =?`;
        db.query(
            query,
            [
                data.name,
                data.role_id,
                data.email,
                data.account,
                data.phone,
                data.address,
                data.active,
                data.updated_at,
                id,
            ],
            (err, dataRes) => {
                if (err) {
                    return result({ msg: constantNotify.ERROR }, null);
                }
                if (dataRes.affectedRows === 0) {
                    return result({ msg: `id ${constantNotify.NOT_EXITS}` }, null);
                }
                result(null, dataRes.insertId);
            },
        );
    } catch (error) {
        result({ msg: error }, null);
    }
};

//delete
exports.delete = async (id, result) => {
    try {
        const query = `DELETE FROM ${tableName} WHERE id =?`;

        db.query(query, id, (err, dataRes) => {
            if (err) {
                return result({ msg: constantNotify.ERROR }, null);
            }
            if (dataRes.affectedRows === 0) {
                return result({ msg: `id ${constantNotify.NOT_EXITS}` });
            }
            result(null, dataRes);
        });
    } catch (error) {
        result({ msg: error }, null);
    }
};

//updateActive
exports.updateActive = async (id, active, result) => {
    try {
        const query = `UPDATE ${tableName} SET active = ? WHERE id = ?`;

        db.query(query, [active, id], (err, dataRes) => {
            if (err) {
                return result({ msg: constantNotify.ERROR }, null);
            }
            if (dataRes.affectedRows === 0) {
                return result({ msg: `id ${constantNotify.NOT_EXITS}` });
            }
            result(null, dataRes);
        });
    } catch (error) {
        result({ msg: error }, null);
    }
};

//login
exports.login = async (account, password, result) => {
    // console.log(account);
    // console.log(password);
    try {
        db.getConnection((err, conn) => {
            if (err) {
                console.log(err);
                console.log('Unable to connect to database. Please check again.');
                return result({ msg: err }, null);
            }
            conn.query(
                `SELECT id,active, password FROM ${tableName} WHERE account = ?`,
                account,
                async (err, dataRes) => {
                    try {
                        if (err) {
                            return result({ msg: constantNotify.ERROR }, null);
                        }

                        if (dataRes.length === 0 || dataRes[0].active === 0) {
                            return result({ msg: 'Tài khoản không đúng hoặc chưa được kích hoạt' }, null);
                        }
                        // console.log(dataRes[0]);
                        const passMatch = await bcrypt.compare(password, dataRes[0].password);
                        // console.log(passMatch);
                        if (!passMatch) {
                            return result({ msg: 'Mật khẩu không đúng' }, null);
                        }
                        const _token = await jwts.make(dataRes[0].id);
                        const _refreshToken = await jwts.refreshToken(dataRes[0].id);

                        const qe = `UPDATE ${tableName} SET refresh_token = ? WHERE id = ?`;
                        conn.query(qe, [_refreshToken, dataRes[0].id], (err, dataRes_) => {
                            // console.log(qe);
                            if (err) {
                                console.log(err);
                                return result({ msg: constantNotify.ERROR }, null);
                            }
                        });
                        result(null, {
                            id: dataRes[0].id,
                            accessToken: _token,
                            refreshToken: _refreshToken,
                        });
                    } catch (error) {
                        console.log('error', error);
                        return result({ msg: error }, null);
                    }
                },
            );
            conn.release();
        });
    } catch (error) {
        result({ msg: error }, null);
    }
};

//refresh token
exports.refreshToken = async (userId, refreshToken, result) => {
    try {
        db.getConnection(async (err, conn) => {
            if (err) {
                console.log(err);
                console.log('Unable to connect to database. Please check again.');
                result({ msg: err }, null);
                return;
            }

            conn.query(
                `SELECT * FROM ${tableName} WHERE refresh_token = ? AND id = ?`,
                [refreshToken, userId],
                (err, data) => {
                    if (err) {
                        result({ msg: constantNotify.ERROR }, null);
                        return;
                    }
                    if (data.length === 0) {
                        const qe = `UPDATE ${tableName} SET refresh_token = 0 WHERE id = ${userId}`;
                        conn.query(qe, (err, data) => {
                            if (err) {
                                result({ msg: constantNotify.ERROR }, null);
                                return;
                            }
                        });
                        conn.query(`SELECT email FROM ${tableName} WHERE id = ?`, [userId], async (err, data) => {
                            if (err) {
                                // console.log(err);
                                result({ msg: constantNotify.ERROR }, null);
                                return;
                            }
                            console.log('email', data[0].email);
                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'leduykhuonggcd@gmail.com',
                                    pass: 'egkwhtwztzbjupvw',
                                },
                            });

                            await transporter.sendMail({
                                from: 'leduykhuonggcd@gmail.com',
                                to: data[0].email,
                                subject: 'Cảnh báo tài khoản của bạn bị xâm nhập trái phép.',
                                text: 'Vui lòng đăng nhập lại để bảo vệ tài khoản của bạn!',
                            });
                            return result({ msg: 'dangerous' }, null);
                        });
                    }
                    if (data.length > 0) {
                        // console.log(123243546754);
                        jwt.verify(refreshToken, constantNotify.REFRESH_TOKEN, async (err, dataVerify) => {
                            if (err) {
                                return result({ msg: err });
                            }

                            const accessToken = await jwt.sign({ userId }, constantNotify.ACCESS_TOKEN, {
                                expiresIn: constantNotify.TOKEN_TIME_LIFE,
                            });
                            const refreshToken = await jwt.sign({ userId }, constantNotify.REFRESH_TOKEN, {
                                expiresIn: constantNotify.REFRESH_TOKEN_TIME_LIFE,
                            });

                            const qe = `UPDATE ${tableName} SET refresh_token = ? WHERE id = ?`;
                            conn.query(qe, [refreshToken, userId], (err, data) => {
                                if (err) {
                                    // console.log(err);
                                    result({ msg: constantNotify.ERROR }, null);
                                    return;
                                }
                            });
                            result(null, { accessToken, refreshToken });
                        });
                    }
                },
            );
            conn.release();
        });
    } catch (error) {
        result({ msg: error }, null);
    }
};

//forgot password
exports.forgotPassword = async (email, result) => {
    try {
        db.getConnection((err, conn) => {
            if (err) {
                console.log('connection db fail');
                return result({ msg: err }, null);
            }
            conn.query(`SELECT id, email FROM ${tableName} WHERE email = ?`, email, async (err, dataRes) => {
                if (err) {
                    return result({ msg: constantNotify.ERROR }, null);
                }
                if (dataRes.length <= 0) {
                    result({ msg: 'Email không chính xác' }, null);
                    return;
                }
                const stringA_Z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const stringa_z = 'abcdefghijklmnopqrstuvwxyz';
                const number = '0123456789';
                let passwordNew = '';
                for (let i = 0; i < 3; i++) {
                    passwordNew += stringA_Z.charAt(Math.floor(Math.random() * stringA_Z.length));
                }
                for (let i = 0; i < 3; i++) {
                    passwordNew += stringa_z.charAt(Math.floor(Math.random() * stringa_z.length));
                }
                for (let i = 0; i < 2; i++) {
                    passwordNew += number.charAt(Math.floor(Math.random() * number.length));
                }
                const salt = await bcrypt.genSalt(12);
                const hashPass = await bcrypt.hash(passwordNew, salt);
                const id = dataRes[0].id;
                conn.query(
                    `UPDATE ${tableName} SET password = ? WHERE id = ?`,
                    [hashPass, id],
                    async (err, dataRes) => {
                        if (err) {
                            return result({ msg: constantNotify.ERROR }, null);
                        }
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'leduykhuonggcd@gmail.com',
                                pass: 'egkwhtwztzbjupvw',
                            },
                        });

                        await transporter.sendMail({
                            from: 'leduykhuonggcd@gmail.com',
                            to: email,
                            subject: 'Cấp lại mật khẩu tài khoản',
                            text: `Mật khẩu mới là ${passwordNew}. Vui lòng truy cập vào ứng dụng hoặc websie để đăng nhập lại!`,
                        });
                        result(null, { msg: 'Vui lòng kiểm tra email để nhận lại mật khẩu!' });
                    },
                );
            });
            conn.release();
        });
    } catch (error) {
        result({ msg: error }, null);
    }
};

//changePassword
exports.changePassword = async (id, password, passwordNew, result) => {
    try {
        db.getConnection((err, conn) => {
            if (err) {
                console.log('connection db fail');
                return result({ msg: err }, null);
            }
            conn.query(`SELECT password FROM ${tableName} WHERE id = ?`, id, async (err, dataRes) => {
                if (err) {
                    return result({ msg: constantNotify.ERROR }, null);
                }
                const passMatch = await bcrypt.compare(password, dataRes[0].password);
                if (!passMatch) {
                    return result({ msg: 'Mật khẩu cũ không chính xác' }, null);
                }
                const salt = await bcrypt.genSalt(12);
                const hashPass = await bcrypt.hash(passwordNew, salt);
                conn.query(`UPDATE ${tableName} SET password = ? WHERE id = ?`, [hashPass, id], (err, dataRes) => {
                    if (err) {
                        console.log(err);
                        return result({ msg: constantNotify.ERROR }, null);
                    }
                    result(null, { msg: 'Thay đổi mật khẩu thành công' });
                });
            });
            conn.release();
        });
    } catch (error) {
        result({ msg: error }, null);
    }
};
