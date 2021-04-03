package com.example.prototype_mobile.viewmodel.game

import android.util.Log
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.Suggestions
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.game.GameRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.lang.Exception

class GameViewModel():ViewModel() {
    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing

    private val _teamScore = MutableLiveData<IntArray>()
    val teamScore: LiveData<IntArray> = _teamScore

    private val _isPlayerGuessing = MutableLiveData<Boolean>()
    val isPlayerGuessing: LiveData<Boolean> = _isPlayerGuessing

    private val _transitionMessage = MutableLiveData<String>()
    val transitionMessage: LiveData<String> = _transitionMessage

    private val _suggestions = MutableLiveData<Suggestions>()
    var suggestions: LiveData<Suggestions> = _suggestions

    val gameRepository = GameRepository.getInstance()!!
    init {
        _isPlayerGuessing.value = gameRepository.isPlayerGuessing.value

        _isPlayerDrawing.value = gameRepository.isPlayerDrawing.value
        gameRepository.isPlayerDrawing.observeForever {
            _isPlayerDrawing.value = it
        }
        gameRepository.isPlayerGuessing.observeForever {
            _isPlayerGuessing.value = it
            _teamScore.value = intArrayOf(0,0)
        }
        gameRepository.transition.observeForever {
            if (it.timer == 5) {
                val msg = when (it.state) {
                    0 -> "Bienvenue dans la partie! C'est " + gameRepository.drawingPlayer + " qui commence à dessiner!"
                    1 -> "Droit de réplique!"
                    2 -> "Prochain round!!! C'est à " + gameRepository.drawingPlayer + " de dessiner!";
                    else -> throw Exception("Transition state undefined")
                }
                _transitionMessage.postValue(msg)
            }
        }
        gameRepository.suggestions.observeForever {
            _suggestions.postValue(it)
        }
    }

    fun getGameType(): GameType {
        return GameRepository.getInstance()!!.gameType
    }

    fun chooseWord(word: String) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                gameRepository.postWordChose(word)
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }
        }
    }

    fun refreshSuggestions() {
        gameRepository.refreshSuggestions()
    }

}




