package com.example.prototype_mobile.model.chat


import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ChannelState
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

    private val _notificationReceived = MutableLiveData<Boolean>()
    val notificationReceived = _notificationReceived

    var channelShown = "General"
    var channelMap = mutableMapOf<String, MutableList<Message>>()
    val channelList = mutableListOf<Channel>()
    val channelJoinedSet = mutableSetOf<String>()
    val channelNotJoinedSet = mutableSetOf<String>()

    var onUpdateChat = Emitter.Listener {
        val messageReceive: MessageReceive = gson.fromJson(it[0].toString(), MessageReceive ::class.java)
        var messageType = 1;
        if (myUsername == messageReceive.user.username) {
            messageType = 0
        }
        val message = Message(messageReceive.user.username, messageReceive.text, messageReceive.timeStamp, messageType)
        channelMap[messageReceive.chatId]?.add(message)

        if (messageReceive.chatId == channelShown) {
            _messageReceived.postValue(message)
        } else {
            channelList.firstOrNull { c -> c.chatId == messageReceive.chatId }?.channelState == ChannelState.NOTIFIED
            notificationReceived.postValue(true)
        }
    }

    init {
        socket = SocketOwner.getInstance()!!.socket
        //Register all the listener and callbacks here.yoo
        socket.on("message", onUpdateChat) // To update if someone send a message to chatroom
    }


    fun sendMessage(msg:String){
        socket.emit("message", gson.toJson(SendMessage(msg, token, channelShown)))
    }
    fun onDestroy(token: InitialData){
        val jsonData = gson.toJson(token)
        socket.emit("unsubscribe", jsonData)
        socket.disconnect()

    }

    fun joinChannel(chatId: String){
        socket.emit("joinChatRoom", gson.toJson(JoinChannel(chatId)))
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

    suspend fun getChannels(): Result<Boolean> {
        var result = getChannelsList("/api/chat/joined")
        if (result is Result.Error) {
            return result
        }
        if (result is Result.Success) {
            for (channel in result.data.chats) {
                // Add channel if not there previously
                if (!channelJoinedSet.contains(channel.chatId)) {
                    channelMap.putIfAbsent(channel.chatId, mutableListOf())
                    channelJoinedSet.add(channel.chatId)
                    if(channelNotJoinedSet.contains(channel.chatId)) {
                        channelList.removeIf { c -> c.chatId == channel.chatId}
                    }

                    if (channel.chatId == channelShown) {
                        channelList.add(Channel(channel.chatId, channel.chatName, ChannelState.SHOWN))
                    } else {
                        channelList.add(Channel(channel.chatId, channel.chatName, ChannelState.JOINED))
                    }

                }
            }

            // Remove channel not existing anymore
            val channelToRemove = mutableSetOf<String>()
            for (channel in channelJoinedSet) {
                var isFound = false
                for (channelReceived in result.data.chats) {
                    if (channelReceived.chatId == channel) {
                        isFound = true
                    }
                }
                if (!isFound) {
                    channelToRemove.add(channel)
                }
            }

            for (channel in channelToRemove) {
                channelMap.remove(channel)
                channelJoinedSet.remove(channel)
                channelList.removeIf { c -> c.chatId == channel}
            }
        }

        result = getChannelsList("/api/chat/list")
        if (result is Result.Error) {
            return result
        }
        if (result is Result.Success) {
            for (channel in result.data.chats) {
                // Add channel if not in the list of channel
                if(!channelJoinedSet.contains(channel.chatId) && !channelNotJoinedSet.contains(channel.chatId)) {
                    channelList.add(Channel(channel.chatId, channel.chatName, ChannelState.NOTJOINED))
                    channelNotJoinedSet.add(channel.chatId)
                }
            }

            // Remove channels if needed
            val channelToRemove = mutableSetOf<String>()
            for (channel in channelNotJoinedSet) {
                var isFound = false
                for (channelReceived in result.data.chats) {
                    if (channelReceived.chatId == channel) {
                        isFound = true
                    }
                }
                if (!isFound) {
                    channelToRemove.add(channel)
                }
            }

            for (channel in channelToRemove) {
                channelNotJoinedSet.remove(channel)
                channelList.removeIf { c -> c.chatId == channel}
            }

        }
        channelList.sortBy { c -> c.channelState.ordinal }
        Log.d("Channels received: ", "received")
        return Result.Success(true);
    }

    suspend fun getChannelsList(urlPath: String): Result<ChannelList> {
        val response = HttpRequestDrawGuess.httpRequestGet(urlPath)
        return analysegetChannelsAnswer(response)
    }
    fun analysegetChannelsAnswer(response: Response): Result<ChannelList> {
        val jsonData: String = response.body()!!.string()
        val channelList = gson.fromJson(jsonData, ChannelList::class.java)
        if(response.code() == ResponseCode.OK.code) {
            return Result.Success(channelList)
        } else {
            return Result.Error(response.code())
        }
    }
}

