package com.example.prototype_mobile.model.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.GuessEvent
import com.example.prototype_mobile.model.SocketOwner
import com.google.gson.Gson
import io.socket.emitter.Emitter
import org.json.JSONObject

const val DRAWING_NAME_EVENT = "drawingName"
const val SCORE_EVENT = "score"
const val GUESS_DRAWING_EVENT = "guessDrawing"
const val END_GAME_EVENT = "endGame"

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

    var drawingName: String? = null
    var score: IntArray = intArrayOf(0,0)

    private val _isGameEnded=  MutableLiveData<Boolean>()
    val isGameEnded: LiveData<Boolean> = _isGameEnded

    // Listener
    private var onDrawingNameEvent = Emitter.Listener {
        drawingName = JSONObject(it[0].toString()).getString("drawingName")
    }

    private  var onScoreEvent = Emitter.Listener {
        score = JSONObject(it[0].toString()).getString("drawingName") as IntArray

    }
    private var onEndGameEvent = Emitter.Listener {
        println("game ended score")
        _isGameEnded.value = true
        score = JSONObject(it[0].toString()).getString("drawingName") as IntArray


    }

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
        _isPlayerDrawing.value = true
        _isPlayerGuessing.value = false
        socket = SocketOwner.getInstance()!!.socket
        socket.on(DRAWING_NAME_EVENT, onDrawingNameEvent)
        socket.on(END_GAME_EVENT, onEndGameEvent)
        _isGameEnded.value = false
    }
}