package com.example.prototype_mobile.model.game

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
    private val hints: MutableList<String> = mutableListOf()
    lateinit var name: String

    fun addHint(hint: String) {
        hints.add(hint)
    }

    fun addDrawing(drawing: Array<DrawingEvent>) {
        // Check with server how they want the drawing list and eraser
        TODO()
    }

    fun uplaod() {
        TODO()
    }

    fun vote(drawing: String, upvote: Boolean) {
        TODO()
    }

}


