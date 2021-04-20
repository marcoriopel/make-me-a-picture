package com.example.prototype_mobile.view.mainmenu

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.annotation.Nullable
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import com.example.prototype_mobile.Difficulty
import com.example.prototype_mobile.GameCreationMergeData
import com.example.prototype_mobile.GameName
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentGameParameterBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameDifficulty
import com.example.prototype_mobile.model.connection.sign_up.model.SelectedButton
import com.example.prototype_mobile.view.connection.login.afterTextChanged
import com.example.prototype_mobile.viewmodel.mainmenu.MainMenuViewModel
import java.util.*

class GameParameterFragment : Fragment() {

    private lateinit var  binding: FragmentGameParameterBinding
    private var filterDifficulty: Vector<Button> = Vector<Button>()
    private val mainMenuViewModel: MainMenuViewModel by activityViewModels()

    private var isPrivate = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        var view = inflater.inflate(R.layout.fragment_game_parameter, container, false)
        return view
    }

    override fun onViewCreated(view: View, @Nullable savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        var gameName =""
        var difficulty = GameDifficulty.NONE

        binding = FragmentGameParameterBinding.bind(view)

        filterDifficulty.addElement(binding.easyFilter)
        filterDifficulty.addElement(binding.mediumFilter)
        filterDifficulty.addElement(binding.hardFilter)

        // filter difficulty
        binding.easyFilter.setOnClickListener {
            binding.easyFilter.isActivated = true
            disableOtherButtons(binding.easyFilter, filterDifficulty)
            if(binding.easyFilter.isActivated){
                mainMenuViewModel.setGameDifficulty(GameDifficulty.EASY)
            }
            mainMenuViewModel.liveDataMerger = mainMenuViewModel.fetchData()
        }

        binding.mediumFilter.setOnClickListener {
            binding.mediumFilter.isActivated = true
            disableOtherButtons(binding.mediumFilter, filterDifficulty)
            if(binding.mediumFilter.isActivated){
                mainMenuViewModel.setGameDifficulty(GameDifficulty.MEDIUM)
            }
            mainMenuViewModel.liveDataMerger = mainMenuViewModel.fetchData()
        }

        binding.hardFilter.setOnClickListener {
            binding.hardFilter.isActivated = true
            disableOtherButtons(binding.hardFilter, filterDifficulty)
            if(binding.hardFilter.isActivated){
                mainMenuViewModel.setGameDifficulty(GameDifficulty.HARD)
            }

            mainMenuViewModel.liveDataMerger = mainMenuViewModel.fetchData()
        }

        //Incognito button
        binding.incognito.setOnClickListener{
            binding.incognito.isActivated = ! binding.incognito.isActivated
            if(binding.incognito.isActivated) {
                mainMenuViewModel._isPrivate.value = true
                isPrivate = true
            } else {
                isPrivate = false
                mainMenuViewModel._isPrivate.value = false
            }

            mainMenuViewModel.setIncognitoMode(binding.incognito.isActivated)
        }


        updateFragmentView(mainMenuViewModel.creationGameButtonType.value!!)

        // Set parameter to game
        binding.gameName.afterTextChanged {
            mainMenuViewModel.setGameName(binding.gameName.text.toString())
            mainMenuViewModel.fetchData()
        }

        mainMenuViewModel.liveDataMerger.observe(viewLifecycleOwner, Observer<GameCreationMergeData> {
            when (it) {
                is GameName -> {
                    gameName = it.name
                }
                is Difficulty -> {
                    difficulty = it.difficulty
                }
            }
            binding.StartGame.isActivated = gameName != "" && difficulty != GameDifficulty.NONE
        })

        binding.StartGame.setOnClickListener{
            if(binding.StartGame.isActivated) {
                mainMenuViewModel.createGame()

            }
        }
    }

    fun disableOtherButtons(currentButton: Button, buttonGroup: Vector<Button>) {
        for (button in buttonGroup) {
            if (button.id != currentButton.id){
                button.isActivated = false
            }
        }
    }

    fun updateIncognitoPassword(password: String) {
        mainMenuViewModel.setIncognitoPassword(password)
    }

    fun updateFragmentView(type: SelectedButton) {
        mainMenuViewModel.setGameName("")
        mainMenuViewModel.setGameDifficulty(GameDifficulty.NONE)
        when(type)
        {

            SelectedButton.SEARCH -> {
                //close popUp
            }
            SelectedButton.CLASSIC -> {
                binding.GameCreation.text = "Création d'une partie classique"
                binding.gameLogo.setImageResource(R.drawable.icon_classic)
                if(isPrivate) {
                    println("Private ")
                }
            }
            SelectedButton.SPRINT -> {
                binding.GameCreation.text = "Création d'une partie sprint solo"
                binding.gameLogo.setImageResource(R.drawable.icon_solo)
                binding.incognito.visibility = View.INVISIBLE
                binding.gameCreationPrivate.visibility = View.INVISIBLE

            }
            SelectedButton.COOP -> {
                binding.GameCreation.text = "Création d'une partie coop"
                binding.gameLogo.setImageResource(R.drawable.ic_hands_helping_solid)
            }
            else -> throw(Exception("Unknown state exception"))
        }
    }

    override fun onResume() {
        super.onResume()
        println("Game parameter Fragment on resume")
        mainMenuViewModel._gameInviteID.value = null
    }

    companion object {
        @JvmStatic
        fun newInstance() = GameParameterFragment()
    }
}