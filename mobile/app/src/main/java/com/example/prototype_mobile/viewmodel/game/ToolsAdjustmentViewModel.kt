package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.connection.sign_up.model.Tool
import com.example.prototype_mobile.model.game.CanvasRepository
import com.example.prototype_mobile.model.game.ToolRepository

class ToolsAdjustmentViewModel : ViewModel() {
    private val _isGrid = MutableLiveData<Boolean>()
    val isGrid : LiveData<Boolean> = _isGrid

    private val _selectedTool = MutableLiveData<Tool>()
    var selectedTool : LiveData<Tool> = _selectedTool

    val toolRepository = ToolRepository.getInstance()!!
    val canvasRepository = CanvasRepository.getInstance()!!

    init {
        canvasRepository.isGrid.observeForever {
            _isGrid.value = it
        }
        toolRepository.selectedTool.observeForever {
            _selectedTool.value = it
        }
    }

    fun setPenSize(size: Int) {
        toolRepository.strokeWidthPen = size.toFloat()
        toolRepository.setPen()
    }

    fun setEraserSize(size: Int) {
        toolRepository.strokeWidthEraser = size.toFloat()
        toolRepository.setEraser()
    }

    fun setGridSize(size: Int) {
        canvasRepository.setGridSize(size)
    }
    fun resetAlpha() {
        toolRepository.resetAlpha()
    }
}