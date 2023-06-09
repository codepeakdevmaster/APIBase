const express = require('express');
const router = express.Router();
var Lead = require('../models/lead.model');
const { validate, Joi } = require('express-validation');

const LeadValidation = {
    body: Joi.object({
        name: Joi.string()
            .required(),
        phone: Joi.string()
            .required(),
        email: Joi.string(),
        courseid: Joi.string(),
        qualification: Joi.string()
            .required(),
        status: Joi.string()
    })
};

router.post('', validate(LeadValidation, {}, {}), async (req, res) => {
    let request = req.body;
    var newLead = new Lead({
        name: request.name,
        phone: request.phone,
        email: request.email,
        courseid: request.courseid,
        qualification: request.qualification,
        status: request.status,
        createdat: Date.now(),
        createdby: req.sessionUser.username
    });
    newLead.save()
        .then(_ => { return res.Success("The batch saved successfully."); })
        .catch(err => {
            console.log(err);
            return res.Exception("Error saving batch data.");
        });
});

router.put('/:id', validate(LeadValidation, {}, {}), async (req, res) => {
    let id = req.params.id;
    let request = req.body;
});

module.exports = router;