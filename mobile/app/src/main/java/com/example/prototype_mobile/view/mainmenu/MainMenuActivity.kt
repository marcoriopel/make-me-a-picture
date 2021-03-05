package com.example.prototype_mobile.view.mainmenu

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentTransaction
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.view.chat.ChatFragment
import com.example.prototype_mobile.viewmodel.mainmenu.MainMenuViewModel
import com.example.prototype_mobile.viewmodel.mainmenu.MainMenuViewModelFactory

import com.example.prototype_mobile.viewmodel.mainmenu.GameList.SelectedButton



class MainMenuActivity : AppCompatActivity() {
    private lateinit var mainMenuViewModel: MainMenuViewModel



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main_menu)
        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                    .replace(R.id.container, GameCreationFragment.newInstance())
                    .commit()
            supportFragmentManager.beginTransaction()
                .replace(R.id.container2, GameListFragment.newInstance())
                .commit()
            supportFragmentManager.beginTransaction()
                    .replace(R.id.container3, ChatFragment.newInstance())
                    .commit()

        }

        mainMenuViewModel = ViewModelProvider(this, MainMenuViewModelFactory())
                .get(MainMenuViewModel::class.java)

        mainMenuViewModel.creationGameButtonType.observe(this@MainMenuActivity, Observer {
            println("Fragment should be deleted")
            if(it == SelectedButton.NONE) {
                    supportFragmentManager.beginTransaction().replace(R.id.container2,GameListFragment.newInstance()).commit()

            }
            else {
                supportFragmentManager.beginTransaction().replace(R.id.container2,GameParameterFragment.newInstance()).commit()
            }
        })


        mainMenuViewModel.lobbyJoined.observe(this@MainMenuActivity, Observer {
            val gameJoined = it ?: return@Observer

            supportFragmentManager.beginTransaction().replace(R.id.container2, LobbyFragment.newInstance(gameJoined.gameName, gameJoined.gameType.type))
                    .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_OPEN)
                    .addToBackStack(null)
                    .commit()
        })

    }

    
}