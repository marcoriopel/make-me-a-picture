package com.example.prototype_mobile.view.game

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentGameInfoBinding
import com.example.prototype_mobile.databinding.FragmentSprintInfoBinding
import com.example.prototype_mobile.viewmodel.game.GameInfoViewModel


class SprintInfoFragment : Fragment() {

    companion object {
        fun newInstance() = SprintInfoFragment()
    }

    private lateinit var viewModel: GameInfoViewModel
    private lateinit var binding: FragmentSprintInfoBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_sprint_info, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this).get(GameInfoViewModel::class.java)
        binding = FragmentSprintInfoBinding.bind(view)

        viewModel.gameTimer.observe(viewLifecycleOwner, Observer {
            binding.gameTimer.text = it.timer.toString()
        })

        viewModel.roundTimer.observe(viewLifecycleOwner, Observer {
            binding.drawingTimer.text = it.timer.toString()
        })

        viewModel.teamScore.observe(viewLifecycleOwner, Observer {
            binding.score.text = it.score[0].toString()
        })

        viewModel.guessesLeft.observe(viewLifecycleOwner, Observer {
            binding.guessesLeft.text = it.toString()
        })
    }


}