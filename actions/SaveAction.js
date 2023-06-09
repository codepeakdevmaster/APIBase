var async = require('async');

var IAction = require("./interfaces/IAction");

class SaveAction extends IAction {
    constructor(repository, dTOMapper, entityMapper) { //, dTOBodyValidator
        super();

        this.repository = repository;
        this.dTOMapper = dTOMapper;
        this.entityMapper = entityMapper;
        // this.dTOBodyValidator = dTOBodyValidator;
    }

    use(req, res, next) {
        // try {
        //   var dto = this.dTOBodyValidator.validate(req.body);
        // } catch (err) {
        //   return next(err);
        // }

        async.waterfall([
            (cb) => { // Insert blog category
                var entity = this.entityMapper.map(dto);

                entity.save().then(() => {
                    cb();
                }, err => {
                    cb(err);
                });
            },
            (cb) => {
                this.repository.findById(dto.id).then((entity) => {
                    var dto = this.dTOMapper.map(entity);

                    cb(null, dto);
                }, err => {
                    cb(err);
                });
            }
        ], (err, dto) => {
            if (err) {
                var error = new Error(err);
                error.status = 500;
                return next(error);
            }

            res.status(201).send({
                data: dto
            });
        });
    }
}

module.exports = InsertRoute;
