package com.example.prototype_mobile.viewmodel.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.Message
import com.example.prototype_mobile.model.connection.sign_up.model.Tool
import com.example.prototype_mobile.model.game.ToolRepository

class ColorViewModel : ViewModel() {
    val toolRepository = ToolRepository.getInstance()!!
    private val _alphaLiveData = MutableLiveData<Int>()
    val alpha: LiveData<Int> = _alphaLiveData

    fun setColor(color: Int) {
        toolRepository.selectedColor = color
        if (toolRepository.selectedTool.value == Tool.PEN) {
            toolRepository.setPen()
        }
    }

    fun setAlpha(alpha: Int) {
        toolRepository.setAlpha(alpha *255/100)
        _alphaLiveData.postValue(alpha)
        if (toolRepository.selectedTool.value == Tool.PEN) {
            toolRepository.setPen()
        }
    }
}