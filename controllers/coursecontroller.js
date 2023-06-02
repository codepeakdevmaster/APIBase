const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
var Course = require('../models/course.model');
const { validate, Joi } = require('express-validation');

const courseValidation = {
    body: Joi.object({
        coursename: Joi.string()
            .required()
    })
};

router.post('', auth, validate(courseValidation, {}, {}), async (req, res) => {
    let request = req.body;
    let course = await Course.findOne({ coursename: request.coursename });
    if (!course) {
        var newCourse = new Course({
            coursename: request.coursename,
            createdat: Date.now(),
            createdby: req.sessionUser.username
        });
        newCourse.save().then(_ => {
            res.status(200).json({
                status: 200,
                message: "Course created successfully."
            });
        }).catch(err => {
            console.log(err);
            res.status(400).json({
                status: 400,
                message: "Error creating course."
            });
        });
    } else {
        res.status(409).json({
            status: 409,
            message: "The course already exists."
        });
    }
});

router.put('/:id', auth, validate(courseValidation, {}, {}), async (req, res) => {
    let id = req.params.id;
    let request = req.body;
    var course = await Course.findById(id).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error finding course."
        });
    });
    if (!course) res.status(404).json({
        status: 404,
        message: "Course not found"
    });
    else {
        await Course.findByIdAndUpdate(id, {
            coursename: request.coursename,
            updatedat: Date.now(),
            updatedby: req.sessionUser.username
        }).then(_ => {
            res.status(200).json({
                status: 200,
                message: "Course updated successfully."
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                message: "Error updating course details."
            });
        });
    }
});

router.get('', auth, async (req, res) => {
    var courses = await Course.find({ active: true }).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error fetching list of courses."
        });
    });
    res.status(200).json({
        status: 200,
        message: "Success",
        data: courses
    });
});

router.get('/:id', auth, async (req, res) => {
    let id = req.params.id;
    var course = await Course.findById(id).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error finding course."
        });
    });
    if (!course) res.status(404).json({
        status: 404,
        message: "Course not found"
    });
    else res.status(200).json({
        status: 200,
        message: "Course found",
        data: course
    });
});

/// Here we are doing only a soft delete on the course collection.
router.delete('/:id', auth, async (req, res) => {
    let id = req.params.id;
    await Course.findByIdAndUpdate(id, {
        active: false,
        updatedat: Date.now(),
        updatedby: req.sessionUser.username
    }).then(_ => {
        res.status(200).json({
            status: 200,
            message: "Deleted course successfully."
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error deleting course."
        });
    });
});

module.exports = router;