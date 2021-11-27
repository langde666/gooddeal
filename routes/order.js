const express = require('express');
const router = express.Router();

//controllers
const { isAuth, isAdmin, isManager } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { storeById } = require('../controllers/store');
const { cartById } = require('../controllers/cart');
const {
    orderById,
    createOrder,
    createOrderItems,
    removeCart,
    removeAllCartItems,
    listOrderForAdmin,
    listOrderByStore,
    listOrderByUser,
    checkOrderAuth,
    readOrder,
    updateStatusForUser,
    updateStatusForStore,
    updateStatusForAdmin,
    updateEWallet,
    updateQuantitySoldProduct,
} = require('../controllers/order');

//routes
router.get(
    '/order/by/user/:orderId/:userId',
    isAuth,
    checkOrderAuth,
    readOrder,
);
router.get(
    '/order/by/store/:orderId/:storeId/:userId',
    isAuth,
    isManager,
    checkOrderAuth,
    readOrder,
);
router.get(
    '/order/for/admin/:orderId/:userId',
    isAuth,
    isAdmin,
    checkOrderAuth,
    readOrder,
);
router.get('/orders/by/user/:userId', isAuth, listOrderByUser);
router.get(
    '/orders/by/store/:storeId/:userId',
    isAuth,
    isManager,
    listOrderByStore,
);
router.get('/orders/for/admin/:userId', isAuth, isAdmin, listOrderForAdmin);
router.post(
    '/order/create/:cartId/:userId',
    isAuth,
    createOrder,
    createOrderItems,
    removeCart,
    removeAllCartItems,
);
router.put(
    '/order/update/by/user/:orderId/:userId',
    isAuth,
    checkOrderAuth,
    updateStatusForUser,
);
router.put(
    '/order/update/by/store/:orderId/:storeId/:userId',
    isAuth,
    isManager,
    checkOrderAuth,
    updateStatusForStore,
);
router.put(
    '/order/update/for/admin/:orderId/:userId',
    isAuth,
    isAdmin,
    checkOrderAuth,
    updateStatusForAdmin,
    updateEWallet,
    updateQuantitySoldProduct,
);

//params
router.param('orderId', orderById);
router.param('cartId', cartById);
router.param('storeId', storeById);
router.param('userId', userById);

module.exports = router;
