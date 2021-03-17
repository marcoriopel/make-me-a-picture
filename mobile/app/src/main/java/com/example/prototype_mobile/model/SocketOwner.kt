package com.example.prototype_mobile.model

import com.example.prototype_mobile.model.connection.login.LoginRepository
import io.socket.client.IO
import java.util.*

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
            val opts = IO.Options()
            opts.extraHeaders.set("authorization",  Arrays.asList(LoginRepository.getInstance()!!.user!!.token))
            //This address is the way you can connect to localhost with AVD(Android Virtual Device)
//            socket = IO.socket("http://18.217.235.167:3000/")
            socket = IO.socket("http://10.0.2.2:3000/", opts)

        } catch (e: Exception) {
            e.printStackTrace()
        }
        socket.connect()
    }


}