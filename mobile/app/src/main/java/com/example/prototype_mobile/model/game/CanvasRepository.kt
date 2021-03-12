package com.example.prototype_mobile.model.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.DrawingEventType
import com.google.gson.Gson
import io.socket.emitter.Emitter

const val DRAWING_EVENT = "drawingEvent"

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

    var onDrawingEvent = Emitter.Listener {
        print(it[0])
        _drawingEvent.value = gson.fromJson(it[0].toString(), DrawingEvent::class.java)
    }

    var onError = Emitter.Listener {
        print(it[0].toString())
    }


    init {
        socket = SocketOwner.getInstance()!!.socket
        socket.on(DRAWING_EVENT, onDrawingEvent)
        socket.on("error", onError)
    }

    fun setGrid(addGrid: Boolean) {
        _isGrid.value = addGrid
    }

    fun setGridSize(size: Int) {
        _gridSize.value = size
    }

    fun undoEvent() {
        // Create Event
        val event = DrawingEvent(DrawingEventType.UNDO, null, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))
    }

    fun redoEvent() {
        // Create Event
        val event = DrawingEvent(DrawingEventType.REDO, null, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))
    }

    fun touchDownEvent(coord: Vec2, lineWith: Int, lineColor: String) {
        // Create Event
        val touchDown = TouchDown(lineColor, lineWith, coord)
        val event = DrawingEvent(DrawingEventType.TOUCHDOWN, touchDown, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        print(gson.toJson(event))
        socket.emit(DRAWING_EVENT, gson.toJson(event))

    }

    fun touchMoveEvent(coord: Vec2) {
        // Create Event
        val event = DrawingEvent(DrawingEventType.TOUCHMOVE, coord, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))

    }

    fun touchUpEvent(coord: Vec2) {
        // Create Event
        val event = DrawingEvent(DrawingEventType.TOUCHUP, coord, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))

    }

}