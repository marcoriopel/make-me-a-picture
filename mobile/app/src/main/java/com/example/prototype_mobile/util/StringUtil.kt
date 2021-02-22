package com.example.prototype_mobile.util

import java.security.MessageDigest
import java.util.*

class StringUtil {
    companion object {
        fun hashSha256(toBeHashed: String): String {
            val bytes = toBeHashed.toByteArray()
            val md = MessageDigest.getInstance("SHA-256")
            val digest = md.digest(bytes)
            return Base64.getEncoder().encodeToString(digest)
        }
    }
}