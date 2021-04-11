package com.example.prototype_mobile.view.tutorial

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.PorterDuff
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Bundle
import android.transition.Visibility
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.DrawableRes
import androidx.annotation.StringRes

import androidx.appcompat.app.AppCompatActivity
import com.example.prototype_mobile.R
import com.example.prototype_mobile.StaticTutorialInfo
import com.example.prototype_mobile.databinding.ActivityStaticTutorialBinding
import com.example.prototype_mobile.view.mainmenu.MainMenuActivity

class StaticTutorialActivity : AppCompatActivity() {

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
        ProgressDot(tutorialPageIndex)





       binding.back.setOnClickListener {
            println("back button click ")
            if(tutorialPageIndex == 1) {
                println("Can't decrement 0")
            } else {
                tutorialPageIndex--
                setNewPageContent()
                ProgressDot(tutorialPageIndex)
            }
        }
        binding.next.setOnClickListener {
            println("next button click ")
            if(tutorialPageIndex < contentMap.size) {
                tutorialPageIndex++
                setNewPageContent()
                ProgressDot(tutorialPageIndex)
            } else if(tutorialPageIndex == contentMap.size) {
                val intent = Intent(this, MainMenuActivity::class.java)
                startActivity(intent)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP

            }

        }
        setNewPageContent()
    }

    override fun onResume() {
        super.onResume()
        tutorialPageIndex =1
    }
    @SuppressLint("SetTextI18n")
    fun setNewPageContent() {
        var info = contentMap[tutorialPageIndex]
        binding.image.setImageResource(info!!.image)
        binding.description.text = getString(resources.getIdentifier(info.description, "string", packageName))
        binding.title.text = getString(resources.getIdentifier(info.title, "string", packageName))
        if(tutorialPageIndex == contentMap.size) {
            val nextText = findViewById<TextView>(R.id.next_text)
            nextText.text = "Finish"
        } else {
            val nextText = findViewById<TextView>(R.id.next_text)
            nextText.text = "Next"
        }
        //Hide back button
        if(tutorialPageIndex == 1) {
            val backButton = findViewById<LinearLayout>(R.id.back)
            backButton.visibility = View.INVISIBLE
        } else {
            val backButton = findViewById<LinearLayout>(R.id.back)
            backButton.visibility = View.VISIBLE
        }
    }


    // Adaptation from https://www.youtube.com/watch?v=9uUMcV-m3Q0
    private fun ProgressDot(tutorialIndex: Int) {
        var dotsLayout = findViewById<LinearLayout>(R.id.dots)
        var dots: Array<ImageView> = Array<ImageView>(contentMap.size) {i -> ImageView(this) }
        dotsLayout.removeAllViews()
        for (i in 0..dots.size-1 ) {
            dots[i] = ImageView(this)
            var width_height = 15
            var params:LinearLayout.LayoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams(width_height,width_height))
            dots[i].layoutParams = params
            dots[i].setImageResource(R.drawable.circle)
            dots[i].setColorFilter(getColor(R.color.grey), PorterDuff.Mode.SRC_IN)
            dotsLayout.addView(dots[i])

        }
        if(dots.size > 0) {
            dots[tutorialIndex-1].setImageResource(R.drawable.circle)
            dots[tutorialIndex-1].setColorFilter(getColor(R.color.poly_blue), PorterDuff.Mode.SRC_IN)
        }


    }


}
