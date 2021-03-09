package com.example.prototype_mobile.viewmodel.game

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.view.MotionEvent
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.Coord
import com.example.prototype_mobile.PathPaint
import com.example.prototype_mobile.Stroke
import com.example.prototype_mobile.model.game.CanvasRepository
import com.example.prototype_mobile.model.game.ToolRepository
import java.util.*
import kotlin.math.abs

class CanvasViewModel(private val canvasRepository: CanvasRepository) : ViewModel() {

    private var motionTouchEventX = 0f
    private var motionTouchEventY = 0f
    private var currentX = 0f
    private var currentY = 0f
    private val drawing = Path()
    private val curPath = Path()

    // Undo-Redo
    private val undoStack = Stack<PathPaint>()
    private var redoStack = Stack<PathPaint>()

    // Repository
    private val toolRepo = ToolRepository.getInstance()
    private val canvasRepo = CanvasRepository()

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Dispatch user event
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun onTouchEvent(event: MotionEvent, touchTolerance: Int = 0) {
        motionTouchEventX = event.x
        motionTouchEventY = event.y
        when(event.action) {
            MotionEvent.ACTION_DOWN -> touchStart()
            MotionEvent.ACTION_MOVE -> touchMove(touchTolerance)
            MotionEvent.ACTION_UP -> touchUp()
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle user event touch down and send data to
     *  the server in live
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun touchStart() {
        curPath.reset()
        curPath.moveTo(motionTouchEventX, motionTouchEventY)
        // Add dot for touch feedback
        curPath.lineTo(motionTouchEventX + .01F , motionTouchEventY + .01F)

        // Call the onDraw() method to update the view
        currentX = motionTouchEventX
        currentY = motionTouchEventY

        // TODO: Send path start

        // (Future feature) Save Drawing
        val coord = Coord(currentX, currentY)
        canvasRepo.coordPath = mutableListOf<Coord>()
        canvasRepo.coordPath.add(coord)

    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle user event touch move and send data to
     *  the server in live
     *  -> Bezier quadratic is use so it smoother (Important)
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun touchMove(touchTolerance: Int) {
        val dx = abs(motionTouchEventX - currentX)
        val dy = abs(motionTouchEventY - currentY)
        if (dx >= touchTolerance || dy >= touchTolerance) {
            // QuadTo() adds a quadratic bezier from the last point,
            // approaching control point (x1,y1), and ending at (x2,y2).
            curPath.quadTo(currentX, currentY, (motionTouchEventX + currentX) / 2, (motionTouchEventY + currentY) / 2)
            currentX = motionTouchEventX
            currentY = motionTouchEventY

            // TODO: Send path update

            // (Future feature) Save Drawing
            val coord = Coord(currentX, currentY)
            canvasRepo.coordPath.add(coord)

        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle user event touch up and send data to
     *  the server in live
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun touchUp() {
        // Undo Redo Feature
        redoStack = Stack<PathPaint>()
        undoStack.push(toolRepo?.getPaint()?.let { PathPaint(curPath, it) })

        // Add the current path to the drawing so far
        drawing.addPath(curPath)
        // Rewind the current path for the next touch
        curPath.reset()

        // TODO: Send path end

        // (Future feature) Save Drawing
        val paint = toolRepo?.getPaint()
        if (paint != null) {
            canvasRepo.strokeList.add(Stroke(canvasRepo.coordPath, paint.strokeWidth, paint.color.toString()))
        }
    }
    
    // Grid attribute
    var isGrid = false;
    private lateinit var gridBitmap: Bitmap
    private lateinit var gridCanvas: Canvas
    private val gridColor = 1
    private val gridWith = 2f // has to be float
    private val gridPaint = Paint().apply {
        color = gridColor
        // Smooths out edges of what is drawn without affecting shape.
        isAntiAlias = true
        // Dithering affects how colors with higher-precision than the device are down-sampled.
        isDither = true
        style = Paint.Style.STROKE // default: FILL
        strokeJoin = Paint.Join.ROUND // default: MITER
        strokeCap = Paint.Cap.ROUND // default: BUTT
        strokeWidth = gridWith // default: Hairline-width (really thin)
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Prepare a canvas with a grid to put one top of the
     * view if needed
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun prepareGrid(width: Int, height: Int, padding: Float) {
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

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Get the bitmap of the grid to be able to draw it on a
     * canvas
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun getGrid(): Bitmap {
        return gridBitmap
    }


}