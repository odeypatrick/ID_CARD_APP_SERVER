const mongoose = require('mongoose')

const cardSchema = mongoose.Schema({
    declaration: {
        type: String,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        trim: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true
    },
    signature: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Card", cardSchema);