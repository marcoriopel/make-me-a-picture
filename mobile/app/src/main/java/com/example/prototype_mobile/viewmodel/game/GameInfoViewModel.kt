package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.Players
import com.example.prototype_mobile.Score
import com.example.prototype_mobile.Timer
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.game.GameRepository

class GameInfoViewModel : ViewModel() {

    private val _teamScore = MutableLiveData<Score>()
    var teamScore: LiveData<Score> = _teamScore

    private val _gameTimer = MutableLiveData<Timer>()
    var gameTimer: LiveData<Timer> = _gameTimer

    private val _roundTimer = MutableLiveData<Timer>() 
    var roundTimer: LiveData<Timer> = _roundTimer

    private val _guessesLeft = MutableLiveData<Int>()
    val guessesLeft: LiveData<Int> = _guessesLeft

    private val gameRepo = GameRepository.getInstance()!!

    fun getTeam1(): MutableList<Players> {
        return gameRepo.team1
    }

    fun getTeam2(): MutableList<Players> {
        return gameRepo.team2
    }

    fun getUsername(): String {
        return LoginRepository.getInstance()!!.user!!.username
    }

    init {
        gameRepo.teamScore.observeForever {
            _teamScore.value = it
        }
        gameRepo.roundTimer.observeForever {
            _roundTimer.value = it
        }
        gameRepo.gameTimer.observeForever {
            _gameTimer.value = it
        }
        gameRepo.guessesLeft.observeForever {
            _guessesLeft.value = it
        }
    }
}