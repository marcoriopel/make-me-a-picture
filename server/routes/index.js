var express = require('express');
var router = express.Router();
var databaseService = require('.././services/database.service');
const jwt = require('jsonwebtoken');

/* GET REQUESTS */
router.get('/', () => {
  console.log('whouhou');
});


/* POST REQUESTS */
router.post('/login', (req, res) => {
  databaseService.loginUser(req.body).then((response) => {
    if (response) {
      let payload = { subject: res.insertId }
      let token = jwt.sign(payload, 'secretKey')
      res.status(200).send({ token });
    }
    else {
      res.sendStatus(403);
    }
  });
});

/* PUT REQUESTS */


/* DELETE REQUESTS */


module.exports = router;
