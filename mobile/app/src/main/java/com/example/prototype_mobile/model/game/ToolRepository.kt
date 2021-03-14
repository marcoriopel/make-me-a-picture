package com.example.prototype_mobile.model.game

import android.graphics.Color
import android.graphics.Paint
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.Tool
import org.jetbrains.anko._ScrollView

class ToolRepository {
    companion object {
        private var instance: ToolRepository? = null

        fun getInstance(): ToolRepository? {
            if (instance == null) {
                synchronized(ToolRepository::class.java) {
                    if (instance == null) {
                        instance = ToolRepository()
                    }
                }
            }
            return instance
        }
    }
    private val _selectedTool = MutableLiveData<Tool>()
    var selectedTool : LiveData<Tool> = _selectedTool

    init{
        _selectedTool.value = Tool.PEN
    }
    // Pencil attribute
    var strokeWidthEraser: Float = 12f
    var selectedColor = Color.BLACK

    // Eraser attribute
    var strokeWidthPen: Float = 12f // has to be float
    
    private val paint = Paint().apply {
        color = selectedColor
        // Smooths out edges of what is drawn without affecting shape.
        isAntiAlias = true
        // Dithering affects how colors with higher-precision than the device are down-sampled.
        isDither = true
        style = Paint.Style.STROKE // default: FILL
        strokeJoin = Paint.Join.ROUND // default: MITER
        strokeCap = Paint.Cap.ROUND // default: BUTT
        strokeWidth = strokeWidth // default: Hairline-width (really thin)
    }

    fun getPaintCopy(): Paint {
        return Paint().apply {
            if(_selectedTool.value == Tool.ERASER)
                color = Color.WHITE
            else
                color = selectedColor

            // Smooths out edges of what is drawn without affecting shape.
            isAntiAlias = true
            // Dithering affects how colors with higher-precision than the device are down-sampled.
            isDither = true
            style = Paint.Style.STROKE // default: FILL
            strokeJoin = Paint.Join.ROUND // default: MITER
            strokeCap = Paint.Cap.ROUND // default: BUTT
            strokeWidth = paint.strokeWidth // default: Hairline-width (really thin)
        }
    }

    fun getPaint(): Paint {
        return paint
    }

    fun setEraser() {
        _selectedTool.value = Tool.ERASER
        setColor(Color.WHITE)
        setStrokeWidth(strokeWidthEraser)
    }

    fun setPen() {
        _selectedTool.value = Tool.PEN
        setColor(selectedColor)
        setStrokeWidth(strokeWidthPen)
    }

    fun setStrokeWidth(width: Float = 12f) {
        paint.strokeWidth = width
    }

    fun setColor(color: Int) {
        // We refer to color in getPaintCopy through selected copy..
        paint.color = color
    }

    fun setColorByValue(color: String) {
        // Ex: "#a8a8a8"
        paint.color = Color.parseColor(color)
        selectedColor = Color.parseColor(color)
    }

}