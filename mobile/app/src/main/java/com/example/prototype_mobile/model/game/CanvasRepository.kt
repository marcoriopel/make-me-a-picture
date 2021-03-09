package com.example.prototype_mobile.model.game

import android.graphics.Path
import com.example.prototype_mobile.Coord
import com.example.prototype_mobile.PathPaint
import com.example.prototype_mobile.Stroke
import java.util.*
import kotlin.math.abs

class CanvasRepository {

    // (Future feature) Save Drawing
    var coordPath = mutableListOf<Coord>()
    val strokeList = mutableListOf<Stroke>()

}