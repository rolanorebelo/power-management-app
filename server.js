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
var powgen= {};
var powconn = {};
var powerremm = {};
var updated_pow = {};
app.get('/home', function(req, res)
{
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("powerDB");
    //     var pw = {};
    //     dbo.collection("pdB").find({}).sort( { $natural: -1 } ).toArray(function(err, docs) {
    //         console.log(docs[0]);
    //         pw =  (docs[0]);
    //         powgen = docs[0];
        
                
         
        
  
    // dbo.collection("PowerCon").findOne({}, function(err, result) {
    //             if (err) throw err;
    //             var pconold = result.PCon;
    //            res.render('home',{roll : result} );
    //     ress = result;
    //     });
      
    // res.render('home', {rol: powgen, roll: powconn});
    //     });

        dbo.collection("pdB", function(err, collection) {
            collection.find({}).sort( { $natural: -1 } ).toArray(function(err, result) {
              if (err) {
                throw err;
              } else {
                powgen = result[0];
              }
            });
            dbo.collection("PowerCon", function(err, collection) {
                collection.findOne({}, function(err, result) {
                if (err) {
                  throw err;
                } else {
                    var pconold = result.PCon;
                  
             powconn  = result;
                }
              });
            });
            dbo.collection("Wallet").findOne({}, function(err, ress) {
              if (err) throw err;
              var wall = {}
              wall = ress;
            // console.log(powgen.Power);
            // console.log(powconn.PCon);
            var powerrem = powgen.Power - powconn.PCon;
            // if(powerrem<0)
            // powerrem = 0;
            var powerremm = {HouseID: "H1", PowerRemaining : powerrem};
           
                dbo.collection("PowRem").insertOne(powerremm, function(err, res) {
               if (err) throw err;
              console.log("1 value inserted");
              
        });
        dbo.collection("PowRem", function(err, collection) {
          collection.findOne({}, function(err, resi) {
            if (err) {
              throw err;
            } else {
              powerremm = resi;
            }
          });
        });
        dbo.collection("PowRemUp", function(err, collection) {
          collection.find({}).sort( { $natural: -1 } ).toArray(function(err, up_pow) {
            if (err) {
              throw err;
            } else {
              updated_pow = up_pow[0];
            }
          });
        });
        console.log("POWER REMAINING : " + powerremm.PowerRemaining);
            res.render('home', {powergen: powgen, powconn: powconn , powerrem: powerremm, wallet: wall, updated_pow: updated_pow});
          });
          // db.close();
});
    });
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("powerDB");
//     var pw = {};
//     dbo.collection("PowerCon").findOne({}, function(err, result) {
//         if (err) throw err;
//         var pconold = result.PCon;
//        res.render('home',{roll : result} );

// });
  
// });
      });

    //   app.get('/home', function(req, res)
    //   {
    //       MongoClient.connect(url, function(err, db) {
    //           if (err) throw err;
    //           var dbo = db.db("powerDB");
    //             dbo.collection("PowerCon").findOne({}, function(err, result) {
    //     if (err) throw err;
    //     var pconold = result.PCon;
    //    res.render('home',{roll : result} );
    
              
            
    //   });
    //         });
    //     });

  
  
    // console.log(dbo.collection("pdB").findOne({$query: {}, $orderby: {$natural : -1}}));
    // res.render('home', {rol: pw});
    // });



app.post('/home',function(req,res) {
    // console.log(req.body);

var houseId=req.body.hId;     	
var current=req.body.current;
    var voltage=req.body.voltage;
    var myjsonobj=req.body;
    var data=JSON.stringify(myjsonobj);
    var power = parseFloat(current)*parseFloat(voltage);
    var pow = power.toFixed(3);
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
      
  });

for (var i = 0; i < data.length; i++)
    {
          myWriteStream.write(data.charAt(i));

    }

