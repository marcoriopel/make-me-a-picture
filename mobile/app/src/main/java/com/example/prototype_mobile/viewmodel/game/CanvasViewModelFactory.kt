package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.model.game.CanvasRepository
import com.example.prototype_mobile.model.game.ToolRepository

class CanvasViewModelFactory : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(CanvasViewModel::class.java)) {
            return CanvasRepository.getInstance(
            )?.let {
                CanvasViewModel(
                    canvasRepository = it
                )
            } as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}