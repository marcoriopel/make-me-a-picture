package com.example.prototype_mobile.ui.chat

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.R
import com.example.prototype_mobile.Message

class ChatRoomAdapter(val context : Context, val chatList : ArrayList<Message>) : RecyclerView.Adapter<ChatRoomAdapter.ViewHolder>(){

    val CHAT_MINE = 0
    val CHAT_PARTNER = 1

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {

        Log.d("chatlist size",chatList.size.toString())
        var view : View? = null
        when(viewType){

            0 ->{
                view = LayoutInflater.from(context).inflate(R.layout.row_chat_user,parent,false)
                Log.d("user inflating","viewType : ${viewType}")
            }

            1 ->
            {
                view = LayoutInflater.from(context).inflate(R.layout.row_chat_partner,parent,false)
                Log.d("partner inflating","viewType : ${viewType}")
            }
        }

        return ViewHolder(view!!)
    }

    override fun getItemCount(): Int {
        return chatList.size
    }

    override fun getItemViewType(position: Int): Int {
        return 1
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val messageData  = chatList[position]
        val userName = messageData.username;
        val content = messageData.text;
        val viewType = 1

        when(viewType) {
            CHAT_MINE -> {
                holder.message.setText(content)
            }
            CHAT_PARTNER ->{
                holder.userName.setText(userName)
                holder.message.setText(content)
            }
        }

    }
    inner class ViewHolder(itemView : View):  RecyclerView.ViewHolder(itemView) {
        val userName = itemView.findViewById<TextView>(R.id.username)
        val message = itemView.findViewById<TextView>(R.id.message)
    }

}