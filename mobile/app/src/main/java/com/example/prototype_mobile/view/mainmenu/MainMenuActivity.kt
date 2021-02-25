package com.example.prototype_mobile.view.mainmenu

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.prototype_mobile.R

class MainMenuActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main_menu)
        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                    .replace(R.id.container, GameCreationFragment.newInstance())
                    .commitNow()
        }
    }
}