const express = require('express');
const router = express.Router();
var Lead = require('../models/lead.model');
var Course = require('../models/course.model');
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
        .then(_ => { return res.Success("The lead saved successfully."); })
        .catch(err => {
            console.log(err);
            return res.Exception("Error saving lead data.");
        });
});

router.put('/:id', validate(LeadValidation, {}, {}), async (req, res) => {
    let id = req.params.id;
    let request = req.body;
    await Lead.findByIdAndUpdate(id, {
        name: request.name,
        phone: request.phone,
        email: request.email,
        courseid: request.courseid,
        qualification: request.qualification,
        status: request.status,
        updatedat: Date.now(),
        updatedby: req.sessionUser.username
    })
        .then(_ => { return res.Success("Lead updated successfully."); })
        .catch(err => {
            console.error(err);
            return res.Exception("Error updating lead.");
        });
});

router.get('', async (req, res) => {
    var leads = await Lead.find()
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching leads.");
        });
    var courses = await Course.find({ active: true })
        .catch(err => {
            console.log("Error fetching courses for batch data");
            console.log(err);
            return res.Exception("Error fetching list of batches");
        })
    var response = [];
    leads.map((lead, _) => {
        var course = courses.find(x => x.id === lead.courseid);
        response.push({
            id: lead._id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            courseid: lead.courseid,
            course: course.coursename,
            qualification: lead.qualification,
            status: lead.status
        });
    });
    return res.Success("Success", response);
});

router.get('/:id', async (req, res) => {
    let id = req.params.id;
    var lead = await Lead.findById(id)
        .catch(err => {
            console.error(err);
            return res.Exception("Error finding lead.");
        });
    if (!lead) return res.NotFound("Lead not found.");
    else {
        var course = Course.findById(lead.courseid)
            .catch(err => {
                console.error(err);
                return res.Exception("Error finding course for lead details.");
            });
        var response = {
            id: lead._id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            courseid: lead.courseid,
            course: course.coursename,
            qualification: lead.qualification,
            status: lead.status,
            createdby: lead.createdby,
            createdat: lead.createdat,
            updatedat: lead.updatedat,
            updatedby: lead.updatedby
        };
        return res.Success("Lead found", response);
    }
});

router.delete('/:id', async (req, res) => {
    let id = req.params.id;
    await Lead.findByIdAndDelete(id)
        .then(_ => { return res.Success("Deleted lead details."); })
        .catch(err => {
            console.error(err);
            return res.Exception("Error deleting lead.");
        })
});

module.exports = router;