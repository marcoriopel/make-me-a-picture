package com.example.prototype_mobile

import com.example.prototype_mobile.model.connection.sign_up.model.GameDifficulty
import com.example.prototype_mobile.model.connection.sign_up.model.GameType

// Data class for the chat
data class Message (val username : String, val text : String, val timeStamp : String, val messageType: Int)
data class MessageReceive (val id : String, val user : User, val text : String, val timeStamp : String, val textColor : String)
data class User (val username: String, val Avatar: Int);
data class InitialData (val token : String)
data class SendMessage(val text: String, val token: String, val avatar: Int)

// Data class for the sign up
data class SignUpInfo(val firstName: String, val lastName: String, val username: String, val password: String, val avatar: Int)

// Data class for the login
data class LoggedInUser(val token: String, val username: String)
data class LoginResult(val success: String? = null, val error: Int? = null)

//Data class for the games
data class Game(val gameID: String, val gameName: String, val difficulty: GameDifficulty, val gameType: GameType)
data class GameListResult(val success: MutableList<Game>? = null, val error: Int? = null)