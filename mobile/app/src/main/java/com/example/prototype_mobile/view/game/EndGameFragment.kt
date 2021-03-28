package com.example.prototype_mobile.view.game

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.Nullable
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentEndGameBinding
import com.example.prototype_mobile.view.mainmenu.MainMenuActivity
import com.example.prototype_mobile.viewmodel.game.GameInfoViewModel
import com.example.prototype_mobile.viewmodel.game.GameViewModel


private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [EndGameFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class EndGameFragment : Fragment() {

    private lateinit var gameInfoViewModel: GameInfoViewModel
    private lateinit var binding : FragmentEndGameBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {

        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment

        return inflater.inflate(R.layout.fragment_end_game, container, false)
    }
    //End game fragment

    override fun onViewCreated(view: View, @Nullable savedInstanceState: Bundle?){
        super.onViewCreated(view, savedInstanceState)
        binding= FragmentEndGameBinding.bind(view)
        val teamScore = sharedViewModel.teamScore.value
        setTextLabel(teamScore!![0], teamScore[1])
        setScore(teamScore)
        binding.goToMenu.setOnClickListener {
            val intent =  Intent(activity, MainMenuActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
            startActivity(intent)
            (context as Activity).finish()

        }




    }
    @SuppressLint("SetTextI18n")
    fun setTextLabel(team1Score: Int, team2Score:Int){
        if( team1Score== team2Score) {
            binding.gameWinner.text = "Égalité !!!"
        } else if ( team1Score > team2Score) {
            binding.gameWinner.text = "L'équipe 1 gagne !!!"
        }
        else if ( team1Score < team2Score) {
            binding.gameWinner.text = " L'équipe 2 gagne !!!"
        }
    }
    @SuppressLint("SetTextI18n")
    fun setScore(teamScore: IntArray){
        binding.score.text =  teamScore[0].toString() + "   -   " + teamScore[1].toString()
    }



    companion object {
        /**
         * Use this factory method to create a new instance of
         * this fragment using the provided parameters.
         *
         * @param param1 Parameter 1.
         * @param param2 Parameter 2.
         * @return A new instance of fragment EndGameFragment.
         */
        @JvmStatic
        fun newInstance(param1: String, param2: String) =
            EndGameFragment().apply {
                arguments = Bundle().apply {
                    putString(ARG_PARAM1, param1)
                    putString(ARG_PARAM2, param2)
                }
            }
    }
}