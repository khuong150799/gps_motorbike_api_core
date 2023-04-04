const tableName = 'tbl_role';
const db = require('../models/connectDb');
const constantNotify = require('../config/constants');

//getall
exports.getall = async (keySearch, result) => {
    try {
        let name = '';
        let query = `SELECT id,name,publish,created_at,updated_at FROM ${tableName}`;
        if (keySearch.name) {
            name = keySearch.name;
            query += ` WHERE name LIKE "%${name}%"`;
        }
        query += ' ORDER BY id DESC';
        db.query(query, (err, dataRes) => {
            if (err) {
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
        const query = `SELECT id,name,publish,created_at,updated_at FROM ${tableName} WHERE id = ?`;

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
                return result({ msg: constantNotify.ADD_DATA_FAILED }, null);
            }
            // console.log(dataRes);
            result(null, dataRes.insertId);
        });
    } catch (error) {
        result({ msg: error }, null);
    }
};

//update
exports.update = async (id, data, result) => {
    try {
        const query = `UPDATE ${tableName} SET name =?, value=?,publish =?, updated_at =? WHERE id = ?`;
        db.query(query, [data.name, data.value, data.publish, data.updated_at, id], (err, dataRes) => {
            if (err) {
                return result({ msg: constantNotify.ADD_DATA_FAILED }, null);
            }
            if (dataRes.affectedRows === 0) {
                return result({ msg: `id ${constantNotify.NOT_EXITS}` }, null);
            }
            result(null, dataRes);
        });
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

//updatePublish
exports.updatePublish = async (id, publish, result) => {
    try {
        const query = `UPDATE ${tableName} SET publish = ? WHERE id = ?`;

        db.query(query, [publish, id], (err, dataRes) => {
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
