package com.example.prototype_mobile.model.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.sign_up.model.Tool
import com.google.gson.Gson
import io.socket.emitter.Emitter
import java.util.*

const val DRAWING_EVENT = "drawingEvent"
const val ERASER_STROKES = "eraserStrokes"
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
    var socket: io.socket.client.Socket = SocketOwner.getInstance()!!.socket
    private val gson: Gson = Gson()
    private val gameRepo = GameRepository.getInstance()!!
    var endGameRepos = EndGameRepository.getInstance()!!
    private val toolRepository = ToolRepository.getInstance()!!

    // Live Data
    private val _isGrid = MutableLiveData<Boolean>()
    val isGrid : LiveData<Boolean> = _isGrid

    private val _gridSize = MutableLiveData<Int>()
    val gridSize : LiveData<Int> = _gridSize

    private val _drawingEvent = MutableLiveData<DrawingEvent>()
    var drawingEvent: LiveData<DrawingEvent> = _drawingEvent

    private val _drawingEventServer = MutableLiveData<Boolean>()
    var drawingEventServer: LiveData<Boolean> = _drawingEventServer

    val drawingEventList = LinkedList<String>()
    val eraserStrokesList = LinkedList<DrawingEvent>()

    var onDrawingEvent = Emitter.Listener {
        drawingEventList.add(it[0].toString())
        _drawingEventServer.postValue(true)
    }

    private var onEraserStrokes = Emitter.Listener {
        val eraserStrokesReceived: EraserStrokesReceived = gson.fromJson(it[0].toString(), EraserStrokesReceived ::class.java)
        for (eraseStroke in eraserStrokesReceived.eraserStrokes) {
            val touchdown = MouseDown(eraseStroke.lineColor, eraseStroke.lineWidth, 1.00 ,eraseStroke.path[0], eraseStroke.strokeNumber)
            val event = DrawingEvent(EVENT_TOUCH_DOWN, touchdown, gameRepo.gameId.toString())
            eraserStrokesList.add(event)

            for(i in 1 until eraseStroke.path.size) {
                val eventMove = DrawingEvent(EVENT_TOUCH_MOVE, eraseStroke.path[i], gameRepo.gameId.toString())
                eraserStrokesList.add(eventMove)
            }

            val eventUp = DrawingEvent(EVENT_TOUCH_UP, eraseStroke.path[eraseStroke.path.size-1], gameRepo.gameId.toString())
            eraserStrokesList.add(eventUp)
        }
    }

    init {
        socket.on(DRAWING_EVENT, onDrawingEvent)
        socket.on(ERASER_STROKES, onEraserStrokes)
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
        // Save if player want to send it
        endGameRepos.addDrawingEvent(DrawingEvent(EVENT_UNDO, null, ""))
    }

    fun redoEvent() {
        // Create Event
        val event = DrawingEvent(EVENT_REDO, null, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))
        // Save if player want to send it
        endGameRepos.addDrawingEvent(DrawingEvent(EVENT_REDO, null, ""))
    }

    fun touchDownEvent(coord: Vec2, lineWith: Int, lineColor: String, strokeNumber: Int, opacity: Double) {
        // Create Event
        val isEraser = toolRepository.selectedTool.value == Tool.ERASER
        val touchDown = MouseDown(lineColor, lineWith, opacity, coord, strokeNumber, isEraser)
        val event = DrawingEvent(EVENT_TOUCH_DOWN, touchDown, gameRepo.gameId.toString())
        println(touchDown.lineColor)
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))
        // Save if player want to send it
        endGameRepos.addDrawingEvent(DrawingEvent(EVENT_TOUCH_DOWN, touchDown, ""))
    }

    fun touchMoveEvent(coord: Vec2) {
        // Create Event
        val event = DrawingEvent(EVENT_TOUCH_MOVE, coord, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))
        // Save if player want to send it
        endGameRepos.addDrawingEvent(DrawingEvent(EVENT_TOUCH_MOVE, coord, ""))
    }

    fun touchUpEvent(coord: Vec2) {
        // Create Event
        val event = DrawingEvent(EVENT_TOUCH_UP, coord, gameRepo.gameId.toString())
        _drawingEvent.value = event
        // Send to other players
        socket.emit(DRAWING_EVENT, gson.toJson(event))
        // Save if player want to send it
        endGameRepos.addDrawingEvent(DrawingEvent(EVENT_TOUCH_UP, coord, ""))

    }

    fun resetCanvas() {
        _drawingEvent.postValue(DrawingEvent(EVENT_CLEAR, null, "clear"))
    }

}