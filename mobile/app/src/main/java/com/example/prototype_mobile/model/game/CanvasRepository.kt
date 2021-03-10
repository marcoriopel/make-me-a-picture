package com.example.prototype_mobile.model.game

import android.text.BoringLayout
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.Coord
import com.example.prototype_mobile.Stroke


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

    
    // (Future feature) Save Drawing
    var coordPath = mutableListOf<Coord>()
    val strokeList = mutableListOf<Stroke>()

    private val _isGrid = MutableLiveData<Boolean>()
    val isGrid : LiveData<Boolean> = _isGrid

    fun setGrid(addGrid: Boolean) {
        _isGrid.value = addGrid
    }

    private val _undo = MutableLiveData<Boolean>()
    var undo : LiveData<Boolean> = _undo

    fun undo() {
        if (_undo.value != null)
            _undo.value = !_undo.value!!
        else
            _undo.value = true
    }

    private val _redo = MutableLiveData<Boolean>()
    val redo : LiveData<Boolean> = _redo

    fun redo() {
        if (_redo.value != null)
            _redo.value = !_redo.value!!
        else
            _redo.value = true
    }

}