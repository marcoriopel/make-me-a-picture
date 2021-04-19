package com.example.prototype_mobile.view.game

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.Observer
import com.example.prototype_mobile.R
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
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this).get(GameInfoViewModel::class.java)
        binding = FragmentGameInfoBinding.bind(view)

        val myUsername = viewModel.getUsername()

        val team1 = viewModel.getTeam1()
        binding.player1.text = team1[0].username
        binding.player2.text = team1[1].username
        val team2 = viewModel.getTeam2()
        binding.player3.text = team2[0].username
        binding.player4.text = team2[1].username

        if (team1[0].username == myUsername) binding.player1.setTextColor(R.color.poly_blue)
        if (team1[1].username == myUsername) binding.player2.setTextColor(R.color.poly_blue)
        if (team2[0].username == myUsername) binding.player1.setTextColor(R.color.poly_blue)
        if (team2[1].username == myUsername) binding.player2.setTextColor(R.color.poly_blue)

        viewModel.roundTimer.observe(viewLifecycleOwner, Observer {
            binding.time.text = it.timer.toString()
        })

        viewModel.teamScore.observe(viewLifecycleOwner, Observer {
            binding.scoreTeam1.text = it.score[1].toString()
            binding.scoreTeam2.text = it.score[0].toString()
        })
    }

}