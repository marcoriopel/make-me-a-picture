package com.example.prototype_mobile.view.game

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.view.chat.ChatFragment
import com.example.prototype_mobile.viewmodel.game.GameViewModel
import com.example.prototype_mobile.viewmodel.game.ToolsAdjustmentViewModel
import com.example.prototype_mobile.viewmodel.game.ToolsViewModel
import com.example.prototype_mobile.viewmodel.game.ToolsViewModelFactory
import com.jaredrummler.android.colorpicker.ColorPickerDialogListener

class GameActivity : AppCompatActivity(), ColorPickerDialogListener {

    private lateinit var gameViewModel: GameViewModel
    private lateinit var toolFragment: ToolsFragment


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
                toolFragment =  (findToolFragment() as ToolsFragment?)!!
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
                toolFragment =  (findToolFragment() as ToolsFragment?)!!
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
        val previousColor = toolFragment.primaryColor
        toolFragment.newColorSelectionArrayUpdate(previousColor)
        toolFragment.primaryColor= color
        toolFragment.viewModel.setColor(color)
        toolFragment.updateButtonColor(color)
        toolFragment.populateSecondaryColor(toolFragment.colorList)
    }

    fun findToolFragment(): Fragment? {
        for (fragment in supportFragmentManager.fragments)
            if(fragment is ToolsFragment)
                return fragment
        return null
    }
}