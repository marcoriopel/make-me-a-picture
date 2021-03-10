package com.example.prototype_mobile.model.mainmenu


import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.google.gson.Gson
import io.socket.emitter.Emitter
import okhttp3.Response
import org.json.JSONObject

class LobbyRepository() {
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

    var onTeamsUpdate = Emitter.Listener {
        val gson: Gson = Gson()
        val lobbyPlayersReceived: LobbyPlayers = gson.fromJson(it[0].toString(), LobbyPlayers::class.java)
        _lobbyPlayers.postValue(lobbyPlayersReceived)
    }

    var onStart = Emitter.Listener {
        val player: String = it[0].toString()
        Log.e("player:", player)
        Log.e("username", LoginRepository.getInstance()!!.user!!.username )
        Log.e("result is player drawing", player.contentEquals(LoginRepository.getInstance()!!.user!!.username).toString())
        _isPlayerDrawing.postValue(player.contentEquals(LoginRepository.getInstance()!!.user!!.username))
    }

    init {
        socket = SocketOwner.getInstance()!!.socket
        socket.on("dispatchTeams", onTeamsUpdate)
        socket.on("gameStart", onStart)
    }

    fun listenLobby(lobbyID: String) {
        val gson: Gson = Gson()
        socket.emit("listenLobby",gson.toJson(ListenLobby(currentListenLobby, lobbyID)))
        currentListenLobby = lobbyID
    }

    suspend fun joinLobby(game: Game): Result<Game> {
        val map = HashMap<String, String>()
        map["lobbyId"] = game.gameID
        val response = HttpRequestDrawGuess.httpRequestPost("/api/games/join", map, true)
        val result = analyseJoinLobbyAnswer(response, game)

        if (result is Result.Success) {
            _lobbyJoined.postValue(game)
        }

        return result;
    }

    fun analyseJoinLobbyAnswer(response: Response, game: Game): Result<Game> {
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
        val result = analyseGeneralAnswer(response)

        return result;
    }

    suspend fun removeVirtualPlayer(team: Int, username: String): Result<String> {
        val map = HashMap<String, String>()
        map["lobbyId"] = currentListenLobby
        map["teamNumber"] = team.toString()
        map["username"] = username
        val response = HttpRequestDrawGuess.httpRequestDelete("/api/games/remove/virtual/player", map, true)
        val result = analyseGeneralAnswer(response)

        return result;
    }

    suspend fun startGame(): Result<String> {
        val map = HashMap<String, String>()
        map["lobbyId"] = currentListenLobby
        val response = HttpRequestDrawGuess.httpRequestPost("/api/games/start", map, true)
        val result = analyseGeneralAnswer(response)

        return result;
    }

    fun analyseGeneralAnswer(response: Response): Result<String> {
        if(response.code() == ResponseCode.OK.code) {
            return Result.Success("Ok")
        } else {
            return Result.Error(response.code())
        }
    }
}