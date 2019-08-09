const issuesRouter = require('express').Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');


const setRequestBody = (req, res, next) => {
    req.name = req.body.issue.name;
    req.issueNumber = req.body.issue.issueNumber;
    req.publicationDate = req.body.issue.publicationDate;
    req.artistId = req.body.issue.artistId;
    next();
}


issuesRouter.get('/', (req, res, next) =>{
    const seriesId = req.params.seriesId;
    db.all(`SELECT * FROM Issue WHERE series_id = $seriesId`,
            {
                $seriesId: seriesId
            },
            (err, rows) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({issues: rows});
                }
            });
})

issuesRouter.post('/', setRequestBody, (req, res, next) => {
        if(req.name && req.issueNumber && req.publicationDate && req.artistId) {
            db.get(`SELECT * FROM Artist WHERE id = $artistId`,
                    {
                        $artistId: req.artistId
                    },
                    (err, row) => {
                        if (err) {
                            next(err);
                        } else if (row) {
                            db.run(`INSERT INTO Issue(name, issue_number, publication_date, artist_id, series_id)
                                    VALUES(${req.name}, ${req.issueNumber}, ${req.publicationDate}, ${req.artistId}, ${req.params.seriesId}`,
                                    function(err) {
                                        if (err) {
                                            next(err);
                                        } else {
                                            db.get(`SELECT * FROM Issue WHERE id = $id`,
                                            {
                                                $id: this.lastID
                                            }, (err, row) => {
                                                if (err) {
                                                    next(err);
                                                } else {
                                                    res.status(201).json({issue: row})
                                                }
                                            })
                                        }
                                    })
                        } else {
                            res.sendStatus(400);
                        }
                    })
        } else {
            res.sendStatus(400);
        }
})


module.exports = issuesRouter;