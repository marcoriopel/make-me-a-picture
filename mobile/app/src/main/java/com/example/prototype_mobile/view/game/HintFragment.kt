package com.example.prototype_mobile.view.game

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentHintBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.viewmodel.game.GameViewModel
import com.example.prototype_mobile.viewmodel.game.GuessViewModel

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER

/**
 * A simple [Fragment] subclass.
 * Use the [HintFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class HintFragment : Fragment() {


    private lateinit var binding: FragmentHintBinding
    private lateinit var gameViewModel: GameViewModel


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {

        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_hint, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding = FragmentHintBinding.bind(view)
        gameViewModel = ViewModelProvider(this).get(GameViewModel::class.java)

        binding.hintButton.setOnClickListener {
            gameViewModel.hintRequest()
        }

    }


    companion object {

        @JvmStatic
        fun newInstance() =
                HintFragment().apply {
                    arguments = Bundle().apply {

                    }
                }
    }
}