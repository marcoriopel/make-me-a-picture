package com.example.prototype_mobile.view.game

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.prototype_mobile.R
import com.example.prototype_mobile.viewmodel.game.GuessViewModel

class GuessFragment : Fragment() {

    companion object {
        fun newInstance() = GuessFragment()
    }

    private lateinit var viewModel: GuessViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.fragment_guess, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(GuessViewModel::class.java)
        // TODO: Use the ViewModel
    }

}