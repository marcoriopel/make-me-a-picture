package com.example.prototype_mobile.model.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.connection.sign_up.model.EndGamePageType
import com.example.prototype_mobile.model.connection.sign_up.model.GameDifficulty
import com.google.gson.Gson
import java.lang.Exception
import java.util.*

class EndGameRepository {
    companion object {
        private var instance: EndGameRepository? = null

        fun getInstance(): EndGameRepository? {
            if (instance == null) {
                synchronized(EndGameRepository::class.java) {
                    if (instance == null) {
                        instance = EndGameRepository()
                    }
                }
            }
            return instance
        }
    }

    private val gson: Gson = Gson()

    // Drawing Data
    private lateinit var gameDifficulty: Difficulty
    private lateinit var drawingList: MutableList<DrawingData>
    private lateinit var gameResult: StaticEndGameInfo
    private lateinit var vPlayerDrawings: MutableList<VDrawingData>
    private var undoStack = Stack<DrawingEvent>()
    // Current hint
    private val _hints = MutableLiveData<MutableList<String>>()
    val hints: LiveData<MutableList<String>> = _hints

    init {
        initializeData(GameDifficulty.NONE)
    }

    fun initializeData(difficulty: GameDifficulty) {
        gameDifficulty = Difficulty(difficulty)
        _hints.postValue(mutableListOf())
        drawingList = mutableListOf()
        gameResult = StaticEndGameInfo("No Result", "", EndGamePageType.RESULT, null)
        vPlayerDrawings = mutableListOf()
    }

    fun addGameResult(title: String, description: String, endGameResult: EndGameResult, ) {
        if(gameResult.title == "No Result")
            this.gameResult = StaticEndGameInfo(title, description, EndGamePageType.RESULT, endGameResult)
    }

    fun getGameResult(): StaticEndGameInfo {
        return gameResult
    }

    fun addHint(hint: String) {
        _hints.value?.add(hint)
        _hints.postValue(_hints.value)
    }

    fun removeHint(hint: String) {
        _hints.value?.remove(hint)
        _hints.postValue(_hints.value)
    }

    fun addNewDrawing(drawingName: String) {
        drawingList.add(DrawingData(drawingName, null, LinkedList<DrawingEvent>(), mutableListOf()))
        undoStack = Stack()
    }

    fun getDrawings(): MutableList<DrawingData> {
        return drawingList
    }

    fun addDrawingImage(encodedImg: String) {
        if(drawingList.lastIndex != -1)
            drawingList[drawingList.lastIndex].image = encodedImg
    }

    fun addDrawingEvent(event: DrawingEvent) {
        try {
            when (event.eventType) {
                EVENT_UNDO -> {
                    if (drawingList[drawingList.lastIndex].drawingEventList.lastIndex != -1)
                        undoStack.push(drawingList[drawingList.lastIndex].drawingEventList.removeLast())
                }
                EVENT_REDO -> {
                    if (drawingList[drawingList.lastIndex].drawingEventList.lastIndex != -1 && !undoStack.isEmpty())
                        drawingList[drawingList.lastIndex].drawingEventList.add(undoStack.pop())
                }
                else -> {
                    drawingList[drawingList.lastIndex].drawingEventList.add(event)
                }
            }
        } catch (e: Exception) {
            println("Error while saving drawing when event: ${event.eventType} occurred")
        }
    }

    fun addVPlayerDrawing(drawingName: String, id: String) {
        val url = "https://drawingimages.s3.us-east-2.amazonaws.com/${id}.png"
        vPlayerDrawings.add(VDrawingData(drawingName, url, id))
    }

    fun getVPlayerDrawings(): MutableList<VDrawingData> {
        return vPlayerDrawings
    }

    suspend fun vote(isUpvote: Boolean, vDrawing: VDrawingData) {
        val body = HashMap<String, String>()
        body["isUpvote"] = isUpvote.toString()
        body["drawingId"] = vDrawing.id
        HttpRequestDrawGuess.httpRequestPatch("/api/drawings/vote", body, true)
    }

    suspend fun upload(drawingData: DrawingData) {
        // Check if thse at least one hint
        if(_hints.value!!.size < 1 || _hints.value == null)
            throw Exception("Uplaod image: Must have at least one hint")
        drawingData.hint.addAll(_hints.value!!)

        val body = HashMap<String, String>()
        val drawing = convertDrawing(drawingData)

        body["hints"] = gson.toJson(drawing.hints)
        body["eraserStrokes"] = gson.toJson(drawing.eraserStrokes)
        body["pencilStrokes"] = gson.toJson(drawing.pencilStrokes)
        body["drawingName"] = gson.toJson(drawing.drawingName)
        body["imageUrl"] =  gson.toJson(drawingData.image!!)
        body["difficulty"] = when(drawing.difficulty.difficulty) {
            GameDifficulty.EASY -> "0"
            GameDifficulty.MEDIUM -> "1"
            GameDifficulty.HARD -> "2"
            else -> "-1"
        }
        val res = HttpRequestDrawGuess.httpRequestPost("/api/drawings/create", body, true)

        Log.e("Upload http response", res.toString())
    }

    private fun convertDrawing(drawingData: DrawingData): Drawing {
        // Construct drawing
        val drawing = Drawing(
            gameDifficulty,
            mutableListOf(),
            mutableListOf(),
            drawingData.hint,
            drawingData.drawingName
        )
        var eventNumber = 0
        var stroke: Stroke? = null
        // Convert drawing event to
        for(event in drawingData.drawingEventList) {
            when(event.eventType) {
                EVENT_TOUCH_DOWN -> {
                    // Push stroke
                    if(stroke != null) {
                        if (stroke.isEraser) drawing.eraserStrokes.add(stroke)
                        else drawing.pencilStrokes.add(stroke)
                    }
                    // Create the next one
                    val mouseDown = event.event as MouseDown
                    stroke = Stroke(
                        mutableListOf(),
                        eventNumber++,
                        mouseDown.isEraser,
                        mouseDown.lineWidth,
                        mouseDown.lineColor
                    )
                }
                EVENT_TOUCH_MOVE -> {
                    stroke?.path?.add(event.event as Vec2)
                }
                EVENT_TOUCH_UP -> {
                    stroke?.path?.add(event.event as Vec2)
                }
                else -> { throw Exception("Event: ${event.eventType} is not supported")}
            }
        }
        return drawing
    }

}
