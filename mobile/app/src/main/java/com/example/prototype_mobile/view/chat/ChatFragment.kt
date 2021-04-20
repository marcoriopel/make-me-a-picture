package com.example.prototype_mobile.view.chat

import android.media.MediaPlayer
import android.os.Bundle
import android.util.Log
import android.view.*
import android.widget.Toast
import androidx.annotation.Nullable
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Message
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentChatBinding
import com.example.prototype_mobile.ressources.LinearLayoutManagerWrapper
import com.example.prototype_mobile.viewmodel.connection.chat.ChatViewModel
import com.example.prototype_mobile.viewmodel.connection.chat.ChatViewModelFactory
import org.jetbrains.anko.support.v4.runOnUiThread

class ChatFragment : Fragment() {

    var chatList: MutableList<Message> = mutableListOf()
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
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_chat, container, false)
    }


    override fun onViewCreated(view: View, @Nullable savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val recyclerView: RecyclerView = view.findViewById(R.id.recyclerView)
        val layoutManager: RecyclerView.LayoutManager = LinearLayoutManagerWrapper(context)
        recyclerView.layoutManager = layoutManager

        val recyclerViewChannel: RecyclerView = view.findViewById(R.id.recyclerViewChannel)
        val layoutManagerChannel: RecyclerView.LayoutManager = LinearLayoutManagerWrapper(context)
        recyclerViewChannel.layoutManager = layoutManagerChannel

        // define an adapter for chatroom
        if (chatViewModel.chatRepository.channelMap.containsKey("General")) {
            chatList = chatViewModel.chatRepository.channelMap["General"]!!
        }
        chatRoomAdapter = ChatRoomAdapter(view.context, chatList, chatViewModel)
        recyclerView.adapter = chatRoomAdapter
        binding = FragmentChatBinding.bind(view)
        binding.send.setOnClickListener { sendMessage() }

        chatViewModel.messageReceived.observe(viewLifecycleOwner, Observer {
            addItemToRecyclerView()
            if(it.username != chatViewModel.getUsername()) {
                val notificationSound = MediaPlayer.create(this.context, R.raw.notification)
                notificationSound.start()
            }
        })

        chatViewModel.notifyMsg.observe(viewLifecycleOwner, Observer {
            val notificationSound = MediaPlayer.create(this.context, R.raw.notification)
            notificationSound.start()
        })

        chatViewModel.messageList.observe(viewLifecycleOwner, Observer {
            val messageList = it ?: return@Observer
            switchMessageList(messageList)
        })

        // define an adapter for chat channels
        channelAdapter = ChannelAdapter(chatViewModel.channelList, chatViewModel)
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

        chatViewModel.getChannels(true)
    }

    private fun sendMessage() {
        val msg = binding.editText.text.toString()

        if (msg != "") {
            chatViewModel.sendMessage(msg)
        }

        binding.editText.setText("")
    }

    private fun addItemToRecyclerView() {
        // Since this function is inside of the listener,
        // You need to do it on UIThread!
        runOnUiThread {
            chatRoomAdapter.notifyItemInserted(chatList.size - 1)
            binding.recyclerView.scrollToPosition(chatList.size - 1) //move focus on last message
        }
    }

    private fun switchMessageList(messageList: MutableList<Message>) {
        runOnUiThread {
            chatList = messageList
            chatRoomAdapter.chatList = messageList
            chatRoomAdapter.notifyDataSetChanged()
            binding.recyclerView.scrollToPosition(chatList.size - 1) //move focus on last message
        }
    }

    private fun addChannel() {
        val channelName = binding.channelNameAdd.text.toString()

        if (channelName != "" && channelName.length <= 12) {
            chatViewModel.createChannel(channelName)
        } else {
            val toast = Toast.makeText(view?.context, "12 caractères maximum", Toast.LENGTH_LONG)
            toast.setGravity(Gravity.CENTER_VERTICAL, 0, 0)
            toast.show()
        }

        binding.channelNameAdd.setText("")
    }

    private fun refreshChannels() {
        runOnUiThread {
            channelAdapter.notifyDataSetChanged()
        }
    }

    companion object {
        fun newInstance() = ChatFragment()
    }

    fun onKeyEnter() {
        sendMessage()
    }

}