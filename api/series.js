const seriesRouter = require('express').Router();
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || '../database.sqlite');



/*This router is for all seriesId requests. It attaches the row of the that series to the request body*/
seriesRouter.param('seriesId', (req, res, next, id) => {
    db.get(`SELECT * FROM Series WHERE id = $id`,
            {
                $id: id
            },
            (err, row) => {
                if (err){
                    next(err);
                } else if (row) {
                    req.series = row;
                } else {
                    res.sendStatus(404);
                }
            });
})

/*This router gets all rows from the series database*/
seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`, (err, rows)=> {
        if (err) {
            next(err);
        } else {
            res.status(200).json({series: rows})
        }
    });
})


seriesRouter.get('/:seriesId', (req, res, next) =>{
    res.status(200).json({series: req.series})
})








module.exports = seriesRouter;