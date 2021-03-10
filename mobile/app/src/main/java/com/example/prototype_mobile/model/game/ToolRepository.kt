package com.example.prototype_mobile.model.game

import android.graphics.Color
import android.graphics.Paint
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.Tool

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

    // Pencil attribute
    var strokeWidthEraser: Float = 12f // has to be float
    var drawColor: Int = Color.BLACK // change with color picker

    // Eraser attribute
    var strokeWidthPen: Float = 12f // has to be float
    
    private val paint = Paint().apply {
        color = Color.BLACK
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
            color = paint.color
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
        setColor(Color.WHITE)
        setStrokeWidth(strokeWidthEraser)
        _selectedTool.value = Tool.ERASER
    }

    fun setPen() {
        setColor(drawColor)
        setStrokeWidth(strokeWidthPen)
        _selectedTool.value = Tool.PEN
    }

    private fun setStrokeWidth(width: Float = 12f) {
        paint.strokeWidth = width
    }

    fun setColor(color: Int) {
        // Ex: Color.RED
        paint.color = color
    }

    fun setColorByValue(color: String) {
        // Ex: "#a8a8a8"
        paint.color = Color.parseColor(color)
    }

}