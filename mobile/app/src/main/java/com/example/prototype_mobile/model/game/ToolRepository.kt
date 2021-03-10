package com.example.prototype_mobile.model.game

import android.graphics.Color
import android.graphics.Paint
import com.example.prototype_mobile.model.connection.login.LoginRepository

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

    // Pencil attribute
    private var strokeWidth: Float = 12f // has to be float
    private var drawColor: Int = 0
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

    fun setEraser(width: Float = 12f) {
        drawColor = paint.color
        setColor(Color.WHITE)
        setStrokeWidth(width)
    }

    fun setPen(width: Float = 12f) {
        setColor(drawColor)
        setStrokeWidth(width)
    }

    private fun setStrokeWidth(width: Float = 12f) {
        paint.strokeWidth = width
    }

    fun setColor(color: Int) {
        paint.color = color
    }

}