package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.game.EndGameRepository

class EndGameViewModel(): ViewModel() {

    private val endGameRepo = EndGameRepository.getInstance()!!

    private val _hints = MutableLiveData<MutableList<String>>()
    val hints: LiveData<MutableList<String>> = _hints
    
    init {
        endGameRepo.hints.observeForever {
            _hints.postValue(it)
        }
    }

    fun upload() {
        endGameRepo.upload()
    }

    fun vote(drawingId: String, upvote: Boolean) {
        endGameRepo.vote(drawingId, upvote)
    }

    fun addHint(hint: String) {
        endGameRepo.addHint(hint)
    }

}