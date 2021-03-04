package com.example.prototype_mobile.model.chat

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.google.gson.Gson
import io.socket.emitter.Emitter


class ChatRepository() {
    var socket: io.socket.client.Socket
    val myUsername = LoginRepository.getInstance()!!.user!!.username
    val token = LoginRepository.getInstance()!!.user!!.token
    val gson: Gson = Gson()

    private val _messageReceived = MutableLiveData<Message>()
    val messageReceived: LiveData<Message> = _messageReceived

    var onUpdateChat = Emitter.Listener {
        val messageReceive: MessageReceive = gson.fromJson(it[0].toString(), MessageReceive ::class.java)
        var messageType = 1;
        if (myUsername == messageReceive.user.username) {
            messageType = 0
        }
            _messageReceived.postValue(Message(messageReceive.user.username, messageReceive.text, messageReceive.timeStamp, messageType))

    }

    init {
        try {
            //This address is the way you can connect to localhost with AVD(Android Virtual Device)
            //mSocket = IO.socket("http://18.217.235.167:3000/")
           mSocket = IO.socket("http://10.0.2.2:3000/")
        } catch (e: Exception) {
            e.printStackTrace()
            Log.d("fail", "Failed to connect")
        }

        //Register all the listener and callbacks here.yoo
        socket.on("message", onUpdateChat) // To update if someone send a message to chatroom
    }


    fun sendMessage(msg:String){
        socket.emit("message", gson.toJson(SendMessage(msg, token, 1)))
    }
    fun onDestroy(token: InitialData){

        //Before disconnecting, send "unsubscribe" event to server so that
        //server can send "userLeftChatRoom" event to other users in chatroom
        val jsonData = gson.toJson(token)
        socket.emit("unsubscribe", jsonData)
        socket.disconnect()

    }

}
