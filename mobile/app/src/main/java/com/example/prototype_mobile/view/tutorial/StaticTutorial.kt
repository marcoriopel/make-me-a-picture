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

    var tutorialPageIndex = 0
    lateinit var binding: ActivityStaticTutorialBinding
    var contentMap = mutableMapOf<Int, StaticTutorialInfo>()


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_static_tutorial)

        binding = ActivityStaticTutorialBinding.inflate(layoutInflater)
        val view = binding.root
        setContentView(view)
        //Creating the map content
        contentMap.put(0, StaticTutorialInfo("title_mainmenu",getImagePath(R.drawable.menu),"main_menu_description"))
        contentMap.put(1, StaticTutorialInfo("title_lobby",getImagePath(R.drawable.lobby),"lobby_description"))
        contentMap.put(2, StaticTutorialInfo("title_game",getImagePath(R.drawable.guessing),"game_description"))




       binding.back.setOnClickListener {
            println("back button click ")
            if(tutorialPageIndex == 0){
                println("Can't decrement 0")
            } else {
                tutorialPageIndex--
                setNewPageContent()
            }
        }
        binding.next.setOnClickListener {
            println("next button click ")
            if(tutorialPageIndex< contentMap.size) {
                tutorialPageIndex++
                setNewPageContent()
            }
        }
        setNewPageContent()
    }

    fun setNewPageContent() {
        var info = contentMap[tutorialPageIndex]
        var drawable = Drawable.createFromPath(info!!.imagePath)
        binding.image.setImageDrawable(drawable)
        binding.description.text = getString(resources.getIdentifier(info!!.description, "string", getPackageName()));
        binding.title.text = getString(resources.getIdentifier(info!!.title, "string", getPackageName()));

    }

    fun getImagePath(@DrawableRes  ressource: Int): String? {
       var  url = Uri.parse("android.resource://your_packagename/" + ressource)
        return url.path

    }
}
