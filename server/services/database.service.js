const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PASSWORD + "@cluster0.oia6z.mongodb.net/database?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });

async function startDB() {
    try {
        await client.connect();
    } catch (e) {
        console.error(e);
    }
    console.log("We are on the moon");
}

async function loginUser(userInfo) {
    try {
        await client.db().collection("logged_users").insertOne({ 'username': userInfo.username, "password": userInfo.password });
    } catch (e) {
        console.error(e);
    }
    console.log("We are on the moon");

}

module.exports = { startDB, loginUser };