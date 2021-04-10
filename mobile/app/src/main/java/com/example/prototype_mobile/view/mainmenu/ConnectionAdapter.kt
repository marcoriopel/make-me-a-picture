package com.example.prototype_mobile.view.mainmenu

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Connection
import com.example.prototype_mobile.R

class ConnectionAdapter(val context: Context, val connectionList: MutableList<Connection>): RecyclerView.Adapter<ConnectionAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ConnectionAdapter.ViewHolder {
        var view = LayoutInflater.from(context).inflate(R.layout.row_connection_profil,parent,false)
        return ViewHolder(view!!)
    }

    override fun getItemCount(): Int {
        return connectionList.size
    }

    override fun onBindViewHolder(holder: ConnectionAdapter.ViewHolder, position: Int) {
        val connection  = connectionList[position]
        holder.date.text = connection.date
        holder.action.text = connection.action
    }

    inner class ViewHolder(itemView : View):  RecyclerView.ViewHolder(itemView) {
        val date = itemView.findViewById<TextView>(R.id.date)
        val action = itemView.findViewById<TextView>(R.id.action)
    }
}