const artistsRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

const setRequestBody = (req, res, next) => {
    req.name = req.body.artist.name;
    req.dateOfBirth = req.body.artist.dateOfBirth;
    req.biography = req.body.artist.biography;
    req.isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed;
    next();
}

/*This param router checks if the ID provided in the request is valid and attaches it to req.artist*/
artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get(`SELECT * FROM Artist WHERE id = $id`, 
            {
                $id: artistId
            },
            (err, row) => {
                if (err) {
                    next(err);
                } else if (row) {
                    req.artist = row;
                    next();
                } else {
                    res.status(404).send();
                }
            })
})


/*This get router selects all currently employed artists from the database*/
artistsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`, (error, artists) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({artists: artists});
        }
    });
})

/*This get router returns the artist row based on the provided id in the request*/
artistsRouter.get('/:artistId', (req, res, next) =>{
    res.status(200).json({artist: req.artist});
})



/*This post router creates a new artist to the database and returns it in the response body*/
artistsRouter.post('/', setRequestBody, (req, res, next) => {
    if (req.name && req.dateOfBirth && req.biography) {
        req.isCurrentlyEmployed = req.isCurrentlyEmployed === 0 ? 0 : 1;
        db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
                VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`,
                {
                    $name: req.name,
                    $dateOfBirth: req.dateOfBirth,
                    $biography: req.biography,
                    $isCurrentlyEmployed: req.isCurrentlyEmployed
                },
                function (err) {
                    if(err) {
                        next(err);
                    } else {
                        db.get(`SELECT * FROM Artist WHERE id = $lastID`,
                                {
                                    $lastID: this.lastID
                                }, 
                                (err, row) => {
                                    if (err) {
                                        next(err);
                                    } else {
                                        res.status(201).json({artist: row});
                                    }
                                });
                    }
                });
    } else {
       return res.sendStatus(400);
    }
})


artistsRouter.put('/:artistId', setRequestBody, (req, res, next) => {
    const artistId= req.params.artistId;
    if(req.name && req.dateOfBirth && req.biography && req.isCurrentlyEmployed) {
        db.run(`UPDATE Artist
        SET name = $name, date_of_birth = $dob, biography = $bio, is_currently_employed = $employed
        WHERE id = $id`,
        {
            $id: artistId,
            $name: req.name,
            $dob: req.dateOfBirth,
            $bio: req.biography,
            $employed: req.isCurrentlyEmployed
        }, 
        (err) => {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Artist WHERE id = $id`,
                                {
                                    $id: artistId
                                }, 
                                (err, row) => {
                                    if (err) {
                                        next(err);
                                    } else {
                                        res.status(200).json({artist: row});
                                    }
                                });
            }
        })
    } else {
        res.sendStatus(400);
    }
})

/*This delete router will set the employment status to 0 for the selected employee and return the employee data */
artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run(`UPDATE Artist
            SET is_currently_employed = 0
            WHERE id = ${req.params.artistId}`, 
            (err) => {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, 
                                (err, row) => {
                                    if (err) {
                                        next(err);
                                    } else {
                                        res.status(200).json({artist: row});
                                    }
                                });
                }
            })
})
module.exports = artistsRouter;