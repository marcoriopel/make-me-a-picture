package com.example.prototype_mobile.viewmodel.game

import android.util.Log
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.game.GameRepository
import java.lang.Exception

class GameViewModel():ViewModel() {
    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing

    private val _isPlayerGuessing = MutableLiveData<Boolean>()
    val isPlayerGuessing: LiveData<Boolean> = _isPlayerGuessing

    private val _transitionMessage = MutableLiveData<String>()
    val transitionMessage: LiveData<String> = _transitionMessage

    val gameRepository = GameRepository.getInstance()!!
    init {
        _isPlayerDrawing.value = gameRepository.isPlayerDrawing.value

        gameRepository.isPlayerDrawing.observeForever {
            _isPlayerDrawing.value = it
        }

        _isPlayerGuessing.value = gameRepository.isPlayerGuessing.value

        gameRepository.isPlayerGuessing.observeForever {
            _isPlayerGuessing.value = it
        }

        gameRepository.transition.observeForever {
            val msg = when (it.state) {
                0 -> "Bienvenue dans la partie! C'est " + gameRepository.drawingPlayer + " qui commence à dessiner! ${it.timer}"
                1 -> "Droit de réplique! ${it.timer}"
                2 -> "Prochain round!!! C'est à " + gameRepository.drawingPlayer + " de dessiner! ${it.timer}";
                else -> throw Exception("Transition state undefined")
            }
            Log.e("GameViewModel -> transition occurred", msg)
            _transitionMessage.postValue(msg)
        }
    }
}




