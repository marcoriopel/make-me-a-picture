package com.example.prototype_mobile.view.chat

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.R
import com.example.prototype_mobile.Message
import com.example.prototype_mobile.viewmodel.connection.chat.ChatViewModel

// This code is an adaptation of the tutorial found at this address : https://medium.com/@joycehong0524/simple-android-chatting-app-using-socket-io-all-source-code-provided-7b06bc7b5aff

class ChatRoomAdapter(val context : Context, var chatList : MutableList<Message>,val viewModel: ChatViewModel) : RecyclerView.Adapter<ChatRoomAdapter.ViewHolder>(){

    val CHAT_MINE = 0
    val CHAT_PARTNER = 1
    val CHAT_HISTORY = 2
    val CHAT_DELETE = 3
    val avatarIconMap: Map<Int, Int> = mapOf(
        Pair(0, R.drawable.avatar0),
        Pair(1, R.drawable.avatar1),
        Pair(2, R.drawable.avatar2),
        Pair(3, R.drawable.avatar3),
        Pair(4, R.drawable.avatar4),
        Pair(5, R.drawable.avatar5),
        Pair(6, R.drawable.avatar_v_p_v_player1),
        Pair(7, R.drawable.avatar_v_player2),
        Pair(8, R.drawable.avatar_v_player3),
        Pair(9, R.drawable.avatar_v_player4),
    )

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        var view : View? = null
        when(viewType){

            0 ->{
                view = LayoutInflater.from(context).inflate(R.layout.row_chat_user,parent,false)
            }

            1 -> {
                view = LayoutInflater.from(context).inflate(R.layout.row_chat_partner,parent,false)
            }

            2 -> {
                view = LayoutInflater.from(context).inflate(R.layout.row_channel_history,parent,false)
            }

            3 -> {
                view = LayoutInflater.from(context).inflate(R.layout.row_channel_delete,parent,false)
            }
        }

        return ViewHolder(view!!)
    }

    override fun getItemCount(): Int {
        return chatList.size
    }

    override fun getItemViewType(position: Int): Int {
        return chatList[position].messageType
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val messageData  = chatList[position]
        val userName = messageData.username + "-" + messageData.time
        val content = messageData.text
        val viewType = messageData.messageType
        val avatar = messageData.avatar

        when(viewType) {
            CHAT_MINE -> {
                holder.message.text = content
                holder.userName.text = userName
                avatarIconMap[avatar]?.let { holder.avatar.setImageResource(it) }
            }
            CHAT_PARTNER ->{
                holder.userName.text = userName
                holder.message.text = content
                avatarIconMap[avatar]?.let { holder.avatar.setImageResource(it) }
            }
            CHAT_HISTORY ->{
                holder.history.setOnClickListener { viewModel.showHistory() }
            }
            CHAT_DELETE -> {
                holder.history.setOnClickListener { viewModel.deleteChannel()}
            }
        }

    }
    inner class ViewHolder(itemView : View):  RecyclerView.ViewHolder(itemView) {
        val userName = itemView.findViewById<TextView>(R.id.username)
        val message = itemView.findViewById<TextView>(R.id.message)
        val history = itemView.findViewById<TextView>(R.id.channel_history)
        val avatar = itemView.findViewById<ImageView>(R.id.avatar)
    }

}