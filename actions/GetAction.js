var async = require('async');

var IAction = require("./interfaces/IAction");

class GetAction extends IAction {
  constructor(repository, dTOMapper) {
    super();

    this.repository = repository;
    this.dTOMapper = dTOMapper;
  }

  use(req, res, next) {
    async.waterfall([
      (cb) => {
        this.repository.find()
          .then((entities) => {
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
