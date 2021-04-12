package com.example.prototype_mobile.model.mainmenu


import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.game.GameRepository
import com.google.gson.Gson
import io.socket.emitter.Emitter
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
    var socket: io.socket.client.Socket

    // Lobby
    var currentListenLobby: String = "null"

    private val _lobbyPlayers = MutableLiveData<LobbyPlayers>()
    val lobbyPlayers: LiveData<LobbyPlayers> = _lobbyPlayers

    private val _lobbyJoined = MutableLiveData<Game>()
    val lobbyJoined: LiveData<Game> = _lobbyJoined

    // Game Start
    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing
    val gson: Gson = Gson()

    var gameStarted = false

    var onTeamsUpdate = Emitter.Listener {
        val gson: Gson = Gson()
        val lobbyPlayersReceived: LobbyPlayers = gson.fromJson(it[0].toString(), LobbyPlayers::class.java)
        _lobbyPlayers.postValue(lobbyPlayersReceived)
    }

    var onStart = Emitter.Listener {
        gameStarted = true
        val gameRepo = GameRepository.getInstance()!!
        if (_lobbyJoined.value!!.gameType == GameType.CLASSIC) {
            val Jobject = JSONObject(it[0].toString())
            val Jarray = Jobject.getString("player")
            val player: String = Jarray.toString()
            gameRepo.gameType = _lobbyJoined.value!!.gameType
            //To access gameType inside game View model later with a liveData
            gameRepo.getGameTypeLiveData().postValue(_lobbyJoined.value!!.gameType)
            _lobbyPlayers.value!!.players.forEach { player ->
                run {
                    when (player.team) {
                        0 -> gameRepo.team1.add(player)
                        1 -> gameRepo.team2.add(player)
                        else -> throw Exception("Player has invalid team nunmber")
                    }
                }
            }
            _isPlayerDrawing.postValue(player.equals(LoginRepository.getInstance()!!.user!!.username))
        } else {
            gameRepo.gameType = _lobbyJoined.value!!.gameType

            gameRepo.getGameTypeLiveData().postValue(_lobbyJoined.value!!.gameType)
            //gameRepo.getTransition().postValue(Transition(gameRepo.gameTimer.value!!.timer, 1))
            _isPlayerDrawing.postValue(false)
        }
    }

    init {
        socket = SocketOwner.getInstance()!!.socket
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

    suspend fun joinLobby(game: Game): Result<Game> {
        val map = HashMap<String, String>()
        map["lobbyId"] = game.gameID
        map["socketId"] = socket.id()
        if(game.lobbyInvited != null) {
            map["lobbyInviteId"] = game.lobbyInvited
            println("We are in private section of the request" + game)
            val response = HttpRequestDrawGuess.httpRequestPost("/api/games/join/private", map, true)
            val result = analyseJoinLobbyAnswer(response, game)
            if (result is Result.Success) {
                _lobbyJoined.postValue(game)
                socket.emit("joinLobby", gson.toJson(PrivateLobby(game.lobbyInvited, game.gameID)))
            }
            return result
        } else {
            println("We are in public section of the request")
            val response = HttpRequestDrawGuess.httpRequestPost("/api/games/join/public", map, true)
            val result = analyseJoinLobbyAnswer(response, game)
            if (result is Result.Success) {
                _lobbyJoined.postValue(game)
                socket.emit("joinLobby", gson.toJson(LobbyId(game.gameID)))
            }
            return result
        }
    }


    private fun analyseJoinLobbyAnswer(response: Response, game: Game): Result<Game> {
        if(response.code() == ResponseCode.OK.code) {
            return Result.Success(game)
        } else {
            return Result.Error(response.code())
        }
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
        socket.emit("leaveLobby",gson.toJson(LobbyId(_lobbyJoined.value!!.gameID)))
        socket.off("dispatchTeams")
        gameStarted = false
        socket.emit("listenLobby",gson.toJson(ListenLobby(currentListenLobby, "")))
        val map = HashMap<String, String>()
        map["lobbyId"] = currentListenLobby
        val response = HttpRequestDrawGuess.httpRequestDelete("/api/games/leave", map, true)

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
        println("reset data called")
        _lobbyPlayers.value = null
        _lobbyJoined.value = null
        _isPlayerDrawing.value = null
    }
}