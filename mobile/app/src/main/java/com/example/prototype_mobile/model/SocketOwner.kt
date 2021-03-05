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

    init {
        try {
            //This address is the way you can connect to localhost with AVD(Android Virtual Device)
            //socket = IO.socket("http://18.217.235.167:3000/")
            socket = IO.socket("http://10.0.2.2:3000/")

        } catch (e: Exception) {
            e.printStackTrace()
        }
        socket.connect()
    }


}