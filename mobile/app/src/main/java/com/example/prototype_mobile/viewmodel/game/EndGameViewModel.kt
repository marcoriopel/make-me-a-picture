package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.DrawingData
import com.example.prototype_mobile.EndGameData
import com.example.prototype_mobile.StaticEndGameInfo
import com.example.prototype_mobile.model.game.EndGameRepository
import com.example.prototype_mobile.VDrawingData
import kotlinx.coroutines.launch

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
        viewModelScope.launch {
            endGameRepo.upload(drawingData)
        }
    }

    fun vote(isUpvote: Boolean, vDrawing: EndGameData) {
        viewModelScope.launch {
            endGameRepo.vote(isUpvote, vDrawing as VDrawingData)
        }
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

    fun getVPlayerDrawing(): List<VDrawingData> {
        return endGameRepo.getVPlayerDrawings()
    }

    fun getGameResult(): StaticEndGameInfo {
        return endGameRepo.getGameResult()
    }
}