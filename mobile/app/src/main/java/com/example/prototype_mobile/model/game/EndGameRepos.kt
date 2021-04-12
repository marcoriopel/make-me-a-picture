package com.example.prototype_mobile.model.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.connection.sign_up.model.EndGamePageType
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
    private lateinit var drawingList: MutableList<DrawingData>
    private lateinit var gameResult: StaticEndGameInfo
    private lateinit var vPlayerDrawings: MutableList<VDrawingData>
    // Current hint
    private val _hints = MutableLiveData<MutableList<String>>()
    val hints: LiveData<MutableList<String>> = _hints

    init {
        initializeData()
    }

    fun initializeData() {
        _hints.value = mutableListOf()
        drawingList = mutableListOf()
        gameResult = StaticEndGameInfo("No Result", "", EndGamePageType.RESULT, null)
        vPlayerDrawings = mutableListOf()
    }

    fun addGameResult(title: String, description: String, endGameResult: EndGameResult, ) {
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

    fun removeAllHint() {
        _hints.postValue(mutableListOf())
    }

    fun addNewDrawing(drawingName: String) {
        drawingList.add(DrawingData(drawingName, null, LinkedList<String>(), mutableListOf()))
    }

    fun getDrawings(): MutableList<DrawingData> {
        return drawingList
    }

    fun addDrawingImage(encodedImg: String) {
        drawingList[drawingList.lastIndex].image = encodedImg
    }

    fun addDrawingEvent(event: DrawingEvent) {
        drawingList[drawingList.lastIndex].drawingEventList.add(gson.toJson(event))
    }

    fun addVPlayerDrawing(drawingName: String, id: String) {
        val url = "https://drawingimages.s3.us-east-2.amazonaws.com/${id}.png"
        vPlayerDrawings.add(VDrawingData(drawingName, url, id))
    }

    fun getVPlayerDrawings(): MutableList<VDrawingData> {
        return vPlayerDrawings
    }

    fun upload(drawingData: DrawingData) {
        if(_hints.value!!.size <= 0 || _hints.value == null)
            throw Exception("Uplaod image: Must have at least one hint")
        drawingData.hint.addAll(_hints.value!!)
        // TODO: Upload drawing
    }

    suspend fun vote(isUpvote: Boolean, vDrawing: VDrawingData) {
        val body = HashMap<String, String>()
        body["isUpvote"] = isUpvote.toString()
        body["drawingId"] = vDrawing.id
        val response = HttpRequestDrawGuess.httpRequestPatch("/api/drawings/vote", body, true)

    }

}


