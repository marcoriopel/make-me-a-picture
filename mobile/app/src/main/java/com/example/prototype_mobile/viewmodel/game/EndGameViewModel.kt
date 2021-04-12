package com.example.prototype_mobile.viewmodel.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.game.EndGameRepository
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
        Log.e("uplaod", "Starting upload")
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