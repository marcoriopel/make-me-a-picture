package com.example.prototype_mobile.viewmodel.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.chat.ChatRepository
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.game.EndGameRepository
import kotlinx.coroutines.launch
import java.lang.Exception

class EndGameViewModel(): ViewModel() {

    private val endGameRepo = EndGameRepository.getInstance()!!

    private val _hints = MutableLiveData<MutableList<String>>()
    val hints: LiveData<MutableList<String>> = _hints

    private val _logout = MutableLiveData<Boolean>()
    val logout: LiveData<Boolean> = _logout
    
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

    fun logout() {
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
}