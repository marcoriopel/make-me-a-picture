package com.example.prototype_mobile.view.game
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.view.MotionEvent
import android.view.View
import com.example.prototype_mobile.viewmodel.game.CanvasViewModel
import java.io.FileOutputStream


private const val STROKE_WIDTH = 12f // has to be float

// Inspired by: https://developer.android.com/codelabs/advanced-android-kotlin-training-canvas#5
class MyCanvasView(context: Context,val canvasViewModel: CanvasViewModel) : View(context) {

    private lateinit var gridBitmap: Bitmap
    private var bitmap = Bitmap.createBitmap(1200, 820, Bitmap.Config.ARGB_8888)

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // Color background white
        canvas.drawColor(-1)

        if (!(canvasViewModel.pathStack.empty() && canvasViewModel.curPath.isEmpty)) {
            // Draw the drawing so far
            for (paintedPath in canvasViewModel.pathStack) {
                canvas.drawPath(paintedPath.second.path, paintedPath.second.paint)
            }
        }

        // Add if to activate / unactivated the grid
        if (canvasViewModel.isGrid) {
            gridBitmap = canvasViewModel.getGrid()
            canvas.drawBitmap(gridBitmap, 0F, 0F, null)
        }

        // Add the word to draw on the upper left of the canvas
        val word = canvasViewModel.getDrawingWord()
        if (word != null) {
            canvas.drawText("Le mot à dessiner est: $word", 10F, 30F, canvasViewModel.getTextPaint())
        }

    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        return canvasViewModel.onTouchEvent(event)
    }

}
