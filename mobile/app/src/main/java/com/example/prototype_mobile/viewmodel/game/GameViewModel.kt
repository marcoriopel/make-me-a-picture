package com.example.prototype_mobile.viewmodel.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.connection.login.LoginRepository
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.chat.ChatRepository
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.game.EndGameRepository
import com.example.prototype_mobile.model.game.GameRepository
import com.example.prototype_mobile.model.game.ToolRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.lang.Exception

class GameViewModel :ViewModel() {

    // Live data
    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing

    private val _teamScore = MutableLiveData<Score>()
    val teamScore: LiveData<Score> = _teamScore

    private val _isPlayerGuessing = MutableLiveData<Boolean?>()
    val isPlayerGuessing: LiveData<Boolean?> = _isPlayerGuessing

    private val _isGameEnded = MutableLiveData<Boolean>()
    val isGameEnded:LiveData<Boolean> = _isGameEnded

    private val _transitionMessage = MutableLiveData<String>()
    val transitionMessage: LiveData<String> = _transitionMessage

    private val _transitionState = MutableLiveData<Transition>()
    var transitionState: LiveData<Transition> = _transitionState

    private val _hint = MutableLiveData<String>()
    val hint: LiveData<String> = _transitionMessage

    private val _countDownSound = MutableLiveData<Boolean>()
    val countDownSound: LiveData<Boolean> = _countDownSound

    private val _tikSound = MutableLiveData<Boolean>()
    val tikSound: LiveData<Boolean> = _tikSound

    private val _suggestions = MutableLiveData<Suggestions>()
    var suggestions: LiveData<Suggestions> = _suggestions

    private val _isGuessGood =  MutableLiveData<Boolean>()
    val isGuessGood: LiveData<Boolean> = _isGuessGood

    private val _logout = MutableLiveData<Boolean>()
    val logout: LiveData<Boolean> = _logout

    val gameRepository = GameRepository.getInstance()!!

    var gameTypeViewModel = GameType.CLASSIC

    // Bind live data
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
            _tikSound.postValue(false)
            _isGameEnded.value = true
        }

        gameRepository.transition.observeForever {
            _transitionState.postValue(it)
            if (it.timer == 5) {
                _tikSound.postValue(false)

                val msg = when (it.state) {
                    0 -> "Bienvenue dans la partie! C'est " + gameRepository.drawingPlayer + " qui commence à dessiner!"
                    1 -> "Droit de réplique!"
                    2 -> "Prochain round!!! C'est à " + gameRepository.drawingPlayer + " de dessiner!"
                    else -> throw Exception("Transition state undefined")
                }
                _transitionMessage.postValue(msg)
            } else if(it.timer == 3) {
                _countDownSound.postValue(true)
            } else if(it.timer == 0) {
                _countDownSound.postValue(false)
            }
        }

        gameRepository.gameTypeLiveData.observeForever{
            gameTypeViewModel = it
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

        gameRepository.isGuessGood.observeForever {
            _isGuessGood.postValue(it)
        }
    }

    fun hintRequest() {
        val username = LoginRepository.getInstance()!!.user!!.username
        gameRepository.sendHintRequest(BasicUser(username, 0))
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

    fun leaveGame() {
        gameRepository.leaveGame()
    }

    fun logout() {
        leaveGame()
        viewModelScope.launch {
            val result: Result<Boolean> = try {
                LoginRepository.getInstance()!!.logout()
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }

            if (result is Result.Success) {
                ChatRepository.getInstance()!!.initialize()
                _logout.postValue(true)
            }
            if (result is Result.Error) {
                println("Bad request")
            }
        }
    }

    fun setEndGameResult(title: String, description: String, endGameResult: EndGameResult) {
        EndGameRepository.getInstance()!!.addGameResult(title, description, endGameResult)
    }

    fun resetAlpha() {
        ToolRepository.getInstance()!!.resetAlpha()
    }

    fun resetData() {
        _teamScore.postValue(null)
    }

}




