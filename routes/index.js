var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.render('index', { title: 'Express' });
});
router.get('/api/hello', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  res.send({ express: 'Hello From Express' });
});

router.post('/api/world', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});
module.exports = router;
