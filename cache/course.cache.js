const nodeCache = require('node-cache');
const Course = require('../models/course.model');

const courseCache = new nodeCache({ stdTTL: 1000 });

exports.save = (objArray) => {
    console.log("Saving courses to cache");
    courseCache.set("courses", objArray);
    return;
};

exports.read = () => {
    console.log("Reading courses from cache.");
    let cachedData = courseCache.get("courses") ?? [];
    console.log('found %d courses in cache', cachedData.length);
    return cachedData;
};

exports.reset = async () => {
    var courses = await Course.find({ active: true })
        .catch(err => {
            console.log(err);
            return;
        });
    courseCache.set("courses", courses);
    return;
};

exports.findById = (id) => {
    console.log("Reading course from cache.");
    let cachedData = courseCache.get("courses") ?? [];
    if(cachedData.length === 0) return;
    var course = cachedData.find(x=> x.id === id);
    return course;
}