package com.example.prototype_mobile.ui.chat

import com.example.prototype_mobile.R
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.gson.Gson
import com.example.prototype_mobile.data.model.MessageType
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import com.example.prototype_mobile.*
import com.example.prototype_mobile.data.LoginDataSource
import com.example.prototype_mobile.data.LoginRepository
import com.example.prototype_mobile.databinding.ActivityChatBinding

class ChatActivity : AppCompatActivity(), View.OnClickListener {

    lateinit var mSocket: Socket;
    private lateinit var binding: ActivityChatBinding;

    val gson: Gson = Gson()
    val myUsername = LoginRepository.getInstance(LoginDataSource())!!.user!!.displayName
    val token = LoginRepository.getInstance(LoginDataSource())!!.user!!.token

    //For setting the recyclerView.
    val chatList: ArrayList<Message> = arrayListOf();
    lateinit var chatRoomAdapter: ChatRoomAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(R.layout.activity_chat)

        val send = findViewById<ImageView>(R.id.send)
        send.setOnClickListener { sendMessage() }

        //Set Chatroom RecyclerView adapter
        chatRoomAdapter = ChatRoomAdapter(this, chatList);
        binding.recyclerView.adapter = chatRoomAdapter;

        val layoutManager = LinearLayoutManager(this)
        binding.recyclerView.layoutManager = layoutManager

        //Let's connect to our Chat room! :D
        try {
            //This address is the way you can connect to localhost with AVD(Android Virtual Device)
            mSocket = IO.socket("http://18.217.235.167:3000/")

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
        val jsonData = gson.toJson(initialData(token)) // Gson changes data object to Json type.
        mSocket.emit("message", jsonData)
    }

    var onUpdateChat = Emitter.Listener {
        val chat: Message = gson.fromJson(it[0].toString(), Message::class.java)
        addItemToRecyclerView(chat)
    }


    private fun sendMessage() {
        val content = binding.editText.text.toString()
        val dataJson = gson.toJson(SendMessage(content, token))
        mSocket.emit("message", dataJson)

        val message = Message(myUsername, content, "1")
        addItemToRecyclerView(message)
    }

    private fun addItemToRecyclerView(message: Message) {

        //Since this function is inside of the listener,
        //You need to do it on UIThread!
        runOnUiThread {
            chatList.add(message)
            chatRoomAdapter.notifyItemInserted(chatList.size)
            binding.editText.setText("")
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