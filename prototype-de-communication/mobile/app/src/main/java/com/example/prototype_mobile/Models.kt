package com.example.prototype_mobile

data class Message (val userName : String, val messageContent : String, var viewType : Int)
data class initialData (val userName : String)
data class SendMessage(val userName : String, val messageContent: String)