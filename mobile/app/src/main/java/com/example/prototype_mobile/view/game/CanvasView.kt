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
import com.example.prototype_mobile.viewmodel.game.CanvasViewModel
import java.util.*
import kotlin.math.abs

private const val STROKE_WIDTH = 12f // has to be float
private const val GRID_WIDTH = 2f // has to be float

// Inspired by: https://developer.android.com/codelabs/advanced-android-kotlin-training-canvas#5
class MyCanvasView(context: Context,val canvasViewModel: CanvasViewModel) : View(context) {

    private val drawColor = ResourcesCompat.getColor(resources, R.color.colorPaint, null)
    private val touchTolerance = ViewConfiguration.get(context).scaledTouchSlop

    // Grid
    private var isGrid = false;
    private lateinit var gridBitmap: Bitmap
    private lateinit var gridCanvas: Canvas
    private val gridColor = ResourcesCompat.getColor(resources, R.color.gridColor, null)

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

        // Color background white
        canvas.drawColor(-1)

        // Draw the drawing so far
        for (paintedPath in canvasViewModel.pathStack)
            canvas.drawPath(paintedPath.path, paintedPath.paint)
        // Draw any current squiggle
        canvas.drawPath(canvasViewModel.curPath, canvasViewModel.getPaint())

        // Add if to activate / unactivated the grid
        if (isGrid)
            canvas.drawBitmap(gridBitmap, 0f, 0f, null)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        return canvasViewModel.onTouchEvent(event, touchTolerance)
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
