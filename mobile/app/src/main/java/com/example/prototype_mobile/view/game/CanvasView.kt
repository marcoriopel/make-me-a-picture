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

// Inspired by: https://developer.android.com/codelabs/advanced-android-kotlin-training-canvas#5
class MyCanvasView(context: Context,val canvasViewModel: CanvasViewModel) : View(context) {

    private val drawColor = ResourcesCompat.getColor(resources, R.color.colorPaint, null)
    // Grid
    private lateinit var gridBitmap: Bitmap
    private val gridColor = ResourcesCompat.getColor(resources, R.color.gridColor, null)


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
        if (canvasViewModel.isGrid) {
            gridBitmap = canvasViewModel.getGrid()
            canvas.drawBitmap(gridBitmap, 0f, 0f, null)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        return canvasViewModel.onTouchEvent(event)
    }

}
