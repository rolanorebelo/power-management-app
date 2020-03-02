var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("powerdB");
      var myobj = { hID: "h1", Current: "25",Voltage:"20" };
    dbo.collection("pdB").insertOne(myobj, function(err, res) {
           if (err) throw err;
          console.log("1 value inserted");
          db.close();
    });
  });