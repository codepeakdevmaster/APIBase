const express = require('express');
const router = express.Router();
var Intern = require('../models/intern.model');
var User = require('../models/user.model');
const { validate, Joi } = require('express-validation');


const InternValidation = {
    body: Joi.object({
        name: Joi.string()
            .required(),
        phone: Joi.string()
            .required(),
        email: Joi.string(),
        qualification: Joi.string()
            .required(),
        courseid: Joi.string()
            .required(),
        batchid: Joi.string()
            .required(),
    })
};

router.post('', validate(InternValidation, {}, {}), async (req, res) => {
    let request = req.body;
    var newIntern = new Intern({
        name: request.name,
        phone: request.phone,
        email: request.email,
        qualification: request.qualification,
        courseid: request.courseid,
        batchid: request.batchid,
        createdat: Date.now(),
        createdby: req.sessionUser.username
    });
    newIntern.save()
        .then(_ => { return res.Success("Intern details saved successfully.") })
        .catch(err => {
            console.error(err);
            return res.Exception("Error saving intern details.");
        });
});

router.put('/:id', validate(InternValidation, {}, {}), async (req, res) => {
    let id = req.params.id;
    let request = req.body;
    await Intern.findByIdAndUpdate(id, {
        name: request.name,
        phone: request.phone,
        email: request.email,
        qualification: request.qualification,
        courseid: request.courseid,
        batchid: request.batchid,
        updatedat: Date.now(),
        updatedby: req.sessionUser.username
    })
        .then(_ => { return res.Success("Intern details updated successfully."); })
        .catch(err => {
            console.error(err);
            return res.Exception("Error updating intern details.");
        });
});

router.get('', async (req, res) => {
    var interns = await Intern.find()
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching list of interns.");
        });
    var response = [];
    interns.map((intern, _) => {
        response.push({
            id: intern._id,
            userid: intern.userid,
            name: intern.name,
            phone: intern.phone,
            email: intern.email,
            qualification: intern.qualification,
            courseid: intern.courseid,
            batchid: intern.batchid,
            createdby: intern.createdby,
            createdat: intern.createdat,
            updatedat: intern.updatedat,
            updatedby: intern.updatedby
        });
    });
    return res.Success("Success", response);
});

router.get('/:id', async (req, res) => {
    let id = req.params.id;
    var intern = await Intern.findById(id)
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching intern details.");
        });
    if (!intern) return res.NotFound("Intern not found.");
    else {
        // var tutorCourses = [];
        // model.find({
        //     '_id': { $in: [
        //         mongoose.Types.ObjectId('4ed3ede8844f0f351100000c'),
        //         mongoose.Types.ObjectId('4ed3f117a844e0471100000d'), 
        //         mongoose.Types.ObjectId('4ed3f18132f50c491100000e')
        //     ]}
        // }, function(err, docs){
        //      console.log(docs);
        // });
        var response = {
            id: intern._id,
            userid: intern.userid,
            name: intern.name,
            phone: intern.phone,
            email: intern.email,
            qualification: intern.qualification,
            courseid: intern.courseid,
            batchid: intern.batchid,
            createdby: intern.createdby,
            createdat: intern.createdat,
            updatedat: intern.updatedat,
            updatedby: intern.updatedby
        };
        return res.Success("Intern found", response);
    }
});

router.put('/setuser', validate(InternValidation, {}, {}),  async (req, res) => {
    let id = req.params.id;
    let request = req.body;
    var intern = await Intern.getInternByEmail(request.email)
        .catch(err => {
            return res.Exception("Error finding intern.");
        });
    if (!intern) return res.NotFound("Intern not found.");
    var user = await User.getUserByUsername(request.email)
        .catch(err => {
            return res.Exception("Error finding user.");
        });
    if (!user) return res.NotFound("User not found.");
    await Intern.findByIdAndUpdate(intern._id, {
        userid: user._id,
        updatedat: Date.now(),
        updatedby: req.sessionUser.username + '[UC]'
    })
        .then(_ => { return res.Success("Intern details updated successfully."); })
        .catch(err => {
            console.error(err);
            return res.Exception("Error updating intern details.");
        });
});

router.delete('/:id', async (req, res) => {
    let id = req.params.id;
    await Intern.findByIdAndDelete(id)
        .then(_ => { return res.Success("Deleted intern details."); })
        .catch(err => {
            console.error(err);
            return res.Exception("Error deleting intern.");
        })
});

module.exports = router;