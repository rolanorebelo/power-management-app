var http = require('http');
var bodyParser = require('body-parser');
var express = require("express"); 
var app = express();
var fs = require('fs');
app.use('/',express.static('public'));

app.set('view engine', 'ejs');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/powerDB";//U named ur db Pdb then why ddnt u change t to   no... pdB is the collection.. powerdB is the db


var myWriteStream = fs.createWriteStream('./output')
//make way for some custom css, js and images
app.use('/css', express.static(__dirname + '/power/public/css'));
app.use('/js', express.static(__dirname + '/power/public/js'));
app.use('/html', express.static(__dirname + '/power/public/html'));

app.use('/users', require('./routes/users'));

app.use(express.urlencoded({ extended: false }));
  
// parse application/json
app.use(bodyParser.json())
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

app.get('/contact.html', function(req, res)
{
    res.render('./public/html/contact.html');
})

app.get('/home', function(req, res) //Use it to get data for ur frontend.... ur frontend isnot posting any data...until now...later if u introduce post 
//u have to write sepeart okok gt it cntinue
{
    var data = {power: 20};
    res.render('home', {rol: data });
})

// app.get('/home', function(req, res)
// {
//     MongoClient.connect(url, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("powerdB");
//         var pw = dbo.pdB.find({}).sort({_id:-1}).limit(1);
//         res.render('home', {data: pw });
//       });
// })

app.post('/home',function(req,res) {
    console.log(req.body);

var houseId=req.body.hId;     	
var current=req.body.current;
    var voltage=req.body.voltage;
    var myjsonobj=req.body;
    var data=JSON.stringify(myjsonobj);
    var power = parseFloat(current)*parseFloat(voltage);
    var pow=power.toString();
console.log(current)
console.log(voltage)
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("powerDB");
    var myobj = { hID:houseId, Current: current,Voltage:voltage, Power:pow};
  dbo.collection("pdb").insertOne(myobj, function(err, res) {
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
    res.send(response)
});

// var server = app.listen(8080, function(){
//     var port = server.address().port;
//     console.log("Server started at http://localhost:%s", port);
// });

//const PORT = process.env.PORT || 8000;

app.listen(8000,'127.0.0.1');