package com.example.prototype_mobile.viewmodel.connection.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.model.chat.ChatRepository
import com.example.prototype_mobile.model.game.ToolRepository
import com.example.prototype_mobile.viewmodel.game.ToolsViewModel

class ChatViewModelFactory: ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ChatViewModel::class.java)) {
            return ChatRepository.getInstance(
            )?.let {
                ChatViewModel(
                    chatRepository = it
                )
            } as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

