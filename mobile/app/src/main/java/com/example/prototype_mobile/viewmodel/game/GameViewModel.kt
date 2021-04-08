package com.example.prototype_mobile.viewmodel.game

import android.util.Log
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.Score
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

    private val _teamScore = MutableLiveData<Score>()
    val teamScore: LiveData<Score> = _teamScore

    private val _isPlayerGuessing = MutableLiveData<Boolean>()
    val isPlayerGuessing: LiveData<Boolean> = _isPlayerGuessing

    private val _isGameEnded = MutableLiveData<Boolean>()
    val isGameEnded:LiveData<Boolean> = _isGameEnded

    private val _transitionMessage = MutableLiveData<String>()
    val transitionMessage: LiveData<String> = _transitionMessage

    private val _countDownSound = MutableLiveData<Boolean>()
    val countDownSound: LiveData<Boolean> = _countDownSound

    private val _tikSound = MutableLiveData<Boolean>()
    val tikSound: LiveData<Boolean> = _tikSound

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
        }
        gameRepository.teamScore.observeForever {
            _teamScore.postValue(it)
        }
        gameRepository.isGameEnded.observeForever{
            _isGameEnded.value = true
        }
        gameRepository.transition.observeForever {
            if (it.timer == 5) {
                _tikSound.postValue(false)
                val msg = when (it.state) {
                    0 -> "Bienvenue dans la partie! C'est " + gameRepository.drawingPlayer + " qui commence à dessiner!"
                    1 -> "Droit de réplique!"
                    2 -> "Prochain round!!! C'est à " + gameRepository.drawingPlayer + " de dessiner!";
                    else -> throw Exception("Transition state undefined")
                }
                _transitionMessage.postValue(msg)
            } else if(it.timer == 3) {
                _countDownSound.postValue(true)
            } else if(it.timer == 0) {
                _countDownSound.postValue(false)
            }
        }
        gameRepository.suggestions.observeForever {
            _suggestions.postValue(it)
        }
        gameRepository.roundTimer.observeForever {
            if (it.timer == 10)
                _tikSound.postValue(true)
            else if (it.timer == 0)
                _tikSound.postValue(false)
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

    fun getSuggestion(): Suggestions {
        return gameRepository.suggestion
    }

    fun refreshSuggestions() {
        gameRepository.refreshSuggestions()
    }

}




