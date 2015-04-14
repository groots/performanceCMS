var express = require("express");
var morgain = rquire ("morgan");
var bodyParser = rquire("body-parser");
var jwt = rquire("jsonwebtoken");
var mongoose = require("mongoose");
var app = express();

var port = process.env.PORT || 3001;
var User = require("./models/User");

mongoose.connection(process.env.MONGO_URL);

app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
	next();
});

app.post('/authenticate', function(req, res){
	User.findOne({email: req.body.email, password: req.body.password, function(err, user)})
	if(err){
		res.json({
			type: false,
			data: "Error occured: " + err;
		} else {
			if (user){
				res.json({
					type: true, 
					data: user,
					token: user.token
				});
			} else {
				res.json({
					type: false,
					data: "Incorrect email/password"
				});
			}
		}

	});
});