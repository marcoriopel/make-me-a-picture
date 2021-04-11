package com.example.prototype_mobile.model.game

import android.util.Log
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
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
const val REQUEST_HINT = "hintRequest"
const val DRAWING_SUGGESTIONS_EVENT = "drawingSuggestions"
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

    private val _gameTypeLiveData= MutableLiveData<GameType>()
    val gameTypeLiveData: LiveData<GameType> = _gameTypeLiveData

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

    private val _suggestions = MutableLiveData<Suggestions>()
    var suggestions: LiveData<Suggestions> = _suggestions

    private val _drawingName = MutableLiveData<String?>()
    var drawingName: LiveData<String?> = _drawingName

    var drawingPlayer: String? = null
    var guessesLeftByTeam: GuessesLeft = GuessesLeft(arrayOf(0,0))

    private val _isGameEnded=  MutableLiveData<String>()
    val isGameEnded: LiveData<String> = _isGameEnded

    // Listener
    var team = 0
    var suggestion = Suggestions(arrayOf())

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
            _isPlayerDrawing.postValue(false)
            _drawingName.postValue(null)
        }
        CanvasRepository.getInstance()!!.resetCanvas()
    }
    private var onEndGameEvent = Emitter.Listener {
        _isPlayerGuessing.postValue(false)
        _isGameEnded.postValue(gameId)
    }

    private var onGuessesLeft = Emitter.Listener {
        if (gameType == GameType.CLASSIC) {
            guessesLeftByTeam = gson.fromJson(it[0].toString(), GuessesLeft::class.java)
            if (!drawingPlayer.equals(LoginRepository.getInstance()!!.user!!.username)) {
                _isPlayerGuessing.postValue(guessesLeftByTeam.guessesLeft[team] > 0)
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
        _roundTimer.postValue(Timer(transitionTemp.timer))
        _transition.postValue(transitionTemp)
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

    private var onDrawingSuggestionsEvent = Emitter.Listener {
        suggestion = gson.fromJson(it[0].toString(), Suggestions::class.java)
        _suggestions.postValue(gson.fromJson(it[0].toString(), Suggestions::class.java))

    }

    fun setIsPlayerDrawing(isDrawing: Boolean) {
        if (isDrawing)
            drawingPlayer = LoginRepository.getInstance()!!.user!!.username
    }

    fun guessDrawing(guess: String) {
        val opts = IO.Options()
        opts.query = "authorization=" + LoginRepository.getInstance()!!.user!!.token
        val guessEvent = GuessEvent(this.gameId!!, guess)
        socket.emit(GUESS_DRAWING_EVENT, gson.toJson(guessEvent), opts)
    }

    fun sendHintRequest(user: BasicUser) {
        val hintRequest = HintRequest(this.gameId!!, user)
        socket.emit(REQUEST_HINT, gson.toJson(hintRequest))
    }

    suspend fun postWordChose(word: String) {
        val body = HashMap<String, String>()
        body["drawingName"] = word
        body["gameId"] = gameId.toString()
        val response = HttpRequestDrawGuess.httpRequestPost("/api/games/word/selection", body, true)
        if (response.code() == ResponseCode.OK.code)
            _suggestions.postValue(null)
    }

    fun refreshSuggestions() {
        val opts = IO.Options()
        opts.query = "authorization=" + LoginRepository.getInstance()!!.user!!.token
        val data = GameId(this.gameId!!)
        socket.emit("drawingSuggestions", gson.toJson(data), opts)
    }

    init {
        _isPlayerDrawing.value = false
        _isPlayerGuessing.value = false

        _isGameEnded.value = "false"
        socket = SocketOwner.getInstance()!!.socket
        socket.on(DRAWING_NAME_EVENT, onDrawingNameEvent)
        socket.on(TIMER_EVENT, onTimerEvent)
        socket.on(SCORE_EVENT, onScoreEvent)
        socket.on(GUESSES_LEFT_EVENT, onGuessesLeft)
        socket.on(NEW_ROUND_EVENT, onNewRound)
        socket.on(END_GAME_EVENT, onEndGameEvent)
        socket.on(TRANSITION_EVENT, onTransition)
        socket.on(DRAWING_SUGGESTIONS_EVENT, onDrawingSuggestionsEvent)
        socket.on(DRAWING_TIMER_EVENT, onTimerEvent)
        socket.on(GAME_TIMER_EVENT, onGameTimerEvent)
        socket.on(GUESS_CALL_BACK_EVENT, guessCallBack)
    }

    fun getGameTypeLiveData() : MutableLiveData<GameType> {
        return _gameTypeLiveData
    }
}

