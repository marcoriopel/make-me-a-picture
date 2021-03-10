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
const val GRID_WIDTH = 2f // has to be float

// Inspired by: https://developer.android.com/codelabs/advanced-android-kotlin-training-canvas#5
class MyCanvasView(context: Context,val canvasViewModel: CanvasViewModel) : View(context) {

    private val drawColor = ResourcesCompat.getColor(resources, R.color.colorPaint, null)
    private val touchTolerance = ViewConfiguration.get(context).scaledTouchSlop

    // Grid
    private lateinit var gridBitmap: Bitmap
    private val gridColor = ResourcesCompat.getColor(resources, R.color.gridColor, null)


    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawColor(-1)
        // Draw the drawing so far
        canvas.drawPath(canvasViewModel.drawing, paint)
        // Draw any current squiggle
        canvas.drawPath(canvasViewModel.curPath, paint)

        // Add if to activate / unactivated the grid
        if (canvasViewModel.isGrid) {
            gridBitmap = canvasViewModel.getGrid()
            canvas.drawBitmap(gridBitmap, 0f, 0f, null)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        return canvasViewModel.onTouchEvent(event, touchTolerance)
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

}
