package com.example.prototype_mobile.view.mainmenu

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.core.content.ContextCompat
import androidx.fragment.app.activityViewModels
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentGameCreationBinding
import com.example.prototype_mobile.model.connection.sign_up.model.SelectedButton
import com.example.prototype_mobile.view.connection.sign_up.SignUpActivity
import com.example.prototype_mobile.view.tutorial.StaticTutorialActivity
import com.example.prototype_mobile.viewmodel.mainmenu.MainMenuViewModel
import org.jetbrains.anko.support.v4.act
import java.util.*

class GameCreationFragment : Fragment() {

    private lateinit var binding: FragmentGameCreationBinding
    private var _createGameButtons: Vector<Button> = Vector<Button>()
    private var _selectedButton: SelectedButton = SelectedButton.SEARCH
    private val sharedViewModel: MainMenuViewModel by activityViewModels()

    companion object {
        fun newInstance() = GameCreationFragment()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_game_creation, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding = FragmentGameCreationBinding.bind(view)

        //Create game buttons
        _createGameButtons.addElement(binding.classic)
        _createGameButtons.addElement(binding.soloSprint)
        _createGameButtons.addElement(binding.coopSprint)
        _createGameButtons.addElement(binding.gameSearch)

        binding.gameSearch.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.red_to_lightred)
        binding.gameSearch.setOnClickListener {
            binding.gameSearch.isActivated = !binding.gameSearch.isActivated
            setSelectedButton(binding.gameSearch, SelectedButton.SEARCH)
            disableOtherButtons(binding.gameSearch, _createGameButtons)
        }

        binding.classic.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.blue_to_lightblue)
        binding.classic.setOnClickListener {
            binding.classic.isActivated = !binding.classic.isActivated
            setSelectedButton(binding.classic, SelectedButton.CLASSIC)
            disableOtherButtons(binding.classic, _createGameButtons)
        }

        binding.soloSprint.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.green_to_lightgreen)
        binding.soloSprint.setOnClickListener {
            binding.soloSprint.isActivated = !binding.soloSprint.isActivated
            setSelectedButton(binding.soloSprint, SelectedButton.SPRINT)

            disableOtherButtons(binding.soloSprint, _createGameButtons)
        }
        binding.coopSprint.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.orange_to_lightorange)
        binding.coopSprint.setOnClickListener {
            binding.coopSprint.isActivated = !binding.coopSprint.isActivated
            setSelectedButton(binding.coopSprint, SelectedButton.COOP)

            disableOtherButtons(binding.coopSprint, _createGameButtons)
        }

        binding.tutorial.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.red_to_lightred)

        binding.tutorial.setOnClickListener {
            sharedViewModel.resetActivityData()
            val intent = Intent(activity, StaticTutorialActivity::class.java)
            startActivity(intent)
        }
        binding.joinGame.setOnClickListener {
            setSelectedButton(binding.gameSearch, SelectedButton.SEARCH)
            sharedViewModel.joinPrivateGame(binding.inviteIdCode.text.toString())
        }
    }

    private fun disableOtherButtons(currentButton: Button, buttonGroup: Vector<Button>) {
        for (button in buttonGroup) {
            if (button.id != currentButton.id){
                button.isActivated = false
            }
        }
    }

    private fun setSelectedButton(button: Button, selection:SelectedButton) {
        _selectedButton = if(button.isActivated) selection else SelectedButton.NONE
        sharedViewModel.setCreationGameButtonType(_selectedButton)
    }

}