package com.example.prototype_mobile.view.chat

import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.annotation.Nullable
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Channel
import com.example.prototype_mobile.Message
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentChatBinding
import com.example.prototype_mobile.viewmodel.connection.chat.ChatViewModel
import com.example.prototype_mobile.viewmodel.connection.chat.ChatViewModelFactory
import org.jetbrains.anko.support.v4.runOnUiThread

class ChatFragment : Fragment() {

    var chatList: MutableList<Message> = mutableListOf()
    var channelList: MutableList<Channel> = mutableListOf()
    lateinit var chatRoomAdapter: ChatRoomAdapter
    lateinit var channelAdapter: ChannelAdapter
    private lateinit var binding: FragmentChatBinding
    private lateinit var chatViewModel: ChatViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        //Set Chatroom RecyclerView adapter
        chatViewModel = ViewModelProvider(this, ChatViewModelFactory()).get(ChatViewModel::class.java)

    }

    override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_chat, container, false)
    }


    override fun onViewCreated(view: View, @Nullable savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val recyclerView: RecyclerView = view.findViewById(R.id.recyclerView)
        val layoutManager: RecyclerView.LayoutManager = LinearLayoutManager(context)
        recyclerView.layoutManager = layoutManager

        val recyclerViewChannel: RecyclerView = view.findViewById(R.id.recyclerViewChannel)
        val layoutManagerChannel: RecyclerView.LayoutManager = LinearLayoutManager(context)
        recyclerViewChannel.layoutManager = layoutManagerChannel

        // define an adapter for chatroom
        chatRoomAdapter = ChatRoomAdapter(view.context, chatList);
        recyclerView.adapter = chatRoomAdapter
        binding = FragmentChatBinding.bind(view)
        binding.send.setOnClickListener { sendMessage() }

        chatViewModel.messageReceived.observe(viewLifecycleOwner, Observer {
            val messageToDisplay = it ?: return@Observer
            addItemToRecyclerView(messageToDisplay)
        })

        chatViewModel.messageList.observe(viewLifecycleOwner, Observer {
            val messageList = it ?: return@Observer
            switchMessageList(messageList)
        })

        // define an adapter for chat channels
        channelAdapter = ChannelAdapter(chatViewModel.channelList, chatViewModel);
        recyclerViewChannel.adapter = channelAdapter
        binding.addButton.setOnClickListener { addChannel() }
        binding.refreshButton.setOnClickListener { chatViewModel.getChannels() }

        chatViewModel.createChannelResult.observe(viewLifecycleOwner, Observer {
            val error = it ?: return@Observer
            val toast = Toast.makeText(view.context, getString(error), Toast.LENGTH_LONG)
            toast.setGravity(Gravity.CENTER_VERTICAL, 0, 0)
            toast.show()
        })

        chatViewModel.getChannelResult.observe(viewLifecycleOwner, Observer {
            val error = it ?: return@Observer
            if (error != -1) {
                val toast = Toast.makeText(view.context, getString(error), Toast.LENGTH_LONG)
                toast.setGravity(Gravity.CENTER_VERTICAL, 0, 0)
                toast.show()
            } else {
                refreshChannels()
            }
        })
    }

    private fun sendMessage() {
        val msg = binding.editText.text.toString()

        if (msg != "") {
            chatViewModel.sendMessage(msg)
        }

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

    private fun switchMessageList(messageList: MutableList<Message>) {
        runOnUiThread {
            chatList = messageList
            chatRoomAdapter.notifyDataSetChanged()
            binding.recyclerView.scrollToPosition(chatList.size - 1) //move focus on last message
        }
    }

    private fun addChannel() {
        val channelName = binding.channelNameAdd.text.toString()

        if (channelName != "") {
            chatViewModel.createChannel(channelName)
        }

        binding.channelNameAdd.setText("")
    }

    private fun refreshChannels() {
        Log.d("refreshing", "refreshed")
        runOnUiThread {
            channelAdapter.notifyDataSetChanged()
        }
    }

    companion object {
        fun newInstance() = ChatFragment()
    }
}