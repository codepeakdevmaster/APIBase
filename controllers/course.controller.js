const express = require('express');
const router = express.Router();
var Course = require('../models/course.model');
const { validate, Joi } = require('express-validation');

const courseValidation = {
    body: Joi.object({
        coursename: Joi.string()
            .required()
    })
};

router.post('', validate(courseValidation, {}, {}), async (req, res) => {
    let request = req.body;
    let course = await Course.findOne({ coursename: request.coursename });
    if (!course) {
        var newCourse = new Course({
            coursename: request.coursename,
            createdat: Date.now(),
            createdby: req.sessionUser.username
        });
        newCourse.save()
            .then(_ => {
                return res.Success("Course created successfully.");
            })
            .catch(err => {
                console.log(err);
                return res.Exception("Error creating course.");
            });
    } else return res.Exists("The course already exists.");
});

router.put('/:id', validate(courseValidation, {}, {}), async (req, res) => {
    let id = req.params.id;
    let request = req.body;
    var course = await Course.findById(id)
        .catch(err => {
            console.log(err);
            return res.Exception("Error finding course");
        });
    if (!course) return res.NotFound("Course not found");
    else {
        await Course.findByIdAndUpdate(id, {
            coursename: request.coursename,
            updatedat: Date.now(),
            updatedby: req.sessionUser.username
        })
            .then(_ => { return res.Success("Course Updated Successfully"); })
            .catch(err => {
                console.log(err);
                return res.Exception("Error updating course details.");
            });
    }
});

router.get('', async (req, res) => {
    var courses = await Course.find({ active: true })
        .catch(err => {
            console.log(err);
            return res.Exception("Error fetching list of courses");
        });
    return res.Success("Success", courses);
});

router.get('/:id', async (req, res) => {
    let id = req.params.id;
    var course = await Course.findById(id)
        .catch(err => {
            console.log(err);
            return res.Exception("Error finding course");
        });
    if (!course) return res.NotFound("Course not found");
    else return res.Success("Course found", course);
});

/// Here we are doing only a soft delete on the course collection.
router.delete('/:id', async (req, res) => {
    let id = req.params.id;
    await Course.findByIdAndUpdate(id, {
        active: false,
        updatedat: Date.now(),
        updatedby: req.sessionUser.username
    })
        .then(_ => { return res.Success("Deleted course successfully."); })
        .catch(err => {
            console.log(err);
            return res.Exception("Error deleting course.");
        });
});

module.exports = router;