package com.example.prototype_mobile.view.mainmenu

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.MenuCompat
import androidx.fragment.app.FragmentTransaction
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.observe
import com.example.prototype_mobile.R
import com.example.prototype_mobile.model.connection.sign_up.model.SelectedButton
import com.example.prototype_mobile.util.Drawable
import com.example.prototype_mobile.view.chat.ChatFragment
import com.example.prototype_mobile.view.connection.login.LoginActivity
import com.example.prototype_mobile.viewmodel.mainmenu.MainMenuViewModel
import com.example.prototype_mobile.viewmodel.mainmenu.MainMenuViewModelFactory


class MainMenuActivity : AppCompatActivity() {
    private lateinit var mainMenuViewModel: MainMenuViewModel
    private var blockProfileButton = false

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        val inflater = menuInflater
        inflater.inflate(R.menu.mainmenu, menu)
        supportActionBar?.setLogo(R.mipmap.ic_launcher2)
        supportActionBar?.setDisplayUseLogoEnabled(true)
        MenuCompat.setGroupDividerEnabled(menu, true)
        menu?.getItem(0)?.setIcon(Drawable.avatars[mainMenuViewModel.avatar])
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem) = when (item.itemId) {
        R.id.action_profil -> {
            if (!blockProfileButton) {
                supportFragmentManager.beginTransaction().replace(
                    R.id.container2,
                    ProfilFragment.newInstance())
                        .commit()
                blockProfileButton = true
            }
            true
        }
        R.id.action_logout -> {
            mainMenuViewModel.logout()
            true
        }
        else -> {
            super.onOptionsItemSelected(item)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main_menu)
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.my_toolbar)
        toolbar.setTitleTextColor(ContextCompat.getColor(applicationContext, R.color.white))
        setSupportActionBar(toolbar)
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

        mainMenuViewModel.creationGameButtonType.observe(this@MainMenuActivity) {
            blockProfileButton = false
            if (it == SelectedButton.NONE || it == SelectedButton.SEARCH) {
                supportFragmentManager.beginTransaction().replace(
                        R.id.container2,
                        GameListFragment.newInstance()
                ).commit()
            } else {
                supportFragmentManager.beginTransaction().replace(
                        R.id.container2,
                        GameParameterFragment.newInstance()
                ).commit()
            }
        }

        mainMenuViewModel.lobbyJoined.observe(this@MainMenuActivity, Observer {
            val gameJoined = it ?: return@Observer
            blockProfileButton = false
            supportFragmentManager.beginTransaction().replace(
                R.id.container2, LobbyFragment.newInstance(
                    gameJoined.gameName,
                    gameJoined.gameType.type,
                    mainMenuViewModel._gameInviteID.value
                )
            )
                .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_OPEN)
                .addToBackStack(null)
                .commit()
        })

        mainMenuViewModel.logout.observe(this@MainMenuActivity) {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
            finish()
        }

        mainMenuViewModel.message.observe(this@MainMenuActivity) {
            Toast.makeText(
                    applicationContext,
                    it,
                    Toast.LENGTH_LONG
            ).show()
        }

    }

    override fun onRestart() {
        super.onRestart()
        println("On restart")
        removeLobbyFromStack()
    }

    private fun removeLobbyFromStack() {
        for(fragment in supportFragmentManager.fragments)
            if(fragment is LobbyFragment) {
                (fragment).getViewModel().resetData()
                supportFragmentManager.beginTransaction().remove(fragment).commitAllowingStateLoss()
                supportFragmentManager.beginTransaction().replace(
                    R.id.container2,
                    GameListFragment()
                ).commitNowAllowingStateLoss()
            }
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_ENTER -> {
                for (fragment in supportFragmentManager.fragments) {
                    if (fragment is ChatFragment)
                        fragment.onKeyEnter()
                }
                true
            }
            else -> super.onKeyUp(keyCode, event)
        }
    }

    override fun onBackPressed() {
        Toast.makeText(
            applicationContext,
            "Il n'est pas possible d'utiliser le bouton back dans l'application",
            Toast.LENGTH_LONG
        ).show()
    }
}