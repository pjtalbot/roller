const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
	const authenticateUser = async (email, password, done) => {
		const queryResult = await getUserByEmail(email);
		const user = queryResult.rows[0];
		console.log(user);

		if (user == null) {
			return done(null, false, { message: 'No user with that email' });
		}

		try {
			console.log(password);
			console.log(user.password);
			if (await bcrypt.compareSync(password, user.password)) {
				return done(null, user);
			} else {
				return done(null, false, { message: 'Password incorrect' });
			}
		} catch (e) {
			return done(e);
		}
	};

	passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
	passport.serializeUser((user, done) => done(null, user.id));
	passport.deserializeUser((id, done) => {
		return done(null, getUserById(id));
	});
}

module.exports = initialize;