package com.example.prototype_mobile.model.game

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.mainmenu.LobbyRepository
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import io.socket.client.IO
import io.socket.emitter.Emitter
import org.json.JSONObject
import java.lang.NullPointerException
import java.lang.reflect.Type

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
const val USER_DISCONNECT_EVENT = "userDisconnect"
const val MAX_SCORE_EVENT = "maxScore"

class GameRepository {
    companion object {
        private var instance: GameRepository? = null

        // Singleton
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

    private var socket: io.socket.client.Socket
    val gson: Gson = Gson()
    var gameId: String? = null
    var gameType: GameType = GameType.COOP

    var team1: MutableList<Players> = mutableListOf()
    var team2: MutableList<Players> = mutableListOf()

    // Live data
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

    private val _isGameEnded = MutableLiveData<String>()
    val isGameEnded: LiveData<String> = _isGameEnded

    private val _saveDrawingImage =  MutableLiveData<Boolean>()
    val saveDrawingImage: LiveData<Boolean> = _saveDrawingImage

    private val _isGuessGood =  MutableLiveData<Boolean>()
    val isGuessGood: LiveData<Boolean> = _isGuessGood

    // Listener
    var team = 0
    var suggestion = Suggestions(arrayOf())

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle drawing name event display the drawing name
     * for the player if he's drawing
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private var onDrawingNameEvent = Emitter.Listener {
        val name = JSONObject(it[0].toString()).getString("drawingName")
        _drawingName.postValue(name)
        EndGameRepository.getInstance()!!.addNewDrawing(name)
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle score event and display score
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private  var onScoreEvent = Emitter.Listener {
        if (gameType == GameType.CLASSIC) {
            _teamScore.postValue(gson.fromJson(it[0].toString(), Score::class.java))
        } else {
            val score =  JSONObject(it[0].toString()).getString("score").toInt()
            _teamScore.postValue(Score(intArrayOf(score)))
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle round timer for classic and sprint
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private var onTimerEvent = Emitter.Listener {
        _roundTimer.postValue(gson.fromJson(it[0].toString(), Timer::class.java))
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle game timer event for sprint
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private var onGameTimerEvent = Emitter.Listener {
        _gameTimer.postValue(gson.fromJson(it[0].toString(), Timer::class.java))
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle new round event
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private var onNewRound = Emitter.Listener {
        if (gameType == GameType.CLASSIC) {
            // Save drawing data to be able to export it
            if (_isPlayerDrawing.value!!)
                _saveDrawingImage.postValue(true)
            // Save data so it can be use after the transition
            drawingPlayer = JSONObject(it[0].toString()).getString("newDrawingPlayer")
            // Block all the action for the player
            _isPlayerDrawing.postValue(false)
            _drawingName.postValue(null)
        } else {
            // To stop the tik sound
            _roundTimer.postValue(Timer(0))
        }
        // reset data
        CanvasRepository.getInstance()!!.resetCanvas()
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle end game event
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private var onEndGameEvent = Emitter.Listener {
        // Safe delete lobby data
        LobbyRepository.getInstance()!!.currentListenLobby = "null"
        // Extract virtual player drawing to be able to vote in end game activity
        val vPlayersDrawing = gson.fromJson(it[0].toString(), VPlayerDrawingEndGame::class.java)
        val endGameRepos = EndGameRepository.getInstance()!!
        for(vDrawingName in vPlayersDrawing.virtualPlayerDrawings) {
            val index = vPlayersDrawing.virtualPlayerDrawings.indexOf(vDrawingName)
            endGameRepos.addVPlayerDrawing(vDrawingName, vPlayersDrawing.virtualPlayerIds[index])
        }
        // Save drawing data to be able to export it
        if (_isPlayerDrawing.value!!)
            _saveDrawingImage.postValue(true)
        // Reset game data
        _isPlayerGuessing.postValue(false)
        _isGameEnded.postValue(gameId)
        CanvasRepository.getInstance()!!.resetCanvas()

    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle guesses left event and dispatch the number of
     * guesses left
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private var onGuessesLeft = Emitter.Listener {
        if (gameType == GameType.CLASSIC) {
            // Data: Array type
            guessesLeftByTeam = gson.fromJson(it[0].toString(), GuessesLeft::class.java)
            if (!drawingPlayer.equals(LoginRepository.getInstance()!!.user!!.username)) {
                _isPlayerGuessing.postValue(guessesLeftByTeam.guessesLeft[team] > 0)
            }
        } else {
            // Data: Int type
            val numberGuessesLeft = JSONObject(it[0].toString()).getString("guessesLeft").toInt()
            _guessesLeft.postValue(numberGuessesLeft)
            _isPlayerGuessing.postValue(numberGuessesLeft > 0)
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle guess call back and display it to console to
     * debug
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private var guessCallBack = Emitter.Listener {
        val guessCallBack = gson.fromJson(it[0].toString(), GuessCallBack::class.java)
        _isGuessGood.postValue(guessCallBack.isCorrectGuess)
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle transition event and dispatch information
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private var onTransition = Emitter.Listener {
        val transitionTemp = gson.fromJson(it[0].toString(), Transition::class.java)
        // Update timer
        _roundTimer.postValue(Timer(transitionTemp.timer))
        _transition.postValue(transitionTemp)
        if(Timer(transitionTemp.timer).timer == 0) {
            // Sprint: Player always guessing
            if ( gameType != GameType.CLASSIC) {
                _isPlayerGuessing.postValue(true)
            }
            // Set that the player can draw if it's his turn
            else if (guessesLeftByTeam.guessesLeft[team] > 0 && drawingPlayer.equals(LoginRepository.getInstance()!!.user!!.username) && transitionTemp.state != 1) {
                _isPlayerDrawing.postValue(true)
            }
            // // Set that the player can guess if it's his turn
            else if (!drawingPlayer.equals(LoginRepository.getInstance()!!.user!!.username)) {
                _isPlayerGuessing.postValue(guessesLeftByTeam.guessesLeft[team] > 0)
            }
        } else {
            // Save the current drawing to export if the player was drawing
            if (_isPlayerDrawing.value!!)
                _saveDrawingImage.postValue(true)
            // Put player in "waiting mode"
            _isPlayerDrawing.postValue(false)
            _isPlayerGuessing.postValue(false)
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Handle suggestion event and dispatch drawing suggestion
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private var onDrawingSuggestionsEvent = Emitter.Listener {
        suggestion = gson.fromJson(it[0].toString(), Suggestions::class.java)
        _suggestions.postValue(gson.fromJson(it[0].toString(), Suggestions::class.java))

    }

    private var onUserDisconnect = Emitter.Listener {
        EndGameRepository.getInstance()!!.addGameResult("Partie nulle", "Un joueur s'est déconnecté", EndGameResult(false, null))
    }

    private var onMaxScore = Emitter.Listener {
        EndGameRepository.getInstance()!!.addGameResult("Bravo, Vous avez eu un score de ${_teamScore.value!!.score[0]}", "*Vous avez épuisé les dessins disponibles pour cette difficulté (pour le moment). Il risque d'y avoir plus de dessins la prochaine fois!*", EndGameResult(true, null))
    }

    fun setIsPlayerDrawing(isDrawing: Boolean) {
        if (isDrawing)
            drawingPlayer = LoginRepository.getInstance()!!.user!!.username
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Send a socket event to guess the current drawing
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun guessDrawing(guess: String) {
        val opts = IO.Options()
        opts.query = "authorization=" + LoginRepository.getInstance()!!.user!!.token
        val guessEvent = GuessEvent(this.gameId!!, guess)
        socket.emit(GUESS_DRAWING_EVENT, gson.toJson(guessEvent), opts)
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Send a socket event to ask for a drawing
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun sendHintRequest(user: BasicUser) {
        val hintRequest = HintRequest(this.gameId!!, user)
        socket.emit(REQUEST_HINT, gson.toJson(hintRequest))
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Http request to tell the server with word the player
     * has choose
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    suspend fun postWordChose(word: String) {
        val body = HashMap<String, String>()
        body["drawingName"] = word
        body["gameId"] = gameId.toString()
        val response = HttpRequestDrawGuess.httpRequestPost("/api/games/word/selection", body, true)
        if (response.code() == ResponseCode.OK.code)
            _suggestions.postValue(null)
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Send a socket event to refresh the word list
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun refreshSuggestions() {
        val opts = IO.Options()
        opts.query = "authorization=" + LoginRepository.getInstance()!!.user!!.token
        val data = GameId(this.gameId!!)
        socket.emit("drawingSuggestions", gson.toJson(data), opts)
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Send a socket event to leave the game
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun leaveGame() {
        try {
            LobbyRepository.getInstance()!!.currentListenLobby = "null"
            val opts = IO.Options()
            opts.query = "authorization=" + LoginRepository.getInstance()!!.user!!.token
            val data = gson.toJson(GameId(this.gameId!!))
            socket.emit("leaveGame", data, opts)
        } catch (e: NullPointerException) {
            println("Safe destructor leave game -> User already disconnected")
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Get the current Game type live data
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    fun getGameTypeLiveData() : MutableLiveData<GameType> {
        return _gameTypeLiveData
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Bind the socket event
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
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
        socket.on(TRANSITION_EVENT, onTransition)
        socket.on(DRAWING_SUGGESTIONS_EVENT, onDrawingSuggestionsEvent)
        socket.on(DRAWING_TIMER_EVENT, onTimerEvent)
        socket.on(GAME_TIMER_EVENT, onGameTimerEvent)
        socket.on(GUESS_CALL_BACK_EVENT, guessCallBack)
        socket.on(USER_DISCONNECT_EVENT, onUserDisconnect)
        socket.on(MAX_SCORE_EVENT, onMaxScore)
    }

}

