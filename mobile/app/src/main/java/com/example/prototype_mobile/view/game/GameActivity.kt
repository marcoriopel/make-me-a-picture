package com.example.prototype_mobile.view.game

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
import com.example.prototype_mobile.R
import com.example.prototype_mobile.view.chat.ChatFragment

class GameActivity : AppCompatActivity() {


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_game)
        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                    .replace(R.id.containerCanvas, CanvasFragment())
                    .commitNow()
            supportFragmentManager.beginTransaction()
                .replace(R.id.containerChat, ChatFragment())
                .commitNow()
            supportFragmentManager.beginTransaction()
                .replace(R.id.containerTools, ToolsFragment())
                .commitNow()
            supportFragmentManager.beginTransaction()
                .replace(R.id.containerGuess, ToolsAdjustmentFragment())
                .commitNow()
        }
    }
}