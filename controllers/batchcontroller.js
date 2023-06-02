const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
var Batch = require('../models/batch.model');
var Course = require('../models/course.model');
const { validate, Joi } = require('express-validation');

const batchValidation = {
    body: Joi.object({
        batchname: Joi.string()
            .required(),
        courseid: Joi.string()
            .required(),
        startdate: Joi.date()
            .required(),
        enddate: Joi.date()
            .required(),
        seats: Joi.number()
            .required()
    })
};

router.post('', auth, validate(batchValidation, {}, {}), async (req, res) => {
    let request = req.body;
    let batch = await Batch.findOne({ batchname: request.batchname });
    if (!batch) {
        var newBatch = new Batch({
            batchname: request.batchname,
            courseid: request.courseid,
            seats: request.seats,
            availableseats: request.seats,
            startdate: request.startdate,
            enddate: request.enddate,
            createdat: Date.now(),
            createdby: req.sessionUser.username
        });
        newBatch.save().then(_ => {
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
    } else {
        res.status(409).json({
            status: 409,
            message: "The batch already exists."
        })
    }
});

router.put('/:id', auth, validate(batchValidation, {}, {}), async (req, res) => {
    let id = req.params.id;
    let request = req.body;
    var course = await Batch.findById(id).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error finding batch."
        });
    });
    if (!course) res.status(404).json({
        status: 404,
        message: "Batch not found"
    });
    else {
        await Batch.findByIdAndUpdate(id, {
            batchname: request.batchname,
            courseid: request.courseid,
            seats: request.seats,
            availableseats: request.seats,
            startdate: request.startdate,
            enddate: request.enddate,
            updatedat: Date.now(),
            updatedby: req.sessionUser.username
        }).then(_ => {
            res.status(200).json({
                status: 200,
                message: "Batch updated successfully."
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                message: "Error updating batch details."
            });
        });
    }
});

router.get('', auth, async (req, res) => {
    var batches = await Batch.find({ active: true }).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error fetching list of batches"
        });
    });

    var courses = await Course.find({ active: true }).catch(err => {
        console.log("Error fetching courses for batch data");
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error fetching list of batches"
        });
    })
    var response = [];
    batches.map((v, _) => {
        var course = courses.find(x => x.id === v.courseid);
        response.push({
            id: v._id,
            batchname: v.batchname,
            courseid: v.courseid,
            course: course.coursename,
            startdate: v.startdate,
            enddate: v.enddate,
            seats: v.seats,
            availableseats: v.availableseats,
            createdby: v.createdby,
            createdat: v.createdat,
            updatedat: v.updatedat,
            updatedby: v.updatedby
        });
    });
    res.status(200).json({
        status: 200,
        message: "Success",
        data: response
    });
});

router.get('/:id', auth, async (req, res) => {
    let id = req.params.id;
    var batch = await Batch.findById(id).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error finding batch."
        });
    });
    if (!batch) res.status(404).json({
        status: 404,
        message: "Batch not found"
    });
    else {
        var course = Course.findById(batch.courseid).catch(err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                message: "Error finding course for batch details."
            });
        });
        console.log(course);
        var response = {
            id: batch._id,
            batchname: batch.batchname,
            courseid: batch.courseid,
            course: course.coursename,
            startdate: batch.startdate,
            enddate: batch.enddate,
            seats: batch.seats,
            availableseats: batch.availableseats,
            createdby: batch.createdby,
            createdat: batch.createdat,
            updatedat: batch.updatedat,
            updatedby: batch.updatedby
        };
        res.status(200).json({
            status: 200,
            message: "Course found",
            data: response
        });
    }
});

/// Here we are doing only a soft delete on the batch collection.
router.delete('/:id', auth, async (req, res)=> {
    let id = req.params.id;
    await Batch.findByIdAndUpdate(id, {
        active: false,
        updatedat: Date.now(),
        updatedby: req.sessionUser.username
    }).then(_ => {
        res.status(200).json({
            status: 200,
            message: "Deleted batch successfully."
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error deleting batch."
        });
    });
});

// TODO DELETE/:id

module.exports = router;