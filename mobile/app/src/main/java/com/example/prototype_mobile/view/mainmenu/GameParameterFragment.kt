package com.example.prototype_mobile.view.mainmenu

import android.graphics.drawable.Drawable
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.Nullable
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentGameCreationBinding
import com.example.prototype_mobile.databinding.FragmentGameParameterBinding

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [gameParameterFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class GameParameterFragment : Fragment() {
    // TODO: Rename and change types of parameters

    private lateinit var  binding: FragmentGameParameterBinding
    private var checked = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {

        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        var view = inflater.inflate(R.layout.fragment_game_parameter, container, false)
        return view
    }

    override fun onViewCreated(view: View, @Nullable savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding = FragmentGameParameterBinding.bind(view)
        binding.icognito.setOnClickListener{
             hello()
                binding.icognito.isActivated = ! binding.icognito.isActivated

        }

    }



    companion object {
        /**
         * Use this factory method to create a new instance of
         * this fragment using the provided parameters.
         *
         * @param param1 Parameter 1.
         * @param param2 Parameter 2.
         * @return A new instance of fragment gameParameterFragment.
         */
        // TODO: Rename and change types and number of parameters
        @JvmStatic
        fun newInstance() =
                GameParameterFragment().apply {
                    arguments = Bundle().apply {

                    }
                }
    }

    fun hello() {
        println("hellooo")
    }
}