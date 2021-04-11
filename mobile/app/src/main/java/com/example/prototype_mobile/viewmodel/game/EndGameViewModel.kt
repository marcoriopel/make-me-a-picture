package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.DrawingData
import com.example.prototype_mobile.EndGameData
import com.example.prototype_mobile.StaticEndGameInfo
import com.example.prototype_mobile.model.game.EndGameRepository
import com.example.prototype_mobile.vDrawingData

class EndGameViewModel(): ViewModel() {

    private val endGameRepo = EndGameRepository.getInstance()!!

    private val _hints = MutableLiveData<MutableList<String>>()
    val hints: LiveData<MutableList<String>> = _hints
    
    init {
        endGameRepo.hints.observeForever {
            _hints.postValue(it)
        }
    }

    fun upload(drawingData: DrawingData) {
        endGameRepo.upload(drawingData)
    }

    fun vote(drawingId: String, upvote: Boolean) {
        endGameRepo.vote(drawingId, upvote)
    }

    fun addHint(hint: String) {
        endGameRepo.addHint(hint)
    }

    fun removeHint(hint: String) {
        endGameRepo.removeHint(hint)
    }

    fun getDrawings(): MutableList<DrawingData> {
        return endGameRepo.getDrawings()
    }

    fun getVPlayerDrawing(): List<vDrawingData> {
        return listOf()
    }

    fun getGameResult(): StaticEndGameInfo {
        return endGameRepo.getGameResult()
    }
}