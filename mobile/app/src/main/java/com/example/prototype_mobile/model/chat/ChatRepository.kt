package com.example.prototype_mobile.model.chat


import android.annotation.SuppressLint
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
import com.example.prototype_mobile.model.game.CanvasRepository
import com.example.prototype_mobile.model.game.GameRepository
import com.example.prototype_mobile.model.mainmenu.LobbyRepository
import com.google.gson.Gson
import io.socket.emitter.Emitter
import okhttp3.Response
import java.util.*
import kotlin.collections.HashMap


class ChatRepository {
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

    var socket: io.socket.client.Socket = SocketOwner.getInstance()!!.socket
    val channelList = mutableListOf<Channel>()
    var channelShown = "General"
    val channelMap = mutableMapOf<String, MutableList<Message>>()

    private val _notificationReceived = MutableLiveData<Boolean>()
    val notificationReceived = _notificationReceived

    private val _messageReceived = MutableLiveData<Message>()
    val messageReceived: LiveData<Message> = _messageReceived

    private val _switchToGeneral = MutableLiveData<Boolean>()
    val switchToGeneral: LiveData<Boolean> = _switchToGeneral

    private val gson: Gson = Gson()
    private val channelJoinedSet = mutableSetOf<String>()
    private val channelNotJoinedSet = mutableSetOf<String>()

    private var onUpdateChat = Emitter.Listener {
        val messageReceive: MessageReceive = gson.fromJson(it[0].toString(), MessageReceive ::class.java)
        var messageType = 1
        if (LoginRepository.getInstance()!!.user!!.username == messageReceive.user.username) {
            messageType = 0
        }
        val message = Message(messageReceive.user.username, messageReceive.text, treatTimestamp(messageReceive.timestamp), messageType, messageReceive.timestamp, messageReceive.user.avatar)
        channelMap[messageReceive.chatId]?.add(message)
        if (messageReceive.chatId == channelShown) {
            _messageReceived.postValue(message)
        } else {
            channelList.firstOrNull { c -> c.chatId == messageReceive.chatId }?.channelState = ChannelState.NOTIFIED
            notificationReceived.postValue(true)
        }
    }

    init {
        //Register all the listener and callbacks here.yoo
        socket.on("message", onUpdateChat) // To update if someone send a message to chatroom
        initialize()
    }

    fun initialize() {
        channelList.clear()
        channelMap.clear()
        channelShown = "General"
        val generalChatMessage: MutableList<Message> = mutableListOf()
        generalChatMessage.add(Message("","", "", 2, 0, 1))
        channelMap.put("General", generalChatMessage)
        channelJoinedSet.add("General")
        channelList.add(Channel("General", "Général", ChannelState.SHOWN))
    }

    fun switchToGeneral() {
        _switchToGeneral.postValue(true)
    }

    fun sendMessage(msg:String){
        socket.emit("message", gson.toJson(SendMessage(msg, LoginRepository.getInstance()!!.user!!.token, channelShown)))
    }

    fun onDestroy(token: InitialData){
        val jsonData = gson.toJson(token)
        socket.emit("unsubscribe", jsonData)
        socket.disconnect()
    }

    fun joinChannel(chatId: String){
        socket.emit("joinChatRoom", gson.toJson(JoinChannel(chatId)))
    }

    fun leaveChannel(chatId: String){
        socket.emit("leaveChatRoom", gson.toJson(JoinChannel(chatId)))
    }

    suspend fun createChannel(channelName: String): Result<String> {
        val mapChannel = HashMap<String, String>()
        mapChannel["chatName"] = channelName
        val response = HttpRequestDrawGuess.httpRequestPost("/api/chat/create", mapChannel, true)
        return analyseCreateChannelAnswer(response)
    }

    private fun analyseCreateChannelAnswer(response: Response): Result<String> {
        return if(response.code() == ResponseCode.OK.code) {
            val jsonData: String = response.body()!!.string()
            val chat = gson.fromJson(jsonData, JoinChannel::class.java)
            Result.Success(chat.chatId)
        } else {
            Result.Error(response.code())
        }
    }

