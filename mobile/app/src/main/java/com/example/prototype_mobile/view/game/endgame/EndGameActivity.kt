package com.example.prototype_mobile.view.game.endgame

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.PorterDuff
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.DrawingData
import com.example.prototype_mobile.EndGameResult
import com.example.prototype_mobile.R
import com.example.prototype_mobile.StaticEndGameInfo
import com.example.prototype_mobile.databinding.ActivityEndGameBinding
import com.example.prototype_mobile.model.connection.sign_up.model.EndGamePageType
import com.example.prototype_mobile.view.mainmenu.MainMenuActivity
import com.example.prototype_mobile.viewmodel.game.EndGameViewModel
import nl.dionsegijn.konfetti.KonfettiView
import nl.dionsegijn.konfetti.models.Shape
import nl.dionsegijn.konfetti.models.Size

class EndGameActivity: AppCompatActivity() {

    var pageIndex = 1
    var numberOfPage = 0
    var hintList: MutableList<String> = mutableListOf()
    var contentMap = mutableMapOf<Int, StaticEndGameInfo>()
    lateinit var hintListAdapter: HintListAdapter
    lateinit var binding: ActivityEndGameBinding
    private lateinit var endGameViewModel: EndGameViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Creating view
        binding = ActivityEndGameBinding.inflate(layoutInflater)
        endGameViewModel = ViewModelProvider(this).get(EndGameViewModel::class.java)
        setContentView(R.layout.activity_end_game)
        val view = binding.root
        setContentView(view)

        // Creating content view
        createContentView()

        // Binding
        bindButton()
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
        numberOfPage = 1
        contentMap[numberOfPage] = endGameViewModel.getGameResult()

        // Vote drawing from virtual player
        for (vDrawing in endGameViewModel.getVPlayerDrawing()) {
            contentMap[numberOfPage++] = StaticEndGameInfo("Vote du dessin ${vDrawing.drawingName}","Avez vous apprécié ce dessin ?", EndGamePageType.VOTE, vDrawing)
        }

        contentMap[2] = StaticEndGameInfo("Vote du dessing Singe","Avez vous apprécié ce dessin ?", EndGamePageType.VOTE, null)
        numberOfPage++

        // Upload
        for (drawing in endGameViewModel.getDrawings()) {
            val description = "Voulez vous envoyer votre dessin de ${drawing.drawingName} pour qu'il soit utilitsé dans le futur ?"
            contentMap[numberOfPage++] = StaticEndGameInfo("Téléverser votre dessin", description, EndGamePageType.UPLOAD, drawing)
        }

        // Set progress bar
        progressDot(pageIndex)

    }

    private fun bindButton() {
        // Add Hint
        binding.buttonAddHint.setOnClickListener {
            if (binding.hintInput.text.toString() != "") {
                endGameViewModel.addHint(binding.hintInput.text.toString())
                binding.hintInput.text.clear()
            }
        }
        // upload
        binding.buttonUpload.setOnClickListener {
            if(endGameViewModel.hints.value!!.size != 0) {
                contentMap[pageIndex]?.data?.let { it1 -> endGameViewModel.upload(it1 as DrawingData) }
                nextPage()
            } else {
                val message = "Veuiller entrer au minimum un indice."
                val toast = Toast.makeText(applicationContext, message , Toast.LENGTH_LONG)
                toast.show()
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
                previousPage()
            }
        }
        binding.next.setOnClickListener {
            println("next button click ")
            if(pageIndex < contentMap.size) {
                nextPage()
            } else if(pageIndex == contentMap.size) {
                val intent =  Intent(this@EndGameActivity, MainMenuActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
                startActivity(intent)
                this.finish()
            }
        }
    }

    private fun previousPage() {
        pageIndex--
        setPageContent()
        progressDot(pageIndex)
    }

    private fun nextPage() {
        pageIndex++
        setPageContent()
        progressDot(pageIndex)
    }

    @SuppressLint("SetTextI18n")
    private fun setPageContent() {
        val pageData = contentMap[pageIndex]!!
        val imgHolder = findViewById<ImageView>(R.id.image)
        Log.e("Image", pageData.data?.image.toString())
        if (pageData.data?.image != null) {
            imgHolder.visibility = View.VISIBLE
            Log.e("Image", "Is visible")
            val imageBytes = Base64.decode(pageData.data.image, Base64.DEFAULT)
            val decodedImage = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
            binding.image.setImageBitmap(decodedImage)
        } else {
            imgHolder.visibility = View.INVISIBLE
        }
        binding.description.text = pageData.description
        binding.title.text = pageData.title
        if(pageIndex == contentMap.size) {
            val nextText = findViewById<TextView>(R.id.next_text)
            nextText.text = "Retour au menu"
        } else {
            val nextText = findViewById<TextView>(R.id.next_text)
            nextText.text = "Suivant"
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
                if (pageData.data != null) {
                    val result = pageData.data as EndGameResult
                    if (result.win)
                        burstKonfetti()
                }
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
        val dots: Array<ImageView> = Array<ImageView>(contentMap.size) { _ -> ImageView(this) }
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

    private fun burstKonfetti() {
        val konfettiView: KonfettiView = findViewById(R.id.viewKonfetti)

        val drawable = ContextCompat.getDrawable(applicationContext, R.drawable.ic_heart)
        val drawableShape = drawable?.let { Shape.DrawableShape(it, true) }
        konfettiView.build()
            .addColors(Color.YELLOW, Color.GREEN, Color.RED, Color.BLUE, Color.CYAN, Color.MAGENTA)
            .setDirection(0.0, 359.0)
            .setSpeed(1f, 5f)
            .setFadeOutEnabled(true)
            .setTimeToLive(2000L)
            .addShapes(Shape.Square, Shape.Circle, drawableShape!!)
            .addSizes(Size(12, 5f))
            .setPosition(
                konfettiView.x + 950,
                konfettiView.y + 380
            )
            .burst(100)
    }

}
