package com.example.prototype_mobile.model.game

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint

class ToolRepository {

    // Pencil attribute
    private var strokeWidth: Float = 12f // has to be float
    private var drawColor: Int = 32
    private var lastColor: Int = 0
    private val paint = Paint().apply {
        color = drawColor
        // Smooths out edges of what is drawn without affecting shape.
        isAntiAlias = true
        // Dithering affects how colors with higher-precision than the device are down-sampled.
        isDither = true
        style = Paint.Style.STROKE // default: FILL
        strokeJoin = Paint.Join.ROUND // default: MITER
        strokeCap = Paint.Cap.ROUND // default: BUTT
        strokeWidth = strokeWidth // default: Hairline-width (really thin)
    }

    fun getPaint(): Paint {
        return paint
    }

    fun setEraser() {
        // TODO: save last color
        lastColor = paint.color
        setColor(0) // TODO: Find white value + Remove magic number
    }

    fun setPen(width: Float = 12f) {
        setColor(lastColor)
        setStrokeWidth(width)
    }

    private fun setStrokeWidth(width: Float = 12f) {
        strokeWidth = width
    }

    fun setColor(color: Int) {
        drawColor = color
    }

    // Grid
    private var isGrid = false;
    private lateinit var gridBitmap: Bitmap
    private lateinit var gridCanvas: Canvas
    private val gridColor = 1
    private val GRID_WIDTH = 2f // has to be float
    private val gridPaint = Paint().apply {
        color = gridColor
        // Smooths out edges of what is drawn without affecting shape.
        isAntiAlias = true
        // Dithering affects how colors with higher-precision than the device are down-sampled.
        isDither = true
        style = Paint.Style.STROKE // default: FILL
        strokeJoin = Paint.Join.ROUND // default: MITER
        strokeCap = Paint.Cap.ROUND // default: BUTT
        strokeWidth = GRID_WIDTH // default: Hairline-width (really thin)
    }

    fun prepareGrid(width: Int, height: Int, padding: Float) {
        // Create grid canvas
        gridBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        gridCanvas = Canvas(gridBitmap)
        var x = 0F
        while(x < width) {
            gridCanvas.drawLine(x, 0F, x, height.toFloat(), gridPaint)
            x += padding
        }
        var y = 0F
        while(y < height) {
            gridCanvas.drawLine(0F, y, width.toFloat(), y, gridPaint)
            y += padding
        }
    }

    fun toggleGrid() {
        isGrid = !isGrid
        // TODO: invalidate canvas view
    }

    fun isGridToolActive(): Boolean {
        return isGrid
    }

    fun getGrid(): Bitmap {
        return gridBitmap
    }

}