package com.example.prototype_mobile.viewmodel.connection.chat

import androidx.lifecycle.*
import com.example.prototype_mobile.*
import com.example.prototype_mobile.R
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.chat.ChatRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.view.chat.ChatRoomAdapter
import kotlinx.coroutines.launch


class ChatViewModel(val chatRepository: ChatRepository) : ViewModel() {
    /*val chatRepository : ChatRepository = ChatRepository.getInstance()!! */
    private val _messageReceived = MutableLiveData<Message>()
    val messageReceived: LiveData<Message> = _messageReceived

    private val _createChannelResult = MutableLiveData<Int>()
    val createChannelResult: LiveData<Int> = _createChannelResult

    init {
        chatRepository.messageReceived.observeForever(Observer {
            _messageReceived.value = it ?: return@Observer
        } )
    }

    fun onDestroy(token:String) {
        val data = InitialData(token)
        chatRepository.onDestroy(data)
    }

    fun sendMessage(msg: String) {
        chatRepository.sendMessage(msg)
    }

    fun createChannel(channelName: String) {
        viewModelScope.launch()
        {
            val result: Result<Boolean> = try {
                chatRepository.createChannel(channelName)
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }

            if (result is Result.Success) {
               // Refresh list ?
            }

            if(result is Result.Error){
                when(result.exception) {
                    ResponseCode.CONFLICT.code -> _createChannelResult.value = R.string.channel_name_used
                    ResponseCode.BAD_REQUEST.code -> _createChannelResult.value = R.string.bad_request
                }
            }
        }
    }

}