package com.example.prototype_mobile.view.game

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.MediaPlayer
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.Menu
import android.view.MenuItem
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.observe
import com.example.prototype_mobile.EndGameResult
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.ActivityGameBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.view.chat.ChatFragment
import com.example.prototype_mobile.view.connection.login.LoginActivity
import com.example.prototype_mobile.view.game.endgame.EndGameActivity
import com.example.prototype_mobile.viewmodel.game.CanvasViewModel
import com.example.prototype_mobile.viewmodel.game.CanvasViewModelFactory
import com.example.prototype_mobile.viewmodel.game.GameViewModel
import com.jaredrummler.android.colorpicker.ColorPickerDialogListener


class GameActivity : AppCompatActivity(), ColorPickerDialogListener {

    private lateinit var gameViewModel: GameViewModel
    private lateinit var colorFragment: ColorFragment
    private lateinit var canvasViewModel: CanvasViewModel
    private lateinit var binding: ActivityGameBinding
    private var mediaPlayer: MediaPlayer? = null

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        val inflater = menuInflater
        inflater.inflate(R.menu.gamemenu, menu)
        supportActionBar?.setLogo(R.mipmap.ic_launcher2)
        supportActionBar?.setDisplayUseLogoEnabled(true)
        return true
    }
    override fun onOptionsItemSelected(item: MenuItem) = when (item.itemId) {
        R.id.action_logout -> {
            gameViewModel.leaveGame()
            gameViewModel.logout()
            true
        }
        else -> {
            super.onOptionsItemSelected(item)
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Bind the view on create and setup listener handler
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Set view, view model and binding
        setContentView(R.layout.activity_game)
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.my_toolbar)
        toolbar.setTitleTextColor(ContextCompat.getColor(applicationContext, R.color.white))
        setSupportActionBar(toolbar)
        gameViewModel = ViewModelProvider(this).get(GameViewModel::class.java)
        binding = ActivityGameBinding.inflate(layoutInflater)
        canvasViewModel = ViewModelProvider(this, CanvasViewModelFactory())
                .get(CanvasViewModel::class.java)

        // Fill the container if it's not done
        if (savedInstanceState == null) {
            setUpGameInit()
        }

        // Handle event
        gameViewModel.isPlayerDrawing.observe(this, Observer {
            if (it) {
                supportFragmentManager.beginTransaction()
                        .replace(R.id.containerTools, ToolsFragment()).commitNow()
                supportFragmentManager.beginTransaction()
                        .replace(R.id.containerGuess, ToolsAdjustmentFragment()).commitNow()
                supportFragmentManager.beginTransaction()
                    .replace(R.id.containerColor, ColorFragment()).commitNow()
                colorFragment =  (findColorFragment() as ColorFragment?)!!
            } else {
                for (fragment in supportFragmentManager.fragments) {
                    if(checkIfDrawingFragment(fragment)) {
                        supportFragmentManager.beginTransaction().remove(fragment).commit()
                    }
                }
            }
        })

        gameViewModel.isPlayerGuessing.observe(this, Observer {
            if (it!!) {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.containerGuess, GuessFragment()).commitNow()
                if(gameViewModel.gameRepository.gameType == GameType.CLASSIC) {
                    //When connecting to the game transition state is null since it doesn't receive can't set a timer
                    //hintFragment()
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
            } else if(!it){
                for (fragment in supportFragmentManager.fragments) {
                    if(fragment is GuessFragment || fragment is HintFragment) {
                        supportFragmentManager.beginTransaction().remove(fragment).commit()
                    }
                }
            }
            else{
                hintFragment()
            }
        })

        gameViewModel.isGameEnded.observe(this, Observer {
            if(gameViewModel.isGameEnded.value!! && gameViewModel.isGameEnded.value != null)
                endGameEvent()
        })

        gameViewModel.transitionMessage.observe(this, Observer{
            if (gameViewModel.gameTypeViewModel == GameType.CLASSIC) {
                val toast = Toast.makeText(applicationContext, it, Toast.LENGTH_LONG)
                toast.show()
            }
        })

        gameViewModel.suggestions.observe(this, Observer {
            if (it != null) {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.containerCanvas, ChooseWordFragment()).commitNow()
                for (fragment in supportFragmentManager.fragments) {
                    if(fragment is ChooseWordFragment) {
                        fragment.bindButton()
                    }
                }
            } else {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.containerCanvas, CanvasFragment(canvasViewModel)).commitNow()
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

        gameViewModel.isGuessGood.observe(this) {
            if(it) {
                Toast.makeText(
                        applicationContext,
                        "Bonne réponse",
                        Toast.LENGTH_LONG
                ).show()
            } else {
                Toast.makeText(
                        applicationContext,
                        "Mauvaise réponse",
                        Toast.LENGTH_LONG
                ).show()
            }
        }

        gameViewModel.logout.observe(this) {
            val mStartActivity = Intent(applicationContext, LoginActivity::class.java)
            val mPendingIntentId = 123456
            val mPendingIntent = PendingIntent.getActivity(applicationContext, mPendingIntentId, mStartActivity, PendingIntent.FLAG_CANCEL_CURRENT)
            val mgr = applicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            mgr.set(AlarmManager.RTC, System.currentTimeMillis() + 100, mPendingIntent)
            System.exit(0)
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Init game onResume
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    override fun onResume() {
        super.onResume()
        setUpGameInit()
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Leave game and close the activity onStop
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    override fun onStop() {
        super.onStop()
        gameViewModel.leaveGame()
        finish()
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Check it $fragment is drawing tool fragment
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun checkIfDrawingFragment(fragment: Fragment): Boolean {
        return fragment is ToolsFragment || fragment is ToolsAdjustmentFragment || fragment is ColorFragment
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Remove the call to super
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    override fun onDialogDismissed(dialogId: Int) {}

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Set the color in the fragment and view model
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    override fun onColorSelected(dialogId: Int, color: Int) {
        colorFragment.viewModel.setColor(color)
        colorFragment.updateButtonColor(color)
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Find the color fragment
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun findColorFragment(): Fragment? {
        for (fragment in supportFragmentManager.fragments)
            if(fragment is ColorFragment)
                return fragment
        return null
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Prepare data for the end game activity
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun endGameEvent() {
        // Classic Game
        var title = ""
        var description = ""
        var win = true
        // Set title, description and sound
        // Classic Game
        if (gameViewModel.teamScore.value != null) {
            if (gameViewModel.teamScore.value!!.score.size == 2) {
                val myTeamIndex = gameViewModel.gameRepository.team
                val otherTeamIndex = if (myTeamIndex == 1) 0 else 1
                win = gameViewModel.teamScore.value!!.score[myTeamIndex] > gameViewModel.teamScore.value!!.score[otherTeamIndex]
                val equality = gameViewModel.teamScore.value!!.score[myTeamIndex] == gameViewModel.teamScore.value!!.score[otherTeamIndex]
                if (win) {
                    mediaPlayer = MediaPlayer.create(this, R.raw.win)
                    val score = "${gameViewModel.teamScore.value!!.score[myTeamIndex]} - ${gameViewModel.teamScore.value!!.score[otherTeamIndex]}"
                    title = "Victoire!"
                    description = "Bravo, vous avez gagné: score ${score}"
                } else if (equality) {
                    mediaPlayer = MediaPlayer.create(this, R.raw.defeat)
                    val score = "${gameViewModel.teamScore.value!!.score[otherTeamIndex]}"
                    title = "Égalité!"
                    description = "Meilleur change la prochaine fois! Les deux équipes ont eu ${score} points"
                } else { // Defait
                    mediaPlayer = MediaPlayer.create(this, R.raw.defeat)
                    val score = "${gameViewModel.teamScore.value!!.score[otherTeamIndex]} - ${gameViewModel.teamScore.value!!.score[myTeamIndex]}"
                    title = "Vous avez perdu"
                    description = "Meilleur change la prochaine fois! Vous avez perdu ${score}"
                }
                mediaPlayer?.start()
            }
            // Sprint Game
            else {
                title = "Bien joué!"
                description = "Bravo, vous avez un score de ${gameViewModel.teamScore.value!!.score[0]} points!"
            }
            gameViewModel.resetData()
            gameViewModel.setEndGameResult(title, description, EndGameResult(win, null))
            // Start end game activity
            val intent = Intent(this, EndGameActivity::class.java)
            startActivity(intent)
        }
    }

    //maybe we will need to
    override fun onRestart() {
        super.onRestart()
        gameViewModel.resetAlpha()

    }
    private fun setUpGameInit() {
        // Canvas
        supportFragmentManager.beginTransaction()
            .replace(R.id.containerCanvas, CanvasFragment(canvasViewModel))
            .commitNow()
        supportFragmentManager.beginTransaction()
            .replace(R.id.containerChat, ChatFragment())
            .commitNow()

        // Drawing tools
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

        // Guessing tools
        if (gameViewModel.isPlayerGuessing.value!!) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.containerGuess, GuessFragment())
                .commitNow()
            supportFragmentManager.beginTransaction().replace(R.id.containerTools, HintFragment()).commitNow()
        }

        // Game info (Score and timer)
        if (gameViewModel.gameTypeViewModel == GameType.CLASSIC) {
            supportFragmentManager.beginTransaction()
                    .replace(R.id.containerGameInfo, GameInfoFragment())
                    .commit()
        } else {
            supportFragmentManager.beginTransaction()
                    .replace(R.id.containerGameInfo, SprintInfoFragment())
                    .commit()
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *  Add the hint fragment in the tool container
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun hintFragment() {
        supportFragmentManager.beginTransaction()
                .replace(R.id.containerTools, HintFragment())
                .commitNow()
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Bind enter key to send message in chat fragment
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
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

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Block the back button
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    override fun onBackPressed() {
        Toast.makeText(
                applicationContext,
                "Il n'est pas possible d'utiliser le bouton back dans l'application",
                Toast.LENGTH_LONG
        ).show()
    }

}
