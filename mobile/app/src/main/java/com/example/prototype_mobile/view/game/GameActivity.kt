package com.example.prototype_mobile.view.game

import android.content.Intent
import android.graphics.Color
import android.media.MediaPlayer
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.ActivityGameBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.view.chat.ChatFragment
import com.example.prototype_mobile.view.game.endgame.StaticEndGame
import com.example.prototype_mobile.viewmodel.game.CanvasViewModel
import com.example.prototype_mobile.viewmodel.game.CanvasViewModelFactory
import com.example.prototype_mobile.viewmodel.game.GameViewModel
import com.jaredrummler.android.colorpicker.ColorPickerDialogListener
import nl.dionsegijn.konfetti.KonfettiView
import nl.dionsegijn.konfetti.models.Shape
import nl.dionsegijn.konfetti.models.Size


class GameActivity : AppCompatActivity(), ColorPickerDialogListener {

    private lateinit var gameViewModel: GameViewModel
    private lateinit var colorFragment: ColorFragment
    private lateinit var canvasViewModel: CanvasViewModel
    private lateinit var binding: ActivityGameBinding
    private var mediaPlayer: MediaPlayer? = null

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
        gameViewModel.countDownSound.observe(this, Observer {
            if (it) {
                mediaPlayer = MediaPlayer.create(this, R.raw.countdown)
                mediaPlayer?.start()
            }
        })

        gameViewModel.tikSound.observe(this, Observer {
            if (it) {
                mediaPlayer = MediaPlayer.create(this, R.raw.tick)
                mediaPlayer?.start()
            } else {
                if(gameViewModel.countDownSound.value != null)
                    if(!gameViewModel.countDownSound.value!!)
                        mediaPlayer?.stop()
            }
        })
    }

    private fun burstKonfetti() {
        val konfettiView: KonfettiView = findViewById(R.id.viewKonfetti)

        val drawable = ContextCompat.getDrawable(applicationContext, R.drawable.ic_heart);
        val drawableShape = drawable?.let { Shape.DrawableShape(it, true) }
        konfettiView.build()
            .addColors(Color.YELLOW, Color.GREEN, Color.RED, Color.BLUE, Color.CYAN, Color.MAGENTA)
            .setDirection(0.0, 359.0)
            .setSpeed(1f, 5f)
            .setFadeOutEnabled(true)
            .setTimeToLive(2000L)
            .addShapes(Shape.Square, Shape.Circle, drawableShape!!)
            .addSizes(Size(12, 5f))
            .setPosition(
                konfettiView.x + 800,
                konfettiView.y + 350
            )
            .burst(100)
    }

    private fun checkIfDrawingFragment(fragment: Fragment): Boolean {
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

    private fun findColorFragment(): Fragment? {
        for (fragment in supportFragmentManager.fragments)
            if(fragment is ColorFragment)
                return fragment
        return null
    }

    private fun endGameEvent() {
        for(fragment in supportFragmentManager.fragments) {
            if (fragment is ColorFragment || fragment is ToolsAdjustmentFragment || fragment is CanvasFragment || fragment is ToolsFragment || fragment is GuessFragment || fragment is GameInfoFragment) {
                supportFragmentManager.beginTransaction().remove(fragment).commit()
                supportFragmentManager.beginTransaction().replace(R.id.containerCanvas, EndGameFragment()).commitNow()
            }
        }
        // End game Audio effects
        if (gameViewModel.teamScore.value != null) {
            if (gameViewModel.teamScore.value!!.score.size == 2) {
                val team = gameViewModel.gameRepository.team
                val otherTeam = if (team == 1) 0 else 1
                if (gameViewModel.teamScore.value!!.score[team] > gameViewModel.teamScore.value!!.score[otherTeam]) {
                    mediaPlayer = MediaPlayer.create(this, R.raw.win)
                    burstKonfetti()
                } else {
                    mediaPlayer = MediaPlayer.create(this, R.raw.defeat)
                }
                mediaPlayer?.start()
                val intent = Intent(this, StaticEndGame::class.java)
                //val intent = Intent(this,   MainMenuActivity::class.java);
                startActivity(intent)
            }
        }
    }

    //maybe we will need to
    override fun onRestart() {
        super.onRestart()
        println("Restart")

    }

    private fun setUpGameInit() {
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
