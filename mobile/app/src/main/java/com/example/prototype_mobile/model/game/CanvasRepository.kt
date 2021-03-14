package com.example.prototype_mobile.model.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.SocketOwner
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
        Log.e("Json", it.toString())
        val d = gson.fromJson(it[0].toString(), DrawingEvent::class.java)
        Log.e("Receive", d.toString())
//        _drawingEvent.postValue(d)
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
        val event = DrawingEvent(3, null, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))
    }

    fun redoEvent() {
        // Create Event
        val event = DrawingEvent(4, null, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))
    }

    fun touchDownEvent(coord: Vec2, lineWith: Int, lineColor: String) {
        // Create Event
        val touchDown = MouseDown(lineColor, lineWith, coord)
        val event = DrawingEvent(0, touchDown, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))

    }

    fun touchMoveEvent(coord: Vec2) {
        // Create Event
        val event = DrawingEvent(1, coord, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))

    }

    fun touchUpEvent(coord: Vec2) {
        // Create Event
        val event = DrawingEvent(2, coord, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))

    }

}