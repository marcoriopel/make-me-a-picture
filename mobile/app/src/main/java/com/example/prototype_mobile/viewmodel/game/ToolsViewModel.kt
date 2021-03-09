package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.game.CanvasRepository
import com.example.prototype_mobile.model.game.ToolRepository

class ToolsViewModel(private val toolRepository: ToolRepository) : ViewModel() {

    fun setColor(color: Int) {
        toolRepository.setColor(color)
    }

    fun useEraser() {
        toolRepository.setEraser()
    }

    fun usePen(width: Float = 12F) {
        toolRepository.setPen(width)
    }

    fun undo() {

    }

    fun redo() {

    }

    fun activateGrid() {
        CanvasRepository.getInstance()!!.setGrid(true)
    }

    fun deactivateGrid() {
        CanvasRepository.getInstance()!!.setGrid(false)
    }
}