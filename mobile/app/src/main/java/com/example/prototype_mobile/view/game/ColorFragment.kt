package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.prototype_mobile.R

class ColorFragment : Fragment() {

    companion object {
        fun newInstance() = ColorFragment()
    }

    private lateinit var viewModel: ColorViewModel

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_color, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(ColorViewModel::class.java)
        // TODO: Use the ViewModel
    }

}