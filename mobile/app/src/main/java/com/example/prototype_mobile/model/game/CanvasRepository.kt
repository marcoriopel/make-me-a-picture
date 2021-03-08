package com.example.prototype_mobile.model.game

import android.graphics.Path
import com.example.prototype_mobile.Coord
import com.example.prototype_mobile.PathPaint
import com.example.prototype_mobile.Stroke
import java.util.*
import kotlin.math.abs

class CanvasRepository {

    private var motionTouchEventX = 0f
    private var motionTouchEventY = 0f
    private var currentX = 0f
    private var currentY = 0f
    private val toolRepo = ToolRepository.getInstance()

    // Path representing the drawing so far
    private val drawing = Path()
    // Path representing what's currently being drawn
    private val curPath = Path()

    // (Future feature) Save Drawing
    private var coordPath = mutableListOf<Coord>()
    private val strokeList = mutableListOf<Stroke>()

    // Undo Redo
    private val undoStack = Stack<PathPaint>()
    private var redoStack = Stack<PathPaint>()

    fun setTouchEvent(x: Float, y: Float) {
        motionTouchEventX = x
        motionTouchEventY = y
    }

    fun touchStart() {
        curPath.reset()
        curPath.moveTo(motionTouchEventX, motionTouchEventY)
        // Add dot for touch feedback
        curPath.lineTo(motionTouchEventX + .01F , motionTouchEventY + .01F)

        // Call the onDraw() method to update the view
        currentX = motionTouchEventX
        currentY = motionTouchEventY
        val coord = Coord(currentX, currentY)

        // TODO: Send path start

        // (Future feature) Save Drawing
        coordPath = mutableListOf<Coord>()
        coordPath.add(coord)
    }

    fun touchMove(touchTolerance: Int) {
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

    }

    fun touchUp() {
        // Undo Redo Feature
        redoStack = Stack<PathPaint>()
        if (toolRepo != null) {
            undoStack.push(PathPaint(curPath, toolRepo.getPaint()))
        }

        // Add the current path to the drawing so far
        drawing.addPath(curPath)
        // Rewind the current path for the next touch
        curPath.reset()

        // TODO: Send path end

        // (Future feature) Save Drawing
        val paint = toolRepo?.getPaint()
        if (paint != null) {
            strokeList.add(Stroke(coordPath, paint.strokeWidth, paint.color.toString()))
        }
    }

}