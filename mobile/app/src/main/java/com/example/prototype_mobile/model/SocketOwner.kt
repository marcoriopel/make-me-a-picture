package com.example.prototype_mobile.model

import com.example.prototype_mobile.model.connection.login.LoginRepository
import io.socket.client.IO
import io.socket.emitter.Emitter
import io.socket.engineio.client.Transport
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
            val options = IO.Options()
            //This address is the way you can connect to localhost with AVD(Android Virtual Device)
            socket = IO.socket("http://18.217.235.167:3000/", options)
//            socket = IO.socket("http://10.0.2.2:3000/")

        } catch (e: Exception) {
            e.printStackTrace()
        }
        socket.connect()
    }

    private val onTransport = Emitter.Listener { args ->
        val transport: Transport = args[0] as Transport
        transport.on(Transport.EVENT_REQUEST_HEADERS, Emitter.Listener { args ->
            val headers = args[0] as MutableMap<String, List<String>>
            val bearer = "bearer " + LoginRepository.getInstance()!!.user!!.token
            headers["Authorization"] = Arrays.asList(bearer)
        }).on(Transport.EVENT_RESPONSE_HEADERS, Emitter.Listener { })
    }
}