package com.example.prototype_mobile.model.game

import android.text.BoringLayout
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.Coord
import com.example.prototype_mobile.DrawingEvent
import com.example.prototype_mobile.MessageReceive
import com.example.prototype_mobile.Stroke
import com.example.prototype_mobile.model.SocketOwner
import com.google.gson.Gson
import io.socket.emitter.Emitter


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
    var coordPath = mutableListOf<Coord>()
    val strokeList = mutableListOf<Stroke>()
//    var socket: io.socket.client.Socket
    val gson: Gson = Gson()

    // Live Data
    private val _isGrid = MutableLiveData<Boolean>()
    val isGrid : LiveData<Boolean> = _isGrid

    private val _gridSize = MutableLiveData<Int>()
    val gridSize : LiveData<Int> = _gridSize

    private val _redo = MutableLiveData<Boolean>()
    val redo : LiveData<Boolean> = _redo

    private val _undo = MutableLiveData<Boolean>()
    var undo : LiveData<Boolean> = _undo

//    var onDrawingEvent = Emitter.Listener {
//        // Cast the event
//        val event: DrawingEvent = gson.fromJson(it[0].toString())
//        // Dispatch the event
//
//    }

//    init {
//        socket = SocketOwner.getInstance()!!.socket
//        socket.on("drawingEvent", onDrawingEvent)
//    }

    fun setGrid(addGrid: Boolean) {
        _isGrid.value = addGrid
    }

    fun setGridSize(size: Int) {
        _gridSize.value = size
    }

    fun undo() {
        if (_undo.value != null)
            _undo.value = !_undo.value!!
        else
            _undo.value = true
    }

    fun redo() {
        if (_redo.value != null)
            _redo.value = !_redo.value!!
        else
            _redo.value = true
    }

}