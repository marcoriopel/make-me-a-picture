package com.example.prototype_mobile.model.game

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
}