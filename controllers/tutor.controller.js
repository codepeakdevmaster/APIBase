const express = require('express');
const router = express.Router();
var Tutor = require('../models/tutor.model');
// var Course = require('../models/course.model');
var User = require('../models/user.model');
const { validate, Joi } = require('express-validation');


const TutorValidation = {
    body: Joi.object({
        name: Joi.string()
            .required(),
        phone: Joi.string()
            .required(),
        email: Joi.string(),
        qualification: Joi.string()
            .required(),
        joindate: Joi.date(),
        releivingdate: Joi.date(),
        courses: Joi.array()
    })
};

router.post('', validate(TutorValidation, {}, {}), async (req, res) => {
    let request = req.body;
    var newTutor = new Tutor({
        name: request.name,
        phone: request.phone,
        email: request.email,
        courses: request.courses,
        qualification: request.qualification,
        joindate: request.joindate,
        releivingdate: request.releivingdate,
        // active: request.active,
        createdat: Date.now(),
        createdby: req.sessionUser.username
    });
    newTutor.save()
        .then(_ => { return res.Success("Tutor details saved successfully.") })
        .catch(err => {
            console.error(err);
            return res.Exception("Error saving tutor details.");
        });
});

router.put('/:id', validate(TutorValidation, {}, {}), async (req, res) => {
    let id = req.params.id;
    let request = req.body;
    await Tutor.findByIdAndUpdate(id, {
        name: request.name,
        phone: request.phone,
        email: request.email,
        courses: request.courses,
        qualification: request.qualification,
        joindate: request.joindate,
        releivingdate: request.releivingdate,
        // active: request.active,
        updatedat: Date.now(),
        updatedby: req.sessionUser.username
    })
        .then(_ => { return res.Success("Tutor details updated successfully."); })
        .catch(err => {
            console.error(err);
            return res.Exception("Error updating tutor details.");
        });
});

router.get('', async (req, res) => {
    var tutors = await Tutor.find()//{ active: true }
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching list of tutors.");
        });
    var response = [];
    tutors.map((tutor, _) => {
        response.push({
            id: tutor._id,
            userid: tutor.userid,
            name: tutor.name,
            phone: tutor.phone,
            email: tutor.email,
            courses: tutor.courses,// tutorCourses,
            qualification: tutor.qualification,
            // active: tutor.active,
            joindate: tutor.joindate,
            releivingdate: tutor.releivingdate,
            createdby: tutor.createdby,
            createdat: tutor.createdat,
            updatedat: tutor.updatedat,
            updatedby: tutor.updatedby
        });
    });
    return res.Success("Success", response);
});

router.get('/:id', async (req, res) => {
    let id = req.params.id;
    var tutor = await Tutor.findById(id)
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching tutor details.");
        });
    if (!tutor) return res.NotFound("Tutor not found.");
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
            id: tutor._id,
            userid: tutor.userid,
            name: tutor.name,
            phone: tutor.phone,
            email: tutor.email,
            courses: tutor.courses,
            qualification: tutor.qualification,
            joindate: tutor.joindate,
            releivingdate: tutor.releivingdate,
            createdby: tutor.createdby,
            createdat: tutor.createdat,
            updatedat: tutor.updatedat,
            updatedby: tutor.updatedby
        };
        return res.Success("Tutor found", response);
    }
});


router.post('/setuser', validate(TutorValidation, {}, {}), async (req, res) => {
    let id = req.params.id;
    let request = req.body;
    var tutor = await Tutor.getTutorByEmail(request.email)
        .catch(err => {
            return res.Exception("Error finding tutor.");
        });
    if (!tutor) return res.NotFound("Tutor not found.");
    var user = await User.getUserByUsername(request.email)
        .catch(err => {
            return res.Exception("Error finding user.");
        });
    if (!user) return res.NotFound("User not found.");
    await Intern.findByIdAndUpdate(tutor._id, {
        userid: user._id,
        updatedat: Date.now(),
        updatedby: req.sessionUser.username + '[UC]'
    })
        .then(_ => { return res.Success("Tutor details updated successfully."); })
        .catch(err => {
            console.error(err);
            return res.Exception("Error updating tutor details.");
        });
});

router.delete('/:id', async (req, res) => {
    let id = req.params.id;
    await Tutor.findByIdAndDelete(id)
        .then(_ => { return res.Success("Deleted tutor details."); })
        .catch(err => {
            console.error(err);
            return res.Exception("Error deleting tutor.");
        })
});

module.exports = router;