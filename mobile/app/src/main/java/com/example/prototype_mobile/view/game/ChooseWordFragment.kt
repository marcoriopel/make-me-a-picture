package com.example.prototype_mobile.view.game

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentChooseWordBinding
import com.example.prototype_mobile.databinding.FragmentGuessBinding
import com.example.prototype_mobile.viewmodel.game.GameViewModel

class ChooseWordFragment : Fragment() {

    private lateinit var gameViewModel: GameViewModel
    private lateinit var binding: FragmentChooseWordBinding


    companion object {
        fun newInstance() = ChooseWordFragment()
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_choose_word, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding = FragmentChooseWordBinding.bind(view)
        binding.wordButton1.setOnClickListener { gameViewModel.chooseWord(binding.wordButton1.text.toString())}
        binding.wordButton2.setOnClickListener { gameViewModel.chooseWord(binding.wordButton2.text.toString())}
        binding.wordButton3.setOnClickListener { gameViewModel.chooseWord(binding.wordButton3.text.toString())}
        binding.refreshButton.setOnClickListener { gameViewModel.refreshSuggestions() }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        gameViewModel = ViewModelProvider(this).get(GameViewModel::class.java)
        gameViewModel.gameRepository.suggestions.observe(this, Observer {
            bindButton()
        })
    }

    fun bindButton() {
        val suggestions = gameViewModel.getSuggestion()
        binding.wordButton1.text = suggestions.drawingNames[0]
        binding.wordButton2.text = suggestions.drawingNames[1]
        binding.wordButton3.text = suggestions.drawingNames[2]
    }
}