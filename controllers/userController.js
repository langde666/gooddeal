const User = require('../models/userModel');
const fs = require('fs');
const formidable = require('formidable');

/*------
  USER
  ------*/
exports.userById = (req, res, next, id) => {
    User.findById(id, (error, user) => {
        if (error || !user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        req.user = user;
        next();
    });
};

exports.getUser = (req, res) => {
    req.user.hashed_password = undefined;
    req.user.salt = undefined;

    let user = req.user;
    res.json({
        success: 'Get user successfully',
        user,
    });
};

exports.updateUser = (req, res) => {
    // console.log('---REQUEST BODY---: ', req.body);
    const { firstname, lastname, email, phone, id_card, password } = req.body;

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { firstname, lastname, email, phone, id_card } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found',
                });
            }

            if (password) {
                user.hashed_password = user.encryptPassword(
                    password,
                    user.salt,
                );

                user.save((e, u) => {
                    if (e) {
                        return res.status(400).json({
                            error: 'Update user successfully but password failed',
                        });
                    }

                    // u.hashed_password = undefined;
                    // u.salt = undefined;
                    return res.json({
                        success: 'Update user and password successfully',
                        // user: u,
                    });
                });
            } else {
                // user.hashed_password = undefined;
                // user.salt = undefined;
                return res.json({
                    success: 'Update user successfully',
                    // user,
                });
            }
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Update user failed, the cause may be because email, phone or id_card already exists',
            });
        });
};

/*------
  ADDRESS
  ------*/
exports.listAddress = (req, res) => {
    // console.log('---REQUEST USER---: ', req.user);
    const addresses = req.user.addresses;
    return res.json({
        success: 'load list address successfully',
        addresses: addresses,
    });
};

exports.addAddress = (req, res) => {
    let addresses = req.user.addresses;
    if (addresses.length >= 5) {
        return res.status(400).json({
            error: 'The limit is 5 addresses',
        });
    }

    addresses.push(req.body.address.trim());
    addresses = [...new Set(addresses)];

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { addresses: addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found',
                });
            }

            // user.hashed_password = undefined;
            // user.salt = undefined;
            return res.json({
                success: 'Add address successfully',
                // user,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Add address failed',
            });
        });
};

exports.updateAddress = (req, res) => {
    const addressIndex = req.params.addressIndex;
    let addresses = req.user.addresses;

    if (addresses.length <= addressIndex) {
        return res.status(404).json({
            error: 'Address not found',
        });
    }

    const index = addresses.indexOf(req.body.address.trim());
    if (index != -1 && index != addressIndex) {
        return res.status(400).json({
            error: 'Address already exists',
        });
    }

    addresses.splice(addressIndex, 1, req.body.address.trim());
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { addresses: addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found',
                });
            }

            // user.hashed_password = undefined;
            // user.salt = undefined;
            return res.json({
                success: 'Update address successfully',
                // user,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Update address failed',
            });
        });
};

exports.removeAddress = (req, res) => {
    const addressIndex = req.params.addressIndex;
    let addresses = req.user.addresses;

    if (addresses.length <= addressIndex) {
        return res.status(404).json({
            error: 'Address not found',
        });
    }

    addresses.splice(addressIndex, 1);
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { addresses: addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found',
                });
            }

            // user.hashed_password = undefined;
            // user.salt = undefined;
            return res.json({
                success: 'Remove address successfully',
                // user,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Remove address failed',
            });
        });
};

/*------
  AVATAR
  ------*/
exports.getAvatar = (req, res) => {
    let avatar = req.user.avatar;
    return res.json({
        success: 'load avatar successfully',
        avatar,
    });
};

exports.updateAvatar = (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    // form.uploadDir = 'public/uploads/user/';

    form.parse(req, (error, fields, files) => {
        if (error) {
            return res.status(400).json({
                error: 'Photo could not be up load',
            });
        }

        // console.log('---FILES---: ', files.photo);
        if (files.photo) {
            const type = files.photo.type;
            if (
                type !== 'image/png' &&
                type !== 'image/jpg' &&
                type !== 'image/jpeg' &&
                type !== 'image/gif'
            ) {
                return res.status(400).json({
                    error: 'Invalid type. Photo type must be png, jpg, jpeg or gif.',
                });
            }

            const size = files.photo.size;
            if (size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size',
                });
            }

            const path = files.photo.path;
            fs.readFile(path, function (error, data) {
                if (error) {
                    return res.status(400).json({
                        error: 'Can not read photo file',
                    });
                }

                let newpath =
                    'public/uploads/user/' + 'avatar-' + req.user.slug;
                const types = ['.png', '.jpg', '.jpeg', '.gif'];
                types.forEach((type) => {
                    try {
                        fs.unlinkSync(newpath + type);
                    } catch {}
                });

                newpath = newpath + '.' + type.replace('image/', '');
                fs.writeFile(newpath, data, function (error) {
                    if (error) {
                        return res.status(400).json({
                            error: 'Photo could not be up load',
                        });
                    }

                    User.findOneAndUpdate(
                        { _id: req.user._id },
                        { $set: { avatar: newpath.replace('public', '') } },
                        { new: true },
                    )
                        .exec()
                        .then((user) => {
                            if (!user) {
                                res.status(404).json({
                                    error: 'User not found',
                                });
                            }

                            // user.hashed_password = undefined;
                            // user.salt = undefined;
                            return res.json({
                                success: 'Update avatar successfully',
                                // user,
                            });
                        })
                        .catch((error) => {
                            return res.status(400).json({
                                error: 'Update avatar failed',
                            });
                        });
                });
            });
        } else {
            return res.status(400).json({
                error: 'Photo file is not exists',
            });
        }
    });
};

/*------
  ROLE
  ------*/
exports.getRole = (req, res) => {
    let role = req.user.role;
    return res.json({
        success: 'Get role successfully',
        role,
    });
};
