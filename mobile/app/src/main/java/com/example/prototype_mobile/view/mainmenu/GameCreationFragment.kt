package com.example.prototype_mobile.view.mainmenu

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.core.content.ContextCompat
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentGameCreationBinding
import java.util.*

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [GameCreationFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class GameCreationFragment : Fragment() {

    // TODO: Rename and change types of parameters
    private var param1: String? = null
    private var param2: String? = null
    private lateinit var binding: FragmentGameCreationBinding
    private var createGameButtons: Vector<Button> = Vector<Button>()
    private var filterGameButtons: Vector<Button> = Vector<Button>()
    private var filterDifficulty: Vector<Button> = Vector<Button>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {
            param1 = it.getString(ARG_PARAM1)
            param2 = it.getString(ARG_PARAM2)
        }



    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment

        return inflater.inflate(R.layout.fragment_game_creation, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding = FragmentGameCreationBinding.bind(view)


        //Create game buttons
        createGameButtons.addElement(binding.classic)
        createGameButtons.addElement(binding.soloSprint)
        createGameButtons.addElement(binding.coopSprint)

        // Create game filter list
        filterGameButtons.addElement(binding.classicFilter)
        filterGameButtons.addElement(binding.soloFilter)
        filterGameButtons.addElement(binding.coopFilter)

        filterDifficulty.addElement(binding.easyFilter)
        filterDifficulty.addElement(binding.mediumFilter)
        filterDifficulty.addElement(binding.hardFilter)


        //Create event listener for gameCreationButton
        binding.classic.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.blue_to_lightblue)
        binding.classic.setOnClickListener {
            binding.classic.isActivated = !binding.classic.isActivated
            disableOtherButtons(binding.classic, createGameButtons)
        }

        binding.soloSprint.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.green_to_lightgreen)
        binding.soloSprint.setOnClickListener {
            binding.soloSprint.isActivated = !binding.soloSprint.isActivated
            disableOtherButtons(binding.soloSprint, createGameButtons)
        }
        binding.coopSprint.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.orange_to_lightorange)
        binding.coopSprint.setOnClickListener {
            binding.coopSprint.isActivated = !binding.coopSprint.isActivated
            disableOtherButtons(binding.coopSprint, createGameButtons)
        }

        //Create event listener for filters
        binding.classicFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.blue_to_lightblue)
        binding.classicFilter.setOnClickListener {
            binding.classicFilter.isActivated = !binding.classicFilter.isActivated
            disableOtherButtons(binding.classicFilter, filterGameButtons)
        }

        binding.soloFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.green_to_lightgreen)
        binding.soloFilter.setOnClickListener {
            binding.soloFilter.isActivated = !binding.soloFilter.isActivated
            disableOtherButtons(binding.soloFilter, filterGameButtons)
        }
        binding.coopFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.orange_to_lightorange)
        binding.coopFilter.setOnClickListener {
            binding.coopFilter.isActivated = !binding.coopFilter.isActivated
            disableOtherButtons(binding.coopFilter, filterGameButtons)
        }

        // filter difficulty
        binding.easyFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.grey_to_green)
        binding.easyFilter.setOnClickListener {
            binding.easyFilter.isActivated = !binding.easyFilter.isActivated
            disableOtherButtons(binding.easyFilter, filterDifficulty)
        }
        binding.mediumFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.grey_to_orange)
        binding.mediumFilter.setOnClickListener {
            binding.mediumFilter.isActivated = !binding.mediumFilter.isActivated
            disableOtherButtons(binding.mediumFilter, filterDifficulty)
        }
        binding.hardFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.grey_to_red)
        binding.hardFilter.setOnClickListener {
            binding.hardFilter.isActivated = !binding.hardFilter.isActivated
            disableOtherButtons(binding.hardFilter, filterDifficulty)
        }

    }

    companion object {
        fun newInstance() = GameCreationFragment()
    }

    fun disableOtherButtons(currentButton: Button, buttonGroup: Vector<Button>) {

        for (button in buttonGroup) {
            if (button.id != currentButton.id){
                button.isActivated = false
            }
        }

    }
}