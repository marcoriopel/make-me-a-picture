package com.example.prototype_mobile.view.mainmenu

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.prototype_mobile.R
import com.example.prototype_mobile.view.chat.ChatFragment

class MainMenuActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main_menu)
        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                    .replace(R.id.container, GameCreationFragment.newInstance())
                    .commitNow()
            supportFragmentManager.beginTransaction().replace(R.id.center, GameParameterFragment.newInstance()).commit()
            supportFragmentManager.beginTransaction()
                .replace(R.id.container2, GameListFragment.newInstance())
                .commitNow()
            supportFragmentManager.beginTransaction()
                    .replace(R.id.container3, ChatFragment.newInstance())
                    .commitNow()
        }
    }
}