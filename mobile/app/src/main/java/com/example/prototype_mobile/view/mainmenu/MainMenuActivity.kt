package com.example.prototype_mobile.view.mainmenu

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.fragment.app.FragmentTransaction
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.view.chat.ChatFragment
import com.example.prototype_mobile.viewmodel.mainmenu.GameList.MainMenuViewModel
import com.example.prototype_mobile.viewmodel.mainmenu.GameList.MainMenuViewModelFactory
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
            supportFragmentManager.beginTransaction().replace(R.id.center, GameParameterFragment.newInstance()).commit()
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
                val transaction1 = supportFragmentManager.beginTransaction()
                transaction1.hide(supportFragmentManager.fragments[1])
                transaction1.commit()
                supportFragmentManager.beginTransaction().show(supportFragmentManager.fragments[2]).commit()
            }
            else {
                val transaction2 = supportFragmentManager.beginTransaction()
                transaction2.hide(supportFragmentManager.fragments[2])
                transaction2.commit()
                val transaction1 = supportFragmentManager.beginTransaction()
                transaction1.show(supportFragmentManager.fragments[1])
                transaction1.commit()

            }
        })
    }

    
}