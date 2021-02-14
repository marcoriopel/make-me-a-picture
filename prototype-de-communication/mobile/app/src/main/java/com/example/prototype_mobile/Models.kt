package com.example.prototype_mobile

data class Message (val username : String, val text : String,  val messageType: Int)
data class MessageReceive (val id : String, val username : String, val text : String, val textColor : String)
data class MessageSend (val token : String, val text : String)
data class initialData (val token : String)
data class SendMessage(val text: String, val token: String)