package com.example.prototype_mobile.view.game

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.prototype_mobile.R
import com.example.prototype_mobile.viewmodel.game.ToolsViewModel

class ToolsFragment : Fragment() {

    companion object {
        fun newInstance() = ToolsFragment()
    }

    private lateinit var viewModel: ToolsViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.fragment_tools, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(ToolsViewModel::class.java)
        // TODO: Use the ViewModel
    }

}