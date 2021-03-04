package com.example.prototype_mobile.model.mainmenu


import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.ListenLobby
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.Message
import com.example.prototype_mobile.model.SocketOwner
import com.google.gson.Gson
import io.socket.emitter.Emitter

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
    }

    fun joinLobby(game: Game) {
        _lobbyJoined.postValue(game)
    }
}