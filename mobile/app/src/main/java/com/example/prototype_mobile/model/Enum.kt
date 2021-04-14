package com.example.prototype_mobile.model.connection.sign_up.model

enum class MessageType(val index : Int){
    CHAT_MINE(0),CHAT_PARTNER(1),USER_JOIN(2),USER_LEAVE(3);
}

enum class ResponseCode(val code: Int){
    OK(200), BAD_REQUEST(400), NOT_AUTHORIZED(401), NOT_FOUND(404), FULL(406), CONFLICT(409)
}

enum class GameDifficulty(val difficulty: Int){
    EASY(0), MEDIUM(1), HARD(2), NONE(-1)
}

enum class GameType(val type: Int){
    CLASSIC(0), SOLO(1), COOP(2)
}

enum class GameFilter(val filter: Int){
    CLASSIC(0), COOP(1), EASY(2), MEDIUM(3), HARD(4)
}

enum class SelectedButton(number: Int){
    CLASSIC(0), SPRINT(1), COOP(2), NONE(3), SEARCH(4)
}

enum class Tool(number: Int){
    PEN(0), ERASER(1)
}

enum class DrawingEventType(type: Int) {
    TOUCHDOWN(0), TOUCHMOVE(1), TOUCHUP(2), UNDO(3), REDO(4), CLEAR(5)
}

enum class ChannelState(state: Int) {
    NOTIFIED(0), SHOWN(1), JOINED(2), NOTJOINED(3),
}

enum class EndGamePageType(type: Int) {
    RESULT(0), VOTE(1), UPLOAD(2)
}