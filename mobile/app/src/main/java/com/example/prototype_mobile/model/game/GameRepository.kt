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
const val DRAWING_TIMER_EVENT = "drawingTimer"
const val GAME_TIMER_EVENT = "gameTimer"
const val GUESS_CALL_BACK_EVENT = "guessCallback"

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

    private val _guessesLeft = MutableLiveData<Int>()
    val guessesLeft: LiveData<Int> = _guessesLeft

    private val _teamScore = MutableLiveData<Score>()
    var teamScore: LiveData<Score> = _teamScore

    private val _roundTimer = MutableLiveData<Timer>()
    var roundTimer: LiveData<Timer> = _roundTimer

    private val _gameTimer = MutableLiveData<Timer>()
    var gameTimer: LiveData<Timer> = _gameTimer

    private val _transition = MutableLiveData<Transition>()
    var transition: LiveData<Transition> = _transition

    private val _drawingName = MutableLiveData<String?>()
    var drawingName: LiveData<String?> = _drawingName

    var drawingPlayer: String? = null
    lateinit var guessesLeftByTeam: GuessesLeft

    private val _isGameEnded=  MutableLiveData<Boolean>()
    val isGameEnded: LiveData<Boolean> = _isGameEnded

    // Listener
    var team = 0

    private var onDrawingNameEvent = Emitter.Listener {
        _drawingName.postValue(JSONObject(it[0].toString()).getString("drawingName"))
    }

    private  var onScoreEvent = Emitter.Listener {
        if (gameType == GameType.CLASSIC) {
            _teamScore.postValue(gson.fromJson(it[0].toString(), Score::class.java))
        } else {
            val score =  JSONObject(it[0].toString()).getString("score").toInt()
            _teamScore.postValue(Score(intArrayOf(score)))
        }
    }

    private var onTimerEvent = Emitter.Listener {
        _roundTimer.postValue(gson.fromJson(it[0].toString(), Timer::class.java))
    }

    private var onGameTimerEvent = Emitter.Listener {
        _gameTimer.postValue(gson.fromJson(it[0].toString(), Timer::class.java))
    }

    private var onNewRound = Emitter.Listener {
        if (gameType == GameType.CLASSIC) {
            drawingPlayer = JSONObject(it[0].toString()).getString("newDrawingPlayer")
            _drawingName.postValue(null)
        }
        CanvasRepository.getInstance()!!.resetCanvas()
    }
    private var onEndGameEvent = Emitter.Listener {
        println("game ended")
        _isGameEnded.postValue(true)

    }

    private var onGuessesLeft = Emitter.Listener {
        if (gameType == GameType.CLASSIC) {
            guessesLeftByTeam = gson.fromJson(it[0].toString(), GuessesLeft::class.java)
            if (guessesLeftByTeam.guessesLeft[team] > 0 && drawingPlayer.equals(LoginRepository.getInstance()!!.user!!.username)) {
                _isPlayerDrawing.postValue(true)
            }
        } else {
            val numberGuessesLeft = JSONObject(it[0].toString()).getString("guessesLeft").toInt()
            _guessesLeft.postValue(numberGuessesLeft)
            _isPlayerGuessing.postValue(numberGuessesLeft > 0)
        }
    }

    private var guessCallBack = Emitter.Listener {
        Log.e("Guess call back", it[0].toString())
    }

    private var onTransition = Emitter.Listener {
        val transitionTemp = gson.fromJson(it[0].toString(), Transition::class.java)
        _transition.postValue(transitionTemp)
        _roundTimer.postValue(Timer(transitionTemp.timer))
        if(Timer(transitionTemp.timer).timer == 0) {
            if (guessesLeftByTeam.guessesLeft[team] > 0 && drawingPlayer.equals(LoginRepository.getInstance()!!.user!!.username) && transitionTemp.state != 1) {
                _isPlayerDrawing.postValue(true)
            } else if (!drawingPlayer.equals(LoginRepository.getInstance()!!.user!!.username)) {
                _isPlayerGuessing.postValue(guessesLeftByTeam.guessesLeft[team] > 0)
            }
        } else {
            _isPlayerDrawing.postValue(false)
            _isPlayerGuessing.postValue(false)
        }
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
        _isGameEnded.value = false
        socket = SocketOwner.getInstance()!!.socket
        socket.on(DRAWING_NAME_EVENT, onDrawingNameEvent)
        socket.on(TIMER_EVENT, onTimerEvent)
        socket.on(SCORE_EVENT, onScoreEvent)
        socket.on(GUESSES_LEFT_EVENT, onGuessesLeft)
        socket.on(NEW_ROUND_EVENT, onNewRound)
        socket.on(END_GAME_EVENT, onEndGameEvent)
        socket.on(TRANSITION_EVENT, onTransition)
        socket.on(DRAWING_TIMER_EVENT, onTimerEvent)
        socket.on(GAME_TIMER_EVENT, onGameTimerEvent)
        socket.on(GUESS_CALL_BACK_EVENT, guessCallBack)
    }
}