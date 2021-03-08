package com.example.prototype_mobile.viewmodel.game

import android.view.MotionEvent
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.game.CanvasRepository

class CanvasViewModel(private val canvasRepository: CanvasRepository) : ViewModel() {

    fun onTouchEvent(action: Int, x: Float, y: Float, touchTolerance: Int = 0) {
        canvasRepository.setTouchEvent(x, y)
        when(action) {
            MotionEvent.ACTION_DOWN -> canvasRepository.touchStart()
            MotionEvent.ACTION_MOVE -> canvasRepository.touchMove(touchTolerance)
            MotionEvent.ACTION_UP -> canvasRepository.touchUp()
        }
    }


}