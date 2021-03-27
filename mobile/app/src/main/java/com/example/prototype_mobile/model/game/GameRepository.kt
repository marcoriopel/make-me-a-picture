package com.example.prototype_mobile.model.game

import android.util.Log
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.emitter.Emitter
import org.json.JSONObject

const val DRAWING_NAME_EVENT = "drawingName"
const val SCORE_EVENT = "score"
const val GUESS_DRAWING_EVENT = "guessDrawing"
const val END_GAME_EVENT = "endGame"
const val NEW_ROUND_EVENT = "newRound"
const val GUESSES_LEFT_EVENT = "guessesLeft"
const val TIMER_EVENT = "timer"
const val TRANSITION_EVENT = "transitionTimer"

class GameRepository {
    companion object {
        private var instance: GameRepository? = null

        fun getInstance(): GameRepository? {
            if (instance == null) {
                synchronized(GameRepository::class.java) {
                    if (instance == null) {
                        instance = GameRepository()
                    }
                }
            }
            return instance
        }
    }

    var socket: io.socket.client.Socket
    val gson: Gson = Gson()
    var gameId: String? = null
    var gameType: GameType = GameType.COOP

    var team1: MutableList<Players> = mutableListOf()
    var team2: MutableList<Players> = mutableListOf()

    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing

    private val _isPlayerGuessing = MutableLiveData<Boolean>()
    val isPlayerGuessing: LiveData<Boolean> = _isPlayerGuessing

    private val _teamScore = MutableLiveData<Score>()
    var teamScore: LiveData<Score> = _teamScore

    private val _timer = MutableLiveData<Timer>()
    var timer: LiveData<Timer> = _timer

    private val _transition = MutableLiveData<Transition>()
    var transition: LiveData<Transition> = _transition

    var drawingName: String? = null
    var drawingPlayer: String? = null
    var guessingPlayer: String? = null

    private val _isGameEnded=  MutableLiveData<Boolean>()
    val isGameEnded: LiveData<Boolean> = _isGameEnded

    // Listener
    var team = 0

    private var onDrawingNameEvent = Emitter.Listener {
        drawingName = JSONObject(it[0].toString()).getString("drawingName")
    }

    private  var onScoreEvent = Emitter.Listener {
        if (gameType == GameType.CLASSIC) {
            _teamScore.postValue(gson.fromJson(it[0].toString(), Score::class.java))
        } else {
            val score =  JSONObject(it[0].toString()).getString("score").toInt()
            _teamScore.postValue(Score(intArrayOf(score)))
        }
    }

    private  var onTimerEvent = Emitter.Listener {
        _timer.postValue(gson.fromJson(it[0].toString(), Timer::class.java))
    }

    private var onNewRound = Emitter.Listener {
        drawingPlayer = JSONObject(it[0].toString()).getString("newDrawingPlayer")
        _isPlayerDrawing.postValue(drawingPlayer.equals(LoginRepository.getInstance()!!.user!!.username))
        CanvasRepository.getInstance()!!.resetCanvas()
    }
    private var onEndGameEvent = Emitter.Listener {
        println("game ended")
        _isGameEnded.postValue(true)

    }

    private var onGuessesLeft = Emitter.Listener {
        if (gameType == GameType.CLASSIC) {
            val guessesLeft: GuessesLeft = gson.fromJson(it[0].toString(), GuessesLeft::class.java)
            _isPlayerGuessing.postValue(guessesLeft.guessesLeft[team] > 0)
        } else {
            val guessesLeft = JSONObject(it[0].toString()).getString("guessesLeft").toInt()
            _isPlayerGuessing.postValue(guessesLeft > 0)
        }
    }

    private var onTransition = Emitter.Listener {
        val transitionTemp = gson.fromJson(it[0].toString(), Transition::class.java)
        _transition.postValue(transitionTemp)
        _timer.postValue(Timer(transitionTemp.timer))
    }

    fun setIsPlayerDrawing(isDrawing: Boolean) {
        _isPlayerDrawing.value = isDrawing
    }


    fun guessDrawing(guess: String) {
        val opts = IO.Options()
        opts.query = "authorization=" + LoginRepository.getInstance()!!.user!!.token
        val guessEvent = GuessEvent(this.gameId!!, guess)
        socket.emit(GUESS_DRAWING_EVENT, gson.toJson(guessEvent), opts)
    }

    init {
        _isPlayerDrawing.value = false
        _isPlayerGuessing.value = false
        socket = SocketOwner.getInstance()!!.socket
        socket.on(DRAWING_NAME_EVENT, onDrawingNameEvent)
        socket.on(TIMER_EVENT, onTimerEvent)
        socket.on(SCORE_EVENT, onScoreEvent)
        socket.on(GUESSES_LEFT_EVENT, onGuessesLeft)
        socket.on(NEW_ROUND_EVENT, onNewRound)
        socket.on(END_GAME_EVENT, onEndGameEvent)
        _isGameEnded.value = false
        socket.on(TRANSITION_EVENT, onTransition)
    }
}