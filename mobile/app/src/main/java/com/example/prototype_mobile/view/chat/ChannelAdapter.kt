package com.example.prototype_mobile.view.chat

import androidx.recyclerview.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.example.prototype_mobile.Channel
import com.example.prototype_mobile.Message
import com.example.prototype_mobile.R
import com.example.prototype_mobile.model.connection.sign_up.model.ChannelState
import com.example.prototype_mobile.viewmodel.connection.chat.ChatViewModel

/**
 * [RecyclerView.Adapter] that can display a [DummyItem].
 * TODO: Replace the implementation with code for your data type.
 */
class ChannelAdapter(private val values: List<Channel>, val viewModel: ChatViewModel) : RecyclerView.Adapter<ChannelAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.row_channel_list, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val channel = values[position]
        holder.channelName.setText(channel.chatName)
        when(channel.channelState) {
            ChannelState.JOINED -> {
                holder.background.setBackgroundResource(R.drawable.button_rounded_channel)
                holder.joinButton.visibility = View.GONE
                holder.background.setOnClickListener {
                    viewModel.switchChannel(channel.chatId)
                }
                if (channel.chatId != "General") {
                    holder.leaveButton.visibility = View.VISIBLE
                    holder.leaveButton.setOnClickListener { viewModel.leaveChannel(channel.chatId) }
                }
            }
            ChannelState.NOTIFIED -> {
                holder.background.setBackgroundResource(R.drawable.button_rounded_channel_notif)
                holder.joinButton.visibility = View.GONE

                if (channel.chatId != "General") {
                    holder.leaveButton.visibility = View.VISIBLE
                    holder.leaveButton.setOnClickListener { viewModel.leaveChannel(channel.chatId) }
                }
                holder.background.setOnClickListener {
                    viewModel.switchChannel(channel.chatId)
                }
            }
            ChannelState.NOTJOINED -> {
                holder.background.setBackgroundResource(R.drawable.button_rounded_channel)
                holder.joinButton.visibility = View.VISIBLE
                holder.leaveButton.visibility = View.GONE
                holder.joinButton.setOnClickListener { viewModel.joinChannel(channel.chatId) }
            }
            ChannelState.SHOWN -> {
                holder.background.setBackgroundResource(R.drawable.button_rounded_channel_shown)
                holder.joinButton.visibility = View.GONE
                holder.leaveButton.visibility = View.GONE
            }
        }
    }

    override fun getItemCount(): Int = values.size

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val channelName: TextView = view.findViewById(R.id.channel_list_name)
        val joinButton: Button = view.findViewById(R.id.channel_list_join)
        val leaveButton: ImageView = view.findViewById(R.id.channel_list_leave)
        val background: LinearLayout = view.findViewById(R.id.channel_background)
    }
}