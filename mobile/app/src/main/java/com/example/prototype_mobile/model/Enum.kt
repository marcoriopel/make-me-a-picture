package com.example.prototype_mobile.model.connection.sign_up.model

enum class MessageType(val index : Int){
    CHAT_MINE(0),CHAT_PARTNER(1),USER_JOIN(2),USER_LEAVE(3);
}

enum class ResponseCode(val code: Int){
    OK(200), BAD_REQUEST(400), NOT_FOUND(404), CONFLICT(409)
}