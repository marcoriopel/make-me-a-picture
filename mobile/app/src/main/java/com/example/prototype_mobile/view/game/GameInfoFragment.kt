package com.example.prototype_mobile.view.game

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.Observer
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentChatBinding
import com.example.prototype_mobile.databinding.FragmentGameInfoBinding
import com.example.prototype_mobile.viewmodel.game.GameInfoViewModel

class GameInfoFragment : Fragment() {

    companion object {
        fun newInstance() = GameInfoFragment()
    }

    private lateinit var viewModel: GameInfoViewModel
    private lateinit var binding: FragmentGameInfoBinding

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.fragment_game_info, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(GameInfoViewModel::class.java)
        // TODO: Use the ViewModel

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this).get(GameInfoViewModel::class.java)
        binding = FragmentGameInfoBinding.bind(view)

        viewModel.timer.observe(viewLifecycleOwner, Observer {
            binding.time.text = it.timer.toString()
        })

        viewModel.teamScore.observe(viewLifecycleOwner, Observer {
            binding.scoreTeam1.text = it.score[0].toString()
            binding.scoreTeam2.text = it.score[1].toString()
        })
    }

}