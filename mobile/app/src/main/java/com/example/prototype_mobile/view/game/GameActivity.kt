package com.example.prototype_mobile.view.game

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.view.chat.ChatFragment
import com.example.prototype_mobile.viewmodel.game.*
import com.jaredrummler.android.colorpicker.ColorPickerDialogListener

class GameActivity : AppCompatActivity(), ColorPickerDialogListener {

    private lateinit var gameViewModel: GameViewModel
    private lateinit var colorFragment: ColorFragment


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)

        gameViewModel = ViewModelProvider(this).get(GameViewModel::class.java)

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                    .replace(R.id.containerCanvas, CanvasFragment())
                    .commitNow()
            supportFragmentManager.beginTransaction()
                .replace(R.id.containerChat, ChatFragment())
                .commitNow()

            if (gameViewModel.isPlayerDrawing.value!!) {
                supportFragmentManager.beginTransaction()
                        .replace(R.id.containerTools, ToolsFragment())
                        .commitNow()
                supportFragmentManager.beginTransaction()
                        .replace(R.id.containerGuess, ToolsAdjustmentFragment())
                        .commitNow()
                supportFragmentManager.beginTransaction()
                    .replace(R.id.containerColor, ColorFragment())
                    .commitNow()
                colorFragment =  (findColorFragment() as ColorFragment?)!!
            }
        }

        gameViewModel.isPlayerDrawing.observe(this, Observer {
            if (it) {
                supportFragmentManager.beginTransaction()
                        .replace(R.id.containerTools, ToolsFragment())
                        .commitNow()
                supportFragmentManager.beginTransaction()
                        .replace(R.id.containerGuess, ToolsAdjustmentFragment())
                        .commitNow()
                supportFragmentManager.beginTransaction()
                    .replace(R.id.containerColor, ColorFragment())
                    .commitNow()
                colorFragment =  (findColorFragment() as ColorFragment?)!!
            } else {
                // TODO: Add fragments to guess
            }
        })

    }

    //override must be in activity
    override fun onDialogDismissed(dialogId: Int) {
    }

    override fun onColorSelected(dialogId: Int, color: Int) {
        // Todo: Setter and getter if we want private member in fragment
        colorFragment.viewModel.setColor(color)
        colorFragment.updateButtonColor(color)
    }

    fun findColorFragment(): Fragment? {
        for (fragment in supportFragmentManager.fragments)
            if(fragment is ColorFragment)
                return fragment
        return null
    }
}