package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.connection.sign_up.model.Tool
import com.example.prototype_mobile.model.game.ToolRepository

class ColorViewModel : ViewModel() {
    val toolRepository = ToolRepository.getInstance()!!

    fun setColor(color: Int) {
        toolRepository.selectedColor = color
        if (toolRepository.selectedTool.value == Tool.PEN) {
            toolRepository.setPen()
        }
    }
}