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

//request handler to authenticate user
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

//request handler for sign in
app.post('/signin', function(req, res){
	User.findOne({
		email: req.body.email, password: req.body.password, function(err, user){
			if(err){
				res.json({
					type: false,
					data: "Error occured " + err
				})
			} else {
				if(user){
					res.json({
						type: false,
						data: "User already exists!"
					});
				} else {
					var userModel = new User();
					userModel.email = req.body.email;
					userModel.password = req.body.email
					userModel.save(function(err, user){
						user.token = jwt.sign(user, process.env.JWT_SECRET);
						user.save(function(err, user1){
							res.json({
								type: true,
								data: user1,
								token: user1.token
							});
						});
					});
				}
			}
		}
	});
});
//checks if page has auhtorization
app.get('/me', ensureAuthorized, function(req, res){
	User.findOne({token: req.token}, function(err, user){
		if(err){
			res.json({
				type: false,
				data: "Error occured" + err
			});
		} else {
			res.json({
				type: true,
				data: user
			});
		}
	});
});

//Catch and display errors
process.on("uncaughtException", function(err){
	console.log(err);
});

//start server
app.listen(port, function(){
	console.log("Express server listentin on port" + port);
});

//checks for headers authorization and sets token if it exists
function ensureAthorized (req, res, next){
	var bearerToken;
	var bearerHeader = req.headers["authorization"];
	if (typeof bearerHeader !== 'undefined'){
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];
		req.token = bearerToken;
		next(); 
	} else {
		res.send(403);
	}
}