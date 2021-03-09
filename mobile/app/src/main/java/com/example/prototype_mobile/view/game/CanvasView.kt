package com.example.prototype_mobile.view.game
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import androidx.core.content.res.ResourcesCompat
import com.example.prototype_mobile.*
import java.util.*
import kotlin.math.abs

private const val STROKE_WIDTH = 12f // has to be float
private const val GRID_WIDTH = 2f // has to be float

// Inspired by: https://developer.android.com/codelabs/advanced-android-kotlin-training-canvas#5
class MyCanvasView(context: Context) : View(context) {

    private val drawColor = ResourcesCompat.getColor(resources, R.color.colorPaint, null)
    private var motionTouchEventX = 0f
    private var motionTouchEventY = 0f
    private var currentX = 0f
    private var currentY = 0f
    private val touchTolerance = ViewConfiguration.get(context).scaledTouchSlop
    // Path representing the drawing so far
    private val drawing = Path()
    // Path representing what's currently being drawn
    private val curPath = Path()

    // (Future feature) Save Drawing
    private var coordPath = mutableListOf<Coord>()
    private val strokeList = mutableListOf<Stroke>()

    // Grid
    private var isGrid = false;
    private lateinit var gridBitmap: Bitmap
    private lateinit var gridCanvas: Canvas
    private val gridColor = ResourcesCompat.getColor(resources, R.color.gridColor, null)

    // Undo Redo
    private val undoStack = Stack<PathPaint>()
    private var redoStack = Stack<PathPaint>()

    override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
        super.onSizeChanged(width, height, oldWidth, oldHeight)

        // Create grid canvas
        gridBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        gridCanvas = Canvas(gridBitmap)
        var x = 0F
        while(x < width) {
            gridCanvas.drawLine(x, 0F, x, height.toFloat(), gridPaint)
            x += 50F // Change this value to change the grid size
        }
        var y = 0F
        while(y < height) {
            gridCanvas.drawLine(0F, y, width.toFloat(), y, gridPaint)
            y += 50F // Change this value to change the grid size
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawColor(-1)
        // Draw the drawing so far
        canvas.drawPath(drawing, paint)
        // Draw any current squiggle
        canvas.drawPath(curPath, paint)

        // Add if to activate / unactivated the grid
        if (isGrid)
            canvas.drawBitmap(gridBitmap, 0f, 0f, null)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        motionTouchEventX = event.x
        motionTouchEventY = event.y

        when (event.action) {
            MotionEvent.ACTION_DOWN -> touchStart()
            MotionEvent.ACTION_MOVE -> touchMove()
            MotionEvent.ACTION_UP -> touchUp()
        }
        return true
    }

    private fun touchStart() {
        curPath.reset()
        curPath.moveTo(motionTouchEventX, motionTouchEventY)
        // Add dot for touch feedback
        curPath.lineTo(motionTouchEventX + .01F , motionTouchEventY + .01F)

        // Call the onDraw() method to update the view
        invalidate()
        currentX = motionTouchEventX
        currentY = motionTouchEventY
        val coord = Coord(currentX, currentY)

        // TODO: Send path start

        // (Future feature) Save Drawing
        coordPath = mutableListOf<Coord>()
        coordPath.add(coord)
    }

    private fun touchMove() {
        val dx = abs(motionTouchEventX - currentX)
        val dy = abs(motionTouchEventY - currentY)
        if (dx >= touchTolerance || dy >= touchTolerance) {
            // QuadTo() adds a quadratic bezier from the last point,
            // approaching control point (x1,y1), and ending at (x2,y2).
            curPath.quadTo(currentX, currentY, (motionTouchEventX + currentX) / 2, (motionTouchEventY + currentY) / 2)
            currentX = motionTouchEventX
            currentY = motionTouchEventY
            val coord = Coord(currentX, currentY)

            // TODO: Send path update

            // (Future feature) Save Drawing
            coordPath.add(coord)
        }
        // Call the onDraw() method to update the view
        invalidate()

    }

    private fun touchUp() {
        // Undo Redo Feature
        redoStack = Stack<PathPaint>()
        undoStack.push(PathPaint(curPath, paint))

        // Add the current path to the drawing so far
        drawing.addPath(curPath)
        // Rewind the current path for the next touch
        curPath.reset()

        // TODO: Send path end

        // (Future feature) Save Drawing
        strokeList.add(Stroke(coordPath, STROKE_WIDTH, paint.color.toString()))
    }

    private val paint = Paint().apply {
        color = drawColor
        // Smooths out edges of what is drawn without affecting shape.
        isAntiAlias = true
        // Dithering affects how colors with higher-precision than the device are down-sampled.
        isDither = true
        style = Paint.Style.STROKE // default: FILL
        strokeJoin = Paint.Join.ROUND // default: MITER
        strokeCap = Paint.Cap.ROUND // default: BUTT
        strokeWidth = STROKE_WIDTH // default: Hairline-width (really thin)
    }

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

}
