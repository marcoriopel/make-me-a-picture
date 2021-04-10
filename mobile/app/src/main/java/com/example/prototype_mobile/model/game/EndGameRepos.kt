package com.example.prototype_mobile.model.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.DrawingEvent

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

    val myDrawing: Array<DrawingEvent> = arrayOf()
    val eraser: Array<DrawingEvent> = arrayOf()
    lateinit var name: String

    private val _hints = MutableLiveData<MutableList<String>>()
    val hints: LiveData<MutableList<String>> = _hints

    init {
        initializeData()
    }

    fun initializeData() {
        _hints.value = mutableListOf()
    }

    fun addHint(hint: String) {
        _hints.value?.add(hint)
        _hints.postValue(_hints.value)
    }

    fun removeHint(hint: String) {
        _hints.value?.remove(hint)
        _hints.postValue(_hints.value)
    }

    fun addDrawing(drawing: Array<DrawingEvent>) {
        // Check with server how they want the drawing list and eraser
        TODO()
    }

    fun upload() {
        TODO()
    }

    fun vote(drawing: String, upvote: Boolean) {
        TODO()
    }

}


