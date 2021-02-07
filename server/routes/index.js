var express = require('express');
var router = express.Router();
var databaseService = require('.././services/database.service');

/* GET REQUESTS */
router.get('/', () => {
  console.log('whouhou');
});


/* POST REQUESTS */
router.post('/login', (req, res) => {
  databaseService.loginUser(req.body);
});

/* PUT REQUESTS */


/* DELETE REQUESTS */


module.exports = router;
