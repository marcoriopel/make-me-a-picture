package com.example.prototype_mobile

// Data class for the chat
data class Message (val username : String, val text : String, val timeStamp : String, val messageType: Int)
data class MessageReceive (val id : String, val username : String, val text : String, val timeStamp : String, val textColor : String)
data class InitialData (val token : String)
data class SendMessage(val text: String, val token: String, val avatar: Int)

// Data class for the sign up
data class SignUpInfo(val firstName: String, val lastName: String, val username: String, val password: String, val avatar: Int)

// Data class for the login
data class LoggedInUser(val token: String, val username: String)
data class LoginResult(val success: String? = null, val error: Int? = null)