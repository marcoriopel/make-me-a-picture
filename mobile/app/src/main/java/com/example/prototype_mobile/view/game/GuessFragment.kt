package com.example.prototype_mobile.view.game

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentChatBinding
import com.example.prototype_mobile.databinding.FragmentGuessBinding
import com.example.prototype_mobile.model.game.GameRepository
import com.example.prototype_mobile.viewmodel.game.GuessViewModel

class GuessFragment : Fragment() {

    private lateinit var binding: FragmentGuessBinding

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
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding = FragmentGuessBinding.bind(view)
        binding.buttonGuess.setOnClickListener { guess() }
    }

    private fun guess() {
        if (binding.guess.text.toString().length > 0) {
            viewModel.guessDrawing(binding.guess.text.toString())
            binding.guess.setText("")
        }
    }

}