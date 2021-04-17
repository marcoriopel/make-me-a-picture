package com.example.prototype_mobile.model.game

import android.graphics.Color
import android.graphics.Paint
import android.util.Log
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
    private var alpha = 255
    
    private val paint = Paint().apply {
        color = selectedColor
        alpha = alpha
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
            else {
                color = selectedColor
                alpha = paint.alpha
            }

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

    fun getOpacity(): Double {
        return alpha.toDouble() / 255
    }

    fun setEraser() {
        _selectedTool.value = Tool.ERASER
        selectedColor = paint.color
        paint.alpha = 255
        setColor(Color.WHITE)
        setStrokeWidth(strokeWidthEraser)
    }

    fun setPen() {
        _selectedTool.value = Tool.PEN
        paint.alpha = alpha
        setColor(selectedColor)
        setStrokeWidth(strokeWidthPen)
    }

    fun setStrokeWidth(width: Float = 12f) {
        paint.strokeWidth = width
    }

    fun setStokeOpacity(opacity: Double) {
        setAlpha((opacity * 255).toInt())
    }

    fun setAlpha(a: Int) {
        if(_selectedTool.value == Tool.PEN) {
            alpha = a
            paint.alpha = alpha
        }
    }

    private fun setColor(color: Int) {
        paint.color = color
    }

    fun setColorByValue(color: String) {
        // Ex: "#a8a8a8"
        if(_selectedTool.value == Tool.PEN) {
            paint.color = Color.parseColor(color)
            selectedColor = Color.parseColor(color)
            paint.alpha = alpha
        }
    }

    fun resetAlpha() {
        println("resetAlpha")
        alpha = 255
        paint.alpha = alpha
    }

}