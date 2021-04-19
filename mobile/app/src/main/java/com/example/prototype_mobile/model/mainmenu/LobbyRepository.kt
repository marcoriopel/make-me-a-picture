package com.example.prototype_mobile.model.mainmenu

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.chat.ChatRepository
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.game.EndGameRepository
import com.example.prototype_mobile.model.game.GameRepository
import com.google.gson.Gson
import io.socket.emitter.Emitter
import kotlinx.coroutines.runBlocking
import okhttp3.Response
import org.json.JSONObject

class LobbyRepository {
    companion object {
        private var instance: LobbyRepository? = null

        fun getInstance(): LobbyRepository? {
            if (instance == null) {
                synchronized(LobbyRepository::class.java) {
                    if (instance == null) {
                        instance = LobbyRepository()
                    }
                }
            }
            return instance
        }
    }

    // Socket
    var socket: io.socket.client.Socket = SocketOwner.getInstance()!!.socket

    // Lobby
    var currentListenLobby: String = "null"

    private val _lobbyPlayers = MutableLiveData<LobbyPlayers>()
    val lobbyPlayers: LiveData<LobbyPlayers> = _lobbyPlayers

    private val _lobbyJoined = MutableLiveData<Game>()
    val lobbyJoined: LiveData<Game> = _lobbyJoined

    private val _gameStarting = MutableLiveData<Boolean>()
    val gameStarting: MutableLiveData<Boolean> = _gameStarting

    private val _message = MutableLiveData<String>()
    val message: LiveData<String> = _message

    // Game Start
    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing
    val gson: Gson = Gson()

    var gameStarted = false

    private val chatRepo = ChatRepository.getInstance()!!

    private var onTeamsUpdate = Emitter.Listener {
        val gson: Gson = Gson()
        val lobbyPlayersReceived: LobbyPlayers = gson.fromJson(it[0].toString(), LobbyPlayers::class.java)
        _lobbyPlayers.postValue(lobbyPlayersReceived)
    }

    private var onStart = Emitter.Listener {
        EndGameRepository.getInstance()!!.initializeData(_lobbyJoined.value!!.difficulty)
        gameStarted = true
        val gameRepo = GameRepository.getInstance()!!
        if (_lobbyJoined.value!!.gameType == GameType.CLASSIC) {
            val Jobject = JSONObject(it[0].toString())
            val Jarray = Jobject.getString("player")
            val player: String = Jarray.toString()
            gameRepo.gameType = _lobbyJoined.value!!.gameType
            gameRepo.drawingPlayer = player
            //To access gameType inside game View model later with a liveData
            gameRepo.getGameTypeLiveData().postValue(_lobbyJoined.value!!.gameType)
            _lobbyPlayers.value!!.players.forEach { player ->
                run {
                    when (player.team) {
                        0 -> gameRepo.team1.add(player)
                        1 -> gameRepo.team2.add(player)
                        else -> throw Exception("Player has invalid team number")
                    }
                }
            }
            _isPlayerDrawing.postValue(player == LoginRepository.getInstance()!!.user!!.username)
            _gameStarting.postValue(true)
        } else {
            gameRepo.gameType = _lobbyJoined.value!!.gameType
            gameRepo.getGameTypeLiveData().postValue(_lobbyJoined.value!!.gameType)
            _isPlayerDrawing.postValue(false)
            _gameStarting.postValue(true)
        }
    }

    init {
        socket.on("dispatchTeams", onTeamsUpdate)
        socket.on("gameStart", onStart)
    }

    fun listenLobby(lobbyID: String) {
        if (!socket.hasListeners("dispatchTeams"))
            socket.on("dispatchTeams", onTeamsUpdate)
        val gson: Gson = Gson()
        socket.emit("listenLobby",gson.toJson(ListenLobby(currentListenLobby, lobbyID)))
        currentListenLobby = lobbyID
    }

    suspend fun joinLobby(game: GameInvited): Result<GameInvited> {
        val map = HashMap<String, String>()
        map["lobbyId"] = game.gameID
        map["socketId"] = socket.id()
        val response = HttpRequestDrawGuess.httpRequestPost("/api/games/join/public", map, true)
        val result = analyseJoinLobbyAnswer(response, game)
        if (result is Result.Success) {
            val game2 = Game(gameID = result.data.gameID, gameName = result.data.gameName,
                    gameType = result.data.gameType, difficulty = result.data.difficulty, isPrivate = game.lobbyInvited == null)
            _lobbyJoined.postValue(game2)
            socket.emit("joinLobby", gson.toJson(LobbyId(game.gameID)))
        }
        return result
    }

