package com.example.prototype_mobile.view.game

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.prototype_mobile.R
import com.example.prototype_mobile.viewmodel.game.ToolsAdjustmentViewModel

class ToolsAdjustmentFragment : Fragment() {

    companion object {
        fun newInstance() = ToolsAdjustmentFragment()
    }

    private lateinit var viewModel: ToolsAdjustmentViewModel

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_tools_adjustment, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(ToolsAdjustmentViewModel::class.java)
        // TODO: Use the ViewModel
    }

}