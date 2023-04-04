const router = require('express').Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const uploadImageUser = require('../middlewares//uploadImageUser');

module.exports = (app) => {
    router.get('/getall', userController.getall);
    router.get('/getbyid/:id', userController.getById);
    router.post(
        '/register',
        [
            body('name', 'Tên không được bỏ trống').notEmpty(),
            body('account', 'Tên tài khoản không được bỏ trống và phải viết liền không dấu').notEmpty(),
            body('email', 'Trường này phải là email').isEmail(),
            body('email', 'Email không được bỏ trống').notEmpty(),
            body('password', 'Mật khẩu không được bỏ trống').notEmpty(),
            body('password', 'Mật khẩu ít nhất là 8 kí tự').isLength({ min: 8 }),
            body('role_id', 'Phân quyền không được bỏ trống').notEmpty(),
            body('phone', 'Số điện thoại không được bỏ trống').notEmpty(),
            body('phone', 'Trường này phải là số').isNumeric(),
            body('phone', 'Số điện thoại không hợp lệ').isLength({ min: 10, max: 10 }),
            body('address', 'Địa chỉ không được bỏ trống').notEmpty(),
        ],
        userController.register,
    );
    router.put(
        '/updatebyid/:id',
        [
            body('name', 'Tên không được bỏ trống').notEmpty(),
            body('account', 'Tên tài khoản không được bỏ trống và phải viết liền không dấu').notEmpty(),
            body('email', 'Trường này phải là email').isEmail(),
            body('email', 'Email không được bỏ trống').notEmpty(),
            body('role_id', 'Phân quyền không được bỏ trống').notEmpty(),
            body('phone', 'Số điện thoại không được bỏ trống').notEmpty(),
            body('phone', 'Trường này phải là số').isNumeric(),
            body('phone', 'Số điện thoại không hợp lệ').isLength({ min: 10, max: 10 }),
            body('address', 'Địa chỉ không được bỏ trống').notEmpty(),
        ],
        userController.update,
    );
    router.delete('/delete/:id', userController.delete);
    router.put('/update-active/:id', userController.updateActive);
    router.post(
        '/login',
        [
            body('account', 'Tên đăng nhập không thể bỏ trống').notEmpty(),
            body('password', 'Mật khẩu không thể bỏ trống').notEmpty(),
            body('password', 'Mật khẩu ít nhất là 8 kí tự').isLength({ min: 8 }),
        ],
        userController.login,
    );
    router.post('/refresh-token', userController.refreshToken);
    router.post(
        '/forgot-password',
        [body('email', 'Email không được bỏ trống').notEmpty(), body('email', 'Trường này phải lài email').isEmail()],
        userController.forgotPassword,
    );
    router.put(
        '/change-password/:id',
        [
            body('password', 'Password không được bỏ trống').notEmpty(),
            body('passwordNew', 'PasswordNew không được bỏ trống').notEmpty(),
        ],
        userController.changePassword,
    );
    router.put('/upload-image/:id', uploadImageUser.single('image'), userController.uploadImage);

    app.use('/api/user', router);
};
