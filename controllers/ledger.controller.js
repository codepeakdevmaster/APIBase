const express = require('express');
const router = express.Router();
var Ledger = require('../models/ledger.model');
const { validate, Joi } = require('express-validation');

const LedgerValidation = {
    body: Joi.object({
        year: Joi.number()
            .required(),
        month: Joi.number()
            .required(),
        day: Joi.number()
            .required(),
        particulars: Joi.string()
            .required(),
        creditamount: Joi.string(),
        debitamount: Joi.string(),
    })
};

router.post('', validate(LedgerValidation, {}, {}), async (req, res) => {
    let request = req.body;
    var newLedgerEntry = new Ledger({
        year: request.year,
        month: request.month,
        day: request.day,
        particulars: request.particulars,
        creditamount: request.creditamount,
        debitamount: request.debitamount,
        createdat: Date.now(),
        createdby: req.sessionUser.username
    });
    newLedgerEntry.save()
        .then(_ => { return res.Success("Ledger entry saved successfully.") })
        .catch(err => {
            console.error(err);
            return res.Exception("Error saving ledger entry.");
        });
});

router.put('/:id', validate(LedgerValidation, {}, {}), async (req, res) => {
    let id = req.params.id;
    let request = req.body;
    await Ledger.findByIdAndUpdate(id, {
        year: request.year,
        month: request.month,
        day: request.day,
        particulars: request.particulars,
        creditamount: request.creditamount,
        debitamount: request.debitamount,
        updatedat: Date.now(),
        updatedby: req.sessionUser.username
    })
        .then(_ => { return res.Success("Ledger entry updated successfully.") })
        .catch(err => {
            console.error(err);
            return res.Exception("Error updating ledger entry.");
        });
});

router.get('', async (req, res) => {
    var entries = await Ledger.find()
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching ledger entries.");
        });
    var response = [];
    entries.map((entry, _) => {
        response.push({
            id: entry._id,
            year: entry.year,
            month: entry.month,
            day: entry.day,
            particulars: entry.particulars,
            creditamount: entry.creditamount,
            debitamount: entry.debitamount,
            createdby: entry.createdby,
            createdat: entry.createdat,
            updatedat: entry.updatedat,
            updatedby: entry.updatedby
        });
    });
    return res.Success("Success", response);
});

router.get('/:id', async (req, res) => {
    let id = req.params.id;
    var entry = await Ledger.findById(id)
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching ledger entry details.");
        });
    if (!entry) return res.NotFound("Ledger entry not found.");
    else {
        var response = {
            id: entry._id,
            year: entry.year,
            month: entry.month,
            day: entry.day,
            particulars: entry.particulars,
            creditamount: entry.creditamount,
            debitamount: entry.debitamount,
            createdby: entry.createdby,
            createdat: entry.createdat,
            updatedat: entry.updatedat,
            updatedby: entry.updatedby
        }
        return res.Success("Ledger entry found", response);
    }
});

router.get('/filter/:year/:month/:day', async (req, res) => {
    let r_year = req.params.year;
    let r_month = req.params.month;
    let r_day = req.params.day;
    var response = [];
    if (r_day == 0) {
        var entries = await Ledger.find({
            "$and": [
                { year: r_year },
                { month: r_month },
            ]
        }).catch(err => {
            console.error(err);
            return res.Exception("Error fetching ledger entries.");
        });
        entries.map((entry, _) => {
            response.push({
                id: entry._id,
                year: entry.year,
                month: entry.month,
                day: entry.day,
                particulars: entry.particulars,
                creditamount: entry.creditamount,
                debitamount: entry.debitamount,
                createdby: entry.createdby,
                createdat: entry.createdat,
                updatedat: entry.updatedat,
                updatedby: entry.updatedby
            });
        });
    } else {
        var entries = await Ledger.find({
            "$and": [
                { year: r_year },
                { month: r_month },
                { day: r_day },
            ]
        }).catch(err => {
            console.error(err);
            return res.Exception("Error fetching ledger entries.");
        });
        entries.map((entry, _) => {
            response.push({
                id: entry._id,
                year: entry.year,
                month: entry.month,
                day: entry.day,
                particulars: entry.particulars,
                creditamount: entry.creditamount,
                debitamount: entry.debitamount,
                createdby: entry.createdby,
                createdat: entry.createdat,
                updatedat: entry.updatedat,
                updatedby: entry.updatedby
            });
        });
    }
    return res.Success("Success", response);
});


router.delete('/:id', async (req, res) => {
    let id = req.params.id;
    await Ledger.findByIdAndDelete(id)
        .then(_ => { return res.Success("Deleted ledger entry details."); })
        .catch(err => {
            console.error(err);
            return res.Exception("Error deleting ledger entry.");
        })
});

module.exports = router;