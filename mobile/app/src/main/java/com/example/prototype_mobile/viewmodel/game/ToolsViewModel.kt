package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.connection.sign_up.model.Tool
import com.example.prototype_mobile.model.game.CanvasRepository
import com.example.prototype_mobile.model.game.ToolRepository

class ToolsViewModel(private val toolRepository: ToolRepository) : ViewModel() {

    fun setColor(color: Int) {
        toolRepository.selectedColor = color
        if (toolRepository.selectedTool.value == Tool.PEN) {
            toolRepository.setPen()
        }
    }

    fun useEraser() {
        toolRepository.setEraser()
    }

    fun usePen() {
        toolRepository.setPen()
    }

    fun undo() {
        CanvasRepository.getInstance()!!.undoEvent()
    }

    fun redo() {
        CanvasRepository.getInstance()!!.redoEvent()
    }

    fun activateGrid() {
        CanvasRepository.getInstance()!!.setGrid(true)
    }

    fun deactivateGrid() {
        CanvasRepository.getInstance()!!.setGrid(false)
    }
}