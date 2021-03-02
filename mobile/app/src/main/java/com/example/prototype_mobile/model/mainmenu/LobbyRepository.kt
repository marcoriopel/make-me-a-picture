package com.example.prototype_mobile.model.mainmenu

<<<<<<< HEAD
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.prototype_mobile.ListenLobby
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.Message
import com.example.prototype_mobile.MessageReceive
=======
>>>>>>> 439-player-list-mobile
import com.example.prototype_mobile.model.SocketOwner
import com.example.prototype_mobile.model.connection.login.LoginRepository
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
<<<<<<< HEAD

    var currentListenLobby: String = "null"
    private val _lobbyPlayers = MutableLiveData<LobbyPlayers>()
    val lobbyPlayers: LiveData<LobbyPlayers> = _lobbyPlayers

    var onTeamsUpdate = Emitter.Listener {
        Log.d("teams update", it.toString())
        val lobbyPlayersReceived: LobbyPlayers = gson.fromJson(it[0].toString(), LobbyPlayers::class.java)
        _lobbyPlayers.postValue(lobbyPlayersReceived)
    }

=======
    var onTeamsUpdate = Emitter.Listener {
        val teamsReceive: 
    }
>>>>>>> 439-player-list-mobile
    init {
        socket = SocketOwner.getInstance()!!.socket
        socket.on("dispatchTeams", onTeamsUpdate)
    }
<<<<<<< HEAD

    fun listenLobby(lobbyID: String) {
        socket.emit("listenLobby",gson.toJson(ListenLobby(currentListenLobby, lobbyID)))
    }
=======
>>>>>>> 439-player-list-mobile
}