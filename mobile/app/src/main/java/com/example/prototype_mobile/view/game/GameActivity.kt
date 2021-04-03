package com.example.prototype_mobile.view.game

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.view.chat.ChatFragment
import com.example.prototype_mobile.viewmodel.game.*
import com.example.prototype_mobile.databinding.ActivityGameBinding
import com.example.prototype_mobile.databinding.FragmentEndGameBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.jaredrummler.android.colorpicker.ColorPickerDialogListener

class GameActivity : AppCompatActivity(), ColorPickerDialogListener {

    private lateinit var gameViewModel: GameViewModel
    private lateinit var colorFragment: ColorFragment
    private lateinit var canvasViewModel: CanvasViewModel
    private lateinit var binding: ActivityGameBinding


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)


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
                if(gameViewModel.gameRepository.gameType == GameType.CLASSIC) {
                    //When connecting to the game transition state is null since it doesn't receive can't set a timer
                    if (gameViewModel.transitionState.value != null) {
                        //Right of reply. We don't want to display hint button
                        if (gameViewModel.transitionState.value!!.state != 1) {
                            hintFragment()
                        }
                    }
                    //If guessing when starting the game
                    else if(gameViewModel.isPlayerGuessing.value!!) {
                        hintFragment()
                    }
                }
                //Coop always have a hintFragment.
                else {
                    hintFragment()
                }

            } else {
                for (fragment in supportFragmentManager.fragments) {
                    if(fragment is GuessFragment || fragment is HintFragment) {
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
        if (gameViewModel.gameTypeViewModel == GameType.CLASSIC) {
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
            supportFragmentManager.beginTransaction().replace(R.id.containerTools, HintFragment()).commitNow()
        }
    }
    override fun onResume() {
        super.onResume()
        println("OnResume")
        setUpGameInit()
    }
    fun hintFragment(){
        supportFragmentManager.beginTransaction()
                .replace(R.id.containerTools, HintFragment())
                .commitNow()
    }

}
