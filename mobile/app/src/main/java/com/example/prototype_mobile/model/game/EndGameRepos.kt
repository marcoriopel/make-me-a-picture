package com.example.prototype_mobile.model.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.DrawingData
import com.example.prototype_mobile.DrawingEvent
import com.google.gson.Gson
import java.io.FileOutputStream
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

    // Current hint
    private val _hints = MutableLiveData<MutableList<String>>()
    val hints: LiveData<MutableList<String>> = _hints

    init {
        initializeData()
    }

    fun initializeData() {
        _hints.value = mutableListOf()
        drawingList = mutableListOf()
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

    fun addDrawingImage(fos: FileOutputStream) {
        TODO()
//        drawingList[drawingList.lastIndex].image = fos
    }

    fun addDrawingEvent(event: DrawingEvent) {
        drawingList[drawingList.lastIndex].drawingEventList.add(gson.toJson(event))
    }

    fun getVPlayerDrawing() {
        TODO()
    }

    fun upload() {
        TODO()
    }

    fun vote(drawing: String, upvote: Boolean) {
        TODO()
    }

}


