const express = require('express');
const router = express.Router();
var Review = require('../models/review.model');
var Intern = require('../models/intern.model');
var Tutor = require('../models/tutor.model');
const { validate, Joi } = require('express-validation');

const ReviewValidation = {
    body: Joi.object({
        tutorid: Joi.string()
            .required(),
        year: Joi.number()
            .required(),
        month: Joi.number()
            .required(),
        day: Joi.number()
            .required(),
        comment: Joi.string()
            .required(),
        rating: Joi.number()
            .required(),
    })
};

router.post('', validate(ReviewValidation, {}, {}), async (req, res) => {
    let request = req.body;
    ///
    /// Checking if a review by the user for the day already exists
    //
    var existing = await Review.findOne({
        year: request.year,
        month: request.month,
        day: request.day,
        // tutorid: request.tutorid,
        internid: req.sessionUser.internid
    }).catch(err => {
        console.log(err);
        return res.Exception(`Error fetching review by ${req.sessionUser.internid}`);
    });
    if (existing) return res.Exists("Review exists");
    ///
    /// Saving the review if not exists
    ///
    var newReviewEntry = new Review({
        internid: req.sessionUser.internid,
        tutorid: request.tutorid,
        year: request.year,
        month: request.month,
        day: request.day,
        comment: request.comment,
        rating: request.rating,
        createdat: Date.now(),
        createdby: req.sessionUser.username
    });
    newReviewEntry.save()
        .then(_ => { return res.Success("Review saved successfully.") })
        .catch(err => {
            console.error(err);
            return res.Exception("Error saving review.");
        });
});

router.get('/listall', async (req, res) => {
    var reviews = await Review.find()
        .catch(err => {
            console.log(err);
            return res.Exception("Error fetching reviews");
        });
    var response = [];
    var interns = await Intern.find()//{ batchid: req.sessionUser.batchid }
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching list of interns.");
        });
    var tutors = await Tutor.find()//{ courses: req.sessionUser.courseid }
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching list of tutors.");
        });
    reviews.map((review, _) => {
        var tutor = tutors.find(a => a._id == review.tutorid);
        var intern = interns.find(a => a._id == review.internid);
        response.push({
            intern: intern,
            tutor: tutor,
            year: review.year,
            month: review.month,
            day: review.day,
            comment: review.comment,
            rating: review.rating,
            createdby: review.createdby,
            createdat: review.createdat,
            updatedat: review.updatedat,
            updatedby: review.updatedby
        });
    });

    return res.Success("Success", response);
});

// router.get('/:id', async (req, res) => {
//     let id = req.params.id;
//     var review = await Intern.findById(id)
//         .catch(err => {
//             console.log(err);
//             return res.Exception("Error fetching review details");
//         });
//     if (!review) return res.NotFound("Review not found");
//     else {
//         var intern = await Intern.findById(review.internid)
//             .catch(err => {
//                 console.error(err);
//                 return res.Exception("Error fetching intern details.");
//             });
//         var tutor = await Tutor.findById(review.tutorid)//{ active: true }
//             .catch(err => {
//                 console.error(err);
//                 return res.Exception("Error fetching tutor details.");
//             });
//         var response = {
//             intern: intern,
//             tutor: tutor,
//             year: review.year,
//             month: review.month,
//             day: review.day,
//             comment: review.comment,
//             rating: review.rating,
//             createdby: review.createdby,
//             createdat: review.createdat,
//             updatedat: review.updatedat,
//             updatedby: review.updatedby
//         };
//         return res.Success("Review found", response);
//     }
// });

router.get('/byintern', async (req, res) => {
    var reviews = await Review.find({
        internid: req.sessionUser.internid
    }).catch(err => {
        console.log(err);
        return res.Exception(`Error fetching reviews by ${req.sessionUser.internid}`);
    });
    var response = [];
    var interns = await Intern.find({ batchid: req.sessionUser.batchid })
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching list of interns.");
        });
    var tutors = await Tutor.find({ courses: req.sessionUser.courseid })
        .catch(err => {
            console.error(err);
            return res.Exception("Error fetching list of tutors.");
        });
    reviews.map((review, _) => {
        var tutor = tutors.find(a => a._id == review.tutorid);
        var intern = interns.find(a => a._id == review.internid);
        response.push({
            intern: intern,
            tutor: tutor,
            year: review.year,
            month: review.month,
            day: review.day,
            comment: review.comment,
            rating: review.rating,
            createdby: review.createdby,
            createdat: review.createdat,
            updatedat: review.updatedat,
            updatedby: review.updatedby
        });
    });

    return res.Success("Success", response);
});

router.get('/byinternonday/:year/:month/:day', async (req, res) => {
    let year = req.params.year;
    let month = req.params.month;
    let day = req.params.day;

    var review = await Review.findOne({
        year: year,
        month: month,
        day: day,
        internid: req.sessionUser.internid
    }).catch(err => {
        console.log(err);
        return res.Exception(`Error fetching review by ${req.sessionUser.internid}`);
    });
    if (!review) return res.NotFound(`Review by ${req.sessionUser.internid} not fonund for the day ${year}/${month}/${day}`);
    else {
        var intern = await Intern.findById(review.internid)
            .catch(err => {
                console.error(err);
                return res.Exception(`Error fetching intern details of ${review.interind}.`);
            });
        var tutor = await Tutor.findById(review.tutorid)//{ active: true }
            .catch(err => {
                console.error(err);
                return res.Exception(`Error fetching tutor details of ${review.tutorid}.`);
            });
        var response = {
            intern: intern,
            tutor: tutor,
            year: review.year,
            month: review.month,
            day: review.day,
            comment: review.comment,
            rating: review.rating,
            createdby: review.createdby,
            createdat: review.createdat,
            updatedat: review.updatedat,
            updatedby: review.updatedby
        };
        return res.Success("Review found", response);
    }
});

module.exports = router;