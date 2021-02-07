package com.example.prototype_mobile.ui.chat

import com.example.prototype_mobile.R
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.gson.Gson
import com.example.prototype_mobile.data.model.MessageType
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import com.example.prototype_mobile.*
import com.example.prototype_mobile.databinding.ActivityChatBinding

class ChatActivity : AppCompatActivity(), View.OnClickListener {

    val TAG = ChatActivity::class.java.simpleName

    lateinit var mSocket: Socket;
    lateinit var userName: String;
    private lateinit var binding: ActivityChatBinding;

    val gson: Gson = Gson()

    //For setting the recyclerView.
    val chatList: ArrayList<Message> = arrayListOf();
    lateinit var chatRoomAdapter: ChatRoomAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(R.layout.activity_chat)

        binding.send.setOnClickListener(this)


        //Get the nickname and roomname from entrance activity.
        try {
            userName = intent.getStringExtra("USERNAME")!!
        } catch (e: Exception) {
            e.printStackTrace()
        }

        //Set Chatroom RecyclerView adapter
        chatRoomAdapter = ChatRoomAdapter(this, chatList);
        binding.recyclerView.adapter = chatRoomAdapter;

        val layoutManager = LinearLayoutManager(this)
        binding.recyclerView.layoutManager = layoutManager

        //Let's connect to our Chat room! :D
        try {
            //This address is the way you can connect to localhost with AVD(Android Virtual Device)
            mSocket = IO.socket("https://18.217.235.167:3000/")
            Log.d("success", mSocket.id())

        } catch (e: Exception) {
            e.printStackTrace()
            Log.d("fail", "Failed to connect")
        }

        mSocket.connect()
        //Register all the listener and callbacks here.
        mSocket.on(Socket.EVENT_CONNECT, onConnect)
        mSocket.on("updateChat", onUpdateChat) // To update if someone send a message to chatroom
    }


    // <----- Callback functions ------->

    var onConnect = Emitter.Listener {
        //After getting a Socket.EVENT_CONNECT which indicate socket has been connected to server,
        //send userName and roomName so that they can join the room.
        val data = initialData(userName)
        val jsonData = gson.toJson(data) // Gson changes data object to Json type.
        mSocket.emit("subscribe", jsonData)
    }

    var onUpdateChat = Emitter.Listener {
        val chat: Message = gson.fromJson(it[0].toString(), Message::class.java)
        chat.viewType = MessageType.CHAT_PARTNER.index
        addItemToRecyclerView(chat)
    }


    private fun sendMessage() {
        val content = binding.editText.text.toString()
        val sendData = SendMessage(userName, content)
        val jsonData = gson.toJson(sendData)
        mSocket.emit("newMessage", jsonData)

        val message = Message(userName, content, MessageType.CHAT_MINE.index)
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
        val data = initialData(userName)
        val jsonData = gson.toJson(data)

        //Before disconnecting, send "unsubscribe" event to server so that
        //server can send "userLeftChatRoom" event to other users in chatroom
        mSocket.emit("unsubscribe", jsonData)
        mSocket.disconnect()
    }

}