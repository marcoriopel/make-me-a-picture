package com.example.prototype_mobile.view.game.endgame

import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.PorterDuff
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.view.*
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.observe
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.*
import com.example.prototype_mobile.databinding.ActivityEndGameBinding
import com.example.prototype_mobile.model.connection.sign_up.model.EndGamePageType
import com.example.prototype_mobile.ressources.LinearLayoutManagerWrapper
import com.example.prototype_mobile.view.chat.ChatFragment
import com.example.prototype_mobile.view.connection.login.LoginActivity
import com.example.prototype_mobile.view.game.GuessFragment
import com.example.prototype_mobile.view.mainmenu.MainMenuActivity
import com.example.prototype_mobile.viewmodel.game.EndGameViewModel
import com.squareup.picasso.Picasso
import nl.dionsegijn.konfetti.KonfettiView
import nl.dionsegijn.konfetti.models.Shape
import nl.dionsegijn.konfetti.models.Size
import java.lang.Exception

class EndGameActivity: AppCompatActivity() {

    // Attributes
    var pageIndex = 1
    var numberOfPage = 0
    var hintList: MutableList<String> = mutableListOf()
    var contentMap = mutableMapOf<Int, StaticEndGameInfo>()
    lateinit var hintListAdapter: HintListAdapter
    lateinit var binding: ActivityEndGameBinding
    private lateinit var endGameViewModel: EndGameViewModel

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        val inflater = menuInflater
        inflater.inflate(R.menu.gamemenu, menu)
        supportActionBar?.setLogo(R.mipmap.ic_launcher2)
        supportActionBar?.setDisplayUseLogoEnabled(true)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem) = when (item.itemId) {
        R.id.action_logout -> {
            endGameViewModel.logout()
            true
        }
        else -> {
            super.onOptionsItemSelected(item)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Set view and View Model
        binding = ActivityEndGameBinding.inflate(layoutInflater)
        val view = binding.root
        setContentView(view)
        endGameViewModel = ViewModelProvider(this).get(EndGameViewModel::class.java)

        // Add Chat and Nav bar
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.my_toolbar)
        toolbar.setTitleTextColor(ContextCompat.getColor(applicationContext, R.color.white))
        setSupportActionBar(toolbar)
        supportFragmentManager.beginTransaction()
                .replace(R.id.containerChat, ChatFragment())
                .commitNow()

        // Creating content view
        createContentView()

        // Binding
        bindButton()
        bindNavigation()

        // Binding hint recycler view
        val recyclerView = binding.recyclerView
        val layoutManager: RecyclerView.LayoutManager = LinearLayoutManagerWrapper(applicationContext)
        recyclerView.layoutManager = layoutManager
        hintListAdapter = HintListAdapter(applicationContext, hintList, endGameViewModel);
        recyclerView.adapter = hintListAdapter
        endGameViewModel.hints.observe(this, Observer {
            hintList = it
            hintListAdapter.hintList = hintList
            addHintToRecyclerView(hintList)
        })

        // Display first page
        setPageContent()

    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Extract all the content to create the content map
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun createContentView() {
        // Result
        numberOfPage = 1
        contentMap[numberOfPage] = endGameViewModel.getGameResult()

        // Vote drawing from virtual player
        for (vDrawing in endGameViewModel.getVPlayerDrawing()) {
            contentMap[++numberOfPage] = StaticEndGameInfo("Vote du dessin ${vDrawing.drawingName}","Avez vous apprécié ce dessin ?", EndGamePageType.VOTE, vDrawing)
        }

        // Upload
        for (drawing in endGameViewModel.getDrawings()) {
            val description = "Voulez vous envoyer votre dessin de ${drawing.drawingName} pour qu'il soit utilitsé dans le futur ?"
            contentMap[++numberOfPage] = StaticEndGameInfo("Téléverser votre dessin", description, EndGamePageType.UPLOAD, drawing)
        }

        // Set progress bar
        progressDot(pageIndex)

    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Bind all button of the view
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun bindButton() {
        // Add Hint
        binding.buttonAddHint.setOnClickListener {
            if (binding.hintInput.text.toString() != "") {
                endGameViewModel.addHint(binding.hintInput.text.toString())
                binding.hintInput.text.clear()
            }
        }
        // Upload
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
        // Up vote
        binding.buttonUpVote.setOnClickListener {
            contentMap[pageIndex]!!.data?.let { it1 -> endGameViewModel.vote(true, it1) }
            nextPage()
        }
        // Down vote
        binding.buttonDownVote.setOnClickListener {
            contentMap[pageIndex]!!.data?.let { it1 -> endGameViewModel.vote(false, it1) }
            nextPage()
        }
        // Logout button
        endGameViewModel.logout.observe(this) {
            val mStartActivity = Intent(applicationContext, LoginActivity::class.java)
            val mPendingIntentId = 123456
            val mPendingIntent = PendingIntent.getActivity(applicationContext, mPendingIntentId, mStartActivity, PendingIntent.FLAG_CANCEL_CURRENT)
            val mgr = applicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            mgr.set(AlarmManager.RTC, System.currentTimeMillis() + 100, mPendingIntent)
            System.exit(0)
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Add a hint
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun addHintToRecyclerView(hints: MutableList<String>) {
        runOnUiThread {
            hintList = hints
            hintListAdapter.notifyDataSetChanged()
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Bind navigation button
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun bindNavigation() {
        // Bind button
        binding.back.setOnClickListener {
            if(pageIndex == 1) {
                println("Can't decrement 0")
            } else {
                previousPage()
            }
        }
        binding.next.setOnClickListener {
            nextPage()
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Go to the main menu
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun goToMenu() {
        val intent =  Intent(this@EndGameActivity, MainMenuActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
        startActivity(intent)
        this.finish()
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Go to the last page if possible
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun previousPage() {
        pageIndex--
        setPageContent()
        progressDot(pageIndex)
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Go to the next page or to the menu if these no content
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun nextPage() {
        if(pageIndex == contentMap.size) {
            goToMenu()
        } else if(pageIndex < contentMap.size) {
            pageIndex++
            setPageContent()
            progressDot(pageIndex)
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *  Set the image from AWS S3 if it's from a V player
   *  or from base64 if it's from a real player
   * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun setImage(pageData: StaticEndGameInfo) {
        val imgHolder = findViewById<ImageView>(R.id.image)
        if (pageData.data?.image != null) {
            when(pageData.type) {
                EndGamePageType.UPLOAD -> {
                    imgHolder.visibility = View.VISIBLE
                    // Set image from Base64
                    val imageBytes = Base64.decode(pageData.data.image, Base64.DEFAULT)
                    val decodedImage = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                    binding.image.setImageBitmap(decodedImage)
                }
                EndGamePageType.VOTE -> {
                    try {
                        Picasso.with(this).load(pageData.data.image).into(imgHolder);
                        imgHolder.visibility = View.VISIBLE
                    }
                    catch (e: Exception) {
                        Log.e("Virtual Player image", "Not found")
                        imgHolder.visibility = View.INVISIBLE
                    }
                }
                else -> { imgHolder.visibility = View.INVISIBLE }
            }
        } else {
            if(pageData.type == EndGamePageType.RESULT) {
                if ((pageData.data as EndGameResult).win)
                    imgHolder.setImageResource(R.drawable.couronner)
                else
                    imgHolder.visibility = View.INVISIBLE
            } else {
                imgHolder.visibility = View.INVISIBLE
            }
        }
    }

    @SuppressLint("SetTextI18n")
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Set the content base on the content map at the
    *  page index
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private fun setPageContent() {

        // Data
        val pageData = contentMap[pageIndex]!!

        // Content
        setImage(pageData)
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
        val backButton = findViewById<LinearLayout>(R.id.back)
        backButton.visibility = View.INVISIBLE

        // Display the data according to the page type
        val upVoteButton = findViewById<Button>(R.id.buttonUpVote)
        val downVoteButton = findViewById<Button>(R.id.buttonDownVote)
        val uploadLayout = findViewById<LinearLayout>(R.id.upload)

        when(pageData.type) {
            EndGamePageType.RESULT -> {
                upVoteButton.visibility = View.INVISIBLE
                downVoteButton.visibility = View.INVISIBLE
                uploadLayout.visibility = View.INVISIBLE
                if (pageData.data != null) {
                    val result = pageData.data as EndGameResult
                    if (result.win)
                        burstKonfetti()
                }
            }
            EndGamePageType.VOTE -> {
                upVoteButton.visibility = View.VISIBLE
                downVoteButton.visibility = View.VISIBLE
                uploadLayout.visibility = View.INVISIBLE
            }
            EndGamePageType.UPLOAD -> {
                upVoteButton.visibility = View.INVISIBLE
                downVoteButton.visibility = View.INVISIBLE
                uploadLayout.visibility = View.VISIBLE
            }
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Update the progression bar
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
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

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Burst confetti in the middle of the screen
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
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
                konfettiView.x + 850,
                konfettiView.y + 380
            )
            .burst(100)
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Block the back button
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    override fun onBackPressed() {
        Toast.makeText(
            applicationContext,
            "Il n'est pas possible d'utiliser le bouton back dans l'application",
            Toast.LENGTH_LONG
        ).show()
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Bind enter key to send message in chat fragment
    * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_ENTER -> {
                for(fragment in supportFragmentManager.fragments) {
                    if (fragment is ChatFragment)
                        fragment.onKeyEnter()
                }
                true
            }
            else -> super.onKeyUp(keyCode, event)
        }
    }


}
