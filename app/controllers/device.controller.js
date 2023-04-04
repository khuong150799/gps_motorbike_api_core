const { validationResult } = require('express-validator');
const Device = require('../models/device.model');
const deviceService = require('../services/device.service');
const constantNotify = require('../config/constants');
const db = require('../models/connectDb');
const tableName = 'tbl_device';

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty) {
            return res.send({ result: false, error: [errors] });
        }
        const { userid, name, imei, sim_card, expired_on, note } = req.body;
        db.query(`SELECT name FROM ${tableName} WHERE name = ?`, name, (err, dataRes) => {
            if (err) {
                return res.send({ result: false, error: [{ msg: constantNotify.ERROR }] });
            }
            if (dataRes.length !== 0) {
                return res.send({
                    result: false,
                    error: [{ msg: 'Tên thiết bị đã được sử dụng' }],
                });
            }
            const device = new Device({
                userid,
                name,
                imei,
                sim_card,
                expired_on,
                note: note ? note : null,
                created_at: Date.now(),
            });
            delete device.updated_at;
            deviceService.register(device, (err, res_) => {
                if (err) {
                    return res.send({ result: false, error: [err] });
                }
                device.id = res_;
                device.updated_at = 0;
                res.send({
                    result: true,
                    data: {
                        msg: constantNotify.ADD_DATA_SUCCESS,
                        insertId: res_,
                        newData: device,
                    },
                });
            });
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
        const errors = validationResult(req);
        if (!errors.isEmpty) {
            return res.send({ result: false, error: [errors] });
        }
        const { userid, name, imei, sim_card, expired_on, note } = req.body;
        const id = req.params.id;
        db.query(`SELECT id, name FROM ${tableName} WHERE name = ?`, name, (err, dataRes) => {
            if (err) {
                return res.send({ result: false, error: [{ msg: constantNotify.ERROR }] });
            }
            if (dataRes.length !== 0 && dataRes[0]?.id !== parseInt(id)) {
                return res.send({
                    result: false,
                    error: [{ msg: 'Tên thiết bị đã được sử dụng' }],
                });
            }
            const device = new Device({
                userid,
                name,
                imei,
                sim_card,
                expired_on,
                note: note ? note : null,
                updated_at: Date.now(),
            });
            delete device.created_at;
            deviceService.update(device, (err, res_) => {
                if (err) {
                    return res.send({ result: false, error: [err] });
                }
                device.id = res_;
                device.created_at = 0;
                res.send({
                    result: true,
                    data: {
                        msg: constantNotify.ADD_DATA_SUCCESS,
                        insertId: res_,
                        newData: device,
                    },
                });
            });
        });
    } catch (error) {
        res.send({
            result: false,
            error: [{ msg: error }],
        });
    }
};
