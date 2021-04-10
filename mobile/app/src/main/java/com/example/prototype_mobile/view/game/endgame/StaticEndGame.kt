package com.example.prototype_mobile.view.game.endgame

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.PorterDuff
import android.os.Bundle
import android.text.Editable
import android.util.Log
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.R
import com.example.prototype_mobile.StaticEndGameInfo
import com.example.prototype_mobile.databinding.ActivityStaticEndGameBinding
import com.example.prototype_mobile.model.connection.sign_up.model.EndGamePageType
import com.example.prototype_mobile.view.mainmenu.GameListAdapter
import com.example.prototype_mobile.view.mainmenu.MainMenuActivity
import com.example.prototype_mobile.viewmodel.game.EndGameViewModel
import com.google.android.material.chip.ChipDrawable

class StaticEndGame: AppCompatActivity() {

    var pageIndex = 1
    var hintList: MutableList<String> = mutableListOf()
    var contentMap = mutableMapOf<Int, StaticEndGameInfo>()
    lateinit var hintListAdapter: HintListAdapter
    lateinit var binding: ActivityStaticEndGameBinding
    private lateinit var endGameViewModel: EndGameViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Creating view
        binding = ActivityStaticEndGameBinding.inflate(layoutInflater)
        endGameViewModel = ViewModelProvider(this).get(EndGameViewModel::class.java)
        setContentView(R.layout.activity_static_end_game)
        val view = binding.root
        setContentView(view)

        // Creating content view
        createContentView()

        // Binding
        bindHint()
        bindNavigation()

        // Display hint
        val recyclerView: RecyclerView = view.findViewById(R.id.recyclerView)
        val layoutManager: RecyclerView.LayoutManager = LinearLayoutManager(view.context)
        recyclerView.layoutManager = layoutManager

        hintListAdapter = HintListAdapter(view.context, hintList, endGameViewModel);
        recyclerView.adapter = hintListAdapter

        endGameViewModel.hints.observe(this, Observer {
            hintList = it
            hintListAdapter.hintList = hintList
            addItemToRecyclerView(hintList)
        })

        // Display first page
        setPageContent()

    }

    private fun createContentView() {
        // Result
        contentMap[1] = StaticEndGameInfo("Partie terminé", R.drawable.menu, "Équipe 1 a gagné", EndGamePageType.RESULT, null)

        // Vote drawing from virtual player
        contentMap[2] = StaticEndGameInfo("Vote du dessing Singe", R.drawable.menu, "Avez vous apprécié ce dessin ?", EndGamePageType.VOTE, "singe")

        // Upload
        contentMap[3] = StaticEndGameInfo("Téléverser votre dessin", R.drawable.menu, "Voulez vous envoyer votre dessin pour qu'il soit utilitsé dans le futur ?", EndGamePageType.UPLOAD, "biscuit")

        // Set progress bar
        progressDot(pageIndex)

    }

    private fun bindHint() {
        // Button
        binding.buttonAddHint.setOnClickListener {
            if (binding.hintInput.text.toString() != "") {
                endGameViewModel.addHint(binding.hintInput.text.toString())
                binding.hintInput.text.clear()
            }
        }
    }

    private fun addItemToRecyclerView(hints: MutableList<String>) {
        runOnUiThread {
            hintList = hints
            hintListAdapter.notifyDataSetChanged()
        }
    }

    private fun bindNavigation() {
        // Bind button
        binding.back.setOnClickListener {
            println("back button click ")
            if(pageIndex == 1) {
                println("Can't decrement 0")
            } else {
                pageIndex--
                setPageContent()
                progressDot(pageIndex)
            }
        }
        binding.next.setOnClickListener {
            println("next button click ")
            if(pageIndex < contentMap.size) {
                pageIndex++
                setPageContent()
                progressDot(pageIndex)
            } else if(pageIndex == contentMap.size) {
                val intent = Intent(this, MainMenuActivity::class.java)
                startActivity(intent)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
        }
    }

    @SuppressLint("SetTextI18n")
    private fun setPageContent() {
        val pageData = contentMap[pageIndex]
        binding.image.setImageResource(pageData!!.image)
        binding.description.text = pageData.description
        binding.title.text = pageData.title
        if(pageIndex == contentMap.size) {
            val nextText = findViewById<TextView>(R.id.next_text)
            nextText.text = "Finish"
        } else {
            val nextText = findViewById<TextView>(R.id.next_text)
            nextText.text = "Next"
        }
        // Hide back button
        if(pageIndex == 1) {
            val backButton = findViewById<LinearLayout>(R.id.back)
            backButton.visibility = View.INVISIBLE
        } else {
            val backButton = findViewById<LinearLayout>(R.id.back)
            backButton.visibility = View.VISIBLE
        }
        // Display the data according to the page type
        val upvoteButton = findViewById<Button>(R.id.buttonUpVote)
        val downvoteButton = findViewById<Button>(R.id.buttonDownVote)
        val uploadLayout = findViewById<LinearLayout>(R.id.upload)

        when(pageData.type) {
            EndGamePageType.RESULT -> {
                upvoteButton.visibility = View.INVISIBLE
                downvoteButton.visibility = View.INVISIBLE
                uploadLayout.visibility = View.INVISIBLE
            }
            EndGamePageType.VOTE -> {
                upvoteButton.visibility = View.VISIBLE
                downvoteButton.visibility = View.VISIBLE
                uploadLayout.visibility = View.INVISIBLE
            }
            EndGamePageType.UPLOAD -> {
                upvoteButton.visibility = View.INVISIBLE
                downvoteButton.visibility = View.INVISIBLE
                uploadLayout.visibility = View.VISIBLE
            }
        }
    }

    private fun progressDot(tutorialIndex: Int) {
        val dotsLayout = findViewById<LinearLayout>(R.id.dots)
        val dots: Array<ImageView> = Array<ImageView>(contentMap.size) { i -> ImageView(this) }
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