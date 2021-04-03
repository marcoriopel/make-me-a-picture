package com.example.prototype_mobile.view.tutorial

import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Bundle
import androidx.annotation.DrawableRes
import androidx.annotation.StringRes

import androidx.appcompat.app.AppCompatActivity
import com.example.prototype_mobile.R
import com.example.prototype_mobile.StaticTutorialInfo
import com.example.prototype_mobile.databinding.ActivityLoginBinding
import com.example.prototype_mobile.databinding.ActivityStaticTutorialBinding

class StaticTutorial : AppCompatActivity() {

    var tutorialPageIndex = 1
    lateinit var binding: ActivityStaticTutorialBinding
    var contentMap = mutableMapOf<Int, StaticTutorialInfo>()


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_static_tutorial)

        binding = ActivityStaticTutorialBinding.inflate(layoutInflater)
        val view = binding.root
        setContentView(view)
        //Creating the map content
        contentMap.put(1, StaticTutorialInfo("title_mainmenu",R.drawable.menu,"main_menu_description"))
        contentMap.put(2, StaticTutorialInfo("title_lobby",R.drawable.lobby,"lobby_description"))
        contentMap.put(3, StaticTutorialInfo("title_game",R.drawable.guessing,"game_description"))




       binding.back.setOnClickListener {
            println("back button click ")
            if(tutorialPageIndex == 1) {
                println("Can't decrement 0")
            } else {
                tutorialPageIndex--
                setNewPageContent()
            }
        }
        binding.next.setOnClickListener {
            println("next button click ")
            if(tutorialPageIndex < contentMap.size) {
                tutorialPageIndex++
                setNewPageContent()
            }
            else{
                println("Can't increment anymore")
            }
        }
        setNewPageContent()
    }

    fun setNewPageContent() {
        var info = contentMap[tutorialPageIndex]
        binding.image.setImageResource(info!!.image)
        binding.description.text = getString(resources.getIdentifier(info!!.description, "string", getPackageName()));
        binding.title.text = getString(resources.getIdentifier(info!!.title, "string", getPackageName()));

    }

    fun getImagePath(@DrawableRes  ressource: Int): String? {
       var  url = Uri.parse("android.resource://drawable/" + ressource)
        return url.path

    }
}
