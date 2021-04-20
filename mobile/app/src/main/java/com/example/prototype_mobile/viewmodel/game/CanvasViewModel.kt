package com.example.prototype_mobile.viewmodel.game

import android.graphics.*
import android.util.Base64
import android.util.Log
import android.view.MotionEvent
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.model.connection.sign_up.model.Tool
import com.example.prototype_mobile.DrawingEvent
import com.example.prototype_mobile.MouseDown
import com.example.prototype_mobile.PaintedPath
import com.example.prototype_mobile.Vec2
import com.example.prototype_mobile.model.game.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import org.json.JSONException
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.util.*
import kotlin.math.abs


const val GRID_WIDTH = 2f // has to be float
const val TOUCH_TOLERANCE = 12
class CanvasViewModel(private val canvasRepository: CanvasRepository) : ViewModel() {

    // Attribute
    var curPath = Path()
    private var lastCoordsReceive: Vec2 = Vec2(0,0)
    private var motionTouchEventX = 0f
    private var motionTouchEventY = 0f
    private var currentX = 0f
    private var currentY = 0f
    private val mutexStartDrawingThread = Mutex()
    private val textPaint = Paint().apply {
        color = Color.BLACK
        textSize = 30F
        isAntiAlias = true
        isDither = true
    }


    // Repository
    private val toolRepo = ToolRepository.getInstance()
    private val gameRepo = GameRepository.getInstance()

    // Live Data
    private val _newCurPath = MutableLiveData<Path>()
    val newCurPath: LiveData<Path> = _newCurPath

    private val _drawingName = MutableLiveData<String?>()
    var drawingName: LiveData<String?> = _drawingName

    val pathStack = Stack<Pair<Int,PaintedPath>>()
    private var redoStack = Stack<Pair<Int,PaintedPath>>()

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Get the current paint
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun getPaint(): Paint {
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
                    if(toolRepo.selectedTool.value == Tool.PEN) {
                        canvasRepository.touchDownEvent(coord, toolRepo.strokeWidthPen.toInt(), "#"  + Integer.toHexString(paint.color).substring(2), pathStack.size, toolRepo.getOpacity())
                    } else {
                        canvasRepository.touchDownEvent(coord, toolRepo.strokeWidthEraser.toInt(), "#" + Integer.toHexString(paint.color).substring(2), pathStack.size, 1.00)
                    }

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
                toolRepo.setStrokeWidth((touchDown.lineWidth.toFloat() * 1.5).toFloat())
                toolRepo.setStokeOpacity(touchDown.lineOpacity)
                motionTouchEventX = (touchDown.coords.x.toFloat() * 1.5).toFloat()
                motionTouchEventY = (touchDown.coords.y.toFloat() * 1.5).toFloat()
                touchStart(touchDown.strokeNumber)
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
                _newCurPath.postValue(curPath)
            }
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle user event touch down and send data to
     *  the server in live
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun touchStart(strokeNumber: Int) {
        curPath = Path()
        pathStack.push(Pair(strokeNumber, PaintedPath(curPath, toolRepo!!.getPaintCopy())))
        pathStack.sortBy { it.first }
        curPath.moveTo(motionTouchEventX, motionTouchEventY)
        // Add dot for touch feedback
        curPath.lineTo(motionTouchEventX + .01F , motionTouchEventY + .01F)
        currentX = motionTouchEventX
        currentY = motionTouchEventY
        // Call the onDraw() method to update the view
        _newCurPath.postValue(curPath)
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
            _newCurPath.postValue(curPath)
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle user event touch up and send data to
     *  the server in live
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun touchUp() {
        // Undo Redo Feature
        redoStack = Stack<Pair<Int,PaintedPath>>()
    }
    
    // Grid attribute
    var isGrid = false
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

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *  Undo: Remove the last action
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun undo() {
        if (!pathStack.empty())
            redoStack.push(pathStack.pop())
        _newCurPath.postValue(null)
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *  Redo: Add back the last action
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun redo() {
        if (!redoStack.empty())
            pathStack.push(redoStack.pop())
        _newCurPath.postValue(null)
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *  Class the drawing event on the right order (New Eraser)
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private suspend fun onReceivingEvent() {
            mutexStartDrawingThread.lock()
            viewModelScope.launch(Dispatchers.IO) {
                while (!canvasRepository.eraserStrokesList.isEmpty()) {
                    val eraser = canvasRepository.eraserStrokesList.poll()
                    onDrawingEvent(eraser)
                }
                try {
                    while (!canvasRepository.drawingEventList.isEmpty()) {
                        val json = canvasRepository.drawingEventList.poll()
                        if (json != null && !gameRepo!!.isPlayerDrawing.value!!) {
                            val objectString = JSONObject(json).getString("drawingEvent")
                            val objectJson = JSONObject(objectString)
                            val drawingEventReceive = when (objectJson.getString("eventType").toInt()) {
                                EVENT_TOUCH_DOWN -> {
                                    val Jevent = JSONObject(objectJson.getString("event"))
                                    val coords = Vec2(JSONObject(Jevent.getString("coords")).getString("x").toInt(), JSONObject(Jevent.getString("coords")).getString("y").toInt())
                                    val event = try {
                                        MouseDown(Jevent.getString("lineColor"), Jevent.getString("lineWidth").toInt(), Jevent.getString("lineOpacity").toDouble() ,coords, Jevent.getInt("strokeNumber"))
                                    } catch (e: JSONException) {
                                        MouseDown(Jevent.getString("lineColor"), Jevent.getString("lineWidth").toInt(), 1.00 ,coords, Jevent.getInt("strokeNumber"))
                                    }
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

                } catch (e: JSONException) {
                    println("Exception ${e.message} cause by ${e.cause} occurred in onReceivingEvent")
                    println(e)
                } finally {
                    mutexStartDrawingThread.unlock()
                }
            }
    }

    fun updateTransparency(lineColor: String) {
        var alphaInt = Integer.parseInt(lineColor.substring(1,3),16)
        ToolRepository.getInstance()!!.setAlpha(alphaInt)
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Get an image of the drawing
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun getDrawingImage(): String {
        // Draw all path
        val bitmap = Bitmap.createBitmap(1200, 820, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        for (paintedPath in pathStack)
            canvas.drawPath(paintedPath.second.path, paintedPath.second.paint)
        canvas.drawPath(curPath, getPaint())
        // Create drawing image
        val byteArrayOutputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
        val byteArray: ByteArray = byteArrayOutputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.DEFAULT)
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Save the image to the end game repo
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun saveDrawingImage() {
        val image = getDrawingImage()
        EndGameRepository.getInstance()!!.addDrawingImage(image)
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
            if(it.eventType == EVENT_CLEAR)
                canvasRepository.setGrid(false)
            onDrawingEvent(it)
        }
        canvasRepository.drawingEventServer.observeForever {
            viewModelScope.launch(Dispatchers.IO) {
                onReceivingEvent()
            }
        }
        GameRepository.getInstance()!!.drawingName.observeForever {
            _drawingName.postValue(it)
        }
        GameRepository.getInstance()!!.saveDrawingImage.observeForever {
            saveDrawingImage()
        }
    }
}