var response="Power = "+pow;
    res.send(response);
  
    //     dbo.collection("pdB", function(err, collection) {
    //         collection.find({}).sort( { $natural: -1 } ).toArray(function(err, result) {
    //           if (err) {
    //             throw err;
    //           } else {
    //             powgen = result[0];
    //           }
    //         });
    //         dbo.collection("PowerCon", function(err, collection) {
    //             collection.findOne({}, function(err, result) {
    //             if (err) {
    //               throw err;
    //             } else {
    //                 var pconold = result.PCon;
                  
    //          powconn  = result;
    //             }
    //           });
    //         });
          
    //       var pow_gen = powgen.Power;
    //       var pow_con = powconn.PCon;
    //       var powrem = pow_gen - pow_con;
    //       console.log("PowRem "+ powrem );
    //       var powremm = { PowerRem : powrem};
    //     dbo.collection("PowRem").insertOne(powremm, function(err, res) {
    //            if (err) throw err;
    //           console.log("1 value inserted");
              
    //     });
       
    // });
    db.close();
});

});



const PORT = process.env.PORT || 5000;

app.set('port', process.env.PORT || 5000);

// var server = app.listen(app.get('port'), function() {
//   debug('Express server listening on port ' + server.address().port);
// });


var server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
// Check which appliances are on





var io = require("socket.io").listen(server);



// io.on("connection", function(socket){
// console.log("Client Connected");

