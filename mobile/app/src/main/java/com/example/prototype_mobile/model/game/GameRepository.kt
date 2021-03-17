package com.example.prototype_mobile.model.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.google.gson.Gson
import io.socket.emitter.Emitter
import org.json.JSONObject

const val DRAWING_NAME_EVENT = "drawingName"
const val NEW_ROUND_EVENT = "newRound"
const val GUESSES_LEFT_EVENT = "guessesLeft"

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

    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing

    private val _isPlayerGuessing = MutableLiveData<Boolean>()
    val isPlayerGuessing: LiveData<Boolean> = _isPlayerGuessing

    lateinit var socket: io.socket.client.Socket
    var gameId: String? = null
    var drawingName: String? = null
    var team = 0

    private var onDrawingNameEvent = Emitter.Listener {
       drawingName = JSONObject(it[0].toString()).getString("drawingName")
    }

    private var onNewRound = Emitter.Listener {
        var playerDrawing = JSONObject(it[0].toString()).getString("newDrawingPlayer")
        if (playerDrawing.equals(LoginRepository.getInstance()!!.user!!.username)) {
            _isPlayerDrawing.postValue(true)
        } else {
            _isPlayerGuessing.postValue(true)
        }
        CanvasRepository.getInstance()!!.resetCanvas()
    }

    private var onGuessesLeft = Emitter.Listener {
        val gson: Gson = Gson()
        val guessesLeft: GuessesLeft = gson.fromJson(it[0].toString(), GuessesLeft::class.java)

    }

    fun setIsPlayerDrawing(isDrawing: Boolean) {
        _isPlayerDrawing.value = isDrawing
    }

    fun setIsPlayerGuessing(isGuessing: Boolean) {
        _isPlayerGuessing.value = isGuessing
    }

    init {
        _isPlayerDrawing.value = false
        _isPlayerGuessing.value = true
        socket = SocketOwner.getInstance()!!.socket
        socket.on(DRAWING_NAME_EVENT, onDrawingNameEvent)

    }
}