package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.game.GameRepository

class GameViewModel():ViewModel() {
    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing

    private val _teamScore = MutableLiveData<IntArray>()
    val teamScore: LiveData<IntArray> = _teamScore

    private val _isPlayerGuessing = MutableLiveData<Boolean>()
    val isPlayerGuessing: LiveData<Boolean> = _isPlayerGuessing

    val gameRepository = GameRepository.getInstance()!!
    init {
        _isPlayerDrawing.value = gameRepository.isPlayerDrawing.value

        gameRepository.isPlayerDrawing.observeForever {
            _isPlayerDrawing.value = it
        }

        _isPlayerGuessing.value = gameRepository.isPlayerGuessing.value

        gameRepository.isPlayerGuessing.observeForever {
            _isPlayerGuessing.value = it

            _teamScore.value = intArrayOf(0,0)
        }
    }
}