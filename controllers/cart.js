const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const { errorHandler } = require('../helpers/errorHandler');

exports.cartById = (req, res, next, id) => {
    Cart.findById(id, (error, cart) => {
        if (error || !cart) {
            return res.status(404).json({
                error: 'Cart not found',
            });
        }

        req.cart = cart;
        next();
    });
};

exports.cartItemById = (req, res, next, id) => {
    CartItem.findById(id, (error, cartItem) => {
        if (error || !cartItem) {
            return res.status(404).json({
                error: 'CartItem not found',
            });
        }

        req.cartItem = cartItem;
        next();
    });
};

exports.createCart = (req, res, next) => {
    const { storeId } = req.body;

    if (!storeId)
        return res.status(400).json({
            error: 'Store not found',
        });

    Cart.findOneAndUpdate(
        { userId: req.user._id, storeId },
        { isDeleted: false },
        { upsert: true, new: true },
    )
        .exec()
        .then((cart) => {
            if (!cart)
                return res.status(400).json({
                    error: 'Create cart failed',
                });
            else {
                //create cart item
                req.cart = cart;
                next();
            }
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Create cart failed',
            });
        });
};

exports.createCartItem = (req, res) => {
    const { productId, styleValueIds, count } = req.body;

    if (!productId || !count)
        return res.status(400).json({
            error: 'All fields are required',
        });

    let styleValueIdsArray = [];
    if (styleValueIds) {
        styleValueIdsArray = styleValueIds.split('|');
    }

    CartItem.findOneAndUpdate(
        { productId, styleValueIds: styleValueIdsArray, cartId: req.cart._id },
        { $set: { count } },
        { upsert: true, new: true },
    )
        .populate({
            path: 'productId',
            populate: {
                path: 'categoryId',
                populate: {
                    path: 'categoryId',
                    populate: { path: 'categoryId' },
                },
            },
            populate: {
                path: 'storeId',
                select: {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                    isActive: 1,
                    isOpen: 1,
                },
            },
        })
        .populate({
            path: 'styleValueIds',
            populate: { path: 'styleId' },
        })
        .exec()
        .then((item) => {
            if (!item)
                return res.status(400).json({
                    error: 'Create cart item failed',
                });
            else
                return res.json({
                    success: 'Add to cart successfully',
                    item,
                });
        });
};

exports.listCarts = (req, res) => {
    const userId = req.user._id;
    const limit =
        req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    let skip = (page - 1) * limit;

    const filter = {
        limit,
        pageCurrent: page,
    };

    Cart.countDocuments({ userId, isDeleted: false }, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'List carts not found',
            });
        }

        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;

        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }

        if (count <= 0) {
            return res.json({
                success: 'Load list carts successfully',
                filter,
                size,
                carts: [],
            });
        }

        Cart.find({ userId, isDeleted: false })
            .populate('storeId', '_id name avatar isActive isOpen')
            .sort({ name: 1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .exec()
            .then((carts) => {
                return res.json({
                    success: 'Load list carts successfully',
                    filter,
                    size,
                    carts,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Load list carts failed',
                });
            });
    });
};

exports.listItemByCard = (req, res) => {
    CartItem.find({ cartId: req.cart._id })
        .populate({
            path: 'productId',
            populate: {
                path: 'categoryId',
                populate: {
                    path: 'categoryId',
                    populate: { path: 'categoryId' },
                },
            },
            populate: {
                path: 'storeId',
                select: {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                    isActive: 1,
                    isOpen: 1,
                },
            },
        })
        .populate({
            path: 'styleValueIds',
            populate: { path: 'styleId' },
        })
        .exec()
        .then((items) => {
            return res.json({
                success: 'Load list cart items successfully',
                items,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Load list cart items failed',
            });
        });
};

exports.updateCartItem = (req, res) => {
    const { count } = req.body;

    CartItem.findOneAndUpdate(
        { _id: req.cartItem._id },
        { $set: { count } },
        { new: true },
    )
        .populate({
            path: 'productId',
            populate: {
                path: 'categoryId',
                populate: {
                    path: 'categoryId',
                    populate: { path: 'categoryId' },
                },
            },
            populate: {
                path: 'storeId',
                select: {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                    isActive: 1,
                    isOpen: 1,
                },
            },
        })
        .populate({
            path: 'styleValueIds',
            populate: { path: 'styleId' },
        })
        .exec()
        .then((item) => {
            return res.json({
                success: 'Update cart item successfully',
                item,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Update cart item failed',
            });
        });
};

exports.removeCartItem = (req, res, next) => {
    CartItem.deleteOne({ _id: req.cartItem._id })
        .exec()
        .then(() => {
            const cartId = req.cartItem.cartId;
            CartItem.countDocuments({ cartId }, (error, count) => {
                if (count <= 0) {
                    //remove cart
                    req.cartId = cartId;
                    next();
                } else {
                    return res.status(500).json({
                        error: 'Remove cart item successfully',
                    });
                }
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Remove cart item failed',
            });
        });
};

exports.removeCart = (req, res) => {
    Cart.findOneAndUpdate(
        { _id: req.cartId },
        { isDeleted: true },
        { new: true },
    )
        .exec()
        .then((cart) => {
            if (!cart)
                return res.status(400).json({
                    error: 'Remove cart failed',
                });
            return res.json({
                success: 'Remove cart successfully',
                cart,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Remove cart failed',
            });
        });
};
