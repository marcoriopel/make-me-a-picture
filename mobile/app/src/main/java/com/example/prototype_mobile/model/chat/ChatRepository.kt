package com.example.prototype_mobile.model.chat


import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.google.gson.Gson
import io.socket.emitter.Emitter
import okhttp3.Response
import org.json.JSONObject


class ChatRepository() {
    var socket: io.socket.client.Socket
    val myUsername = LoginRepository.getInstance()!!.user!!.username
    val token = LoginRepository.getInstance()!!.user!!.token
    val gson: Gson = Gson()

    private val _messageReceived = MutableLiveData<Message>()
    val messageReceived: LiveData<Message> = _messageReceived

    var chatShown = ""
    var 

    var onUpdateChat = Emitter.Listener {
        val messageReceive: MessageReceive = gson.fromJson(it[0].toString(), MessageReceive ::class.java)
        var messageType = 1;
        if (myUsername == messageReceive.user.username) {
            messageType = 0
        }

        if (messageReceive.chatId == chatShown) {
            _messageReceived.postValue(Message(messageReceive.user.username, messageReceive.text, messageReceive.timeStamp, messageType))
        }
    }

    init {
        socket = SocketOwner.getInstance()!!.socket
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

    suspend fun createChannel(channelName: String): Result<Boolean> {
        val mapChannel = HashMap<String, String>()
        mapChannel["chatName"] = channelName
        val response = HttpRequestDrawGuess.httpRequestPost("/api/chat/create", mapChannel, true)

        val result = analyseCreateChannelAnswer(response)

        if (result is Result.Success) {
            Log.d("Channel Created: ", channelName)
        }

        return result;
    }

    fun analyseCreateChannelAnswer(response: Response): Result<Boolean> {
        if(response.code() == ResponseCode.OK.code) {
            return Result.Success(true)
        } else {
            return Result.Error(response.code())
        }
    }

}

