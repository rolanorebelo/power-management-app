const express = require('express');
const router = express.Router();

//Login Page
router.get('/login', (req, res) => res.render('login'));

//Register page
router.get('/signup', (req, res) => res.render('signup'));

//Register Handle

router.post('/signup', (req, res) =>{
    console.log(req.body);
    res.send("Hello");
})

module.exports = router;