//   socket.on("stateChanged", function(state){
//     console.log("State Changed: " + state);
//   });
// });
var pco =0;
var pow = { PCon : 0};
MongoClient.connect(url, function(err, db) {
    var dbo = db.db("powerDB");

  dbo.collection("PowerCon").insertOne(pow, function(err, res) {
         if (err) throw err;
        console.log("1 value inserted");
       
  });		
  var  power_avl = { PowerAvl : 0 };
  dbo.collection("PowAvl").insertOne(pow, function(err, res) {
    if (err) throw err;
   console.log("Default Pow Avl inserted");
  
});		
     
//   dbo.collection("PowRem", function(err, collection) {
//     collection.find({}).sort( { $natural: -1 } ).toArray(function(err, result) {
//       if (err) {
//         throw err;
//       } else {
//         power_rem = result[0];
//         var  pr = power_rem.PowerRemaining;
//       }
// //Insert into updated power remaining
var update_pow = {};

// update_pow = result[0];
dbo.collection("PowRemUp").insertOne(update_pow, function(err, resultt) {
if (err) throw err;
console.log("Updated power inserted");

});
//     });
//   });

         // Insert into wallet collection
         var wallet = {houseID: "H1", earned: 0 , owes: 0};
         dbo.collection("Wallet").insertOne(wallet, function(err, res) {
          if (err) throw err;
         console.log("1 value wallet inserted");
    
    
    });	


io.sockets.on('connection', function (socket) {// WebSocket Connection
    var dbo = db.db("powerDB");
    var lightvalue = 0; //static variable for current status
    console.log("Client connected");
    socket.on("AC", function(state){
             console.log("AC: " + state);
             io.emit("updateState1", state);
             if(state)
             {

                dbo.collection("PowerCon").findOne({}, function(err, result) {
                    if (err) throw err;
                    var pconold = result.PCon;
                    // console.log("Pcon " + result.PCon );
                    var pconoldd = 0;
                   
 

     pconoldd = pconold + 1000;


 var myquery = { PCon: pconold };
 var newvalues = { $set: {PCon: pconoldd } };
 dbo.collection("PowerCon").updateOne(myquery, newvalues, function(err, res) {
     if (err) throw err;
     console.log("1 document updated");
  
   });
   
});
             }
             else
             {
                dbo.collection("PowerCon").findOne({}, function(err, result) {
                    if (err) throw err;
                    var pconold = result.PCon;
                    // console.log("PCon 0" + result.PCon );
                    var pconoldd = 0;
                   
 
if(pconold>0)
     pconoldd = pconold  - 1000;
    else
    pconoldd = 0;
 


 var myquery = { PCon: pconold };
 var newvalues = { $set: {PCon: pconoldd } };
 dbo.collection("PowerCon").updateOne(myquery, newvalues, function(err, res) {
     if (err) throw err;
     console.log("1 document updated");
  
   });
  
});
             }

          });

    socket.on("Electric Vehicle", function(state){
            console.log("Electric Vehicle: " + state);
            io.emit("updateState2", state);

            if(state)
            {

               dbo.collection("PowerCon").findOne({}, function(err, result) {
                   if (err) throw err;
                   var pconold = result.PCon;
                  //  console.log("Pcon 1 " + result.PCon );
                   var pconoldd = 0;
                  


    pconoldd = pconold + 2000;



var myquery = { PCon: pconold };
var newvalues = { $set: {PCon: pconoldd } };
dbo.collection("PowerCon").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    
 
  });
  
});
            }
            else
            {
               dbo.collection("PowerCon").findOne({}, function(err, result) {
                   if (err) throw err;
                   var pconold = result.PCon;
                  //  console.log("Pcon " + result.PCon );
                   var pconoldd = 0;
                  

if(pconoldd>0)
    pconoldd = pconold  - 2000;
   else
   pconoldd = 0;



var myquery = { PCon: pconold };
var newvalues = { $set: {PCon: pconoldd } };
dbo.collection("PowerCon").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
 
  });
});
            }
         });   
    socket.on("Washing Machine", function(state){
            console.log("Washing Machine: " + state);
            io.emit("updateState3", state);
            if(state)
            {

               dbo.collection("PowerCon").findOne({}, function(err, result) {
                   if (err) throw err;
                   var pconold = result.PCon;
                  //  console.log("Pcon 1 " + result.PCon );
                   var pconoldd = 0;
                  


    pconoldd = pconold + 300;



var myquery = { PCon: pconold };
var newvalues = { $set: {PCon: pconoldd } };
dbo.collection("PowerCon").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
 
  });
});
            }
            else
            {
               dbo.collection("PowerCon").findOne({}, function(err, result) {
                   if (err) throw err;
                   var pconold = result.PCon;
                  //  console.log("Pcon " + result.PCon );
                   var pconoldd = 0;
                  

if(pconoldd>0)
    pconoldd = pconold  - 300;
   else
   pconoldd = 0;



var myquery = { PCon: pconold };
var newvalues = { $set: {PCon: pconoldd } };
dbo.collection("PowerCon").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
 
  });
});
            }
         });
    socket.on("Pump", function(state){
            console.log("Pump: " + state);
            io.emit("updateState4", state);
            if(state)
            {
   
               dbo.collection("PowerCon").findOne({}, function(err, result) {
                   if (err) throw err;
                   var pconold = result.PCon;
                  //  console.log("Pcon 1 " + result.PCon );
                   var pconoldd = 0;
                  
   
   
    pconoldd = pconold + 1000;
   
   
   
   var myquery = { PCon: pconold };
   var newvalues = { $set: {PCon: pconoldd } };
   dbo.collection("PowerCon").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
   
   });
   });
            }
            else
            {
               dbo.collection("PowerCon").findOne({}, function(err, result) {
                   if (err) throw err;
                   var pconold = result.PCon;
                  //  console.log("Pcon " + result.PCon );
                   var pconoldd = 0;
                  
   
   if(pconoldd>0)
    pconoldd = pconold  - 1000;
   else
   pconoldd = 0;
   
   
   
   var myquery = { PCon: pconold };
   var newvalues = { $set: {PCon: pconoldd } };
   dbo.collection("PowerCon").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
   
   });
   });
            }
         });      
		
       socket.on("insert", function(data){
    
         var power_rem = {};
    
         if(data.status){
           
          dbo.collection("PowRem", function(err, collection) {
            collection.find({}).sort( { $natural: -1 } ).toArray(function(err, result) {
              if (err) {
                throw err;
              } else {
                power_rem = result[0];
                var  pr = power_rem.PowerRemaining;
              }
    var myquery = power_rem;
    var newvalues = {$set : {HouseID: "H1", PowerRemaining: 0}};
// dbo.collection("PowRemUp").updateOne(myquery, newvalues, function(err, res) {
//   if (err) throw err;
//  console.log("Update Power updated");


// });	
var updated_pow = {HouseID: "H1", PowerRemaining: 0};
dbo.collection("PowRemUp").insertOne(updated_pow, function(err, res) {
  if (err) throw err;
 console.log("1 updated power inserted");


});	

//   });
// });





           pr = Number(pr).toFixed(4);
          power_avl = { PowerAvl : power_rem.PowerRemaining };
console.log("POWER REMAINING 1:" + pr)
          if(pr>0){
            io.emit("insert", {status: 1, alert: 1});
          dbo.collection("PowAvl").insertOne(power_avl, function(err, resultt) {
            if (err) throw err;
           console.log("1 value res inserted");
        
     });
    }
    else{
      io.emit("insert", {status: 1, alert: 0});
    }
    
     var rate = 0.001;
     var end = pr*rate;
     console.log("EARNING " + end);
    //  console.log("PR " + pr);
     dbo.collection("Wallet").findOne({}, function(err, ress) {
      if (err) throw err;
      var myquery = ress;
    var owesss = ress.owes;
     var newvalues = { $set: {houseID: "H1", earned: end, owes: owesss}};
     dbo.collection("Wallet").updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
     console.log("wallet updated");

});			






     });
         });
        
        });
      }
  });