    suspend fun getChannels(isInit: Boolean = false): Result<Boolean> {
        var result = getChannelsList("/api/chat/joined")
        if (result is Result.Error) {
            return result
        }
        if (result is Result.Success) {
            for (channel in result.data.chats) {
                // Add channel if not there previously
                if (!channelJoinedSet.contains(channel.chatId)) {
                    val newMessageList: MutableList<Message> = mutableListOf()
                    if (channel.chatId != LobbyRepository.getInstance()!!.currentListenLobby) {
                        newMessageList.add(Message("", "", "", 3, 0, LoginRepository.getInstance()!!.user!!.avatar))
                    }
                    newMessageList.add(Message("", "", "", 2, 0, LoginRepository.getInstance()!!.user!!.avatar))
                    channelMap.putIfAbsent(channel.chatId, newMessageList)
                    channelJoinedSet.add(channel.chatId)
                    if(channelNotJoinedSet.contains(channel.chatId)) {
                        channelList.removeIf { c -> c.chatId == channel.chatId}
                        channelNotJoinedSet.remove(channel)
                    }
                    if (channel.chatId == channelShown) {
                        channelList.add(Channel(channel.chatId, channel.chatName, ChannelState.SHOWN))
                    } else {
                        channelList.add(Channel(channel.chatId, channel.chatName, ChannelState.JOINED))
                    }
                    if (isInit) {
                        joinChannel(channel.chatId)
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
                if (!isFound && channel != LobbyRepository.getInstance()!!.currentListenLobby) {
                    channelToRemove.add(channel)
                }
            }

            for (channel in channelToRemove) {
                channelMap.remove(channel)
                channelJoinedSet.remove(channel)
                channelNotJoinedSet.remove(channel)
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
                    if(!channel.isGameChat) {
                        channelList.add(
                            Channel(
                                channel.chatId,
                                channel.chatName,
                                ChannelState.NOTJOINED
                            )
                        )
                        channelNotJoinedSet.add(channel.chatId)
                    }
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
        return Result.Success(true)
    }

    private suspend fun getChannelsList(urlPath: String): Result<ChannelList> {
        val response = HttpRequestDrawGuess.httpRequestGet(urlPath, HashMap<String, String>())
        return analyseGetChannelsAnswer(response)
    }

    private fun analyseGetChannelsAnswer(response: Response): Result<ChannelList> {
        val jsonData: String = response.body()!!.string()
        val channelList = gson.fromJson(jsonData, ChannelList::class.java)
        return if(response.code() == ResponseCode.OK.code) {
            Result.Success(channelList)
        } else {
            Result.Error(response.code())
        }
    }

   suspend fun getHistory(): Result<Boolean> {
        // handle login
        val mapHistory = HashMap<String, String>()
        mapHistory["chatId"] = channelShown
        val response = HttpRequestDrawGuess.httpRequestGet("/api/chat/history", mapHistory)
        val result = analyseGetHistoryAnswer(response)
       if (result is Result.Error) {
           return result
       }

        if (result is Result.Success) {
            val historyMessage = mutableListOf<Message>()
            for (message in result.data.chatHistory) {
                val timestamp = treatTimestamp(message.timestamp)
                var messageType = 1
                if (LoginRepository.getInstance()!!.user!!.username == message.username) {
                    messageType = 0
                }
                val username = message.username ?: "Unavailable"
                historyMessage.add(Message(username, message.message, timestamp, messageType, message.timestamp, message.avatar))
            }
            if (channelMap.containsKey(channelShown)) {
                if (channelShown == "General" || channelShown == GameRepository.getInstance()!!.gameId || channelShown == LobbyRepository.getInstance()!!.currentListenLobby) {
                    channelMap[channelShown]!!.removeAt(0)
                } else {
                    channelMap[channelShown]!!.removeAt(1)
                    channelMap[channelShown]!!.removeAt(0)
                }
                val firstMessageTimestamp: Long
                firstMessageTimestamp = if (channelShown == "General" || channelShown == GameRepository.getInstance()!!.gameId || channelShown == LobbyRepository.getInstance()!!.currentListenLobby) {
                    if (channelMap[channelShown]!!.size > 0) channelMap[channelShown]!![0].timestamp else Long.MAX_VALUE
                } else {
                    if (channelMap[channelShown]!!.size > 1) channelMap[channelShown]!![1].timestamp else Long.MAX_VALUE
                }
                for (message in historyMessage.asReversed()) {
                    if (message.timestamp < firstMessageTimestamp) {
                        channelMap[channelShown]!!.asReversed().add(message)
                    }
                }
                if (channelShown != "General" && channelShown != GameRepository.getInstance()!!.gameId && channelShown != LobbyRepository.getInstance()!!.currentListenLobby) {
                    channelMap[channelShown]!!.asReversed().add(Message("", "", "", 3, 0, LoginRepository.getInstance()!!.user!!.avatar))
                }
            }
        }
       return Result.Success(true)
    }

    private fun analyseGetHistoryAnswer(response: Response): Result<ChatHistory> {
        val jsonData: String = response.body()!!.string()
        val chatHistory = gson.fromJson(jsonData, ChatHistory::class.java)
        if(response.code() == ResponseCode.OK.code) {
            return Result.Success(chatHistory)
        } else {
            return Result.Error(response.code())
        }
    }

    private fun treatTimestamp(timestamp: Long): String {
        if (timestamp == 0L) {
            return ""
        }

        val date = Date(timestamp)
        val cal = Calendar.getInstance()
        cal.time = date

        var tmpHour: Int = cal.get(Calendar.HOUR_OF_DAY)
        if (tmpHour < 0) { tmpHour += 24 }
        val hours = if (tmpHour.toString().length == 1) "0" + tmpHour.toString() else tmpHour.toString()
        val minutes = if(cal.get(Calendar.MINUTE).toString().length == 1) "0" + cal.get(Calendar.MINUTE).toString() else cal.get(
            Calendar.MINUTE).toString()
        val seconds = if(cal.get(Calendar.SECOND).toString().length == 1) "0" + cal.get(Calendar.SECOND).toString() else cal.get(
            Calendar.SECOND).toString()
        val day = if(cal.get(Calendar.DAY_OF_MONTH).toString().length == 1) "0" + cal.get(Calendar.DAY_OF_MONTH).toString() else cal.get(
            Calendar.DAY_OF_MONTH).toString()
        val month = if(cal.get(Calendar.MONTH).toString().length == 1) "0" + cal.get(Calendar.MONTH).toString() else cal.get(
            Calendar.MONTH).toString()
        val year = if(cal.get(Calendar.YEAR).toString().length == 1) "0" + cal.get(Calendar.YEAR).toString() else cal.get(
            Calendar.YEAR).toString()
        return day + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds
    }

    suspend fun deleteChannel(): Result<Boolean> {
        val mapChannel = HashMap<String, String>()
        mapChannel["chatId"] = channelShown
        val response = HttpRequestDrawGuess.httpRequestDelete("/api/chat/delete", mapChannel, true)
        return analyseDeleteChannelAnswer(response)
    }

    private fun analyseDeleteChannelAnswer(response: Response): Result<Boolean> {
        return if(response.code() == ResponseCode.OK.code) {
            Result.Success(true)
        } else {
            Result.Error(response.code())
        }
    }

}

