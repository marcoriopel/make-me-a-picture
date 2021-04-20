package com.example.prototype_mobile.model

import android.util.Log
import com.example.prototype_mobile.model.connection.login.LoginRepository
import io.socket.client.IO
import io.socket.emitter.Emitter
import org.json.JSONObject


class SocketOwner {
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

    private  var onErrorEvent = Emitter.Listener {
        val msg = JSONObject(it[0].toString()).getString("error")
        Log.e("Socket Error", msg.toString() )

    }

    init {
        try {
            val opts = IO.Options()
            opts.query = "authorization=" + LoginRepository.getInstance()!!.user!!.token

            socket = IO.socket("http://18.219.29.27:3000/", opts)
//            socket = IO.socket("http://10.0.2.2:3000/", opts)

        } catch (e: Exception) {
            e.printStackTrace()
        }
        socket.connect()
        socket.on("error", onErrorEvent)
    }

}