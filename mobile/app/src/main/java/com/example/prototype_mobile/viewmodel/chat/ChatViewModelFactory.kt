package com.example.prototype_mobile.viewmodel.connection.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.model.chat.ChatRepository

class ChatViewModelFactory: ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ChatViewModel::class.java)) {
           return ChatViewModel(ChatRepository()) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

