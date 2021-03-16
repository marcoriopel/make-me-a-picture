package com.example.prototype_mobile.model.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.GuessEvent
import com.example.prototype_mobile.model.SocketOwner
import com.google.gson.Gson

const val GUESS_DRAWING_EVENT = "guessDrawing"

class GameRepository {
    companion object {
        private var instance: GameRepository? = null

        fun getInstance(): GameRepository? {
            if (instance == null) {
                synchronized(GameRepository::class.java) {
                    if (instance == null) {
                        instance = GameRepository()
                    }
                }
            }
            return instance
        }
    }

    var socket: io.socket.client.Socket
    val gson: Gson = Gson()
    var gameId: String? = null

    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing

    private val _isPlayerGuessing = MutableLiveData<Boolean>()
    val isPlayerGuessing: LiveData<Boolean> = _isPlayerGuessing

    fun setIsPlayerDrawing(isDrawing: Boolean) {
        _isPlayerDrawing.value = isDrawing
    }

    fun setIsPlayerGuessing(isGuessing: Boolean) {
        _isPlayerGuessing.value = isGuessing
    }

    fun guessDrawing(guess: String) {
        val guessEvent = GuessEvent(this.gameId!!, guess)
        socket.emit(GUESS_DRAWING_EVENT, gson.toJson(guessEvent))
    }

    init {
        _isPlayerDrawing.value = false
        _isPlayerGuessing.value = true
        socket = SocketOwner.getInstance()!!.socket
    }
}