const express = require('express');
const router = express.Router();
var Batch = require('../models/batch.model');
var Course = require('../models/course.model');
var courseCache = require('../cache/course.cache');
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
        starttime: Joi.string()
            .required(),
        endtime: Joi.string()
            .required(),
        seats: Joi.number()
            .required()
    })
};

router.post('', validate(batchValidation, {}, {}), async (req, res) => {
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
            starttime: request.starttime,
            endtime: request.endtime,
            createdat: Date.now(),
            createdby: req.sessionUser.username
        });
        newBatch.save()
            .then(_ => { return res.Success("The batch saved successfully."); })
            .catch(err => {
                console.log(err);
                return res.Exception("Error saving batch data.");
            });
    } else return res.Exists("The batch already exists.");
});

router.put('/:id', validate(batchValidation, {}, {}), async (req, res) => {
    let id = req.params.id;
    let request = req.body;
    var batch = await Batch.findById(id)
        .catch(err => {
            console.log(err);
            return res.Exception("Error finding batch.");
        });
    if (!batch) return res.NotFound("Batch not found");
    else {
        await Batch.findByIdAndUpdate(id, {
            batchname: request.batchname,
            courseid: request.courseid,
            seats: request.seats,
            availableseats: request.seats,
            startdate: request.startdate,
            enddate: request.enddate,
            starttime: request.starttime,
            endtime: request.endtime,
            updatedat: Date.now(),
            updatedby: req.sessionUser.username
        })
            .then(_ => { return res.Success("Batch updated successfully."); })
            .catch(err => {
                console.log(err);
                return res.Exception("Error updating batch details.");
            });
    }
});

router.get('', async (req, res) => {
    var batches = await Batch.find({ active: true })
        .catch(err => {
            console.log(err);
            return res.Exception("Error fetching list of batches");
        });

    var courses = [];
    courses = courseCache.read();
    if (courses.length === 0) {
        courses = await Course.find({ active: true })
            .catch(err => {
                console.log("Error fetching courses for batch data");
                console.log(err);
                return res.Exception("Error fetching list of batches");
            });
        courseCache.save(courses);
    }
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
            starttime: v.starttime,
            endtime: v.endtime,
            seats: v.seats,
            availableseats: v.availableseats,
            createdby: v.createdby,
            createdat: v.createdat,
            updatedat: v.updatedat,
            updatedby: v.updatedby
        });
    });
    return res.Success("Success", response);
});

router.get('/:id', async (req, res) => {
    let id = req.params.id;
    var batch = await Batch.findById(id)
        .catch(err => {
            console.log(err);
            return res.Exception("Error finding batch.");
        });
    if (!batch) return res.NotFound("Batch not found.");
    else {
        var course = courseCache.findById(batch.courseid);
        if (!course) {
            Course.findById(batch.courseid)
                .catch(err => {
                    console.log(err);
                    return res.Exception("Error finding course for batch details.");
                });
        }
        var response = {
            id: batch._id,
            batchname: batch.batchname,
            courseid: batch.courseid,
            course: course.coursename,
            startdate: batch.startdate,
            enddate: batch.enddate,
            starttime: batch.starttime,
            endtime: batch.endtime,
            seats: batch.seats,
            availableseats: batch.availableseats,
            createdby: batch.createdby,
            createdat: batch.createdat,
            updatedat: batch.updatedat,
            updatedby: batch.updatedby
        };
        return res.Success("Course found", response);
    }
});

/// Here we are doing only a soft delete on the batch collection.
router.delete('/:id', async (req, res) => {
    let id = req.params.id;
    await Batch.findByIdAndUpdate(id, {
        active: false,
        updatedat: Date.now(),
        updatedby: req.sessionUser.username
    })
        .then(_ => { return res.Success("Deleted batch successfully."); })
        .catch(err => {
            console.log(err);
            return res.Exception("Error deleting batch");
        });
});

module.exports = router;