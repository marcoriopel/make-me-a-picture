package com.example.prototype_mobile.view.game

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
import com.example.prototype_mobile.R

class GameActivity : AppCompatActivity() {


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


//        val myCanvasView =
//            MyCanvasView(this)
//        myCanvasView.systemUiVisibility = SYSTEM_UI_FLAG_FULLSCREEN
//        myCanvasView.contentDescription = getString(R.string.canvasContentDescription)
//        setContentView(myCanvasView)

        setContentView(R.layout.activity_game)
        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                    .replace(R.id.container, CanvasFragment.newInstance())
                    .commitNow()
        }
    }
}