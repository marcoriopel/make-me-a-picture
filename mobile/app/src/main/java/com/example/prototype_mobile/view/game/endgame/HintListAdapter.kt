package com.example.prototype_mobile.view.game.endgame

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.R
import com.example.prototype_mobile.viewmodel.game.EndGameViewModel
import org.jetbrains.anko.attr

class HintListAdapter(val context: Context, var hintList: MutableList<String>, val viewModel: EndGameViewModel): RecyclerView.Adapter<HintListAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HintListAdapter.ViewHolder {
        val view = LayoutInflater.from(context).inflate(R.layout.row_hint_list,parent,false)
        return ViewHolder(view!!)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.hintName.text = hintList[position]
        val removeButton = holder.view.findViewById<Button>(R.id.remove_hint)
        removeButton.setOnClickListener {
            Log.e("to remove", holder.hintName.text as String)
            viewModel.removeHint(holder.hintName.text.toString())
        }
    }

    override fun getItemCount(): Int {
        return hintList.size
    }

    inner class ViewHolder(itemView : View):  RecyclerView.ViewHolder(itemView) {
        val view = itemView
        var hintName: TextView = itemView.findViewById<TextView>(R.id.hintlist_name)

    }

}