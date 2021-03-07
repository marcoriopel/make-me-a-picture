package com.example.prototype_mobile.model.mainmenu


import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.SocketOwner
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

    var socket: io.socket.client.Socket
    val gson: Gson = Gson()

    var currentListenLobby: String = "null"
    private val _lobbyPlayers = MutableLiveData<LobbyPlayers>()
    val lobbyPlayers: LiveData<LobbyPlayers> = _lobbyPlayers

    private val _lobbyJoined = MutableLiveData<Game>()
    val lobbyJoined: LiveData<Game> = _lobbyJoined
    var onTeamsUpdate = Emitter.Listener {
        val lobbyPlayersReceived: LobbyPlayers = gson.fromJson(it[0].toString(), LobbyPlayers::class.java)
        _lobbyPlayers.postValue(lobbyPlayersReceived)
    }

    init {
        socket = SocketOwner.getInstance()!!.socket
        socket.on("dispatchTeams", onTeamsUpdate)
    }

    fun listenLobby(lobbyID: String) {
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
        val result = analyseAddVirtualPlayerAnswer(response)

        return result;
    }

    fun analyseAddVirtualPlayerAnswer(response: Response): Result<String> {
        if(response.code() == ResponseCode.OK.code) {
            return Result.Success("Added")
        } else {
            return Result.Error(response.code())
        }
    }

    suspend fun removeVirtualPlayer(team: Int, username: String): Result<String> {
        val map = HashMap<String, String>()
        map["lobbyId"] = currentListenLobby
        map["teamNumber"] = team.toString()
        map["username"] = username
        val response = HttpRequestDrawGuess.httpRequestDelete("/api/games/remove/virtual/player", map, true)
        val result = analyseRemoveVirtualPlayerAnswer(response)

        return result;
    }

    fun analyseRemoveVirtualPlayerAnswer(response: Response): Result<String> {
        if(response.code() == ResponseCode.OK.code) {
            return Result.Success("Removed")
        } else {
            return Result.Error(response.code())
        }
    }
}