const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const storeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxLength: 100,
            validate: [nameAvailable, 'Store name is invalid'],
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true,
        },
        bio: {
            type: String,
            trim: true,
            required: true,
            maxLength: 1000,
        },
        ownerId: {
            type: ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        staffIds: {
            type: [
                {
                    type: ObjectId,
                    ref: 'User',
                },
            ],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            default: 'close',
            enum: ['open', 'close'],
        },
        avatar: {
            type: String,
            default: '/uploads/default.jpg',
        },
        cover: {
            type: String,
            default: '/uploads/default.jpg',
        },
        featured_images: {
            type: [String],
            validate: [featured_imagesLimit, 'The limit is 6 images'],
        },
        e_wallet: {
            type: mongoose.Decimal128,
            min: 0,
            default: 0,
        },
        point: {
            type: Number,
            default: function () {
                return this.amount_order + Math.floor(this.amount_spent / 100);
            },
        },
        amount_order: {
            type: Number,
            default: 0,
            min: 0,
        },
        amount_spent: {
            type: mongoose.Decimal128,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true },
);

//validators
function featured_imagesLimit(val) {
    return val.length <= 6;
}

function nameAvailable(val) {
    const defaultName = [
        'gooddeal',
        'good deal',
        'good-deal',
        "good'deal",
        'good_deal',
    ];
    let flag = true;
    defaultName.forEach((name) => {
        if (val.toLowerCase().includes(name)) {
            flag = false;
        }
    });
    return flag;
}

module.exports = mongoose.model('Store', storeSchema);