    suspend fun joinLobby(game: Game): Result<Game> {
        val map = HashMap<String, String>()
        map["lobbyId"] = game.gameID
        map["socketId"] = socket.id()
        val response = HttpRequestDrawGuess.httpRequestPost("/api/games/join/public", map, true)
        val result = analyseJoinLobbyAnswer(response, game)
        if (result is Result.Success) {
            _lobbyJoined.postValue(game)
            socket.emit("joinLobby", gson.toJson(LobbyId(game.gameID)))
        }
        return result
    }

    suspend fun joinPrivate(id: String): Result<PrivateLobby> {
        val map = HashMap<String, String>()
        map["lobbyInviteId"] = id
        val response = HttpRequestDrawGuess.httpRequestPost("/api/games/join/private", map, true)
        return analyseJoinPrivateLobbyAnswer(response, id)
    }

    private fun analyseJoinLobbyAnswer(response: Response, game: GameInvited): Result<GameInvited> {
        return if(response.code() == ResponseCode.OK.code) {
            Result.Success(game)
        } else {
            _message.postValue("Le Lobby est inexistant ou plein.")
            Result.Error(response.code())
        }
    }

    private fun analyseJoinLobbyAnswer(response: Response, game: Game): Result<Game> {
        return if(response.code() == ResponseCode.OK.code) {
            Result.Success(game)
        } else {
            _message.postValue("Le Lobby est inexistant ou plein.")
            Result.Error(response.code())
        }
    }

    private fun analyseJoinPrivateLobbyAnswer(response: Response, id: String): Result<PrivateLobby> {
        val lobbyId: String = response.body()!!.string()
        if(response.code() == ResponseCode.OK.code) {
            currentListenLobby = lobbyId
            if (!socket.hasListeners("dispatchTeams"))
                socket.on("dispatchTeams", onTeamsUpdate)
            return Result.Success(PrivateLobby(lobbyInvited = id, lobbyId = lobbyId ))
        } else {
            _message.postValue("Le Lobby est inexistant ou plein.")
            Result.Error(response.code())
        }
        return Result.Error(2)
    }

    suspend fun addVirtualPlayer(team: Int): Result<String> {
        val map = HashMap<String, String>()
        map["lobbyId"] = currentListenLobby
        map["teamNumber"] = team.toString()
        val response = HttpRequestDrawGuess.httpRequestPost("/api/games/add/virtual/player", map, true)

        return analyseGeneralAnswer(response)
    }

    suspend fun removeVirtualPlayer(team: Int, username: String): Result<String> {
        val map = HashMap<String, String>()
        map["lobbyId"] = currentListenLobby
        map["teamNumber"] = team.toString()
        map["username"] = username
        val response = HttpRequestDrawGuess.httpRequestDelete("/api/games/remove/virtual/player", map, true)

        return analyseGeneralAnswer(response)
    }

    suspend fun startGame(): Result<String> {
        gameStarted = true
        val map = HashMap<String, String>()
        map["lobbyId"] = currentListenLobby
        val response = HttpRequestDrawGuess.httpRequestPost("/api/games/start", map, true)

        return analyseGeneralAnswer(response)
    }

    suspend fun quitLobby(): Result<String> {
        if(_lobbyJoined.value != null) {
            socket.emit("leaveLobby", gson.toJson(LobbyId(_lobbyJoined.value!!.gameID)))
            socket.off("dispatchTeams")
        }
        gameStarted = false
        if (_lobbyJoined.value != null) {
            chatRepo.leaveChannel(_lobbyJoined.value!!.gameID)
            chatRepo.switchToGeneral()
        }
        socket.emit("listenLobby",gson.toJson(ListenLobby(currentListenLobby, "")))
        val map = HashMap<String, String>()
        map["lobbyId"] = currentListenLobby
        val response = HttpRequestDrawGuess.httpRequestDelete("/api/games/leave", map, true)
        currentListenLobby = "null"

        return  analyseGeneralAnswer(response)
    }

    private fun analyseGeneralAnswer(response: Response): Result<String> {
        return if(response.code() == ResponseCode.OK.code) {
            Result.Success("Ok")
        } else {
            Result.Error(response.code())
        }
    }

    fun resetData() {
        if (_lobbyJoined.value?.gameID != null && !gameStarted) {
            runBlocking {
                quitLobby()
            }
        }
        _lobbyPlayers.value = null
        _lobbyJoined.value = null
        _isPlayerDrawing.value = null
        _gameStarting.value = false
    }
}