var async = require('async');

var IAction = require("./interfaces/IAction");

class GetAction extends IAction {
  constructor(repository, dTOMapper, uidValidator) {
    super();

    this.repository = repository;
    this.dTOMapper = dTOMapper;
    this.uidValidator = uidValidator;
  }

  use(req, res, next) {
    // try {
    //   var params = this.uidValidator.validate(req.params);
    //   var uid = params.uid;
    // } catch (err) {
    //   return next(err);
    // }

    async.waterfall([
      (cb) => {
        this.repository.find().then((entities) => {
          if (entities === undefined) {
            var err = new Error('Not Found');
            err.status = 404;
            return next(err);
          }

          var dto = null;
          var dtos = [];

          entities.forEach(entity => {
            dto = this.dTOMapper.map(entity);
            dtos.push(dto);
          });

          cb(null, dtos);
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

      res.send({
        data: dto
      });
    });
  }
}

module.exports = GetAction;
