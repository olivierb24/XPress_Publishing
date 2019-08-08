const seriesRouter = require('express').Router();
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || '../database.sqlite');



/*This router is for all seriesId requests. It attaches the row of the that series to the request body*/
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE id = $id`,
            {
                $id: seriesId
            },
            (err, row) => {
                if (err){
                    next(err);
                } else if (row) {
                    req.series = row;
                    next();
                } else {
                    res.sendStatus(404);
                }
            });
})


const setRequestBody = (req, res, next) => {
    req.name = req.body.series.name;
    req.description = req.body.series.description;
    next();
}

/*This router gets all rows from the series database*/
seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`, (err, rows)=> {
        if (err) {
            next(err);
        } else {
            res.status(200).json({series: rows});
        }
    });
})


seriesRouter.get('/:seriesId', (req, res, next) =>{
    res.status(200).json({series: req.series});
})


seriesRouter.post('/', setRequestBody, (req, res, next) => {
    if (req.name && req.description) {
        db.run(`INSERT INTO Series (name, description)
                VALUES ($name, $description)`,
                {
                    $name: req.name,
                    $description: req.description
                },
                function(error) {
                    if (error) {
                        next(error);
                    } else {
                        db.get(`SELECT * FROM Artist WHERE id = $lastID`,
                        {
                            $lastID: this.lastID
                        },
                        (error, row) => {
                            if (error) {
                                next(error);
                            } else {
                                res.status(201).json({series: row});
                            }
                        });
                    }
                });
    } else {
       return  res.sendStatus(400);
    }
})


seriesRouter.put('/:seriesId', setRequestBody, (req, res, next) =>{
    const ident = req.params.seriesId;
        if (req.name && req.description) {
            db.run(`UPDATE Series
                    SET name = $name, description = $description
                    WHERE id = $id`,
                    {
                        $name: req.name,
                        $decription: req.description,
                        $id: ident
                    },
                    (err) => {
                        if(err) {
                            next(err);
                        } else {
                            db.get(`SELECT * FROM Artist WHERE id = $id`,
                            {
                                $id: ident
                            }, 
                            (err, row) => {
                                if (err){
                                    next(err);
                                } else {
                                    res.status(200).json({series: row});
                                }
                            });
                        }
                    });
        } else {
            res.sendStatus(400);
        }
})




module.exports = seriesRouter;