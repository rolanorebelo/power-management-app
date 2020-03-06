var http = require('http');
var bodyParser = require('body-parser');
var express = require("express"); 
var app = express();
const flash = require('connect-flash');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const bcrypt = require('bcryptjs')
var fs = require('fs');
const passport = require('passport');
var debug = require('debug')('server');

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = require("jquery")(window);
//Passport config
require('./config/passport')(passport);

app.use('/',express.static('public'));

// Mongoose for Login

var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://localhost:27017/userData';
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// User model

const User = require('./models/User');
// EJS
// app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express Session

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash

app.use(flash()); 

// Global Vars
app.use((req, res, next) =>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/powerDB";//U named ur db Pdb then why ddnt u change t to   no... pdB is the collection.. powerdB is the db


var myWriteStream = fs.createWriteStream('./output')
//make way for some custom css, js and images
app.use('/css', express.static(__dirname + '/power/public/css'));
app.use('/js', express.static(__dirname + '/power/public/js'));
app.use('/html', express.static(__dirname + '/power/public/html'));

app.use('/users', require('./routes/users'));

// parse application/json
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));
  

//app.use(bodyParser.text({type:'text/html'}))
app.get('/', function(req, res)
{
    res.render('index');
})

app.get('/index', function(req, res)
{
    res.render('index');
})
app.get('/login', function(req, res)
{
    res.render('login');
})

app.get('/signup', function(req, res)
{
    res.render('signup');
})

app.post('/signup', function(req, res) 
{
    const {name, email, password} = req.body;
    let errors = [];

    //Check required fields
    if(!name || !email || !password){
        errors.push({msg: 'Please fill in all fields'});
    }
    if(password.length<6){
        errors.push({msg: 'Password should be at least 6 characters'});
    }
    if(errors.length>0){
        res.render('signup',{
            errors,
            name, 
            email,
            password
        });
    }
    else{
        User.findOne({email: email})
        .then(user => {
            if(user){
                // User exists
                errors.push({msg:'Email is already registered'});
                res.render('login',{
                    errors,
                    name, 
                    email,
                    password
                });
            } else{
                const newUser = new User({
                    name,
                    email,
                    password
                }) ;

                //Hash Password
                bcrypt.genSalt(10, (err,salt) =>
                bcrypt.hash(newUser.password, salt, (err,hash) =>{
                    if(err) throw err;
                        // Set password to hashed
                        newUser.password = hash;
                        //Save user
                        newUser.save()
                        .then(user =>{
                            req.flash('success_msg', 'You are now registered and can login');
                            res.redirect('/login');
                        })
                        .catch(err=> console.log(err));
                }))
            }
        })
    }
});



app.post('/login', function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash:true
    })(req, res, next);
});

// app.get('/contact.html', function(req, res)
// {
//     res.render('./public/html/contact.html');
// })

// app.get('/home', function(req, res) 
// {
//     var data = {power: 20};
//     res.render('home', {rol: data });
// })

app.get('/home', function(req, res)
{
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("powerDB");
        var pw = {};
        dbo.collection("pdB").find({}).toArray(function(err, docs) {
            // console.log(docs[0]);
            pw =  (docs[0]);
            db.close();
          
        // console.log(pw);
        res.render('home', {rol: docs[0]});});
      });
})

app.post('/home',function(req,res) {
    // console.log(req.body);

var houseId=req.body.hId;     	
var current=req.body.current;
    var voltage=req.body.voltage;
    var myjsonobj=req.body;
    var data=JSON.stringify(myjsonobj);
    var power = parseFloat(current)*parseFloat(voltage);
    var pow=power.toString();
// console.log(current);
// console.log(voltage);
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("powerDB");
    var myobj = { hID:houseId, Current: current,Voltage:voltage, Power:pow};
  dbo.collection("pdB").insertOne(myobj, function(err, res) {
         if (err) throw err;
        console.log("1 value inserted");
        db.close();
  });
});
for (var i = 0; i < data.length; i++)
    {
          myWriteStream.write(data.charAt(i));

    }

var response="Power = "+pow;
    res.send(response);
});

// var server = app.listen(8080, function(){
//     var port = server.address().port;
//     console.log("Server started at http://localhost:%s", port);
// });

const PORT = process.env.PORT || 8000;

app.set('port', process.env.PORT || 8000);

// var server = app.listen(app.get('port'), function() {
//   debug('Express server listening on port ' + server.address().port);
// });

var server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

var io = require("socket.io").listen(server);

// io.on("connection", function(socket){
// console.log("Client Connected");

//   socket.on("stateChanged", function(state){
//     console.log("State Changed: " + state);
//   });
// });
io.sockets.on('connection', function (socket) {// WebSocket Connection
    var lightvalue = 0; //static variable for current status
    socket.on("AC", function(state){
             console.log("AC: " + state);
          });
    socket.on("Electric Vehicle", function(state){
            console.log("Electric Vehicle: " + state);
         });   
    socket.on("Washing Machine", function(state){
            console.log("Washing Machine: " + state);
         });
    socket.on("Pump", function(state){
            console.log("Pump: " + state);
         });       
        
  });