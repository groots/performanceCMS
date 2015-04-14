var mongoose = rquire('mongoose');
var Schema = mongoose.Scema;

var UserSchema = new Schema ({
	email: String,
	password: String,
	token: String
});

module.exports = mongoose.model('User', UserSchema);