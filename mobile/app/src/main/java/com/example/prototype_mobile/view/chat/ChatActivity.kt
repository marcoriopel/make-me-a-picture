package com.example.prototype_mobile.view.chat

import com.example.prototype_mobile.R
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.databinding.ActivityChatBinding

// This code is an adaptation of the tutorial found at this address : https://medium.com/@joycehong0524/simple-android-chatting-app-using-socket-io-all-source-code-provided-7b06bc7b5aff
class ChatActivity : AppCompatActivity(), View.OnClickListener {

    lateinit var mSocket: Socket;
    private lateinit var binding: ActivityChatBinding

    val gson: Gson = Gson()
    val myUsername = LoginRepository.getInstance(HttpRequestDrawGuess())!!.user!!.displayName
    val token = LoginRepository.getInstance(HttpRequestDrawGuess())!!.user!!.token

    //For setting the recyclerView.
    var chatList: MutableList<Message> = mutableListOf() ;
    lateinit var chatRoomAdapter: ChatRoomAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        val view = binding.root
        setContentView(view)

        binding.send.setOnClickListener { sendMessage() }

        //Set Chatroom RecyclerView adapter
        chatRoomAdapter = ChatRoomAdapter(this, chatList);
        binding.recyclerView.adapter = chatRoomAdapter;

        val layoutManager = LinearLayoutManager(this)
        binding.recyclerView.layoutManager = layoutManager

        //Let's connect to our Chat room! :D

        try {
            //This address is the way you can connect to localhost with AVD(Android Virtual Device)
            mSocket = IO.socket("http://18.217.235.167:3000/")
            // mSocket = IO.socket("http://10.0.2.2:3000/")
        } catch (e: Exception) {
            e.printStackTrace()
            Log.d("fail", "Failed to connect")
        }

        //Register all the listener and callbacks here.
        mSocket.on(Socket.EVENT_CONNECT, onConnect)
        mSocket.on("message", onUpdateChat) // To update if someone send a message to chatroom
        mSocket.connect()
    }

    // <----- Callback functions ------->

    var onConnect = Emitter.Listener {
        //After getting a Socket.EVENT_CONNECT which indicate socket has been connected to server,
        //Send token to advise that we are connected
        Log.d("Socket - ", "Connected")

    }

    var onUpdateChat = Emitter.Listener {
        val messageReceive: MessageReceive  = gson.fromJson(it[0].toString(), MessageReceive ::class.java)
        var messageType = 1;
        if (myUsername == messageReceive.username)
            messageType = 0
        val messageToDisplay: Message = Message(messageReceive.username, messageReceive.text, messageReceive.timeStamp, messageType)
        addItemToRecyclerView(messageToDisplay)
    }


    private fun sendMessage() {
        val msg = findViewById<EditText>(R.id.editText).text.toString()
        if (msg != "")
            mSocket.emit("message", gson.toJson(SendMessage(msg, token)))
        binding.editText.setText("")
    }

    private fun addItemToRecyclerView(message: Message) {
        // Since this function is inside of the listener,
        // You need to do it on UIThread!
       runOnUiThread {
           chatList.add(message)
           chatRoomAdapter.notifyItemInserted(chatList.size - 1)
           binding.recyclerView.scrollToPosition(chatList.size - 1) //move focus on last message
        }
    }


    override fun onClick(p0: View?) {
        when (p0!!.id) {
            R.id.send -> sendMessage()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        val data = initialData(token)
        val jsonData = gson.toJson(data)

        //Before disconnecting, send "unsubscribe" event to server so that
        //server can send "userLeftChatRoom" event to other users in chatroom
        mSocket.emit("unsubscribe", jsonData)
        mSocket.disconnect()
    }

}