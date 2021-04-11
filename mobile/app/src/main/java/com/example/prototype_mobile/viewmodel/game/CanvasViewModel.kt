package com.example.prototype_mobile.viewmodel.game

import android.graphics.*
import android.view.MotionEvent
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.game.*
import org.json.JSONObject
import java.io.FileOutputStream
import java.util.*
import kotlin.Exception
import kotlin.math.abs

const val GRID_WIDTH = 2f // has to be float
const val TOUCH_TOLERANCE = 12
class CanvasViewModel(private val canvasRepository: CanvasRepository) : ViewModel() {

    private var lastCoordsReceive: Vec2 = Vec2(0,0)
    // Path
    private var motionTouchEventX = 0f
    private var motionTouchEventY = 0f
    private var currentX = 0f
    private var currentY = 0f
    var curPath = Path()
    private val _newCurPath = MutableLiveData<Path>()
    val newCurPath: LiveData<Path> = _newCurPath

    private val _drawingName = MutableLiveData<String?>()
    var drawingName: LiveData<String?> = _drawingName

    // Undo-Redo
    val pathStack = Stack<PaintedPath>()
    private var redoStack = Stack<PaintedPath>()

    // Repository
    private val toolRepo = ToolRepository.getInstance()
    private val gameRepo = GameRepository.getInstance()

    // Text Paint
    private val textPaint = Paint().apply {
        color = Color.BLACK
        textSize = 30F
        isAntiAlias = true
        isDither = true
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Get the current paint
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun getPaint(): Paint {
        return toolRepo!!.getPaint()
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Get the paint for the text
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun getTextPaint(): Paint {
        return textPaint
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Get the current paint
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun getDrawingWord(): String? {
        return _drawingName.value
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Dispatch user event
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun onTouchEvent(event: MotionEvent): Boolean {
        if(gameRepo!!.isPlayerDrawing.value!!) {
            val coord = Vec2((event.x.toInt() / 1.5).toInt(), (event.y.toInt() / 1.5).toInt())
            when (event.action) {
                MotionEvent.ACTION_MOVE -> canvasRepository.touchMoveEvent(coord)
                MotionEvent.ACTION_UP -> canvasRepository.touchUpEvent(coord)
                MotionEvent.ACTION_DOWN -> {
                    val paint = toolRepo!!.getPaint()
                    canvasRepository.touchDownEvent(coord, paint.strokeWidth.toInt(), "#" + Integer.toHexString(paint.color).substring(2))
                }
            }
        }
        return true
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Dispatch socketEvent
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun onDrawingEvent(drawingEvent: DrawingEvent ) {
        when(drawingEvent.eventType) {
            EVENT_TOUCH_DOWN -> {
                val touchDown: MouseDown = drawingEvent.event as MouseDown
                toolRepo!!.setColorByValue(touchDown.lineColor)
                toolRepo.setStrokeWidth(touchDown.lineWidth.toFloat())
                motionTouchEventX = (touchDown.coords.x.toFloat() * 1.5).toFloat()
                motionTouchEventY = (touchDown.coords.y.toFloat() * 1.5).toFloat()
                touchStart()
            }
            EVENT_TOUCH_MOVE -> {
                val touchMove: Vec2 = drawingEvent.event as Vec2
                motionTouchEventX = (touchMove.x.toFloat() * 1.5).toFloat()
                motionTouchEventY = (touchMove.y.toFloat() * 1.5).toFloat()
                touchMove()
            }
            EVENT_TOUCH_UP -> {
                val touchUp: Vec2 = drawingEvent.event as Vec2
                motionTouchEventX = (touchUp.x.toFloat() * 1.5).toFloat()
                motionTouchEventY = (touchUp.y.toFloat() * 1.5).toFloat()
                touchUp()
            }
            EVENT_UNDO -> {
                undo()
            }
            EVENT_REDO ->{
                redo()
            }
            EVENT_CLEAR ->{
                pathStack.clear()
                redoStack.clear()
                curPath.reset()
                _newCurPath.value = curPath
            }
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

        currentX = motionTouchEventX
        currentY = motionTouchEventY

        // Call the onDraw() method to update the view
        _newCurPath.value = curPath
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle user event touch move and send data to
     *  the server in live
     *  -> Bezier quadratic is use so it smoother (Important)
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
     private fun touchMove() {
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
    private fun prepareGrid(padding: Float) {
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

   private fun onReceivingEvent() {
       while (!canvasRepository.drawingEventList.isEmpty()) {
           val json = canvasRepository.drawingEventList.poll()
           if (json != null && !gameRepo!!.isPlayerDrawing.value!!) {
               val objectString = JSONObject(json).getString("drawingEvent")
               val objectJson = JSONObject(objectString)
               // try {
               val drawingEventReceive = when (objectJson.getString("eventType").toInt()) {
                   EVENT_TOUCH_DOWN -> {
                       val Jevent = JSONObject(objectJson.getString("event"))
                       val coords = Vec2(JSONObject(Jevent.getString("coords")).getString("x").toInt(), JSONObject(Jevent.getString("coords")).getString("y").toInt())
                       val event = MouseDown(Jevent.getString("lineColor"), Jevent.getString("lineWidth").toInt(), coords)
                       DrawingEvent(EVENT_TOUCH_DOWN, event, objectJson.getString("gameId"))
                   }
                   EVENT_TOUCH_MOVE -> {
                       lastCoordsReceive = Vec2(JSONObject(objectJson.getString("event")).getString("x").toInt(), JSONObject(objectJson.getString("event")).getString("y").toInt())
                       DrawingEvent(EVENT_TOUCH_MOVE, lastCoordsReceive, objectJson.getString("gameId"))
                   }
                   EVENT_TOUCH_UP -> {
                       DrawingEvent(EVENT_TOUCH_UP, lastCoordsReceive, objectJson.getString("gameId"))
                   }
                   else -> {
                       DrawingEvent(objectJson.getString("eventType").toInt(), null, objectJson.getString("gameId"))
                   }
               }
               onDrawingEvent(drawingEventReceive)
           }
       }
   }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Get an image of the drawing
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun getDrawingImage(): FileOutputStream? {
        // Draw all path
        val bitmap = Bitmap.createBitmap(1200, 820, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        for (paintedPath in pathStack)
            canvas.drawPath(paintedPath.path, paintedPath.paint)
        canvas.drawPath(curPath, getPaint())
        // Create drawing image
        val fos: FileOutputStream? = null
        val isCompress = bitmap.compress(Bitmap.CompressFormat.PNG, 95, fos);
        if (isCompress)
            return fos
        else
            throw Exception("Not able to compress image")
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Save the image to the end game repo
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun saveDrawingImage() {
        val image = getDrawingImage()
        if (image != null)
            EndGameRepository.getInstance()!!.addDrawingImage(image)
        else
            throw Exception("Image is null")
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Bind observer
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    init {
        prepareGrid(padding = 50F)
        canvasRepository.isGrid.observeForever {
            isGrid = it
            _newCurPath.value = curPath
        }
        canvasRepository.gridSize.observeForever {
            prepareGrid(padding = it.toFloat())
            _newCurPath.value = curPath
        }
        canvasRepository.drawingEvent.observeForever {
            onDrawingEvent(it)
        }
        canvasRepository.drawingEventServer.observeForever {
            onReceivingEvent()
        }
        GameRepository.getInstance()!!.drawingName.observeForever {
            _drawingName.postValue(it)
        }
        GameRepository.getInstance()!!.saveDrawingImage.observeForever {
            saveDrawingImage()
        }
    }
}
