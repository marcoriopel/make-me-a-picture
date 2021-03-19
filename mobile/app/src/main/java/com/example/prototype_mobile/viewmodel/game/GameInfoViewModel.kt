package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.Score
import com.example.prototype_mobile.Timer
import com.example.prototype_mobile.model.game.GameRepository

class GameInfoViewModel : ViewModel() {

    private val _teamScore = MutableLiveData<Score>()
    var teamScore: LiveData<Score> = _teamScore

    private val _timer = MutableLiveData<Timer>()
    var timer: LiveData<Timer> = _timer

    val gameRepo = GameRepository.getInstance()!!

    init {
        gameRepo.teamScore.observeForever {
            _teamScore.value = it
        }
        gameRepo.timer.observeForever {
            _timer.value = it
        }
    }

}