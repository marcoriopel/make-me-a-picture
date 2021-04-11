package com.example.prototype_mobile.viewmodel.connection.chat

import androidx.lifecycle.*
import com.example.prototype_mobile.*
import com.example.prototype_mobile.R
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.chat.ChatRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ChannelState
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.game.GameRepository
import com.example.prototype_mobile.model.mainmenu.LobbyRepository
import com.example.prototype_mobile.view.chat.ChatRoomAdapter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch


class ChatViewModel(val chatRepository: ChatRepository) : ViewModel() {
    private val _messageReceived = MutableLiveData<Message>()
    val messageReceived: LiveData<Message> = _messageReceived

    private val _messageList = MutableLiveData<MutableList<Message>>()
    val messageList: LiveData<MutableList<Message>> = _messageList

    private val _createChannelResult = MutableLiveData<Int>()
    val createChannelResult: LiveData<Int> = _createChannelResult

    private val _getChannelResult = MutableLiveData<Int>()
    val getChannelResult: LiveData<Int> = _getChannelResult
    var channelList: MutableList<Channel>

    var gameId: String? = null

    init {
        chatRepository.messageReceived.observeForever(Observer {
            _messageReceived.value = it ?: return@Observer
        } )

        chatRepository.notificationReceived.observeForever(Observer {
            getChannels()
        } )

        channelList = chatRepository.channelList

        LobbyRepository.getInstance()!!.lobbyJoined.observeForever {
            if(it != null) {
                gameId = it.gameID
                joinLobbyChannel(it.gameID)
            }
        }
        GameRepository.getInstance()!!.isGameEnded.observeForever{
            if(it != null)
                switchChannel("General")
                leaveChannel(it)
        }
    }

    fun onDestroy(token:String) {
        val data = InitialData(token)
        chatRepository.onDestroy(data)
    }

    fun sendMessage(msg: String) {
        chatRepository.sendMessage(msg)
    }

    fun createChannel(channelName: String) {
        viewModelScope.launch(Dispatchers.IO)
        {
            getChannelWithinThread()
            val channelFiltered = chatRepository.channelList.find { it.chatName == channelName }

            if (channelFiltered != null) {
                joinLobbyChannel(channelFiltered.chatId)
            } else {
                val result: Result<String> = try {
                    chatRepository.createChannel(channelName)
                } catch (e: Exception) {
                    Result.Error(ResponseCode.BAD_REQUEST.code)
                }

                if (result is Result.Success) {
                    joinChannel(result.data)
                }

                if (result is Result.Error) {
                    when (result.exception) {
                        ResponseCode.CONFLICT.code -> _createChannelResult.value = R.string.channel_name_used
                        ResponseCode.BAD_REQUEST.code -> _createChannelResult.value = R.string.bad_request
                    }
                }
            }
            getChannelWithinThread()
        }
    }

    var joinLimit = 4
    var chatTryingToBeJoined = ""
    fun joinLobbyChannel(chatId: String) {
        if (chatTryingToBeJoined != chatId) {
            joinLimit = 4
            chatTryingToBeJoined = chatId
        }
        viewModelScope.launch(Dispatchers.IO)
        {
            chatRepository.joinChannel(chatId)
            val result: Result<Boolean> = try {
                chatRepository.getChannels()
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }

            if (result is Result.Success) {
                _getChannelResult.postValue(-1)
                if (chatRepository.channelMap.containsKey(chatId)) {
                    switchChannel(chatId)
                } else {
                    if (joinLimit-- > 0) {
                        joinLobbyChannel(chatId)
                    }
                }
            }

            if(result is Result.Error && joinLimit == 0){
                when(result.exception) {
                    ResponseCode.NOT_AUTHORIZED.code -> _getChannelResult.postValue(R.string.not_authorized)
                    ResponseCode.BAD_REQUEST.code -> _getChannelResult.postValue(R.string.bad_request)
                }
            }

        }
    }

    suspend fun getChannelWithinThread(isInit: Boolean = false) {
        val result: Result<Boolean> = try {
            chatRepository.getChannels(isInit)
        } catch (e: Exception) {
            Result.Error(ResponseCode.BAD_REQUEST.code)
        }

        if (result is Result.Success) {
            _getChannelResult.postValue(-1)
        }

        if(result is Result.Error){
            when(result.exception) {
                ResponseCode.NOT_AUTHORIZED.code -> _getChannelResult.postValue(R.string.not_authorized)
                ResponseCode.BAD_REQUEST.code -> _getChannelResult.postValue(R.string.bad_request)
            }
        }
    }
    fun getChannels(isInit: Boolean = false) {
        viewModelScope.launch(Dispatchers.IO)
        {
            getChannelWithinThread(isInit)
        }
    }

    fun joinChannel(chatId: String) {
        chatRepository.joinChannel(chatId)
        getChannels()
    }

    fun leaveChannel(chatId: String) {
        chatRepository.leaveChannel(chatId)
        getChannels()
    }

    fun switchChannel(chatId: String) {

        _messageList.postValue(chatRepository.channelMap[chatId]!!)

        viewModelScope.launch(Dispatchers.IO){
            channelList.firstOrNull { c -> c.channelState == ChannelState.SHOWN }?.channelState = ChannelState.JOINED
            channelList.firstOrNull { c -> c.chatId == chatId }?.channelState = ChannelState.SHOWN
            chatRepository.channelShown = chatId
            getChannels()
        }
    }

    fun showHistory() {
        viewModelScope.launch(Dispatchers.IO)
        {
            val result: Result<Boolean> =
                try {
                chatRepository.getHistory()
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }

            if (result is Result.Success) {
                if (chatRepository.channelMap.containsKey(chatRepository.channelShown)) {
                    _messageList.postValue(chatRepository.channelMap[chatRepository.channelShown]!!)
                } else {
                    _messageList.postValue(mutableListOf())
                }
            }

            if(result is Result.Error){
                when(result.exception) {
                    ResponseCode.NOT_AUTHORIZED.code -> _getChannelResult.postValue(R.string.not_authorized)
                    ResponseCode.BAD_REQUEST.code -> _getChannelResult.postValue(R.string.bad_request)
                }
            }
        }
    }

}