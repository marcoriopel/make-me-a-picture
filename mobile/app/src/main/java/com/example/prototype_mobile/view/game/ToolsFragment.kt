package com.example.prototype_mobile.view.game

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.prototype_mobile.R
import com.example.prototype_mobile.viewmodel.connection.login.LoginViewModel
import com.example.prototype_mobile.viewmodel.connection.login.LoginViewModelFactory
import com.example.prototype_mobile.viewmodel.game.ToolsViewModel
import com.example.prototype_mobile.viewmodel.game.ToolsViewModelFactory

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
        viewModel = ViewModelProvider(this, ToolsViewModelFactory())
            .get(ToolsViewModel::class.java)
        // TODO: Use the ViewModel
    }

}