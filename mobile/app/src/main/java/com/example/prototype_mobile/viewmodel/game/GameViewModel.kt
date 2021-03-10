package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.game.GameRepository

class GameViewModel():ViewModel() {
    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing

    val gameRepository = GameRepository.getInstance()!!
    init {
        _isPlayerDrawing.value = gameRepository.isPlayerDrawing.value

        gameRepository.isPlayerDrawing.observeForever {
            _isPlayerDrawing.value = it
        }
    }
}