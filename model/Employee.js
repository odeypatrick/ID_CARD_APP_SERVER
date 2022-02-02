const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        trim: true,
        max: 100,
        min: 3,
        default: ""
    },
    cardId: {
        type: String,
        required: true
    },
    department: {
        type: String,
        lowercase: true,
        default: ""
    },
    role: {
        type: String,
        lowercase: true,
        default: ""
    },
    picture: {
        type: String,
    },
    companyName: {
        type: String,
    },
    signature: {
        type: String,
        default: ""
    },
    expiryDate: {
        type: String
    },
    type: {
        type: Number,
        default: 1
    },
}, { timestamps: true })

module.exports = mongoose.model("Employee", employeeSchema)