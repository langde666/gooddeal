const express = require('express');
const router = express.Router();

//import validators
const userValidator = require('../validators/userValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const {
    isAuth,
    isAdmin,
    verifyPassword,
} = require('../controllers/authController');
const { upload } = require('../controllers/uploadController');
const {
    userById,
    getUser,
    updateProfile,
    updateAccount,
    listAddress,
    addAddress,
    updateAddress,
    removeAddress,
    getAvatar,
    updateAvatar,
    getCover,
    updateCover,
    // getRole,
    listUser,
    // getUserProfile,
    listUserForAdmin,
} = require('../controllers/userController');

//routes
router.get('/user/:userId', getUser);
// router.get('/user/profile/:userId', isAuth, getUserProfile);
router.get('/users', listUser);
router.get('/users/for/admin/:userId', isAuth, isAdmin, listUserForAdmin);
router.put(
    '/user/profile/:userId',
    isAuth,
    userValidator.updateProfile(),
    validateHandler,
    updateProfile,
);
router.put(
    '/user/account/:userId',
    isAuth,
    userValidator.updateAccount(),
    validateHandler,
    verifyPassword,
    updateAccount,
);

router.get('/user/addresses/:userId', isAuth, listAddress);
router.post(
    '/user/address/:userId',
    isAuth,
    userValidator.userAddress(),
    validateHandler,
    addAddress,
);
router.put(
    '/user/address/:userId',
    isAuth,
    userValidator.userAddress(),
    validateHandler,
    updateAddress,
);
router.delete('/user/address/:userId', isAuth, removeAddress);

router.get('/user/avatar/:userId', getAvatar);
router.put('/user/avatar/:userId', isAuth, upload, updateAvatar);

router.get('/user/cover/:userId', getCover);
router.put('/user/cover/:userId', isAuth, upload, updateCover);

// router.get('/user/role/:userId', getRole);

//router params
router.param('userId', userById);

module.exports = router;
