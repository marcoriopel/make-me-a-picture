package com.example.prototype_mobile.model.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.sign_up.model.DrawingEventType
import com.google.gson.Gson
import io.socket.emitter.Emitter
import org.json.JSONObject

const val DRAWING_EVENT = "drawingEvent"
const val EVENT_TOUCH_DOWN = 0
const val EVENT_TOUCH_MOVE = 1
const val EVENT_TOUCH_UP = 2
const val EVENT_UNDO = 3
const val EVENT_REDO = 4
const val EVENT_CLEAR = 5

class CanvasRepository {
    companion object {
        private var instance: CanvasRepository? = null

        fun getInstance(): CanvasRepository? {
            if (instance == null) {
                synchronized(CanvasRepository::class.java) {
                    if (instance == null) {
                        instance = CanvasRepository()
                    }
                }
            }
            return instance
        }
    }

    // Attribute
    var socket: io.socket.client.Socket
    val gson: Gson = Gson()
    val gameRepo = GameRepository.getInstance()!!

    // Live Data
    private val _isGrid = MutableLiveData<Boolean>()
    val isGrid : LiveData<Boolean> = _isGrid

    private val _gridSize = MutableLiveData<Int>()
    val gridSize : LiveData<Int> = _gridSize

    private val _drawingEvent = MutableLiveData<DrawingEvent>()
    var drawingEvent: LiveData<DrawingEvent> = _drawingEvent

    private val _drawingEventServer = MutableLiveData<Boolean>()
    var drawingEventServer: LiveData<Boolean> = _drawingEventServer

    val drawingEventDeque = ArrayDeque<String>()

    var onDrawingEvent = Emitter.Listener {
        drawingEventDeque.addLast(it[0].toString())
        _drawingEventServer.postValue(true)
    }

    init {
        socket = SocketOwner.getInstance()!!.socket
        socket.on(DRAWING_EVENT, onDrawingEvent)
    }

    fun setGrid(addGrid: Boolean) {
        _isGrid.value = addGrid
    }

    fun setGridSize(size: Int) {
        _gridSize.value = size
    }

    fun undoEvent() {
        // Create Event
        val event = DrawingEvent(EVENT_UNDO, null, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))
    }

    fun redoEvent() {
        // Create Event
        val event = DrawingEvent(EVENT_REDO, null, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))
    }

    fun touchDownEvent(coord: Vec2, lineWith: Int, lineColor: String) {
        // Create Event
        val touchDown = MouseDown(lineColor, lineWith, coord)
        val event = DrawingEvent(EVENT_TOUCH_DOWN, touchDown, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))

    }

    fun touchMoveEvent(coord: Vec2) {
        // Create Event
        val event = DrawingEvent(EVENT_TOUCH_MOVE, coord, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))

    }

    fun touchUpEvent(coord: Vec2) {
        // Create Event
        val event = DrawingEvent(EVENT_TOUCH_UP, coord, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))

    }

    fun resetCanvas() {
        _drawingEvent.postValue(DrawingEvent(EVENT_CLEAR, null, "clear"))
    }

}