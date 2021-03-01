package com.example.prototype_mobile.model.chat

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter


class ChatRepository() {

    lateinit var mSocket: Socket
    val gson: Gson = Gson()
    val myUsername = LoginRepository.getInstance()!!.user!!.username
    val token = LoginRepository.getInstance()!!.user!!.token

    private val _messageReceived = MutableLiveData<Message>()
    val messageReceived: LiveData<Message> = _messageReceived

    companion object {
        private var instance: ChatRepository? = null
        fun getInstance(): ChatRepository? {
            if (instance == null) {
                synchronized(ChatRepository::class.java) {
                    if (instance == null) {
                        instance = ChatRepository()
                    }
                }
            }
            return instance
        }
    }

    var onConnect = Emitter.Listener {
        //After getting a Socket.EVENT_CONNECT which indicate socket has been connected to server,
        //Send token to advise that we are connected
        Log.d("Socket - ", "Connected")
    }

    var onUpdateChat = Emitter.Listener {
        val messageReceive: MessageReceive = gson.fromJson(it[0].toString(), MessageReceive ::class.java)
        var messageType = 1;
        if (myUsername == messageReceive.username) {
            messageType = 0
        }
            _messageReceived.postValue(Message(messageReceive.username, messageReceive.text, messageReceive.timeStamp, messageType))

    }

    init {
        try {
            //This address is the way you can connect to localhost with AVD(Android Virtual Device)
            mSocket = IO.socket("http://18.217.235.167:3000/")
            //mSocket = IO.socket("http://10.0.2.2:3000/")
        } catch (e: Exception) {
            e.printStackTrace()
            Log.d("fail", "Failed to connect")
        }

        //Register all the listener and callbacks here.yoo
        mSocket.on(Socket.EVENT_CONNECT, onConnect)
        mSocket.on("message", onUpdateChat) // To update if someone send a message to chatroom
        mSocket.connect()
    }


    fun sendMessage(msg:String){
        mSocket.emit("message", gson.toJson(SendMessage(msg, token, 1)))
    }
    fun onDestroy(token: InitialData){

        //Before disconnecting, send "unsubscribe" event to server so that
        //server can send "userLeftChatRoom" event to other users in chatroom
        val jsonData = gson.toJson(token)
        mSocket.emit("unsubscribe", jsonData)
        mSocket.disconnect()

    }

}
