const express = require('express');
const router = express.Router();

//import validators
const storeValidator = require('../validators/storeValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const {
    isAuth,
    isAdmin,
    isManager,
    isOwner,
} = require('../controllers/authController');
const { userById } = require('../controllers/userController');
const { upload } = require('../controllers/uploadController');
const {
    storeById,
    getStore,
    createStore,
    getStoreProfile,
    updateStore,
    activeStore,
    updateCommission,
    openStore,
    updateAvatar,
    updateCover,
    listFeatureImages,
    addFeatureImage,
    updateFeatureImage,
    removeFeaturedImage,
    addStaffs,
    cancelStaff,
    listStaffs,
    removeStaff,
    listStoreCommissions,
    listStores,
    listStoresByUser,
} = require('../controllers/storeController');

//routes
router.get('/store/:storeId', getStore);
router.get(
    '/store/profile/:storeId/:userId',
    isAuth,
    isManager,
    getStoreProfile,
);
router.get(
    '/stores/by/user/:userId',
    isAuth,
    listStoreCommissions,
    listStoresByUser,
);
router.get(
    '/stores/:userId',
    isAuth,
    isAdmin,
    listStoreCommissions,
    listStores,
);
router.post(
    '/store/create/:userId',
    isAuth,
    storeValidator.createStore(),
    validateHandler,
    createStore,
);
router.put(
    '/store/:storeId/:userId',
    isAuth,
    isManager,
    storeValidator.updateStore(),
    validateHandler,
    updateStore,
);

router.put(
    '/store/active/:storeId/:userId',
    isAuth,
    isAdmin,
    storeValidator.activeStore(),
    validateHandler,
    activeStore,
);

router.put(
    '/store/commission/:storeId/:userId',
    isAuth,
    isAdmin,
    storeValidator.updateCommission(),
    validateHandler,
    updateCommission,
);

router.put(
    '/store/open/:storeId/:userId',
    isAuth,
    isManager,
    storeValidator.openStore(),
    validateHandler,
    openStore,
);

// router.get('/store/avatar/:storeId', getAvatar);
router.put(
    '/store/avatar/:storeId/:userId',
    isAuth,
    isManager,
    upload,
    updateAvatar,
);

// router.get('/store/cover/:storeId', getCover);
router.put(
    '/store/cover/:storeId/:userId',
    isAuth,
    isManager,
    upload,
    updateCover,
);

router.get('/store/featured/images/:storeId', listFeatureImages);
router.post(
    '/store/featured/image/:storeId/:userId',
    isAuth,
    isManager,
    upload,
    addFeatureImage,
);
router.put(
    '/store/featured/image/:storeId/:userId',
    isAuth,
    isManager,
    upload,
    updateFeatureImage,
);
router.delete(
    '/store/featured/image/:storeId/:userId',
    isAuth,
    isManager,
    removeFeaturedImage,
);

// router.get('/store/owner/:storeId', getOwner);

router.get('/store/staffs/:storeId/:userId', isAuth, isManager, listStaffs);
router.post('/store/staffs/:storeId/:userId', isAuth, isOwner, addStaffs);
router.delete(
    '/store/staff/remove/:storeId/:userId',
    isAuth,
    isOwner,
    removeStaff,
);
router.get(
    '/store/staff/cancel/:storeId/:userId',
    isAuth,
    isManager,
    cancelStaff,
);

//router params
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
