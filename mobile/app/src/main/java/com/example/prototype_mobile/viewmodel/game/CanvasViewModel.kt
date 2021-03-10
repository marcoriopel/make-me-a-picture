package com.example.prototype_mobile.viewmodel.game

import android.graphics.*
import android.util.Log
import android.view.MotionEvent
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.Coord
import com.example.prototype_mobile.DrawingEvent
import com.example.prototype_mobile.PaintedPath
import com.example.prototype_mobile.Stroke
import com.example.prototype_mobile.model.connection.sign_up.model.DrawingEventType
import com.example.prototype_mobile.model.game.CanvasRepository
import com.example.prototype_mobile.model.game.ToolRepository
import java.util.*
import kotlin.math.abs

const val GRID_WIDTH = 2f // has to be float
const val TOUCH_TOLERANCE = 12
class CanvasViewModel(private val canvasRepository: CanvasRepository) : ViewModel() {

    // Path
    private var motionTouchEventX = 0f
    private var motionTouchEventY = 0f
    private var currentX = 0f
    private var currentY = 0f
    var curPath = Path()
    private val _newCurPath = MutableLiveData<Path>()
    val newCurPath: LiveData<Path> = _newCurPath

    // Undo-Redo
    val pathStack = Stack<PaintedPath>()
    private var redoStack = Stack<PaintedPath>()

    // Repository
    private val toolRepo = ToolRepository.getInstance()
    private val canvasRepo = CanvasRepository()

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Get the current paint
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun getPaint(): Paint {
        return toolRepo!!.getPaint()
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Dispatch user event
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun onTouchEvent(event: MotionEvent): Boolean {
        motionTouchEventX = event.x
        motionTouchEventY = event.y
        when(event.action) {
            MotionEvent.ACTION_DOWN -> touchStart()
            MotionEvent.ACTION_MOVE -> touchMove()
            MotionEvent.ACTION_UP -> touchUp()
        }
        return true
    }

//    fun onDrawingEvent(event: DrawingEvent ) {
//        when(event.eventType) {
//            DrawingEventType.TOUCHDOWN -> touchStart()
//            DrawingEventType.TOUCHMOVE -> touchMove()
//            DrawingEventType.TOUCHUP -> touchUp()
//        }
//    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle user event touch down and send data to
     *  the server in live
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun touchStart() {
        curPath.reset()
        curPath.moveTo(motionTouchEventX, motionTouchEventY)
        // Add dot for touch feedback
        curPath.lineTo(motionTouchEventX + .01F , motionTouchEventY + .01F)

        currentX = motionTouchEventX
        currentY = motionTouchEventY

        // Call the onDraw() method to update the view
        _newCurPath.value = curPath

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
        if (dx >= TOUCH_TOLERANCE || dy >= TOUCH_TOLERANCE) {
            // QuadTo() adds a quadratic bezier from the last point,
            // approaching control point (x1,y1), and ending at (x2,y2).
            curPath.quadTo(currentX, currentY, (motionTouchEventX + currentX) / 2, (motionTouchEventY + currentY) / 2)
            currentX = motionTouchEventX
            currentY = motionTouchEventY

            // Call the onDraw() method to update the view
            _newCurPath.value = curPath
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
        redoStack = Stack<PaintedPath>()
        pathStack.push(PaintedPath(curPath, toolRepo!!.getPaintCopy()))

        // Rewind the current path for the next touch
        curPath = Path()

        // Call the onDraw() method to update the view
        _newCurPath.value = curPath

        // (Future feature) Save Drawing
        val paint = toolRepo.getPaint()
        canvasRepo.strokeList.add(Stroke(canvasRepo.coordPath, paint.strokeWidth, paint.color.toString()))
    }
    
    // Grid attribute
    var isGrid = false;
    private lateinit var gridBitmap: Bitmap
    private lateinit var gridCanvas: Canvas
    private val gridColor = Color.GRAY
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

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Prepare a canvas with a grid to put one top of the
     * view if needed
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun prepareGrid(padding: Float) {
        val width = 1200
        val height = 820
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

    init {
        canvasRepository.isGrid.observeForever {
            isGrid = it
            _newCurPath.value = curPath
        }
        prepareGrid(padding = 50F)

        canvasRepository.undo.observeForever {
            undo()
        }
        canvasRepository.redo.observeForever {
            redo()
        }

        canvasRepository.gridSize.observeForever {
            prepareGrid(padding = it.toFloat())
            _newCurPath.value = curPath
        }
    }

    // Undo - Redo
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *  Undo: Remove the last action
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun undo() {
        if (!pathStack.empty())
            redoStack.push(pathStack.pop())
        _newCurPath.value = null
    }

    private fun redo() {
        if (!redoStack.empty())
            pathStack.push(redoStack.pop())
        _newCurPath.value = null
    }


}
