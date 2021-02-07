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
        const user = await getUserInfo(userInfo.username);
        if (user && user.password == userInfo.password) {
            await client.db().collection("logged_users").insertOne({ 'username': userInfo.username, "password": userInfo.password });
            return true;
        }
    } catch (e) {
        console.error(e);
        return false;
    }
    return false;
}

async function getUserInfo(userID) {
    try {
        const user = client.db().collection("Users").findOne({ 'username': userID });
        return user;
    } catch (e) {
        console.error(e);
    }
}

async function logoutUser(userInfo) {
    try {
        await client.db().collection("logged_users").deleteOne({ 'username': userInfo.username });
    } catch (e) {
        console.error(e);
    }
    console.log("Logout successfull");
}

module.exports = { startDB, loginUser, logoutUser, getUserInfo };