package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider

import com.example.prototype_mobile.model.game.ToolRepository

class ToolsViewModelFactory: ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ToolsViewModel::class.java)) {
            return ToolRepository.getInstance(
            )?.let {
                ToolsViewModel(
                    toolRepository = it
                )
            } as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}