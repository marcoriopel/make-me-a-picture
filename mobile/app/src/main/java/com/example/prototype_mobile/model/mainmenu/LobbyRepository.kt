package com.example.prototype_mobile.model.mainmenu

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
    var onTeamsUpdate = Emitter.Listener {
        val teamsReceive: 
    }
    init {
        socket = SocketOwner.getInstance()!!.socket
        socket.on("dispatchTeams", onTeamsUpdate)
    }
}