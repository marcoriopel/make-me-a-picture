package com.example.prototype_mobile.model.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.DrawingEvent
import com.example.prototype_mobile.MouseDown
import com.example.prototype_mobile.Vec2
import com.example.prototype_mobile.model.SocketOwner
import io.socket.emitter.Emitter
import org.json.JSONObject

const val DRAWING_NAME_EVENT = "drawingName"
const val SCORE_EVENT = "score"

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
    var score: IntArray = intArrayOf(0,0)

    // Listener
    private var onDrawingNameEvent = Emitter.Listener {
       drawingName = JSONObject(it[0].toString()).getString("drawingName")
    }

    private  var onScoreEvent = Emitter.Listener {
        score = JSONObject(it[0].toString()).getString("drawingName") as IntArray

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