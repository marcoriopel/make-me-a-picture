package com.example.prototype_mobile.model

import android.util.Log
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.emitter.Emitter

class SocketOwner() {
    companion object {
        private var instance: SocketOwner? = null

        fun getInstance(): SocketOwner? {
            if (instance == null) {
                synchronized(SocketOwner::class.java) {
                    if (instance == null) {
                        instance = SocketOwner()
                    }
                }
            }
            return instance
        }
    }

    lateinit var socket: io.socket.client.Socket

    var onConnect = Emitter.Listener {
        //After getting a Socket.EVENT_CONNECT which indicate socket has been connected to server,
        //Send token to advise that we are connected
        Log.d("Socket - ", "Connected")
    }

    init {
        try {
            //This address is the way you can connect to localhost with AVD(Android Virtual Device)
            socket = IO.socket("http://18.217.235.167:3000/")
//            mSocket = IO.socket("http://10.0.2.2:3000/")
        } catch (e: Exception) {
            e.printStackTrace()
            Log.d("fail", "Failed to connect")
        }
        socket.connect()
        socket.on(io.socket.client.Socket.EVENT_CONNECT, onConnect)
    }


}