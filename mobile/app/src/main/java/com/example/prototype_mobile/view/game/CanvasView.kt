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
import com.example.prototype_mobile.R
import kotlin.math.abs

private const val STROKE_WIDTH = 12f // has to be float
private const val GRID_WIDTH = 2f // has to be float

// Inspired by: https://developer.android.com/codelabs/advanced-android-kotlin-training-canvas#5
class MyCanvasView(context: Context) : View(context) {

    private lateinit var extraCanvas: Canvas
    private lateinit var extraBitmap: Bitmap
    private val backgroundColor = ResourcesCompat.getColor(resources, R.color.colorBackground, null)
    private val drawColor = ResourcesCompat.getColor(resources, R.color.colorPaint, null)
    private var path = Path()
    private var motionTouchEventX = 0f
    private var motionTouchEventY = 0f
    private var currentX = 0f
    private var currentY = 0f
    private val touchTolerance = ViewConfiguration.get(context).scaledTouchSlop
    // Path representing the drawing so far
    private val drawing = Path()
    // Path representing what's currently being drawn
    private val curPath = Path()

    // Grid
    private var isGrid = true;
    private lateinit var gridBitmap: Bitmap
    private lateinit var gridCanvas: Canvas
    private val gridColor = ResourcesCompat.getColor(resources, R.color.gridColor, null)

    override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
        super.onSizeChanged(width, height, oldWidth, oldHeight)

        // BITMAP VERSION
//        if (::extraBitmap.isInitialized)
//            extraBitmap.recycle()
//
//        extraBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
//        extraCanvas = Canvas(extraBitmap)
//        extraCanvas.drawColor(backgroundColor)

        gridBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        gridCanvas = Canvas(gridBitmap)

        var x = 0F
        while(x < width) {
            gridCanvas.drawLine(x, 0F, x, height.toFloat(), gridPaint)
            x += 50F
        }
        var y = 0F
        while(y < height) {
            gridCanvas.drawLine(0F, y, width.toFloat(), y, gridPaint)
            y += 50F
        }

    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // BITMAP VERSION
//          canvas.drawBitmap(extraBitmap, 0f, 0f, null)

        // PATH VERSION
            // Draw the drawing so far
            canvas.drawPath(drawing, paint)
            // Draw any current squiggle
            canvas.drawPath(curPath, paint)

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
        // BITMAP VERSION
//          path.reset()
//          path.moveTo(motionTouchEventX, motionTouchEventY)
        // PATH VERSION
            curPath.reset()
            curPath.moveTo(motionTouchEventX, motionTouchEventY)
            // Add dot for touch feedback
            curPath.lineTo(motionTouchEventX + .01F , motionTouchEventY + .01F)

        // Call the onDraw() method to update the view
        invalidate()
        currentX = motionTouchEventX
        currentY = motionTouchEventY
    }

    private fun touchMove() {
        val dx = abs(motionTouchEventX - currentX)
        val dy = abs(motionTouchEventY - currentY)
        if (dx >= touchTolerance || dy >= touchTolerance) {
            // QuadTo() adds a quadratic bezier from the last point,
            // approaching control point (x1,y1), and ending at (x2,y2).

            // BITMAP VERSION
//              path.quadTo(currentX, currentY, (motionTouchEventX + currentX) / 2, (motionTouchEventY + currentY) / 2)
//              currentX = motionTouchEventX
//              currentY = motionTouchEventY
                // Draw the path in the extra bitmap to cache it.
//              extraCanvas.drawPath(path, paint)

            // PATH VERSION
                curPath.quadTo(currentX, currentY, (motionTouchEventX + currentX) / 2, (motionTouchEventY + currentY) / 2)
                currentX = motionTouchEventX
                currentY = motionTouchEventY

            // TODO: Add current point to data struct to send to the other player
        }
        // Call the onDraw() method to update the view
        invalidate()

    }

    private fun touchUp() {
        // Reset the path so it doesn't get drawn again.
        // BITMAP VERSION
//          path.reset()

        // PATH VERSION
            // Add the current path to the drawing so far
            drawing.addPath(curPath)
            // Rewind the current path for the next touch
            curPath.reset()
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
