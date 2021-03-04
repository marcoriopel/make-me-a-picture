package com.example.prototype_mobile.viewmodel.connection.chat

import androidx.lifecycle.*
import com.example.prototype_mobile.InitialData
import com.example.prototype_mobile.Message
import com.example.prototype_mobile.SendMessage
import com.example.prototype_mobile.model.chat.ChatRepository
import com.example.prototype_mobile.view.chat.ChatRoomAdapter


class ChatViewModel(val chatRepository: ChatRepository) : ViewModel() {
    /*val chatRepository : ChatRepository = ChatRepository.getInstance()!! */
    private val _messageReceived = MutableLiveData<Message>()
    val messageReceived: LiveData<Message> = _messageReceived

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



}