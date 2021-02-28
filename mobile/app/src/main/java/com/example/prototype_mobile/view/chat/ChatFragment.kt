package com.example.prototype_mobile.view.chat

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.Nullable
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Message
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentChatBinding
import com.example.prototype_mobile.viewmodel.connection.chat.ChatViewModel
import com.example.prototype_mobile.viewmodel.connection.chat.ChatViewModelFactory
import org.jetbrains.anko.support.v4.runOnUiThread

class ChatFragment : Fragment() {

    var chatList: MutableList<Message> = mutableListOf() ;
    lateinit var chatRoomAdapter: ChatRoomAdapter
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
        var view = inflater.inflate(R.layout.fragment_chat, container, false)

        return view
    }


    override fun onViewCreated(view: View, @Nullable savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val recyclerView: RecyclerView = view.findViewById(R.id.recyclerView)
        val layoutManager: RecyclerView.LayoutManager = LinearLayoutManager(context)
        recyclerView.layoutManager = layoutManager

        // define an adapter
        chatRoomAdapter = ChatRoomAdapter(view.context, chatList);
        recyclerView.adapter = chatRoomAdapter
        binding = FragmentChatBinding.bind(view)
        binding.send.setOnClickListener { sendMessage() }

        chatViewModel.messageReceived.observe(viewLifecycleOwner, Observer {
            val messageToDisplay = it ?: return@Observer
            addItemToRecyclerView(messageToDisplay)
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

    companion object {
        fun newInstance() = ChatFragment()
    }
}