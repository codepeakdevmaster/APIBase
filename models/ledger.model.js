const mongoose = require('mongoose');

let LedgerSchema = mongoose.Schema({
    year: {
        type: Number,
        default: null
    },
    month: {
        type: Number,
        default: null
    },
    day: {
        type: Number,
        default: null,
    },
    particulars: {
        type: String,
        default: ''
    },
    debitamount: {
        type: String,
        default: '0'
    },
    creditamount: {
        type: String,
        default: '0'
    },
    createdat: {
        type: Date,
        default: null
    },
    createdby: {
        type: String,
        default: ''
    },
    updatedat: {
        type: Date,
        default: null,
    },
    updatedby: {
        type: String,
        default: ''
    }
});

var Ledger = module.exports = mongoose.model('Ledger', LedgerSchema);