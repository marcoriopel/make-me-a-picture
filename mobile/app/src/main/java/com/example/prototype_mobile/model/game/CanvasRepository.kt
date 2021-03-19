package com.example.prototype_mobile.model.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.SocketOwner
import com.google.gson.Gson
import io.socket.emitter.Emitter
import org.json.JSONObject

const val DRAWING_EVENT = "drawingEvent"
const val EVENT_TOUCH_DOWN = 0
const val EVENT_TOUCH_MOVE = 1
const val EVENT_TOUCH_UP = 2
const val EVENT_UNDO = 3
const val EVENT_REDO = 4

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
    private var lastCoordsReceive: Vec2 = Vec2(0,0)

    var onDrawingEvent = Emitter.Listener {
        if(!gameRepo.isPlayerDrawing.value!!) {
            val objectString = JSONObject(it[0].toString()).getString("drawingEvent")
            val objectJson = JSONObject(objectString)
            try {
                val drawingEventReceive = when(objectJson.getString("eventType").toInt()) {
                    EVENT_TOUCH_DOWN -> {
                        val Jevent = JSONObject(objectJson.getString("event"))
                        val coords = Vec2(JSONObject(Jevent.getString("coords")).getString("x").toInt(), JSONObject(Jevent.getString("coords")).getString("y").toInt())
                        val event = MouseDown(Jevent.getString("lineColor"), Jevent.getString("lineWidth").toInt(), coords)
                        DrawingEvent(EVENT_TOUCH_DOWN, event, objectJson.getString("gameId"))
                    }
                    EVENT_TOUCH_MOVE -> {
                        lastCoordsReceive = Vec2(JSONObject(objectJson.getString("event")).getString("x").toInt(), JSONObject(objectJson.getString("event")).getString("y").toInt())
                        DrawingEvent(EVENT_TOUCH_MOVE, lastCoordsReceive, objectJson.getString("gameId"))
                    }
                    EVENT_TOUCH_UP -> {
                        DrawingEvent(EVENT_TOUCH_UP, lastCoordsReceive, objectJson.getString("gameId"))
                    }
                    else -> {
                        DrawingEvent(objectJson.getString("eventType").toInt(), null, objectJson.getString("gameId"))
                    }
                }
                _drawingEvent.postValue(drawingEventReceive)
            } catch (e: Exception) {
                Log.e("Error in Drawing event", e.toString())
                Log.e("Receive", it[0].toString())
                throw Exception()
            }

        }
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

}