const pr = 0;
  socket.on("buy", function(data){
    if(data.status){
     
      dbo.collection("PowRem", function(err, collection) {
        collection.find({}).sort( { $natural: -1 } ).toArray(function(err, result) {
          if (err) {
            throw err;
          } else {
            var power_rem = {};
            power_rem =  result[0];
            var pr = power_rem.PowerRemaining;
          }
       pr = Number(pr).toFixed(4);
      
    
       dbo.collection("PowAvl").find({}).sort( { $natural: -1 } ).toArray(function(err, result) {
        if (err) throw err;
       console.log("Available Power Found");

       var avl = {} ;
       avl = result[0];
       var avl_pow = avl.PowerAvl;
       if(avl_pow> Math.abs(pr)){
        io.emit("buy", {status: 1, alert: 1});
         var new_avl = avl_pow - Math.abs(pr);
         var myquery = {PowerAvl : avl_pow};
         var newvalues = {$set: {PowerAvl : new_avl}};
       dbo.collection("PowAvl").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
       console.log("Power Available updated");

  });	

dbo.collection("Wallet").findOne({}, function(err, ress) {
  if (err) throw err;
  var wall = {}
  wall = ress;
var rate_buy = 0.001;
  var owess = Math.abs(pr)*rate_buy;
  var earnedd = wall.earned;
  var owes1 = wall.owes;
  // console.log("Earned : "+owess);
  // console.log("PR buy "+pr);
  var myquery = {earned: earnedd , owes: owes1};
         var newvalues = {$set : {earned: wall.earned, owes: owess }};
       dbo.collection("Wallet").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
       console.log("wallet updated");

  });	
});		
}		
else{
  io.emit("buy", {status: 1, alert: 0});
  var updated_pow = {HouseID: "H1", PowerRemaining: 0};
  dbo.collection("PowRemUp").insertOne(updated_pow, function(err, res) {
    if (err) throw err;
   console.log("1 updated power inserted");
});

dbo.collection("Wallet").findOne({}, function(err, ress) {
  if (err) throw err;
  var wall = {}
  wall = ress;
var rate_buy = 0.005;
  var owess = Math.abs(pr)*rate_buy;
  var earnedd = wall.earned;
  var owes1 = wall.owes;
  console.log("Earned : "+owess);
  console.log("PR buy "+pr);
  var myquery = {earned: earnedd , owes: owes1};
         var newvalues = {$set : {earned: wall.earned, owes: owess }};
       dbo.collection("Wallet").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
       console.log("wallet updated");

  });	
});	
}
  });	
		


});	
    });
  }
  else
  {
    io.emit("buy", {status: 0, alert: 0});
    
  }

  });
 

});

});
