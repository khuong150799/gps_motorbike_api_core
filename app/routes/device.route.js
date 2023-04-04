const router = require('express').Router();
const { body } = require('express-validator');
const deviceController = require('../controllers/device.controller');

module.exports = (app) => {
    // router.get('/getall', deviceController.getall);
    // router.get('/getbyid/:id', deviceController.getById);
    router.post(
        '/register',
        [
            body('userid', 'Trường này không được bỏ trống').notEmpty(),
            body('name', 'Trường này không được bỏ trống').notEmpty(),
            body('imei', 'Trường này không được bỏ trống').notEmpty(),
            body('sim_card', 'Trường này không được bỏ trống').notEmpty(),
            body('expired_on', 'Trường này không được bỏ trống').notEmpty(),
        ],
        deviceController.register,
    );
    router.put(
        '/updatebyid/:id',
        [
            body('userid', 'Trường này không được bỏ trống').notEmpty(),
            body('name', 'Trường này không được bỏ trống').notEmpty(),
            body('imei', 'Trường này không được bỏ trống').notEmpty(),
            body('sim_card', 'Trường này không được bỏ trống').notEmpty(),
            body('expired_on', 'Trường này không được bỏ trống').notEmpty(),
        ],
        deviceController.update,
    );
    // router.delete('/delete/:id', deviceController.delete);
    // router.put('/update-publish/:id', deviceController.updatePublish);

    app.use('/api/device', router);
};
