package com.example.prototype_mobile.view.mainmenu

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.annotation.Nullable
import androidx.core.content.ContextCompat
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import com.example.prototype_mobile.Difficulty
import com.example.prototype_mobile.GameCreationMergeData
import com.example.prototype_mobile.GameName
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentGameParameterBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameDifficulty
import com.example.prototype_mobile.view.connection.login.afterTextChanged
import com.example.prototype_mobile.viewmodel.mainmenu.GameList.MainMenuViewModel
import com.example.prototype_mobile.viewmodel.mainmenu.GameList.SelectedButton
import java.util.*


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
    private var filterDifficulty: Vector<Button> = Vector<Button>()
    private val sharedViewModel: MainMenuViewModel by activityViewModels()


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
        var gameName =""
        var difficulty = GameDifficulty.NONE

        binding = FragmentGameParameterBinding.bind(view)



        filterDifficulty.addElement(binding.easyFilter)
        filterDifficulty.addElement(binding.mediumFilter)
        filterDifficulty.addElement(binding.hardFilter)

        binding.gameName.afterTextChanged {
            updateGameName(binding.gameName.text.toString())
        }

        binding.StartGame.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.grey_to_green)

        // filter difficulty
        binding.easyFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.grey_to_green)
        binding.easyFilter.setOnClickListener {
            binding.easyFilter.isActivated = !binding.easyFilter.isActivated
            disableOtherButtons(binding.easyFilter, filterDifficulty)
            if(binding.easyFilter.isActivated){
                sharedViewModel.setGameDifficulty(GameDifficulty.EASY)
            } else {
                sharedViewModel.setGameDifficulty(GameDifficulty.NONE)
            }
            sharedViewModel.liveDataMerger = sharedViewModel.fetchData()
        }
        binding.mediumFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.grey_to_orange)
        binding.mediumFilter.setOnClickListener {
            binding.mediumFilter.isActivated = !binding.mediumFilter.isActivated
            disableOtherButtons(binding.mediumFilter, filterDifficulty)
            if(binding.mediumFilter.isActivated){
                sharedViewModel.setGameDifficulty(GameDifficulty.MEDIUM)
            } else {
                sharedViewModel.setGameDifficulty(GameDifficulty.NONE)
            }
            sharedViewModel.liveDataMerger = sharedViewModel.fetchData()
        }
        binding.hardFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.grey_to_red)
        binding.hardFilter.setOnClickListener {
            binding.hardFilter.isActivated = !binding.hardFilter.isActivated
            disableOtherButtons(binding.hardFilter, filterDifficulty)
            println("hard filter" + binding.hardFilter.isActivated)
            if(binding.hardFilter.isActivated){
                sharedViewModel.setGameDifficulty(GameDifficulty.HARD)
            } else {
                sharedViewModel.setGameDifficulty(GameDifficulty.NONE)
            }

            sharedViewModel.liveDataMerger = sharedViewModel.fetchData()
        }
        //Incognito button
        binding.icognito.setOnClickListener{
            binding.icognito.isActivated = ! binding.icognito.isActivated
            if(binding.icognito.isActivated)
                binding.passwordPrivateGame.visibility = View.VISIBLE
            else
                binding.passwordPrivateGame.visibility = View.INVISIBLE

            updateIcognitoModeStatus(binding.icognito.isActivated)
        }
        binding.passwordPrivateGame.afterTextChanged {
            updateIcognitoPassword(binding.passwordPrivateGame.text.toString())
            sharedViewModel.liveDataMerger = sharedViewModel.fetchData()
        }
        updateFragmentView(sharedViewModel.creationGameButtonType.value!!)

        // Set parameter to game
        binding.gameName.afterTextChanged {
            println("after text changed: " + binding.gameName.text.toString())
            sharedViewModel.setGameName(binding.gameName.text.toString())
            sharedViewModel.fetchData()
        }


        sharedViewModel.liveDataMerger.observe(viewLifecycleOwner, Observer<GameCreationMergeData> {

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
                sharedViewModel.sendRequest()
            }
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
    fun disableOtherButtons(currentButton: Button, buttonGroup: Vector<Button>) {

        for (button in buttonGroup) {
            if (button.id != currentButton.id){
                button.isActivated = false
            }
        }
    }

    fun updateGameName(name:String) {
        sharedViewModel.setGameName(name)
    }
    fun updateIcognitoModeStatus(isIcognito: Boolean){
        sharedViewModel.setIcognitoMode(isIcognito)
    }
    fun updateIcognitoPassword(password: String) {
        sharedViewModel.setIcognitoPassword(password)
    }

    fun updateFragmentView(type: SelectedButton) {

        when(type)
        {
            SelectedButton.SEARCH -> {
                //close popUp
            }
            SelectedButton.CLASSIC -> {
                binding.GameCreation.text = "Création partie classique"
                binding.gameLogo.setImageResource(R.drawable.icon_classic)
            }
            SelectedButton.SPRINT -> {
                binding.GameCreation.text = "Création partie SPRINT"
                binding.gameLogo.setImageResource(R.drawable.icon_solo)

               // binding.GameCreation.setCompoundDrawablesWithIntrinsicBounds(null,null,drawable ,null)
            }
            SelectedButton.COOP -> {
                binding.GameCreation.text = "Création partie COOP"
                binding.gameLogo.setImageResource(R.drawable.icon_solo)
            }
        }
    }

}