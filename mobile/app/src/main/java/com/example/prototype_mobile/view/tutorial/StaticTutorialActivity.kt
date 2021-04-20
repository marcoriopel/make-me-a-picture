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
        contentMap[1] = StaticTutorialInfo("menu_game_title",R.drawable.menugame,"menu_game_description")
        contentMap[2] = StaticTutorialInfo("parametre_game_title",R.drawable.parametergame,"parametre_game_description")
        contentMap[3] = StaticTutorialInfo("lobby_title",R.drawable.lobby,"lobby_description")
        contentMap[4] = StaticTutorialInfo("guess_classic_title",R.drawable.guessclassic,"guess_classic_description")
        contentMap[5] = StaticTutorialInfo("draw_classic_title",R.drawable.drawclassic,"draw_classic_description")
        contentMap[6] = StaticTutorialInfo("guess_coop_title",R.drawable.guesscoopsprint,"guess_coop_description")


        ProgressDot(tutorialPageIndex)

       binding.back.setOnClickListener {
            if(tutorialPageIndex == 1) {
            } else {
                tutorialPageIndex--
                setNewPageContent()
                ProgressDot(tutorialPageIndex)
            }
        }
        binding.next.setOnClickListener {
            if(tutorialPageIndex < contentMap.size) {
                tutorialPageIndex++
                setNewPageContent()
                ProgressDot(tutorialPageIndex)
            } else if(tutorialPageIndex == contentMap.size) {
                val intent = Intent(this, MainMenuActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                startActivity(intent)
               finish()

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
            nextText.text = "Terminer"
        } else {
            val nextText = findViewById<TextView>(R.id.next_text)
            nextText.text = "Suivant"
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
        val dotsLayout = findViewById<LinearLayout>(R.id.dots)
        val dots: Array<ImageView> = Array<ImageView>(contentMap.size) { ImageView(this) }
        dotsLayout.removeAllViews()
        for (i in dots.indices) {
            dots[i] = ImageView(this)
            val widthHeight = 15
            val params:LinearLayout.LayoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams(widthHeight,widthHeight))
            dots[i].layoutParams = params
            dots[i].setImageResource(R.drawable.circle)
            dots[i].setColorFilter(getColor(R.color.grey), PorterDuff.Mode.SRC_IN)
            dotsLayout.addView(dots[i])

        }
        if(dots.isNotEmpty()) {
            dots[tutorialIndex-1].setImageResource(R.drawable.circle)
            dots[tutorialIndex-1].setColorFilter(getColor(R.color.poly_blue), PorterDuff.Mode.SRC_IN)
        }
    }


}
