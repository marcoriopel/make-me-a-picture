package com.example.prototype_mobile.view.game

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.KeyEvent
import android.view.Menu
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.view.MenuCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.view.chat.ChatFragment
import com.example.prototype_mobile.viewmodel.game.*
import com.example.prototype_mobile.databinding.ActivityGameBinding
import com.example.prototype_mobile.databinding.FragmentEndGameBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.util.Drawable
import com.jaredrummler.android.colorpicker.ColorPickerDialogListener

class GameActivity : AppCompatActivity(), ColorPickerDialogListener {

    private lateinit var gameViewModel: GameViewModel
    private lateinit var colorFragment: ColorFragment
    private lateinit var canvasViewModel: CanvasViewModel
    private lateinit var binding: ActivityGameBinding

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        val inflater = menuInflater
        inflater.inflate(R.menu.gamemenu, menu)
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.my_toolbar)
        toolbar.setTitleTextColor(ContextCompat.getColor(applicationContext, R.color.white))
        setSupportActionBar(toolbar)

        gameViewModel = ViewModelProvider(this).get(GameViewModel::class.java)
        binding = ActivityGameBinding.inflate(layoutInflater)
        canvasViewModel = ViewModelProvider(this, CanvasViewModelFactory())
                .get(CanvasViewModel::class.java)

        if (savedInstanceState == null) {
            setUpGameInit()
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
                for (fragment in supportFragmentManager.fragments) {
                    if(checkIfDrawingFragment(fragment)) {
                        supportFragmentManager.beginTransaction().remove(fragment).commit();
                    }
                }
            }
        })

        gameViewModel.isPlayerGuessing.observe(this, Observer {
            if (it) {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.containerGuess, GuessFragment())
                    .commitNow()
            } else {
                for (fragment in supportFragmentManager.fragments) {
                    if(fragment is GuessFragment) {
                        supportFragmentManager.beginTransaction().remove(fragment).commit();
                    }
                }
            }
        })

        gameViewModel.isGameEnded.observe(this, Observer {
            if(gameViewModel.isGameEnded.value!! && gameViewModel.isGameEnded.value != null)
                endGameEvent()
        })
        gameViewModel.transitionMessage.observe(this, Observer{
            val toast = Toast.makeText(applicationContext, it, Toast.LENGTH_LONG)
            toast.show()
        })

        gameViewModel.suggestions.observe(this, Observer {
            if (it != null) {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.containerCanvas, ChooseWordFragment())
                    .commitNow()
                for (fragment in supportFragmentManager.fragments) {
                    if(fragment is ChooseWordFragment) {
                        fragment.bindButton()
                    }
                }

            } else {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.containerCanvas, CanvasFragment(canvasViewModel))
                    .commitNow()
            }
        })

    }
    fun checkIfDrawingFragment(fragment: Fragment): Boolean {
        return fragment is ToolsFragment || fragment is ToolsAdjustmentFragment || fragment is ColorFragment
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
    
    fun endGameEvent() {

        for(fragment in supportFragmentManager.fragments)
            if(fragment is ColorFragment || fragment is ToolsAdjustmentFragment || fragment is CanvasFragment || fragment is ToolsFragment || fragment is GuessFragment || fragment is GameInfoFragment) {
                supportFragmentManager.beginTransaction().remove(fragment).commit()
                supportFragmentManager.beginTransaction().replace(R.id.containerCanvas, EndGameFragment()).commitNow()
            }

    }

    //maybe we will need to
    override fun onRestart() {
        super.onRestart()
        println("Restart")

    }

    fun setUpGameInit() {
        supportFragmentManager.beginTransaction()
            .replace(R.id.containerCanvas, CanvasFragment(canvasViewModel))
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
        if (gameViewModel.getGameType() == GameType.CLASSIC) {
            supportFragmentManager.beginTransaction()
                    .replace(R.id.containerGameInfo, GameInfoFragment())
                    .commit()
        } else {
            supportFragmentManager.beginTransaction()
                    .replace(R.id.containerGameInfo, SprintInfoFragment())
                    .commit()
        }

        if (gameViewModel.isPlayerGuessing.value!!) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.containerGuess, GuessFragment())
                .commitNow()
        }
    }
    override fun onResume() {
        super.onResume()
        println("OnResume")
        setUpGameInit()
    }
    override fun onBackPressed() {
        Toast.makeText(
                applicationContext,
                "Il n'est pas possible d'utiliser le bouton back dans l'application",
                Toast.LENGTH_LONG
        ).show()
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_ENTER -> {
                for(fragment in supportFragmentManager.fragments) {
                    if (fragment is GuessFragment)
                        fragment.onKeyEnter()
                    if (fragment is ChatFragment)
                        fragment.onKeyEnter()
                }
                true
            }
            else -> super.onKeyUp(keyCode, event)
        }
    }

}
