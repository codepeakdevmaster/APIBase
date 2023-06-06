const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
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

router.post('', auth, validate(LeadValidation, {}, {}), async (req, res)=>{
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
    newLead.save().then(_ => {
        res.status(200).json({
            status: 200,
            message: "The batch saved successfully."
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error saving batch data."
        })
    });
});

module.exports = router;