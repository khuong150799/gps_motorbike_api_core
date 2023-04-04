const tableName = 'tbl_device';
const constantNotify = require('../config/constants');
const db = require('../models/connectDb');

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
