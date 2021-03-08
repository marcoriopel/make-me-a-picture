package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.game.ToolRepository

class ToolsViewModel(private val toolRepository: ToolRepository) : ViewModel() {

    fun prepareGrid(width: Int, height: Int, padding: Float = 75F) {
        toolRepository.prepareGrid(width, height, padding)
    }

    fun setColor(color: Int) {
        toolRepository.setColor(color)
    }

    fun useEraser() {
        toolRepository.setEraser()
    }

    fun usePen(width: Float = 12F) {
        toolRepository.setPen(width)
    }
}