const chalk = require('chalk');
const mongoose = require('mongoose');
//connectDB
const connect = async (username, password, dbname) => {
	await mongoose.connect(
		`mongodb+srv://dthadmin:hiephihi123@cluster0.owazy.mongodb.net/Twitter?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		},
		() => console.log(chalk.blueBright('connect successfully'))
	);
};

module.exports = connect;
